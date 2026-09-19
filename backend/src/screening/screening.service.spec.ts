import { Test, TestingModule } from '@nestjs/testing';
import { ScreeningService } from './screening.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/ai/gemini.service';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('ScreeningService', () => {
  let service: ScreeningService;
  let prisma: PrismaService;
  let geminiService: GeminiService;

  const mockPrisma = {
    candidateApplication: {
      findUnique: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
    },
    aICandidateScreening: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockGeminiService = {
    screenCandidateApplication: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'GEMINI_MODEL') return 'gemini-1.5-flash';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScreeningService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GeminiService, useValue: mockGeminiService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ScreeningService>(ScreeningService);
    prisma = module.get<PrismaService>(PrismaService);
    geminiService = module.get<GeminiService>(GeminiService);
    jest.clearAllMocks();
  });

  describe('Authorization & Isolation', () => {
    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue(null);

      await expect(
        service.screenApplication('non-existent-app', 'company-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if job belongs to another company', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'job-comp-2',
        userId: 'user-1',
        user: { candidateProfile: null, candidateEducation: [], candidateExperience: [], candidateSkills: [], aiResumeExtractions: [] },
      });

      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-comp-2',
        companyId: 'company-2',
      });

      await expect(
        service.screenApplication('app-1', 'company-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Caching & Reuse Behavior', () => {
    it('should return cached completed screening without calling Gemini when forceRescreen is false', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'job-1',
        userId: 'user-1',
        user: { candidateProfile: null, candidateEducation: [], candidateExperience: [], candidateSkills: [], aiResumeExtractions: [] },
      });

      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        title: 'Full Stack Engineer',
      });

      mockPrisma.aICandidateScreening.findUnique.mockResolvedValue({
        id: 'screen-1',
        applicationId: 'app-1',
        status: 'COMPLETED',
        overallFit: 'STRONG',
        screeningScore: 90,
      });

      const result = await service.screenApplication('app-1', 'company-1', false);

      expect(result.success).toBe(true);
      expect(result.cached).toBe(true);
      expect(result.screening.id).toBe('screen-1');
      expect(mockGeminiService.screenCandidateApplication).not.toHaveBeenCalled();
    });
  });

  describe('Screening Execution & Score Calculation', () => {
    it('should calculate deterministic score and invoke Gemini when screening is fresh or forced', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'job-1',
        userId: 'user-1',
        user: {
          candidateProfile: {
            designation: 'Senior Engineer',
            experienceYears: 5,
            currentCompany: 'ABC Tech',
          },
          candidateEducation: [{ degree: 'B.Tech', institution: 'IIT' }],
          candidateExperience: [{ role: 'Developer', company: 'XYZ', duration: '3 yrs' }],
          candidateSkills: [{ name: 'React' }, { name: 'Node.js' }, { name: 'TypeScript' }],
          aiResumeExtractions: [
            {
              extractedData: {
                skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
                education: [{ degree: 'B.Tech', institution: 'IIT' }],
                totalExperience: '5',
              },
            },
          ],
        },
      });

      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        title: 'Senior Full Stack Developer',
        skills: 'React, Node.js, TypeScript',
        experienceYears: 4,
        description: 'Building modern web apps',
      });

      mockPrisma.aICandidateScreening.findUnique.mockResolvedValue(null);
      mockPrisma.aICandidateScreening.upsert.mockResolvedValue({ id: 'screen-1', status: 'PROCESSING' });

      const mockAssessment = {
        overallFit: 'strong',
        matchingSkills: [{ skill: 'React', evidence: 'Used in past projects' }],
        missingSkills: [],
        relevantExperience: { assessment: '5 years matches 4 required', evidence: 'Worked at ABC Tech' },
        qualificationAlignment: { assessment: 'Holds B.Tech in CS', evidence: 'IIT' },
        strengths: ['Full stack experience'],
        concerns: [],
        evidence: [{ point: 'Strong React background', source: 'Resume' }],
        screeningSummary: 'Highly qualified candidate for the role.',
        recommendationForHumanReview: 'Proceed with technical interview.',
      };

      mockGeminiService.screenCandidateApplication.mockResolvedValue(mockAssessment);

      mockPrisma.aICandidateScreening.update.mockResolvedValue({
        id: 'screen-1',
        applicationId: 'app-1',
        status: 'COMPLETED',
        overallFit: 'STRONG',
        screeningScore: 95,
        screeningData: mockAssessment,
      });

      const result = await service.screenApplication('app-1', 'company-1', true);

      expect(result.success).toBe(true);
      expect(result.cached).toBe(false);
      expect(mockGeminiService.screenCandidateApplication).toHaveBeenCalled();
      expect(mockPrisma.aICandidateScreening.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { applicationId: 'app-1' },
          data: expect.objectContaining({
            status: 'COMPLETED',
            overallFit: 'STRONG',
          }),
        }),
      );
    });

    it('should strip protected attributes in sanitizeCandidateForFairScreening', () => {
      const rawCandidate = {
        name: 'John Doe',
        gender: 'Male',
        age: 32,
        religion: 'None',
        race: 'Asian',
        photo: 'https://example.com/photo.jpg',
        candidateProfile: {
          designation: 'Architect',
          experienceYears: 8,
          currentCompany: 'CloudCo',
        },
        candidateEducation: [{ degree: 'M.S. CS', institution: 'MIT' }],
        candidateExperience: [{ role: 'Lead Architect', company: 'CloudCo' }],
        candidateSkills: [{ name: 'Go' }, { name: 'Kubernetes' }],
      };

      const extractionData = {
        skills: ['Go', 'Kubernetes', 'AWS'],
        totalExperience: '8',
      };

      const sanitized = service.sanitizeCandidateForFairScreening(rawCandidate, extractionData);

      expect(sanitized).not.toHaveProperty('gender');
      expect(sanitized).not.toHaveProperty('age');
      expect(sanitized).not.toHaveProperty('religion');
      expect(sanitized).not.toHaveProperty('race');
      expect(sanitized).not.toHaveProperty('photo');
      expect(sanitized.skills).toContain('Go');
      expect(sanitized.skills).toContain('Kubernetes');
      expect(sanitized.experienceYears).toBe(8);
    });

    it('should safely handle Gemini failure by recording FAILED status', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'job-1',
        userId: 'user-1',
        user: { candidateProfile: null, candidateEducation: [], candidateExperience: [], candidateSkills: [], aiResumeExtractions: [] },
      });

      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        title: 'Developer',
      });

      mockPrisma.aICandidateScreening.findUnique.mockResolvedValue(null);
      mockPrisma.aICandidateScreening.upsert.mockResolvedValue({ id: 'screen-1' });
      mockGeminiService.screenCandidateApplication.mockRejectedValue(new Error('AI Service Down'));

      await expect(
        service.screenApplication('app-1', 'company-1'),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockPrisma.aICandidateScreening.update).toHaveBeenCalledWith({
        where: { applicationId: 'app-1' },
        data: expect.objectContaining({
          status: 'FAILED',
        }),
      });
    });
  });
});
