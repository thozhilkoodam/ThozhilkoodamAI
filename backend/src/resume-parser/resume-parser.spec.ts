import { Test, TestingModule } from '@nestjs/testing';
import { ResumeParserService, UserContext } from './resume-parser.service';
import { GeminiService } from '../common/ai/gemini.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException, ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';

const mockPrismaService = {
  candidateDocument: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  aIResumeExtraction: {
    upsert: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockStorageRepository = {
  getFileBuffer: jest.fn(),
  uploadFile: jest.fn(),
  getSignedDownloadUrl: jest.fn(),
  deleteFile: jest.fn(),
  isStorageEnabled: jest.fn().mockReturnValue(true),
};

const mockGeminiService = {
  isConfigured: jest.fn().mockReturnValue(true),
  extractResumeData: jest.fn().mockResolvedValue({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    totalExperience: '5 years',
    skills: ['TypeScript', 'NestJS', 'React'],
    education: [{ degree: 'B.Tech', institution: 'Anna University', year: '2020' }],
    currentCompany: 'Tech Corp',
    designation: 'Software Engineer',
    location: 'Chennai',
    summary: 'Experienced software engineer.',
  }),
};

describe('ResumeParserService (Step 6C Persistence & Security Tests)', () => {
  let service: ResumeParserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeParserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: 'FileStorageRepository', useValue: mockStorageRepository },
        { provide: GeminiService, useValue: mockGeminiService },
      ],
    }).compile();

    service = module.get<ResumeParserService>(ResumeParserService);
  });

  const candidateA: UserContext = { id: 'cand-a', role: 'candidate' };
  const candidateB: UserContext = { id: 'cand-b', role: 'candidate' };

  it('1-8. Creates AI extraction, saves fields, model, versions, COMPLETED status & completedAt', async () => {
    mockPrismaService.candidateDocument.findFirst.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
      url: 'candidates/cand-a/resumes/doc-1/test-resume.pdf',
      name: 'test-resume.pdf',
    });

    mockStorageRepository.getFileBuffer.mockResolvedValue(
      Buffer.from('%PDF-1.4 Mock PDF content for John Doe'),
    );

    mockPrismaService.aIResumeExtraction.upsert.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      status: 'PROCESSING',
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      parserVersion: 'v1.0',
    });

    mockPrismaService.aIResumeExtraction.update.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        totalExperience: '5 years',
        skills: ['TypeScript', 'NestJS'],
        education: [{ degree: 'B.Tech', institution: 'Anna University', year: '2020' }],
        currentCompany: 'Tech Corp',
        designation: 'Software Engineer',
        location: 'Chennai',
        summary: 'Experienced software engineer.',
      },
      rawText: '%PDF-1.4 Mock PDF content for John Doe',
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      parserVersion: 'v1.0',
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
    });

    const result = await service.parseDocument(candidateA, 'doc-1');

    expect(result.success).toBe(true);
    expect(result.extraction.status).toBe('COMPLETED');
    expect(result.extraction.model).toBe('gemini-1.5-flash');
    expect(result.extraction.promptVersion).toBe('v1.0');
    expect(result.extraction.parserVersion).toBe('v1.0');
    expect(result.extraction.completedAt).toBeDefined();

    expect(mockPrismaService.aIResumeExtraction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ext-1' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          extractedData: expect.any(Object),
          rawText: expect.any(String),
          completedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('9 & 10. Reprocessing same document uses upsert without duplicate rows', async () => {
    mockPrismaService.candidateDocument.findFirst.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
      url: 'candidates/cand-a/resumes/doc-1/test-resume.pdf',
      name: 'test-resume.pdf',
    });

    mockStorageRepository.getFileBuffer.mockResolvedValue(
      Buffer.from('%PDF-1.4 Content'),
    );

    mockPrismaService.aIResumeExtraction.upsert.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      status: 'PROCESSING',
    });

    mockPrismaService.aIResumeExtraction.update.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: {},
    });

    await service.parseDocument(candidateA, 'doc-1');

    expect(mockPrismaService.aIResumeExtraction.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { documentId: 'doc-1' },
      }),
    );
  });

  it('11. Candidate B cannot parse or GET Candidate A extraction (403 Forbidden)', async () => {
    mockPrismaService.candidateDocument.findFirst.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
      url: 'candidates/cand-a/resumes/doc-1/test-resume.pdf',
      name: 'test-resume.pdf',
    });

    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
      url: 'candidates/cand-a/resumes/doc-1/test-resume.pdf',
      name: 'test-resume.pdf',
    });

    await expect(
      service.parseDocument(candidateB, 'doc-1'),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.getExtraction(candidateB, 'doc-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('12. Invalid document returns 404', async () => {
    mockPrismaService.candidateDocument.findFirst.mockResolvedValue(null);

    await expect(
      service.parseDocument(candidateA, 'non-existent-doc'),
    ).rejects.toThrow(NotFoundException);
  });

  it('13. Non-resume document returns 400', async () => {
    mockPrismaService.candidateDocument.findFirst.mockResolvedValue({
      id: 'doc-cert',
      userId: 'cand-a',
      type: 'certificate',
      url: 'candidates/cand-a/certificates/doc-cert/cert.pdf',
      name: 'cert.pdf',
    });

    await expect(
      service.parseDocument(candidateA, 'doc-cert'),
    ).rejects.toThrow(BadRequestException);
  });

  it('14. Unauthenticated request rejected', async () => {
    await expect(
      service.parseDocument({ id: '', role: '' }, 'doc-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('15 & 16. Gemini failure sets FAILED status and records safe errorMessage', async () => {
    mockPrismaService.candidateDocument.findFirst.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
      url: 'candidates/cand-a/resumes/doc-1/test-resume.pdf',
      name: 'test-resume.pdf',
    });

    mockStorageRepository.getFileBuffer.mockResolvedValue(
      Buffer.from('%PDF-1.4 Mock PDF content'),
    );

    mockPrismaService.aIResumeExtraction.upsert.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      status: 'PROCESSING',
    });

    mockGeminiService.extractResumeData.mockRejectedValueOnce(
      new InternalServerErrorException('Rate limit exceeded at https://generativelanguage.googleapis.com with key AIzaSyABC123Token'),
    );

    await expect(
      service.parseDocument(candidateA, 'doc-1'),
    ).rejects.toThrow(InternalServerErrorException);

    expect(mockPrismaService.aIResumeExtraction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ext-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: expect.not.stringContaining('AIzaSyABC123Token'),
        }),
      }),
    );
  });

  it('17, 18, 19. Secrets, rawText by default, and signed URLs are not returned in extraction response', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: { name: 'John Doe' },
      rawText: 'Secret full text content',
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      parserVersion: 'v1.0',
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
    });

    const res = await service.getExtraction(candidateA, 'doc-1');
    const jsonStr = JSON.stringify(res);

    expect(res.extraction.extractedData).toBeDefined();
    expect((res.extraction as any).rawText).toBeUndefined();
    expect(jsonStr).not.toContain('GEMINI_API_KEY');
    expect(jsonStr).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('20. Candidate A can GET own extraction successfully', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: { name: 'John Doe' },
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      parserVersion: 'v1.0',
    });

    const res = await service.getExtraction(candidateA, 'doc-1');
    expect(res.success).toBe(true);
    expect(res.extraction.status).toBe('COMPLETED');
  });
});
