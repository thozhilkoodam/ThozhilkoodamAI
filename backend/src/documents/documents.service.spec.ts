import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService, UserContext } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

const mockPrismaService = {
  candidateDocument: {
    create: jest.fn().mockImplementation((args) => Promise.resolve({
      id: args.data.id || 'doc-1',
      userId: args.data.userId,
      name: args.data.name,
      type: args.data.type,
      url: args.data.url,
      size: args.data.size,
      createdAt: new Date(),
    })),
    findUnique: jest.fn(),
    delete: jest.fn().mockResolvedValue({ id: 'doc-1' }),
    update: jest.fn().mockImplementation((args) => Promise.resolve({
      id: args.where.id,
      userId: 'cand-1',
      name: args.data.name,
      type: 'resume',
      url: args.data.url,
      size: args.data.size,
      createdAt: new Date(),
    })),
  },
};

const mockStorageRepository = {
  uploadFile: jest.fn().mockResolvedValue({
    url: null,
    path: 'candidates/cand-1/resumes/doc-1/resume.pdf',
    bucket: 'candidate-resumes',
    objectKey: 'candidates/cand-1/resumes/doc-1/resume.pdf',
    message: 'Uploaded to Supabase',
    isStorageEnabled: true,
  }),
  getSignedDownloadUrl: jest.fn().mockResolvedValue('https://example.supabase.co/storage/v1/object/sign/candidate-resumes/doc-1.pdf?token=abc'),
  deleteFile: jest.fn().mockResolvedValue(true),
  isStorageEnabled: jest.fn().mockReturnValue(true),
};

describe('DocumentsService (Step 5 Security & Upload Tests)', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: 'FileStorageRepository', useValue: mockStorageRepository },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  const candidateUser: UserContext = { id: 'cand-1', role: 'candidate' };
  const otherCandidateUser: UserContext = { id: 'cand-2', role: 'candidate' };
  const employerUser: UserContext = { id: 'emp-1', role: 'msme_client', companyId: 'comp-1' };
  const otherEmployerUser: UserContext = { id: 'emp-2', role: 'msme_client', companyId: 'comp-2' };
  const adminUser: UserContext = { id: 'admin-1', role: 'admin' };

  const validPdfFile = {
    originalname: 'my_resume.pdf',
    buffer: Buffer.from('%PDF-1.4 sample content'),
    mimetype: 'application/pdf',
    size: 2048,
  } as Express.Multer.File;

  it('1. Authenticated candidate upload should succeed', async () => {
    const result = await service.uploadDocument(candidateUser, 'resume', validPdfFile);
    expect(result.documentId).toBeDefined();
    expect(result.storageProvider).toBe('supabase');
    expect(result.bucketName).toBe('candidate-resumes');
    expect(result.status).toBe('ready');
  });

  it('2. Unauthenticated upload rejection', async () => {
    await expect(
      service.uploadDocument({ id: '', role: '' }, 'resume', validPdfFile),
    ).rejects.toThrow(ForbiddenException);
  });

  it('3. Candidate accessing own document download URL should succeed', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-1',
      type: 'resume',
      url: 'candidates/cand-1/resumes/doc-1/my_resume.pdf',
    });

    const result = await service.getSignedDownloadUrl(candidateUser, 'doc-1');
    expect(result.signedUrl).toContain('sign');
    expect(result.expiresInSeconds).toBe(900);
  });

  it('4. Candidate accessing another candidate document rejection (403)', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-1',
      type: 'resume',
      url: 'candidates/cand-1/resumes/doc-1/my_resume.pdf',
    });

    await expect(
      service.getSignedDownloadUrl(otherCandidateUser, 'doc-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('5. Authorized employer company logo upload should succeed', async () => {
    const pngFile = {
      originalname: 'logo.png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      mimetype: 'image/png',
      size: 1024,
    } as Express.Multer.File;

    const result = await service.uploadDocument(employerUser, 'company_logo', pngFile, 'comp-1');
    expect(result.bucketName).toBe('company-logos');
  });

  it('6. Unauthorized employer company logo upload rejection (403)', async () => {
    const pngFile = {
      originalname: 'logo.png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      mimetype: 'image/png',
      size: 1024,
    } as Express.Multer.File;

    await expect(
      service.uploadDocument(otherEmployerUser, 'company_logo', pngFile, 'comp-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('7. Invalid MIME type rejection', async () => {
    const txtFile = {
      originalname: 'resume.txt',
      buffer: Buffer.from('plain text'),
      mimetype: 'text/plain',
      size: 512,
    } as Express.Multer.File;

    await expect(service.uploadDocument(candidateUser, 'resume', txtFile)).rejects.toThrow(BadRequestException);
  });

  it('8. Oversized file rejection', async () => {
    const oversizedFile = {
      originalname: 'big.pdf',
      buffer: Buffer.alloc(11 * 1024 * 1024),
      mimetype: 'application/pdf',
      size: 11 * 1024 * 1024,
    } as Express.Multer.File;

    await expect(service.uploadDocument(candidateUser, 'resume', oversizedFile)).rejects.toThrow(BadRequestException);
  });

  it('9. Unsafe filename & script rejection', async () => {
    const scriptFile = {
      originalname: 'exploit.sh',
      buffer: Buffer.from('%PDF-1.4'),
      mimetype: 'application/pdf',
      size: 1024,
    } as Express.Multer.File;

    await expect(service.uploadDocument(candidateUser, 'resume', scriptFile)).rejects.toThrow(BadRequestException);
  });

  it('10. Path traversal rejection (../)', async () => {
    const traversalFile = {
      originalname: '../../etc/passwd.pdf',
      buffer: Buffer.from('%PDF-1.4'),
      mimetype: 'application/pdf',
      size: 1024,
    } as Express.Multer.File;

    const result = await service.uploadDocument(candidateUser, 'resume', traversalFile);
    expect(result.fileName).not.toContain('..');
    expect(result.objectKey).not.toContain('..');
  });

  it('11. Successful upload & SHA-256 checksum generation', async () => {
    const result = await service.uploadDocument(candidateUser, 'resume', validPdfFile);
    expect(result.checksum).toBeDefined();
    expect(result.checksum.length).toBe(64);
  });

  it('12. Supabase storage failure handling & cleanup', async () => {
    mockStorageRepository.uploadFile.mockRejectedValueOnce(new Error('Network error'));
    await expect(service.uploadDocument(candidateUser, 'resume', validPdfFile)).rejects.toThrow(InternalServerErrorException);
    expect(mockPrismaService.candidateDocument.delete).toHaveBeenCalled();
  });

  it('13. Firestore/DB metadata failure handling', async () => {
    mockPrismaService.candidateDocument.create.mockRejectedValueOnce(new Error('DB connection failed'));
    await expect(service.uploadDocument(candidateUser, 'resume', validPdfFile)).rejects.toThrow(InternalServerErrorException);
  });

  it('14. Signed URL authorization for owner and admin', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-1',
      type: 'resume',
      url: 'candidates/cand-1/resumes/doc-1/my_resume.pdf',
    });

    const ownerRes = await service.getSignedDownloadUrl(candidateUser, 'doc-1');
    const adminRes = await service.getSignedDownloadUrl(adminUser, 'doc-1');
    expect(ownerRes.signedUrl).toBeDefined();
    expect(adminRes.signedUrl).toBeDefined();
  });

  it('15. Signed URL 15-minute expiration specification', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-1',
      type: 'resume',
      url: 'candidates/cand-1/resumes/doc-1/my_resume.pdf',
    });

    const result = await service.getSignedDownloadUrl(candidateUser, 'doc-1');
    expect(result.expiresInSeconds).toBe(900);
  });

  it('16. Document deletion by owner', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-1',
      type: 'resume',
      url: 'candidates/cand-1/resumes/doc-1/my_resume.pdf',
    });

    const result = await service.deleteDocument(candidateUser, 'doc-1');
    expect(result.success).toBe(true);
    expect(mockStorageRepository.deleteFile).toHaveBeenCalled();
  });

  it('17. Atomic document replacement', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-1',
      type: 'resume',
      url: 'candidates/cand-1/resumes/doc-1/my_resume.pdf',
    });

    const newFile = {
      originalname: 'new_resume.pdf',
      buffer: Buffer.from('%PDF-1.5 new content'),
      mimetype: 'application/pdf',
      size: 4096,
    } as Express.Multer.File;

    const result = await service.replaceDocument(candidateUser, 'doc-1', newFile);
    expect(result.documentId).toBe('doc-1');
    expect(result.fileName).toBe('new_resume.pdf');
  });

  it('18. Missing Supabase configuration fallback message', async () => {
    mockStorageRepository.uploadFile.mockRejectedValueOnce(
      new InternalServerErrorException('Supabase storage is unconfigured.'),
    );
    await expect(service.uploadDocument(candidateUser, 'resume', validPdfFile)).rejects.toThrow(InternalServerErrorException);
  });

  it('19. Role-based authorization enforcement', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-1',
      type: 'resume',
      url: 'candidates/cand-1/resumes/doc-1/my_resume.pdf',
    });

    await expect(service.deleteDocument(otherCandidateUser, 'doc-1')).rejects.toThrow(ForbiddenException);
  });

  it('20. Verification of no secret key leakage in returned document metadata', async () => {
    const result = await service.uploadDocument(candidateUser, 'resume', validPdfFile);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(serialized).not.toContain('service_role');
    expect(serialized).not.toContain('secret');
  });
});
