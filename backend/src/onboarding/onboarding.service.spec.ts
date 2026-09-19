import { Test, TestingModule } from '@nestjs/testing';
import {
  OnboardingService,
  DEFAULT_ONBOARDING_CHECKLIST,
} from './onboarding.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { OnboardingStatus, JobOfferStatus } from '@prisma/client';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let prisma: any;
  let documentsService: any;

  const mockCompanyId = 'company-abc-123';
  const mockCandidateId = 'candidate-xyz-456';
  const mockApplicationId = 'application-789';
  const mockOfferId = 'offer-101';
  const mockOnboardingId = 'onboarding-uuid-001';

  const mockOnboarding = {
    id: mockOnboardingId,
    applicationId: mockApplicationId,
    offerId: mockOfferId,
    candidateId: mockCandidateId,
    companyId: mockCompanyId,
    jobId: 'job-555',
    status: OnboardingStatus.NOT_STARTED,
    joiningDate: new Date('2026-10-01T00:00:00Z'),
    checklist: DEFAULT_ONBOARDING_CHECKLIST,
    completionPercentage: 0,
    documents: [],
    internalNotes: null,
    completedAt: null,
    joinedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    candidate: {
      id: mockCandidateId,
      name: 'Ravi Kumar',
      email: 'ravi@example.com',
      phone: '9876543210',
    },
    company: {
      id: mockCompanyId,
      agencyName: 'ABC Technologies',
    },
    job: {
      id: 'job-555',
      title: 'Full Stack Engineer',
      department: 'Engineering',
    },
    offer: {
      id: mockOfferId,
      baseSalary: 1200000,
      currency: 'INR',
    },
  };

  beforeEach(async () => {
    prisma = {
      jobOffer: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      candidateOnboarding: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      candidateApplication: {
        update: jest.fn().mockResolvedValue({}),
      },
      candidateProfile: {
        upsert: jest.fn().mockResolvedValue({}),
      },
      candidateExperience: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
    };

    documentsService = {
      uploadDocument: jest.fn(),
      getSignedDownloadUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: PrismaService, useValue: prisma },
        { provide: DocumentsService, useValue: documentsService },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
  });

  describe('Employer: List and Retrieve Onboarding', () => {
    it('should list onboardings for employer company after syncing accepted offers', async () => {
      prisma.jobOffer.findMany.mockResolvedValue([
        {
          id: 'offer-1',
          applicationId: 'app-1',
          candidateId: 'cand-1',
          companyId: mockCompanyId,
          jobId: 'job-1',
          status: JobOfferStatus.ACCEPTED,
          joiningDate: new Date('2026-10-01'),
        },
      ]);
      prisma.candidateOnboarding.findUnique.mockResolvedValue(null);
      prisma.candidateOnboarding.create.mockResolvedValue(mockOnboarding);
      prisma.candidateOnboarding.findMany.mockResolvedValue([mockOnboarding]);

      const result = await service.getEmployerOnboardings(mockCompanyId);

      expect(prisma.jobOffer.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockOnboardingId);
    });

    it('should retrieve a single onboarding record for authorized employer', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);

      const result = await service.getEmployerOnboarding(mockOnboardingId, mockCompanyId);
      expect(result.id).toBe(mockOnboardingId);
      expect(result.companyId).toBe(mockCompanyId);
    });

    it('should throw NotFoundException if onboarding does not exist', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(null);

      await expect(
        service.getEmployerOnboarding('non-existent-id', mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if employer belongs to another company (multi-tenant isolation)', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue({
        ...mockOnboarding,
        companyId: 'competitor-company-999',
      });

      await expect(
        service.getEmployerOnboarding(mockOnboardingId, mockCompanyId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Employer: Update Checklist & Progress', () => {
    it('should update employer checklist items and calculate progress percentage', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);
      prisma.candidateOnboarding.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...mockOnboarding, ...data }),
      );

      const result = await service.updateEmployerOnboarding(mockOnboardingId, mockCompanyId, {
        items: [{ id: 'item-emp-bgv', completed: true, notes: 'Clearance verified' }],
      });

      expect(result.success).toBe(true);
      expect(prisma.candidateOnboarding.update).toHaveBeenCalled();
      const updateCall = prisma.candidateOnboarding.update.mock.calls[0][0];
      expect(updateCall.data.completionPercentage).toBeGreaterThan(0);
      expect(updateCall.data.status).toBe(OnboardingStatus.IN_PROGRESS);
    });

    it('should reject updating a cancelled onboarding record', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue({
        ...mockOnboarding,
        status: OnboardingStatus.CANCELLED,
      });

      await expect(
        service.updateEmployerOnboarding(mockOnboardingId, mockCompanyId, {
          items: [{ id: 'item-emp-bgv', completed: true }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Employer: Controlled Joining Confirmation', () => {
    it('should confirm candidate joining, update statuses to JOINED/joined, and activate employment profile', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);
      prisma.candidateOnboarding.update.mockResolvedValue({
        ...mockOnboarding,
        status: OnboardingStatus.JOINED,
        joinedAt: new Date(),
      });

      const result = await service.confirmJoining(mockOnboardingId, mockCompanyId, {
        notes: 'Candidate reported to office on time and completed induction.',
      });

      expect(result.success).toBe(true);
      expect(prisma.candidateOnboarding.update).toHaveBeenCalledWith({
        where: { id: mockOnboardingId },
        data: expect.objectContaining({
          status: OnboardingStatus.JOINED,
        }),
        include: expect.any(Object),
      });
      // Verifies CandidateApplication status set to 'joined'
      expect(prisma.candidateApplication.update).toHaveBeenCalledWith({
        where: { id: mockApplicationId },
        data: { status: 'joined' },
      });
      // Verifies employment profile activation
      expect(prisma.candidateProfile.upsert).toHaveBeenCalled();
    });

    it('should reject joining confirmation for unauthorized company with ForbiddenException', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue({
        ...mockOnboarding,
        companyId: 'different-company',
      });

      await expect(
        service.confirmJoining(mockOnboardingId, mockCompanyId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject joining confirmation if onboarding was cancelled with BadRequestException', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue({
        ...mockOnboarding,
        status: OnboardingStatus.CANCELLED,
      });

      await expect(
        service.confirmJoining(mockOnboardingId, mockCompanyId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Employer: Cancel Onboarding', () => {
    it('should cancel onboarding with documented reason', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);
      prisma.candidateOnboarding.update.mockResolvedValue({
        ...mockOnboarding,
        status: OnboardingStatus.CANCELLED,
        cancellationReason: 'Candidate withdrew before joining',
      });

      const result = await service.cancelOnboarding(mockOnboardingId, mockCompanyId, {
        reason: 'Candidate withdrew before joining',
      });

      expect(result.success).toBe(true);
      expect(result.onboarding.status).toBe(OnboardingStatus.CANCELLED);
    });
  });

  describe('Candidate: Portal & Isolation', () => {
    it('should allow candidate to retrieve their own onboarding record', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);

      const result = await service.getCandidateOnboarding(mockOnboardingId, mockCandidateId);
      expect(result.id).toBe(mockOnboardingId);
      expect(result.candidateId).toBe(mockCandidateId);
    });

    it('should reject another candidate accessing the onboarding record with ForbiddenException', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);

      await expect(
        service.getCandidateOnboarding(mockOnboardingId, 'intruder-candidate-999'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow candidate to complete candidate-assigned items', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);
      prisma.candidateOnboarding.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...mockOnboarding, ...data }),
      );

      const result = await service.updateCandidateChecklist(mockOnboardingId, mockCandidateId, {
        items: [{ id: 'item-cand-personal', completed: true }],
      });

      expect(result.success).toBe(true);
      expect(prisma.candidateOnboarding.update).toHaveBeenCalled();
    });

    it('should reject candidate trying to complete employer-designated item with ForbiddenException', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);

      await expect(
        service.updateCandidateChecklist(mockOnboardingId, mockCandidateId, {
          items: [{ id: 'item-emp-bgv', completed: true }],
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Candidate: Document Upload Security', () => {
    it('should upload document via DocumentsService, link to checklist item, and update progress', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);
      prisma.candidateOnboarding.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...mockOnboarding, ...data }),
      );

      const mockFile = {
        originalname: 'degree_certificate.pdf',
        buffer: Buffer.from('fake pdf'),
        mimetype: 'application/pdf',
        size: 1024,
      } as any;

      documentsService.uploadDocument.mockResolvedValue({
        documentId: 'doc-uuid-111',
        fileName: 'degree_certificate.pdf',
      });

      const result = await service.uploadCandidateDocument(
        mockOnboardingId,
        mockCandidateId,
        'item-cand-education',
        mockFile,
      );

      expect(result.success).toBe(true);
      expect(documentsService.uploadDocument).toHaveBeenCalledWith(
        { id: mockCandidateId, role: 'candidate' },
        'certificate',
        mockFile,
        mockCandidateId,
      );
      expect(prisma.candidateOnboarding.update).toHaveBeenCalled();
      const updateCall = prisma.candidateOnboarding.update.mock.calls[0][0];
      const educationItem = updateCall.data.checklist.find((i: any) => i.id === 'item-cand-education');
      expect(educationItem.completed).toBe(true);
      expect(educationItem.documentId).toBe('doc-uuid-111');
    });
  });

  describe('Secure Document Download URL', () => {
    it('should allow candidate owner to generate signed URL', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);
      documentsService.getSignedDownloadUrl.mockResolvedValue({
        signedUrl: 'https://storage.supabase.co/signed-url',
      });

      const result = await service.getSignedDocumentDownloadUrl(
        mockOnboardingId,
        'doc-uuid-111',
        { id: mockCandidateId, role: 'candidate' },
      );

      expect(result.signedUrl).toBeDefined();
    });

    it('should allow employer of the same company to generate signed URL', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);
      documentsService.getSignedDownloadUrl.mockResolvedValue({
        signedUrl: 'https://storage.supabase.co/signed-url',
      });

      const result = await service.getSignedDocumentDownloadUrl(
        mockOnboardingId,
        'doc-uuid-111',
        { id: mockCompanyId, role: 'employer', companyId: mockCompanyId },
      );

      expect(result.signedUrl).toBeDefined();
    });

    it('should reject unauthorized user from downloading document with ForbiddenException', async () => {
      prisma.candidateOnboarding.findUnique.mockResolvedValue(mockOnboarding);

      await expect(
        service.getSignedDocumentDownloadUrl(
          mockOnboardingId,
          'doc-uuid-111',
          { id: 'random-intruder', role: 'candidate' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
