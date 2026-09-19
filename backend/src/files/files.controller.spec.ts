import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilesController } from './files.controller';
import { DocumentsService } from '../documents/documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('FilesController', () => {
  let controller: FilesController;
  let service: jest.Mocked<Partial<DocumentsService>>;

  const mockUser = {
    id: 'user-cand-123',
    email: 'candidate@example.com',
    role: 'candidate',
  };

  const mockFile = {
    fieldname: 'file',
    originalname: 'test-resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test resume content'),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    service = {
      uploadDocument: jest.fn(),
      getDocumentMetadata: jest.fn(),
      getSignedDownloadUrl: jest.fn(),
      deleteDocument: jest.fn(),
      replaceDocument: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: DocumentsService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadResume', () => {
    it('should successfully upload resume when authenticated and file is provided', async () => {
      const mockResult = {
        id: 'doc-123',
        originalName: 'test-resume.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        bucket: 'candidate-resumes',
        objectKey: 'resumes/test-resume.pdf',
        checksum: 'sha256-hash',
        status: 'active',
        createdAt: new Date(),
        downloadUrl: 'https://example.supabase.co/storage/v1/object/sign/candidate-resumes/test-resume.pdf?token=123',
      };

      (service.uploadDocument as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.uploadResume(mockUser, mockFile);

      expect(service.uploadDocument).toHaveBeenCalledWith(mockUser, 'resume', mockFile);
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(controller.uploadResume(mockUser, null as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('uploadCertificate', () => {
    it('should successfully upload certificate', async () => {
      const mockResult = { id: 'cert-1' };
      (service.uploadDocument as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.uploadCertificate(mockUser, mockFile);

      expect(service.uploadDocument).toHaveBeenCalledWith(mockUser, 'certificate', mockFile);
      expect(result).toEqual(mockResult);
    });
  });

  describe('uploadProfileImage', () => {
    it('should successfully upload profile image', async () => {
      const mockResult = { id: 'img-1' };
      (service.uploadDocument as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.uploadProfileImage(mockUser, mockFile);

      expect(service.uploadDocument).toHaveBeenCalledWith(mockUser, 'profile_image', mockFile);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getMetadata', () => {
    it('should return document metadata', async () => {
      const mockResult = { id: 'doc-123', originalName: 'test.pdf' };
      (service.getDocumentMetadata as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getMetadata(mockUser, 'doc-123');

      expect(service.getDocumentMetadata).toHaveBeenCalledWith(mockUser, 'doc-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getDownloadUrl', () => {
    it('should return signed download URL', async () => {
      const mockResult = { downloadUrl: 'https://signed-url' };
      (service.getSignedDownloadUrl as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getDownloadUrl(mockUser, 'doc-123');

      expect(service.getSignedDownloadUrl).toHaveBeenCalledWith(mockUser, 'doc-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document', async () => {
      const mockResult = { success: true, message: 'Document deleted successfully' };
      (service.deleteDocument as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.deleteDocument(mockUser, 'doc-123');

      expect(service.deleteDocument).toHaveBeenCalledWith(mockUser, 'doc-123');
      expect(result).toEqual(mockResult);
    });
  });
});
