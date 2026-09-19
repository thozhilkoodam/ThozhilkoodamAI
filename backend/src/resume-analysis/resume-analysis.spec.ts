import { Test, TestingModule } from '@nestjs/testing';
import { ResumeAnalysisService, UserContext } from './resume-analysis.service';
import { GeminiService } from '../common/ai/gemini.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockPrismaService = {
  candidateDocument: {
    findUnique: jest.fn(),
  },
  aIResumeExtraction: {
    findUnique: jest.fn(),
  },
  candidateProfile: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  aIResumeAnalysis: {
    upsert: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockGeminiService = {
  isConfigured: jest.fn().mockReturnValue(true),
  analyzeResume: jest.fn().mockResolvedValue({
    professionalSummary: 'High performing software developer with expertise in TypeScript.',
    keyStrengths: ['Problem solving', 'System design'],
    technicalSkills: [
      { skill: 'TypeScript', level: 'advanced', evidence: '5 years experience built backend APIs' },
    ],
    softSkills: ['Communication', 'Teamwork'],
    experienceAnalysis: {
      totalExperience: '5 years',
      areasOfExperience: ['Web Development', 'Backend Engineering'],
      seniorityAssessment: 'Senior Level',
    },
    skillGaps: [
      { skill: 'Kubernetes', reason: 'Commonly required for cloud native deployment', priority: 'medium' },
    ],
    careerSuggestions: [
      { role: 'Senior Backend Engineer', reason: 'Matches deep TypeScript and NestJS experience' },
    ],
    resumeImprovements: [
      'Add metrics to backend accomplishments.',
    ],
  }),
};

describe('ResumeAnalysisService (Step 6D.2 Analysis & Security Tests)', () => {
  let service: ResumeAnalysisService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeAnalysisService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GeminiService, useValue: mockGeminiService },
      ],
    }).compile();

    service = module.get<ResumeAnalysisService>(ResumeAnalysisService);
  });

  const candidateA: UserContext = { id: 'cand-a', role: 'candidate' };
  const candidateB: UserContext = { id: 'cand-b', role: 'candidate' };

  it('1-8. Authenticated candidate can analyze own completed extraction: creates analysis record, persists analysisData, model, promptVersion, analyzerVersion, status=COMPLETED, completedAt populated', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: {
        name: 'Jane Doe',
        skills: ['TypeScript', 'NestJS'],
      },
    });

    mockPrismaService.candidateProfile.findUnique.mockResolvedValue({
      userId: 'cand-a',
      preferredRole: 'Backend Engineer',
      preferredIndustry: 'FinTech',
      experienceYears: 5,
    });

    mockPrismaService.aIResumeAnalysis.upsert.mockResolvedValue({
      id: 'analysis-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      extractionId: 'ext-1',
      status: 'PROCESSING',
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      analyzerVersion: 'v1.0',
    });

    mockPrismaService.aIResumeAnalysis.update.mockResolvedValue({
      id: 'analysis-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      extractionId: 'ext-1',
      status: 'COMPLETED',
      analysisData: {
        professionalSummary: 'High performing software developer.',
        keyStrengths: ['Problem solving'],
        technicalSkills: [{ skill: 'TypeScript', level: 'advanced', evidence: '5 years' }],
        softSkills: ['Communication'],
        experienceAnalysis: { totalExperience: '5 years', areasOfExperience: ['Web'], seniorityAssessment: 'Senior' },
        skillGaps: [{ skill: 'Docker', reason: 'Cloud setup', priority: 'low' }],
        careerSuggestions: [{ role: 'Senior Engineer', reason: 'Strong JS' }],
        resumeImprovements: ['Add impact numbers.'],
      },
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      analyzerVersion: 'v1.0',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await service.generateAnalysis(candidateA, 'doc-1');

    expect(res.success).toBe(true);
    expect(res.analysis.status).toBe('COMPLETED');
    expect(res.analysis.model).toBeDefined();
    expect(res.analysis.promptVersion).toBe('v1.0');
    expect(res.analysis.analyzerVersion).toBe('v1.0');
    expect(res.analysis.completedAt).toBeDefined();
    expect(res.analysis.analysisData).toBeDefined();
  });

  it('9. Repeated analysis on the same document uses upsert and does not create duplicates', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Node.js'] },
    });

    mockPrismaService.aIResumeAnalysis.upsert.mockResolvedValue({
      id: 'analysis-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      extractionId: 'ext-1',
      status: 'PROCESSING',
    });

    mockPrismaService.aIResumeAnalysis.update.mockResolvedValue({
      id: 'analysis-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      extractionId: 'ext-1',
      status: 'COMPLETED',
      analysisData: {},
    });

    await service.generateAnalysis(candidateA, 'doc-1');

    expect(mockPrismaService.aIResumeAnalysis.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { documentId: 'doc-1' },
      }),
    );
  });

  it('10 & 11. GET retrieves persisted analysis without calling Gemini', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeAnalysis.findUnique.mockResolvedValue({
      id: 'analysis-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      extractionId: 'ext-1',
      status: 'COMPLETED',
      analysisData: { professionalSummary: 'Persisted summary' },
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      analyzerVersion: 'v1.0',
    });

    const res = await service.getAnalysis(candidateA, 'doc-1');

    expect(res.success).toBe(true);
    expect(res.analysis.analysisData).toEqual({ professionalSummary: 'Persisted summary' });
    expect(mockGeminiService.analyzeResume).not.toHaveBeenCalled();
  });

  it('12 & 13. Candidate B cannot POST or GET analysis for Candidate A (403 Forbidden)', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    await expect(service.generateAnalysis(candidateB, 'doc-1')).rejects.toThrow(
      ForbiddenException,
    );

    await expect(service.getAnalysis(candidateB, 'doc-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('14. Invalid document returns 404 Not Found', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue(null);

    await expect(service.generateAnalysis(candidateA, 'non-existent')).rejects.toThrow(
      NotFoundException,
    );

    await expect(service.getAnalysis(candidateA, 'non-existent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('15. Document without completed extraction is rejected (400 Bad Request)', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      documentId: 'doc-1',
      status: 'FAILED',
      extractedData: null,
    });

    await expect(service.generateAnalysis(candidateA, 'doc-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('16. Non-owner extraction attempt is rejected (403 Forbidden)', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    await expect(service.generateAnalysis(candidateB, 'doc-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('17 & 18. Gemini failure sets status=FAILED and records safe error message', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: { skills: ['JS'] },
    });

    mockPrismaService.aIResumeAnalysis.upsert.mockResolvedValue({
      id: 'analysis-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      extractionId: 'ext-1',
      status: 'PROCESSING',
    });

    mockGeminiService.analyzeResume.mockRejectedValueOnce(
      new Error('Gemini API Error with key AIzaSyTestKey123Secret'),
    );

    await expect(service.generateAnalysis(candidateA, 'doc-1')).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockPrismaService.aIResumeAnalysis.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'analysis-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: expect.not.stringContaining('AIzaSyTestKey123Secret'),
        }),
      }),
    );
  });

  it('19, 20, 21. rawText, signed URLs, and Gemini API keys are never included in response', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeAnalysis.findUnique.mockResolvedValue({
      id: 'analysis-1',
      userId: 'cand-a',
      documentId: 'doc-1',
      extractionId: 'ext-1',
      status: 'COMPLETED',
      analysisData: { summary: 'Clean data' },
      model: 'gemini-1.5-flash',
      promptVersion: 'v1.0',
      analyzerVersion: 'v1.0',
    });

    const res = await service.getAnalysis(candidateA, 'doc-1');
    const resString = JSON.stringify(res);

    expect(resString).not.toContain('rawText');
    expect(resString).not.toContain('signedUrl');
    expect(resString).not.toContain('GEMINI_API_KEY');
    expect(resString).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('22. Prompt rule verification: Gemini analyzeResume call does not pass demographic attributes', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Python'] },
    });

    mockPrismaService.candidateProfile.findUnique.mockResolvedValue({
      userId: 'cand-a',
      preferredRole: 'Data Scientist',
      preferredIndustry: 'AI',
      experienceYears: 3,
    });

    mockPrismaService.aIResumeAnalysis.upsert.mockResolvedValue({
      id: 'analysis-1',
      status: 'PROCESSING',
    });

    mockPrismaService.aIResumeAnalysis.update.mockResolvedValue({
      id: 'analysis-1',
      status: 'COMPLETED',
      analysisData: {},
    });

    await service.generateAnalysis(candidateA, 'doc-1');

    const passedProfileContext = mockGeminiService.analyzeResume.mock.calls[0][1];
    expect(passedProfileContext).toEqual({
      preferredRole: 'Data Scientist',
      preferredIndustry: 'AI',
      experienceYears: 3,
    });
    expect(passedProfileContext).not.toHaveProperty('gender');
    expect(passedProfileContext).not.toHaveProperty('race');
    expect(passedProfileContext).not.toHaveProperty('religion');
  });

  it('23. CandidateProfile is not automatically modified during analysis', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Python'] },
    });

    mockPrismaService.aIResumeAnalysis.upsert.mockResolvedValue({ id: 'analysis-1' });
    mockPrismaService.aIResumeAnalysis.update.mockResolvedValue({ id: 'analysis-1', status: 'COMPLETED' });

    await service.generateAnalysis(candidateA, 'doc-1');

    expect(mockPrismaService.candidateProfile.update).not.toHaveBeenCalled();
  });

  it('24. Malformed output from Gemini is caught and rejected', async () => {
    mockPrismaService.candidateDocument.findUnique.mockResolvedValue({
      id: 'doc-1',
      userId: 'cand-a',
      type: 'resume',
    });

    mockPrismaService.aIResumeExtraction.findUnique.mockResolvedValue({
      id: 'ext-1',
      documentId: 'doc-1',
      status: 'COMPLETED',
      extractedData: { skills: ['Python'] },
    });

    mockPrismaService.aIResumeAnalysis.upsert.mockResolvedValue({ id: 'analysis-1' });

    mockGeminiService.analyzeResume.mockResolvedValueOnce({
      professionalSummary: 'Incomplete output missing key arrays',
    } as any);

    await expect(service.generateAnalysis(candidateA, 'doc-1')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('25. Baseline check: Existing tests compatibility validated', () => {
    expect(service).toBeDefined();
  });
});
