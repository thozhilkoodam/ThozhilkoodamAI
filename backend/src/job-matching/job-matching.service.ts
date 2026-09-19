import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService, JobMatchAssessment } from '../common/ai/gemini.service';

export interface UserContext {
  id: string;
  role: string;
  companyId?: string;
}

@Injectable()
export class JobMatchingService {
  private readonly logger = new Logger(JobMatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async getRecommendedJobs(user: UserContext) {
    if (!user || !user.id) {
      throw new ForbiddenException('Authentication is required.');
    }

    // 1. Load CandidateProfile and latest completed AIResumeExtraction
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId: user.id },
    });

    const extraction = await this.prisma.aIResumeExtraction.findFirst({
      where: { userId: user.id, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
    });

    if (!extraction || !extraction.extractedData) {
      throw new BadRequestException('A completed resume extraction is required to receive AI job recommendations.');
    }

    // 2. SQL pre-filter: Active published jobs (isPublished = true, status = published)
    const activeJobs = await this.prisma.job.findMany({
      where: {
        isPublished: true,
        status: 'published',
      },
      orderBy: { postedDate: 'desc' },
      take: 50, // Limit candidate pool to maximum 50 jobs
    });

    if (activeJobs.length === 0) {
      return { success: true, matches: [] };
    }

    const now = new Date();

    // 3. Check cached non-expired AIJobMatch records for this candidate and extraction
    const cachedMatches = await this.prisma.aIJobMatch.findMany({
      where: {
        userId: user.id,
        extractionId: extraction.id,
        expiresAt: { gt: now },
      },
    });

    const cachedJobMap = new Map(cachedMatches.map(m => [m.jobId, m]));

    const uncachedJobs = activeJobs.filter(j => !cachedJobMap.has(j.id));

    // 4. Call Gemini batch matching only for uncached jobs
    if (uncachedJobs.length > 0) {
      const candidatePayload = {
        extractedFacts: extraction.extractedData as any,
        preferences: profile
          ? {
              preferredRole: profile.preferredRole || null,
              preferredIndustry: profile.preferredIndustry || null,
              preferredLocation: profile.preferredLocation || null,
              experienceYears: profile.experienceYears || null,
              employmentType: profile.employmentType || null,
            }
          : null,
      };

      const jobsPayload = uncachedJobs.map(j => ({
        id: j.id,
        title: j.title,
        description: j.description,
        responsibilities: j.responsibilities,
        qualifications: j.qualifications,
        skills: j.skills,
        mandatorySkills: j.mandatorySkills,
        employmentType: j.employmentType,
        workMode: j.workMode,
        location: j.location,
        experience: j.experience,
        industry: j.industry,
      }));

      const assessments: JobMatchAssessment[] = await this.geminiService.matchJobsBatch(
        candidatePayload,
        jobsPayload,
      );

      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const promptVersion = 'v1.0';
      const matcherVersion = 'v1.0';
      const ttlHours = 24;
      const expiresAt = new Date(now.getTime() + ttlHours * 3600 * 1000);

      // 5. Calculate deterministic score and strength, then persist AIJobMatch
      for (const job of uncachedJobs) {
        const assessment = assessments.find(a => a.jobId === job.id) || {
          jobId: job.id,
          matchingSkills: [],
          missingSkills: [],
          experienceAlignment: { status: 'partial', reason: 'Basic alignment' },
          locationAlignment: { status: 'partial', reason: 'Basic alignment' },
          preferenceAlignment: { status: 'partial', reason: 'Basic alignment' },
          explanation: 'General match evaluation',
        };

        const score = this.calculateDeterministicMatchScore(job, assessment);
        const strength = this.deriveMatchStrength(score);

        const matchRecord = await this.prisma.aIJobMatch.upsert({
          where: {
            userId_jobId_extractionId: {
              userId: user.id,
              jobId: job.id,
              extractionId: extraction.id,
            },
          },
          create: {
            userId: user.id,
            jobId: job.id,
            extractionId: extraction.id,
            matchStrength: strength,
            matchScore: score,
            matchData: assessment as any,
            model: modelName,
            promptVersion,
            matcherVersion,
            expiresAt,
          },
          update: {
            matchStrength: strength,
            matchScore: score,
            matchData: assessment as any,
            model: modelName,
            promptVersion,
            matcherVersion,
            expiresAt,
          },
        });

        cachedJobMap.set(job.id, matchRecord);
      }
    }

    // 6. Return all matched active jobs sorted by matchScore descending
    const resultList = activeJobs
      .map(job => {
        const match = cachedJobMap.get(job.id);
        if (!match) return null;
        return {
          id: match.id,
          jobId: match.jobId,
          jobTitle: job.title,
          organizationName: job.organizationName || job.companyId,
          location: job.location,
          workMode: job.workMode,
          employmentType: job.employmentType,
          matchStrength: match.matchStrength,
          matchScore: match.matchScore,
          matchData: match.matchData,
          expiresAt: match.expiresAt,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.matchScore - a.matchScore);

    return {
      success: true,
      matches: resultList,
    };
  }

  async getJobMatch(user: UserContext, jobId: string) {
    if (!user || !user.id) {
      throw new ForbiddenException('Authentication is required.');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || !job.isPublished || job.status !== 'published') {
      throw new NotFoundException('Job is not available for matching.');
    }

    const extraction = await this.prisma.aIResumeExtraction.findFirst({
      where: { userId: user.id, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
    });

    if (!extraction || !extraction.extractedData) {
      throw new BadRequestException('A completed resume extraction is required to view AI job match details.');
    }

    const now = new Date();

    let match = await this.prisma.aIJobMatch.findUnique({
      where: {
        userId_jobId_extractionId: {
          userId: user.id,
          jobId: job.id,
          extractionId: extraction.id,
        },
      },
    });

    if (!match || (match.expiresAt && match.expiresAt <= now)) {
      // Regenerate match for single job
      const profile = await this.prisma.candidateProfile.findUnique({
        where: { userId: user.id },
      });

      const candidatePayload = {
        extractedFacts: extraction.extractedData as any,
        preferences: profile
          ? {
              preferredRole: profile.preferredRole || null,
              preferredIndustry: profile.preferredIndustry || null,
              preferredLocation: profile.preferredLocation || null,
              experienceYears: profile.experienceYears || null,
              employmentType: profile.employmentType || null,
            }
          : null,
      };

      const jobsPayload = [{
        id: job.id,
        title: job.title,
        description: job.description,
        responsibilities: job.responsibilities,
        qualifications: job.qualifications,
        skills: job.skills,
        mandatorySkills: job.mandatorySkills,
        employmentType: job.employmentType,
        workMode: job.workMode,
        location: job.location,
        experience: job.experience,
        industry: job.industry,
      }];

      const assessments = await this.geminiService.matchJobsBatch(candidatePayload, jobsPayload);
      const assessment = assessments[0] || {
        jobId: job.id,
        matchingSkills: [],
        missingSkills: [],
        experienceAlignment: { status: 'partial', reason: 'Basic evaluation' },
        locationAlignment: { status: 'partial', reason: 'Basic evaluation' },
        preferenceAlignment: { status: 'partial', reason: 'Basic evaluation' },
        explanation: 'General match evaluation',
      };

      const score = this.calculateDeterministicMatchScore(job, assessment);
      const strength = this.deriveMatchStrength(score);

      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const ttlHours = 24;
      const expiresAt = new Date(now.getTime() + ttlHours * 3600 * 1000);

      match = await this.prisma.aIJobMatch.upsert({
        where: {
          userId_jobId_extractionId: {
            userId: user.id,
            jobId: job.id,
            extractionId: extraction.id,
          },
        },
        create: {
          userId: user.id,
          jobId: job.id,
          extractionId: extraction.id,
          matchStrength: strength,
          matchScore: score,
          matchData: assessment as any,
          model: modelName,
          promptVersion: 'v1.0',
          matcherVersion: 'v1.0',
          expiresAt,
        },
        update: {
          matchStrength: strength,
          matchScore: score,
          matchData: assessment as any,
          model: modelName,
          promptVersion: 'v1.0',
          matcherVersion: 'v1.0',
          expiresAt,
        },
      });
    }

    return {
      success: true,
      match: {
        id: match.id,
        jobId: match.jobId,
        jobTitle: job.title,
        organizationName: job.organizationName || job.companyId,
        location: job.location,
        matchStrength: match.matchStrength,
        matchScore: match.matchScore,
        matchData: match.matchData,
        model: match.model,
        promptVersion: match.promptVersion,
        matcherVersion: match.matcherVersion,
        createdAt: match.createdAt,
        expiresAt: match.expiresAt,
      },
    };
  }

  private calculateDeterministicMatchScore(job: any, assessment: JobMatchAssessment): number {
    const matchingCount = assessment.matchingSkills?.length || 0;
    const missingCount = assessment.missingSkills?.length || 0;
    const totalSkills = matchingCount + missingCount;

    let skillsScore = 40;
    if (totalSkills > 0) {
      skillsScore = Math.round((matchingCount / totalSkills) * 40);
    }

    let mandatoryScore = 20;
    if (job.mandatorySkills) {
      mandatoryScore = matchingCount > 0 ? 20 : 5;
    }

    const alignmentMap: Record<string, number> = {
      strong: 20,
      good: 16,
      partial: 10,
      weak: 4,
      unknown: 10,
    };

    const expScore = alignmentMap[assessment.experienceAlignment?.status || 'partial'] || 10;
    const locScore = (alignmentMap[assessment.locationAlignment?.status || 'partial'] || 10) / 2;
    const prefScore = (alignmentMap[assessment.preferenceAlignment?.status || 'partial'] || 10) / 2;

    const total = Math.min(100, Math.max(0, Math.round(skillsScore + mandatoryScore + expScore + locScore + prefScore)));
    return total;
  }

  private deriveMatchStrength(score: number): 'STRONG' | 'GOOD' | 'PARTIAL' | 'WEAK' {
    if (score >= 80) return 'STRONG';
    if (score >= 65) return 'GOOD';
    if (score >= 45) return 'PARTIAL';
    return 'WEAK';
  }
}
