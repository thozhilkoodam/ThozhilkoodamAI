import { Test, TestingModule } from '@nestjs/testing';
import { EmployerOffersController, CandidateOffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { UnauthorizedException } from '@nestjs/common';

describe('OffersControllers', () => {
  let employerController: EmployerOffersController;
  let candidateController: CandidateOffersController;
  let service: any;

  beforeEach(async () => {
    service = {
      generateAiDraft: jest.fn(),
      saveOffer: jest.fn(),
      getEmployerOffer: jest.fn(),
      sendOffer: jest.fn(),
      withdrawOffer: jest.fn(),
      getCandidateOffer: jest.fn(),
      respondToOffer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerOffersController, CandidateOffersController],
      providers: [{ provide: OffersService, useValue: service }],
    }).compile();

    employerController = module.get<EmployerOffersController>(EmployerOffersController);
    candidateController = module.get<CandidateOffersController>(CandidateOffersController);
  });

  describe('EmployerOffersController', () => {
    it('should generate AI draft when authorized', async () => {
      service.generateAiDraft.mockResolvedValue({ success: true });
      const result = await employerController.generateAiDraft(
        { id: 'comp-1' },
        'app-1',
        { jobTitle: 'Developer', baseSalary: 1000000 },
      );
      expect(result).toEqual({ success: true });
      expect(service.generateAiDraft).toHaveBeenCalledWith('app-1', 'comp-1', expect.anything());
    });

    it('should throw UnauthorizedException if user has no id', async () => {
      await expect(
        employerController.generateAiDraft(
          null,
          'app-1',
          { jobTitle: 'Developer', baseSalary: 1000000 },
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should save offer when authorized', async () => {
      service.saveOffer.mockResolvedValue({ success: true });
      const result = await employerController.saveOffer(
        { id: 'comp-1' },
        'app-1',
        { jobTitle: 'Developer', baseSalary: 1000000, offerLetterContent: 'Content' },
      );
      expect(result).toEqual({ success: true });
      expect(service.saveOffer).toHaveBeenCalledWith('app-1', 'comp-1', expect.anything());
    });

    it('should send offer when authorized', async () => {
      service.sendOffer.mockResolvedValue({ success: true });
      const result = await employerController.sendOffer({ id: 'comp-1' }, 'app-1');
      expect(result).toEqual({ success: true });
      expect(service.sendOffer).toHaveBeenCalledWith('app-1', 'comp-1');
    });

    it('should withdraw offer when authorized', async () => {
      service.withdrawOffer.mockResolvedValue({ success: true });
      const result = await employerController.withdrawOffer({ id: 'comp-1' }, 'app-1');
      expect(result).toEqual({ success: true });
      expect(service.withdrawOffer).toHaveBeenCalledWith('app-1', 'comp-1');
    });
  });

  describe('CandidateOffersController', () => {
    it('should get candidate offer when authenticated', async () => {
      service.getCandidateOffer.mockResolvedValue({ offer: { id: 'offer-1' } });
      const result = await candidateController.getOffer({ id: 'cand-1' }, 'app-1');
      expect(result).toEqual({ offer: { id: 'offer-1' } });
      expect(service.getCandidateOffer).toHaveBeenCalledWith('app-1', 'cand-1');
    });

    it('should throw UnauthorizedException if candidate user is missing', async () => {
      await expect(candidateController.getOffer(null, 'app-1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should respond to offer when authenticated', async () => {
      service.respondToOffer.mockResolvedValue({ success: true, action: 'accepted' });
      const result = await candidateController.respondOffer(
        { id: 'cand-1' },
        'app-1',
        { action: 'accept' },
      );
      expect(result).toEqual({ success: true, action: 'accepted' });
      expect(service.respondToOffer).toHaveBeenCalledWith('app-1', 'cand-1', { action: 'accept' });
    });
  });
});
