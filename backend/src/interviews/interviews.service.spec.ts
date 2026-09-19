import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsService } from './interviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/ai/gemini.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CandidateInterviewStatus, AIPreparationStatus } from '@prisma/client';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let prisma: any;
  let geminiService: any;

  const mockCompanyId = 'company-123';
  const mockOtherCompanyId = 'company-other';
  const mockCandidateId = 'candidate-123';
  const mockOtherCandidateId = 'candidate-other';
  const mockApplicationId = 'app-123';
  const mockJobId = 'job-123';
  const mockInterviewId = 'interview-123';

  const mockApplication = {
    id: mockApplicationId,
    jobId: mockJobId,
    userId: mockCandidateId,
    company: 'Test Company',
    position: 'Full Stack Engineer',
    status: 'applied',
    stage: 'applied',
    job: {
      id: mockJobId,
      companyId: mockCompanyId,
      title: 'Full Stack Engineer',
      description: 'Role description',
      skills: 'TypeScript, React, Node.js',
    },
    user: {
      id: mockCandidateId,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
    },
  };

  const mockInterview = {
    id: mockInterviewId,
    applicationId: mockApplicationId,
    jobId: mockJobId,
    candidateId: mockCandidateId,
    companyId: mockCompanyId,
    scheduledAt: new Date('2026-10-01T10:00:00Z'),
    interviewType: 'online',
    durationMinutes: 45,
    meetingLink: 'https://meet.google.com/abc-def',
    status: 'scheduled',
    notes: 'Initial round',
    application: mockApplication,
    job: mockApplication.job,
    aiPreparation: null,
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn((cb) => cb(prisma)),
      job: {
        findUnique: jest.fn(),
      },
      candidateApplication: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      candidateInterview: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      interviewResponse: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
      candidateNotification: {
        create: jest.fn(),
      },
      aIInterviewPreparation: {
        upsert: jest.fn(),
      },
      aIInterviewEvaluation: {
        upsert: jest.fn(),
      },
    };

    geminiService = {
      generateCandidateInterviewPreparation: jest.fn(),
      evaluateInterviewResponses: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: PrismaService, useValue: prisma },
        { provide: GeminiService, useValue: geminiService },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
  });

  describe('scheduleInterview', () => {
    it('should schedule an interview successfully and update application stage', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue(mockApplication.job);
      prisma.candidateInterview.create.mockResolvedValue(mockInterview);
      prisma.candidateApplication.update.mockResolvedValue({
        ...mockApplication,
        status: 'interview',
        stage: 'interview',
      });
      prisma.candidateNotification.create.mockResolvedValue({});

      const result = await service.scheduleInterview(mockCompanyId, mockApplicationId, {
        scheduledAt: '2026-10-01T10:00:00Z',
        interviewType: 'online' as any,
        durationMinutes: 45,
        meetingLink: 'https://meet.google.com/abc-def',
      });

      expect(result).toBeDefined();
      expect(prisma.candidateInterview.create).toHaveBeenCalled();
      expect(prisma.candidateApplication.update).toHaveBeenCalledWith({
        where: { id: mockApplicationId },
        data: expect.objectContaining({
          status: 'interview',
          stage: 'interview',
        }),
      });
    });

    it('should throw NotFoundException if application does not exist', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(null);

      await expect(
        service.scheduleInterview(mockCompanyId, 'non-existent', {
          scheduledAt: '2026-10-01T10:00:00Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if company tries to schedule interview for another company job', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue({ ...mockApplication.job, companyId: mockCompanyId });

      await expect(
        service.scheduleInterview(mockOtherCompanyId, mockApplicationId, {
          scheduledAt: '2026-10-01T10:00:00Z',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if scheduledAt is invalid', async () => {
      prisma.candidateApplication.findUnique.mockResolvedValue(mockApplication);
      prisma.job.findUnique.mockResolvedValue(mockApplication.job);

      await expect(
        service.scheduleInterview(mockCompanyId, mockApplicationId, {
          scheduledAt: 'invalid-date',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getEmployerInterviews', () => {
    it('should return all interviews for the employer company', async () => {
      prisma.candidateInterview.findMany.mockResolvedValue([mockInterview]);

      const result = await service.getEmployerInterviews(mockCompanyId);
      expect(result).toHaveLength(1);
      expect(prisma.candidateInterview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: mockCompanyId }),
        }),
      );
    });
  });

  describe('updateInterview & cancellation', () => {
    it('should update interview details and notify candidate if rescheduled', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);
      prisma.candidateInterview.update.mockResolvedValue({
        ...mockInterview,
        scheduledAt: new Date('2026-10-02T10:00:00Z'),
        status: 'rescheduled',
      });
      prisma.candidateNotification.create.mockResolvedValue({});

      const result = await service.updateInterview(mockCompanyId, mockInterviewId, {
        scheduledAt: '2026-10-02T10:00:00Z',
      });

      expect(result.status).toBe('rescheduled');
      expect(prisma.candidateInterview.update).toHaveBeenCalled();
    });

    it('should cancel interview and notify candidate with reason', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);
      prisma.candidateInterview.update.mockResolvedValue({
        ...mockInterview,
        status: 'cancelled',
        cancellationReason: 'Candidate unavailable',
      });
      prisma.candidateNotification.create.mockResolvedValue({});

      const result = await service.cancelInterview(
        mockCompanyId,
        mockInterviewId,
        'Candidate unavailable',
      );

      expect(result.status).toBe('cancelled');
      expect(prisma.candidateInterview.update).toHaveBeenCalledWith({
        where: { id: mockInterviewId },
        data: expect.objectContaining({
          status: 'cancelled',
          cancellationReason: 'Candidate unavailable',
        }),
      });
    });

    it('should throw ForbiddenException if modifying interview of another company', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);

      await expect(
        service.updateInterview(mockOtherCompanyId, mockInterviewId, {
          notes: 'Unauthorized edit',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Candidate interview endpoints & isolation', () => {
    it('should return candidate interviews', async () => {
      prisma.candidateInterview.findMany.mockResolvedValue([mockInterview]);

      const result = await service.getCandidateInterviews(mockCandidateId);
      expect(result).toHaveLength(1);
      expect(prisma.candidateInterview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { candidateId: mockCandidateId },
        }),
      );
    });

    it('should throw ForbiddenException if candidate views another candidate interview', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);

      await expect(
        service.getCandidateInterviewById(mockOtherCandidateId, mockInterviewId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('AI Interview Preparation', () => {
    const mockPrepData = {
      roleOverview: 'Preparation overview',
      interviewFormatTips: ['Be punctual'],
      technicalTopics: [{ topic: 'TypeScript', whyImportant: 'Core', preparationTips: ['Review types'] }],
      behavioralTopics: [{ topic: 'Teamwork', context: 'Sprint delivery', exampleGuidance: 'Use STAR' }],
      suggestedQuestions: [{ question: 'Tell us about your background', category: 'behavioral', guidance: 'Be concise', sampleOutline: '1. intro' }],
      preparationAreas: ['Architecture'],
      roleSpecificTips: ['Focus on code quality'],
      disclaimer: 'AI-generated interview preparation.',
    };

    it('should generate and save AI interview preparation', async () => {
      const fullInterviewWithCandidate = {
        ...mockInterview,
        candidate: {
          id: mockCandidateId,
          name: 'John Doe',
          candidateProfile: { experienceYears: '5' },
          candidateSkills: [{ name: 'TypeScript' }],
          candidateEducation: [],
          candidateExperience: [],
        },
      };

      prisma.candidateInterview.findUnique.mockResolvedValue(fullInterviewWithCandidate);
      geminiService.generateCandidateInterviewPreparation.mockResolvedValue(mockPrepData);
      prisma.aIInterviewPreparation.upsert.mockResolvedValue({
        id: 'prep-123',
        status: AIPreparationStatus.COMPLETED,
        preparationData: mockPrepData,
      });

      const result = await service.generateOrGetCandidatePreparation(
        mockCandidateId,
        mockInterviewId,
      );

      expect(result.cached).toBe(false);
      expect(result.preparation).toBeDefined();
      expect(geminiService.generateCandidateInterviewPreparation).toHaveBeenCalled();
    });

    it('should return cached AI preparation when available and not forced', async () => {
      const interviewWithCachedPrep = {
        ...mockInterview,
        aiPreparation: {
          id: 'prep-123',
          status: AIPreparationStatus.COMPLETED,
          preparationData: mockPrepData,
        },
      };

      prisma.candidateInterview.findUnique.mockResolvedValue(interviewWithCachedPrep);

      const result = await service.generateOrGetCandidatePreparation(
        mockCandidateId,
        mockInterviewId,
        false,
      );

      expect(result.cached).toBe(true);
      expect(geminiService.generateCandidateInterviewPreparation).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if another candidate requests preparation', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);

      await expect(
        service.generateOrGetCandidatePreparation(mockOtherCandidateId, mockInterviewId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Fairness sanitization', () => {
    it('should strip protected attributes (gender, photo, passwords, dob)', () => {
      const sensitiveCandidate = {
        name: 'John Doe',
        gender: 'Male',
        photo: 'https://secret.photo.jpg',
        passwordHash: 'secret-hash',
        candidateProfile: {
          gender: 'Male',
          dob: new Date('1990-01-01'),
          photo: 'https://secret.photo.jpg',
          experienceYears: '5',
          preferredRole: 'Full Stack',
        },
        candidateSkills: [{ name: 'TypeScript' }],
        candidateEducation: [{ degree: 'B.Tech', college: 'Anna University' }],
        candidateExperience: [{ role: 'Developer', company: 'Tech Inc' }],
      };

      const sanitized: any = service.sanitizeCandidateForFairPreparation(sensitiveCandidate);

      expect(sanitized.gender).toBeUndefined();
      expect(sanitized.photo).toBeUndefined();
      expect(sanitized.passwordHash).toBeUndefined();
      expect(sanitized.skills).toEqual(['TypeScript']);
      expect(sanitized.experienceYears).toBe('5');
    });
  });

  describe('saveInterviewResponses', () => {
    it('should save interview Q&A responses within transaction', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);
      prisma.interviewResponse.findMany.mockResolvedValue([
        { id: 'resp-1', question: 'Q1', response: 'A1', orderIndex: 0 },
      ]);

      const result = await service.saveInterviewResponses(mockCompanyId, mockInterviewId, {
        responses: [{ question: 'Q1', response: 'A1', orderIndex: 0 }],
        overallNotes: 'Great communication',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.interviewResponse.deleteMany).toHaveBeenCalledWith({ where: { interviewId: mockInterviewId } });
      expect(prisma.interviewResponse.createMany).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should throw ForbiddenException if company does not own interview', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);

      await expect(
        service.saveInterviewResponses(mockOtherCompanyId, mockInterviewId, {
          responses: [{ question: 'Q1', response: 'A1' }],
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getInterviewResponses', () => {
    it('should retrieve ordered interview responses for authorized employer', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);
      prisma.interviewResponse.findMany.mockResolvedValue([
        { id: 'resp-1', question: 'Q1', response: 'A1', orderIndex: 0 },
        { id: 'resp-2', question: 'Q2', response: 'A2', orderIndex: 1 },
      ]);

      const result = await service.getInterviewResponses(mockCompanyId, mockInterviewId);

      expect(result.interviewId).toBe(mockInterviewId);
      expect(result.responses).toHaveLength(2);
    });

    it('should throw ForbiddenException on cross-company response retrieval', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);

      await expect(
        service.getInterviewResponses(mockOtherCompanyId, mockInterviewId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('evaluateInterview (AI Interview Evaluation Assistant)', () => {
    const mockEvalResult = {
      evaluationSummary: 'Good performance',
      competencyAreas: [
        { competency: 'Technical', observation: 'Solid answer', ratingLevel: 'strong' },
      ],
      strengths: ['Clear answers'],
      areasForClarification: ['More testing experience needed'],
      evidenceFromResponses: [
        { topic: 'Architecture', candidateResponseSnippet: 'Built NestJS APIs', evaluationNote: 'Grounded' },
      ],
      communicationObservations: 'Articulate',
      technicalObservations: 'Competent',
      behavioralObservations: 'Collaborative',
      followUpQuestions: ['Elaborate on scaling'],
      disclaimer: 'AI-assisted interview evaluation for human review. This does not make or predict an employment decision.',
    };

    it('should evaluate interview responses and compute deterministic rubric score', async () => {
      const interviewWithResponses = {
        ...mockInterview,
        responses: [
          { question: 'Q1', response: 'Extensive explanation of NestJS architecture with PostgreSQL optimization.', score: 85, competencyArea: 'Architecture' },
          { question: 'Q2', response: 'Detailed incident remediation with root-cause analysis.', score: 80, competencyArea: 'Reliability' },
        ],
        candidate: {
          candidateProfile: { experienceYears: '5' },
          candidateSkills: [{ name: 'TypeScript' }],
        },
      };

      prisma.candidateInterview.findUnique.mockResolvedValue(interviewWithResponses);
      geminiService.evaluateInterviewResponses.mockResolvedValue(mockEvalResult);
      prisma.aIInterviewEvaluation.upsert.mockResolvedValue({
        id: 'eval-1',
        interviewId: mockInterviewId,
        deterministicScore: 82.5,
        evaluationData: mockEvalResult,
        status: 'COMPLETED',
      });

      const result = await service.evaluateInterview(mockCompanyId, mockInterviewId, false);

      expect(result.cached).toBe(false);
      expect(geminiService.evaluateInterviewResponses).toHaveBeenCalled();
      expect(prisma.aIInterviewEvaluation.upsert).toHaveBeenCalled();
      // Crucial: candidate application stage/status should NOT be changed!
      expect(prisma.candidateApplication.update).not.toHaveBeenCalled();
    });

    it('should return cached evaluation if completed and reEvaluate is false', async () => {
      const interviewWithCached = {
        ...mockInterview,
        responses: [{ question: 'Q1', response: 'A1' }],
        aiEvaluation: {
          id: 'eval-1',
          status: 'COMPLETED',
          evaluationData: mockEvalResult,
        },
      };

      prisma.candidateInterview.findUnique.mockResolvedValue(interviewWithCached);

      const result = await service.evaluateInterview(mockCompanyId, mockInterviewId, false);

      expect(result.cached).toBe(true);
      expect(geminiService.evaluateInterviewResponses).not.toHaveBeenCalled();
    });

    it('should re-evaluate when reEvaluate is true', async () => {
      const interviewWithCached = {
        ...mockInterview,
        responses: [{ question: 'Q1', response: 'A1' }],
        aiEvaluation: {
          id: 'eval-1',
          status: 'COMPLETED',
          evaluationData: mockEvalResult,
        },
      };

      prisma.candidateInterview.findUnique.mockResolvedValue(interviewWithCached);
      geminiService.evaluateInterviewResponses.mockResolvedValue(mockEvalResult);
      prisma.aIInterviewEvaluation.upsert.mockResolvedValue({
        id: 'eval-1',
        status: 'COMPLETED',
      });

      const result = await service.evaluateInterview(mockCompanyId, mockInterviewId, true);

      expect(result.cached).toBe(false);
      expect(geminiService.evaluateInterviewResponses).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no responses and no notes are present', async () => {
      const emptyInterview = {
        ...mockInterview,
        notes: '',
        responses: [],
      };

      prisma.candidateInterview.findUnique.mockResolvedValue(emptyInterview);

      await expect(
        service.evaluateInterview(mockCompanyId, mockInterviewId, false),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if another company requests evaluation', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);

      await expect(
        service.evaluateInterview(mockOtherCompanyId, mockInterviewId, false),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getInterviewEvaluation', () => {
    it('should retrieve evaluation for authorized company', async () => {
      const interviewWithEval = {
        ...mockInterview,
        aiEvaluation: {
          id: 'eval-1',
          status: 'COMPLETED',
        },
      };

      prisma.candidateInterview.findUnique.mockResolvedValue(interviewWithEval);

      const result = await service.getInterviewEvaluation(mockCompanyId, mockInterviewId);

      expect(result.cached).toBe(true);
      expect(result.evaluation.id).toBe('eval-1');
    });

    it('should throw NotFoundException if evaluation does not exist', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue({
        ...mockInterview,
        aiEvaluation: null,
      });

      await expect(
        service.getInterviewEvaluation(mockCompanyId, mockInterviewId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for cross-company access', async () => {
      prisma.candidateInterview.findUnique.mockResolvedValue(mockInterview);

      await expect(
        service.getInterviewEvaluation(mockOtherCompanyId, mockInterviewId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

