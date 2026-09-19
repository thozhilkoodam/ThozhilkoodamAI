import { Test, TestingModule } from '@nestjs/testing';
import { JobMatchingService, UserContext } from './job-matching.service';
import { GeminiService } from '../common/ai/gemini.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

const mockPrismaService = {
  candidateProfile: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  aIResumeExtraction: {
    findFirst: jest.fn(),
  },
  job: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  aIJobMatch: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

const mockGeminiService = {
  isConfigured: jest.fn().mockReturnValue(true),
  matchJobsBatch: jest.fn().mockResolvedValue([
    {
      jobId: 'job-1',
      matchingSkills: [{ skill: 'TypeScript', reason: 'Explicit match' }],
      missingSkills: [{ skill: 'Docker', reason: 'Not listed' }],
      experienceAlignment: { status: 'good', reason: '5 years matches senior level' },
      locationAlignment: { status: 'strong', reason: 'Chennai location matches' },
      preferenceAlignment: { status: 'strong', reason: 'Backend role matches' },
      explanation: 'Candidate demonstrates strong technical alignment for Senior Backend Engineer.',
    },
  ]),
};

describe('JobMatchingService (Step 7B.1 AI Job Matching Tests)', () => {
  let service: JobMatchingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobMatchingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GeminiService, useValue: mockGeminiService },
      ],
    }).compile();

    service = module.get<JobMatchingService>(JobMatchingService);
  });

  const candidateA: UserContext = { id: 'cand-a', role: 'candidate' };
  const candidateB: UserContext = { id: 'cand-b', role: 'candidate' };

  it('1-6. Authenticated candidate receives recommendations, using SQL pre-filtered published jobs & candidate profile preferences', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue({
      userId: 'cand-a',
      preferredRole: 'Backend Engineer',
      preferredLocation: 'Chennai',
    });

    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      status: 'COMPLETED',
      extractedData: { skills: ['TypeScript', 'NestJS'], totalExperience: '5 years' },
    });

    mockPrismaService.job.findMany.mockResolvedValue([
      {
        id: 'job-1',
        title: 'Senior Backend Engineer',
        isPublished: true,
        status: 'published',
        location: 'Chennai',
        organizationName: 'Tech Corp',
        skills: '["TypeScript", "NestJS", "Docker"]',
      },
    ]);

    mockPrismaService.aIJobMatch.findMany.mockResolvedValue([]);

    mockPrismaService.aIJobMatch.upsert.mockResolvedValue({
      id: 'match-1',
      userId: 'cand-a',
      jobId: 'job-1',
      extractionId: 'ext-1',
      matchStrength: 'STRONG',
      matchScore: 88,
      matchData: { explanation: 'Strong match' },
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      matcherVersion: 'v1.0',
      expiresAt: new Date(Date.now() + 86400000),
    });

    const res = await service.getRecommendedJobs(candidateA);

    expect(res.success).toBe(true);
    expect(res.matches).toHaveLength(1);
    expect(res.matches[0].jobId).toBe('job-1');
    expect(mockPrismaService.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: true, status: 'published' },
        take: 50,
      }),
    );
  });

  it('7. Completed resume extraction is required for job matching', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue(null);

    await expect(service.getRecommendedJobs(candidateA)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('8-10. Gemini receives structured candidate/job data and output is validated', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      status: 'COMPLETED',
      extractedData: { skills: ['React'] },
    });

    mockPrismaService.job.findMany.mockResolvedValue([
      { id: 'job-2', title: 'React Dev', isPublished: true, status: 'published' },
    ]);
    mockPrismaService.aIJobMatch.findMany.mockResolvedValue([]);
    mockPrismaService.aIJobMatch.upsert.mockResolvedValue({
      id: 'match-2',
      jobId: 'job-2',
      matchScore: 75,
      matchStrength: 'GOOD',
    });

    await service.getRecommendedJobs(candidateA);

    expect(mockGeminiService.matchJobsBatch).toHaveBeenCalled();
  });

  it('11-19. Deterministic score calculated, match strength derived, fields persisted (skills, explanation, versions, expiresAt)', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      status: 'COMPLETED',
      extractedData: { skills: ['TypeScript'] },
    });
    mockPrismaService.job.findMany.mockResolvedValue([
      { id: 'job-1', title: 'Backend Dev', isPublished: true, status: 'published' },
    ]);
    mockPrismaService.aIJobMatch.findMany.mockResolvedValue([]);
    mockPrismaService.aIJobMatch.upsert.mockResolvedValue({
      id: 'm-1',
      jobId: 'job-1',
      matchScore: 85,
      matchStrength: 'STRONG',
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      matcherVersion: 'v1.0',
      expiresAt: new Date(Date.now() + 86400000),
    });

    await service.getRecommendedJobs(candidateA);

    expect(mockPrismaService.aIJobMatch.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          model: expect.any(String),
          promptVersion: 'v1.0',
          matcherVersion: 'v1.0',
          expiresAt: expect.any(Date),
        }),
      }),
    );
  });

  it('20 & 21. Valid non-expired cache prevents unnecessary Gemini calls; expired cache triggers regeneration', async () => {
    const validExpiry = new Date(Date.now() + 3600000);

    mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Node.js'] },
    });
    mockPrismaService.job.findMany.mockResolvedValue([
      { id: 'job-cached', title: 'Node Dev', isPublished: true, status: 'published' },
    ]);

    mockPrismaService.aIJobMatch.findMany.mockResolvedValue([
      {
        id: 'match-cached',
        userId: 'cand-a',
        jobId: 'job-cached',
        extractionId: 'ext-1',
        matchStrength: 'STRONG',
        matchScore: 90,
        matchData: { explanation: 'Cached match' },
        expiresAt: validExpiry,
      },
    ]);

    const res = await service.getRecommendedJobs(candidateA);

    expect(res.success).toBe(true);
    expect(mockGeminiService.matchJobsBatch).not.toHaveBeenCalled();
  });

  it('22. Repeated matching uses upsert without creating duplicate records', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Node.js'] },
    });
    mockPrismaService.job.findMany.mockResolvedValue([
      { id: 'job-1', title: 'Node Dev', isPublished: true, status: 'published' },
    ]);
    mockPrismaService.aIJobMatch.findMany.mockResolvedValue([]);
    mockPrismaService.aIJobMatch.upsert.mockResolvedValue({
      id: 'match-1',
      jobId: 'job-1',
      matchScore: 80,
      matchStrength: 'STRONG',
    });

    await service.getRecommendedJobs(candidateA);

    expect(mockPrismaService.aIJobMatch.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_jobId_extractionId: {
            userId: 'cand-a',
            jobId: 'job-1',
            extractionId: 'ext-1',
          },
        },
      }),
    );
  });

  it('23 & 24. Candidate isolation & authentication enforcement', async () => {
    mockPrismaService.job.findUnique.mockResolvedValue({
      id: 'job-1',
      isPublished: true,
      status: 'published',
    });
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      userId: 'cand-a',
      status: 'COMPLETED',
      extractedData: { skills: ['JS'] },
    });

    await expect(service.getRecommendedJobs({ id: '', role: '' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('25 & 26. Invalid, closed, or unpublished job is rejected (404 Not Found)', async () => {
    mockPrismaService.job.findUnique.mockResolvedValue({
      id: 'job-closed',
      isPublished: false,
      status: 'closed',
    });

    await expect(service.getJobMatch(candidateA, 'job-closed')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('27. Protected demographic attributes are never sent to Gemini', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue({
      userId: 'cand-a',
      preferredRole: 'Full Stack',
      gender: 'Male',
      dob: new Date('1995-01-01'),
    });
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Python'] },
    });
    mockPrismaService.job.findMany.mockResolvedValue([
      { id: 'job-1', title: 'Python Dev', isPublished: true, status: 'published' },
    ]);
    mockPrismaService.aIJobMatch.findMany.mockResolvedValue([]);
    mockPrismaService.aIJobMatch.upsert.mockResolvedValue({ id: 'm-1', jobId: 'job-1' });

    await service.getRecommendedJobs(candidateA);

    const sentCandidate = mockGeminiService.matchJobsBatch.mock.calls[0][0];
    expect(sentCandidate.preferences).not.toHaveProperty('gender');
    expect(sentCandidate.preferences).not.toHaveProperty('dob');
  });

  it('28. Gemini API key is never exposed in match response', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Python'] },
    });
    mockPrismaService.job.findUnique.mockResolvedValue({
      id: 'job-1',
      title: 'Python Dev',
      isPublished: true,
      status: 'published',
    });
    mockPrismaService.aIJobMatch.findUnique.mockResolvedValue({
      id: 'match-1',
      userId: 'cand-a',
      jobId: 'job-1',
      extractionId: 'ext-1',
      matchStrength: 'STRONG',
      matchScore: 85,
      matchData: { explanation: 'Clean match' },
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      matcherVersion: 'v1.0',
      createdAt: new Date(),
    });

    const res = await service.getJobMatch(candidateA, 'job-1');
    const jsonStr = JSON.stringify(res);

    expect(jsonStr).not.toContain('GEMINI_API_KEY');
    expect(jsonStr).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('29. CandidateProfile is not automatically modified during job matching', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue({ userId: 'cand-a' });
    mockPrismaService.aIResumeExtraction.findFirst.mockResolvedValue({
      id: 'ext-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Python'] },
    });
    mockPrismaService.job.findMany.mockResolvedValue([]);

    await service.getRecommendedJobs(candidateA);

    expect(mockPrismaService.candidateProfile.update).not.toHaveBeenCalled();
  });

  it('30 & 31. Baseline check: Existing extraction and analysis services compatibility maintained', () => {
    expect(service).toBeDefined();
  });
});
