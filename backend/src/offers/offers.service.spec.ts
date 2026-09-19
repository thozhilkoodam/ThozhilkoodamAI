import { Test, TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/ai/gemini.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JobOfferStatus } from '@prisma/client';

describe('OffersService', () => {
  let service: OffersService;
  let prisma: any;
  let geminiService: any;

  const mockCompanyId = 'company-123';
  const mockApplicationId = 'app-123';
  const mockCandidateId = 'cand-123';
  const mockJobId = 'job-123';

  const mockApplication = {
    id: mockApplicationId,
    jobId: mockJobId,
    userId: mockCandidateId,
    status: 'interview',
    user: {
      id: mockCandidateId,
      name: 'John Doe',
      email: 'john@example.com',
      candidateProfile: {
        fullName: 'John Doe',
        designation: 'Senior Developer',
      },
    },
  };

  const mockJob = {
    id: mockJobId,
    title: 'Senior TypeScript Developer',
    companyId: mockCompanyId,
    location: 'Chennai, India',
    companyName: 'Tech Corp',
    company: {
      id: mockCompanyId,
      agencyName: 'Tech Corp',
    },
  };

  const mockOffer = {
    id: 'offer-123',
    applicationId: mockApplicationId,
    jobId: mockJobId,
    candidateId: mockCandidateId,
    companyId: mockCompanyId,
    jobTitle: 'Senior TypeScript Developer',
    baseSalary: 1800000,
    salaryPeriod: 'annual',
    currency: 'INR',
    variableBonus: 200000,
    benefits: JSON.stringify(['Health Insurance', 'Remote Work']),
    offerLetterContent: '# Employment Offer Letter',
    status: JobOfferStatus.DRAFT,
  };

  beforeEach(async () => {
    prisma = {
      candidateApplication: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      job: {
        findUnique: jest.fn(),
      },
      jobOffer: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    geminiService = {
      generateOfferLetter: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: PrismaService, useValue: prisma },
        { provide: GeminiService, useValue: geminiService },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
  });

  describe('generateAiDraft', () => {
    it('should generate an AI draft offer letter for authorized employer', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue(mockJob);
      geminiService.generateOfferLetter.mockResolvedValue({
        headline: 'Employment Offer for Senior Developer',
        letterMarkdown: '# Offer Content',
        keyHighlights: ['Role: Senior Developer'],
        standardClauses: ['3-month probation'],
        suggestedBenefits: ['Health Insurance'],
      });

      const result = await service.generateAiDraft(mockApplicationId, mockCompanyId, {
        jobTitle: 'Senior Developer',
        baseSalary: 1800000,
      });

      expect(result.success).toBe(true);
      expect(result.aiDraft.headline).toBe('Employment Offer for Senior Developer');
      expect(geminiService.generateOfferLetter).toHaveBeenCalled();
    });

    it('should reject unauthorized cross-company access with ForbiddenException', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue({ ...mockJob, companyId: 'other-company' });

      await expect(
        service.generateAiDraft(mockApplicationId, mockCompanyId, {
          jobTitle: 'Senior Developer',
          baseSalary: 1800000,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('saveOffer', () => {
    it('should create new offer as DRAFT if none exists', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue(mockJob);
      prisma.jobOffer.findUnique.mockResolvedValue(null);
      prisma.jobOffer.create.mockResolvedValue(mockOffer);

      const result = await service.saveOffer(mockApplicationId, mockCompanyId, {
        jobTitle: 'Senior TypeScript Developer',
        baseSalary: 1800000,
        offerLetterContent: '# Employment Offer Letter',
      });

      expect(result.success).toBe(true);
      expect(prisma.jobOffer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            applicationId: mockApplicationId,
            status: JobOfferStatus.DRAFT,
          }),
        }),
      );
    });

    it('should update existing offer if already present', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue(mockJob);
      prisma.jobOffer.findUnique.mockResolvedValue(mockOffer);
      prisma.jobOffer.update.mockResolvedValue({ ...mockOffer, baseSalary: 2000000 });

      const result = await service.saveOffer(mockApplicationId, mockCompanyId, {
        jobTitle: 'Senior TypeScript Developer',
        baseSalary: 2000000,
        offerLetterContent: '# Updated Letter',
      });

      expect(result.success).toBe(true);
      expect(prisma.jobOffer.update).toHaveBeenCalled();
    });
  });

  describe('sendOffer', () => {
    it('should update offer status to SENT and application status to offer', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue(mockJob);
      prisma.jobOffer.findUnique.mockResolvedValue(mockOffer);
      prisma.jobOffer.update.mockResolvedValue({ ...mockOffer, status: JobOfferStatus.SENT });
      prisma.candidateApplication.update.mockResolvedValue({ ...mockApplication, status: 'offer' });

      const result = await service.sendOffer(mockApplicationId, mockCompanyId);

      expect(result.success).toBe(true);
      expect(prisma.jobOffer.update).toHaveBeenCalledWith({
        where: { applicationId: mockApplicationId },
        data: expect.objectContaining({ status: JobOfferStatus.SENT }),
      });
      expect(prisma.candidateApplication.update).toHaveBeenCalledWith({
        where: { id: mockApplicationId },
        data: expect.objectContaining({ status: 'offer', offerStatus: 'sent' }),
      });
    });

    it('should throw BadRequestException if no offer was created before sending', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue(mockJob);
      prisma.jobOffer.findUnique.mockResolvedValue(null);

      await expect(service.sendOffer(mockApplicationId, mockCompanyId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Candidate: getCandidateOffer & respondToOffer', () => {
    it('should allow candidate to retrieve released offer', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue({
        ...mockApplication,
        jobOffer: { ...mockOffer, status: JobOfferStatus.SENT },
      });

      const result = await service.getCandidateOffer(mockApplicationId, mockCandidateId);
      expect(result.offer).toBeDefined();
      expect(result.offer.status).toBe(JobOfferStatus.SENT);
    });

    it('should reject candidate viewing DRAFT offer with NotFoundException', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue({
        ...mockApplication,
        jobOffer: { ...mockOffer, status: JobOfferStatus.DRAFT },
      });

      await expect(
        service.getCandidateOffer(mockApplicationId, mockCandidateId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject unauthorized candidate access with ForbiddenException', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue({
        ...mockApplication,
        userId: 'other-candidate',
      });

      await expect(
        service.getCandidateOffer(mockApplicationId, mockCandidateId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should accept offer, update offer status to ACCEPTED and application status to onboarding', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue({
        ...mockApplication,
        jobOffer: { ...mockOffer, status: JobOfferStatus.SENT },
      });
      prisma.jobOffer.update.mockResolvedValue({ ...mockOffer, status: JobOfferStatus.ACCEPTED });
      prisma.candidateApplication.update.mockResolvedValue({
        ...mockApplication,
        status: 'onboarding',
        offerStatus: 'accepted',
      });

      const result = await service.respondToOffer(mockApplicationId, mockCandidateId, {
        action: 'accept',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('accepted');
      expect(prisma.jobOffer.update).toHaveBeenCalledWith({
        where: { applicationId: mockApplicationId },
        data: expect.objectContaining({ status: JobOfferStatus.ACCEPTED }),
      });
      expect(prisma.candidateApplication.update).toHaveBeenCalledWith({
        where: { id: mockApplicationId },
        data: expect.objectContaining({ status: 'onboarding', offerStatus: 'accepted' }),
      });
    });

    it('should decline offer with reason and update offer status to DECLINED', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue({
        ...mockApplication,
        jobOffer: { ...mockOffer, status: JobOfferStatus.SENT },
      });
      prisma.jobOffer.update.mockResolvedValue({
        ...mockOffer,
        status: JobOfferStatus.DECLINED,
        declineReason: 'Accepted another role',
      });
      prisma.candidateApplication.update.mockResolvedValue({
        ...mockApplication,
        offerStatus: 'declined',
      });

      const result = await service.respondToOffer(mockApplicationId, mockCandidateId, {
        action: 'decline',
        reason: 'Accepted another role',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('declined');
      expect(prisma.jobOffer.update).toHaveBeenCalledWith({
        where: { applicationId: mockApplicationId },
        data: expect.objectContaining({
          status: JobOfferStatus.DECLINED,
          declineReason: 'Accepted another role',
        }),
      });
    });
  });
});
