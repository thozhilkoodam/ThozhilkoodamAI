import { Test, TestingModule } from '@nestjs/testing';
import {
  EmployerOnboardingController,
  CandidateOnboardingController,
} from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { UnauthorizedException } from '@nestjs/common';

describe('OnboardingControllers', () => {
  let employerController: EmployerOnboardingController;
  let candidateController: CandidateOnboardingController;
  let service: any;

  const mockCompanyUser = { id: 'company-123', role: 'recruitment_agency' };
  const mockCandidateUser = { id: 'candidate-456', role: 'candidate' };

  beforeEach(async () => {
    service = {
      getEmployerOnboardings: jest.fn().mockResolvedValue([]),
      getEmployerOnboarding: jest.fn().mockResolvedValue({ id: 'onb-1' }),
      updateEmployerOnboarding: jest.fn().mockResolvedValue({ success: true }),
      confirmJoining: jest.fn().mockResolvedValue({ success: true, message: 'Confirmed' }),
      cancelOnboarding: jest.fn().mockResolvedValue({ success: true }),
      getCandidateOnboardings: jest.fn().mockResolvedValue([]),
      getCandidateOnboarding: jest.fn().mockResolvedValue({ id: 'onb-1' }),
      updateCandidateChecklist: jest.fn().mockResolvedValue({ success: true }),
      uploadCandidateDocument: jest.fn().mockResolvedValue({ success: true }),
      getSignedDocumentDownloadUrl: jest.fn().mockResolvedValue({ signedUrl: 'https://test' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerOnboardingController, CandidateOnboardingController],
      providers: [{ provide: OnboardingService, useValue: service }],
    }).compile();

    employerController = module.get<EmployerOnboardingController>(EmployerOnboardingController);
    candidateController = module.get<CandidateOnboardingController>(CandidateOnboardingController);
  });

  describe('EmployerOnboardingController', () => {
    it('should call getEmployerOnboardings with companyId', async () => {
      await employerController.getOnboardings(mockCompanyUser, 'IN_PROGRESS', 'developer');
      expect(service.getEmployerOnboardings).toHaveBeenCalledWith(mockCompanyUser.id, {
        status: 'IN_PROGRESS',
        search: 'developer',
      });
    });

    it('should throw UnauthorizedException if employer user has no id', async () => {
      await expect(
        employerController.getOnboardings(null),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call confirmJoining with id, companyId, and dto', async () => {
      await employerController.confirmJoining(mockCompanyUser, 'onb-1', { notes: 'Joining confirmed' });
      expect(service.confirmJoining).toHaveBeenCalledWith('onb-1', mockCompanyUser.id, { notes: 'Joining confirmed' });
    });
  });

  describe('CandidateOnboardingController', () => {
    it('should call getCandidateOnboardings with candidateUserId', async () => {
      await candidateController.getOnboardings(mockCandidateUser);
      expect(service.getCandidateOnboardings).toHaveBeenCalledWith(mockCandidateUser.id);
    });

    it('should throw UnauthorizedException if candidate user has no id', async () => {
      await expect(
        candidateController.getOnboardings(null),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call updateCandidateChecklist with id and candidateUserId', async () => {
      const dto = { items: [{ id: 'item-1', completed: true }] };
      await candidateController.updateChecklist(mockCandidateUser, 'onb-1', dto);
      expect(service.updateCandidateChecklist).toHaveBeenCalledWith('onb-1', mockCandidateUser.id, dto);
    });
  });
});
