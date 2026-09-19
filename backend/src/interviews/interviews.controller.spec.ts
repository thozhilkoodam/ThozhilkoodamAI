import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';

describe('InterviewsController', () => {
  let controller: InterviewsController;
  let service: any;

  const mockCompanyId = 'company-123';
  const mockCandidateId = 'candidate-123';
  const mockApplicationId = 'app-123';
  const mockInterviewId = 'interview-123';

  beforeEach(async () => {
    service = {
      scheduleInterview: jest.fn().mockResolvedValue({ id: mockInterviewId }),
      getEmployerInterviews: jest.fn().mockResolvedValue([{ id: mockInterviewId }]),
      getEmployerInterviewById: jest.fn().mockResolvedValue({ id: mockInterviewId }),
      updateInterview: jest.fn().mockResolvedValue({ id: mockInterviewId }),
      cancelInterview: jest.fn().mockResolvedValue({ id: mockInterviewId, status: 'cancelled' }),
      getCandidateInterviews: jest.fn().mockResolvedValue([{ id: mockInterviewId }]),
      getCandidateInterviewById: jest.fn().mockResolvedValue({ id: mockInterviewId }),
      generateOrGetCandidatePreparation: jest.fn().mockResolvedValue({ cached: true, preparation: {} }),
      saveInterviewResponses: jest.fn().mockResolvedValue({ success: true, count: 1 }),
      getInterviewResponses: jest.fn().mockResolvedValue({ interviewId: mockInterviewId, responses: [] }),
      evaluateInterview: jest.fn().mockResolvedValue({ cached: false, evaluation: { id: 'eval-1' } }),
      getInterviewEvaluation: jest.fn().mockResolvedValue({ cached: true, evaluation: { id: 'eval-1' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewsController],
      providers: [{ provide: InterviewsService, useValue: service }],
    }).compile();

    controller = module.get<InterviewsController>(InterviewsController);
  });

  it('should call scheduleInterview', async () => {
    const dto = { scheduledAt: '2026-10-01T10:00:00Z' };
    const res = await controller.scheduleInterview(mockApplicationId, mockCompanyId, dto as any);
    expect(res).toEqual({ id: mockInterviewId });
    expect(service.scheduleInterview).toHaveBeenCalledWith(mockCompanyId, mockApplicationId, dto);
  });

  it('should call getEmployerInterviews', async () => {
    const res = await controller.getEmployerInterviews(mockCompanyId, 'scheduled', 'job-1');
    expect(res).toHaveLength(1);
    expect(service.getEmployerInterviews).toHaveBeenCalledWith(mockCompanyId, { status: 'scheduled', jobId: 'job-1' });
  });

  it('should call updateInterview', async () => {
    const dto = { durationMinutes: 60 };
    const res = await controller.updateInterview(mockInterviewId, mockCompanyId, dto as any);
    expect(res).toEqual({ id: mockInterviewId });
    expect(service.updateInterview).toHaveBeenCalledWith(mockCompanyId, mockInterviewId, dto);
  });

  it('should call cancelInterview', async () => {
    const res = await controller.cancelInterview(mockInterviewId, mockCompanyId, 'Reason');
    expect(res).toEqual({ id: mockInterviewId, status: 'cancelled' });
    expect(service.cancelInterview).toHaveBeenCalledWith(mockCompanyId, mockInterviewId, 'Reason');
  });

  it('should call saveInterviewResponses', async () => {
    const dto = { responses: [{ question: 'Q1', response: 'A1' }] };
    const res = await controller.saveInterviewResponses(mockInterviewId, mockCompanyId, dto as any);
    expect(res).toEqual({ success: true, count: 1 });
    expect(service.saveInterviewResponses).toHaveBeenCalledWith(mockCompanyId, mockInterviewId, dto);
  });

  it('should call getInterviewResponses', async () => {
    const res = await controller.getInterviewResponses(mockInterviewId, mockCompanyId);
    expect(res).toEqual({ interviewId: mockInterviewId, responses: [] });
    expect(service.getInterviewResponses).toHaveBeenCalledWith(mockCompanyId, mockInterviewId);
  });

  it('should call evaluateInterview', async () => {
    const res = await controller.evaluateInterview(mockInterviewId, mockCompanyId, 'true');
    expect(res).toEqual({ cached: false, evaluation: { id: 'eval-1' } });
    expect(service.evaluateInterview).toHaveBeenCalledWith(mockCompanyId, mockInterviewId, true);
  });

  it('should call getInterviewEvaluation', async () => {
    const res = await controller.getInterviewEvaluation(mockInterviewId, mockCompanyId);
    expect(res).toEqual({ cached: true, evaluation: { id: 'eval-1' } });
    expect(service.getInterviewEvaluation).toHaveBeenCalledWith(mockCompanyId, mockInterviewId);
  });

  it('should call getCandidateInterviews', async () => {
    const res = await controller.getCandidateInterviews(mockCandidateId);
    expect(res).toHaveLength(1);
    expect(service.getCandidateInterviews).toHaveBeenCalledWith(mockCandidateId);
  });

  it('should call generateCandidatePreparation', async () => {
    const res = await controller.generateCandidatePreparation(mockInterviewId, mockCandidateId, 'true');
    expect(res).toEqual({ cached: true, preparation: {} });
    expect(service.generateOrGetCandidatePreparation).toHaveBeenCalledWith(mockCandidateId, mockInterviewId, true);
  });
});
