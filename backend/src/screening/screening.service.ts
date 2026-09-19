import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService, CandidateScreeningAssessment } from '../common/ai/gemini.service';
import { ConfigService } from '@nestjs/config';

export interface ScoreBreakdown {
  skillsScore: number;
  experienceScore: number;
  qualificationScore: number;
  profileCompletenessScore: number;
  totalScore: number;
}

@Injectable()
export class ScreeningService {
  private readonly logger = new Logger(ScreeningService.name);
  public static readonly PROMPT_VERSION = 'v1.0';
  public static readonly SCREENER_VERSION = '1.0.0';

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Deterministically calculates a candidate screening score based on objective factors
   */
  calculateDeterministicScore(job: any, candidateData: any): ScoreBreakdown {
    // 1. Skills Match Score (0 - 40 points)
    let skillsScore = 20; // default baseline
    const jobSkillsRaw = [
      job.skills,
      job.primarySkills,
      job.mandatorySkills,
    ]
      .filter(Boolean)
      .join(',');

    const requiredSkills = jobSkillsRaw
      .split(/[,;\n]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 1);

    const candidateSkills: string[] = (candidateData.skills || []).map((s: string) =>
      s.toLowerCase().trim(),
    );

    if (requiredSkills.length > 0 && candidateSkills.length > 0) {
      const matchCount = requiredSkills.filter((req) =>
        candidateSkills.some((cand) => cand.includes(req) || req.includes(cand)),
      ).length;
      const ratio = matchCount / requiredSkills.length;
      skillsScore = Math.round(ratio * 40);
    } else if (candidateSkills.length >= 5) {
      skillsScore = 28;
    }

    // 2. Experience Alignment Score (0 - 35 points)
    let experienceScore = 18;
    const requiredYears = job.experienceYears || (job.experience ? parseInt(job.experience) : null);
    const candidateYears = candidateData.experienceYears || (candidateData.totalExperienceYears ? parseFloat(candidateData.totalExperienceYears) : null);

    if (requiredYears && candidateYears !== null) {
      if (candidateYears >= requiredYears) {
        experienceScore = 35;
      } else if (candidateYears >= requiredYears * 0.7) {
        experienceScore = 26;
      } else {
        experienceScore = Math.max(10, Math.round((candidateYears / requiredYears) * 35));
      }
    } else if (candidateData.experience && candidateData.experience.length > 0) {
      experienceScore = 25;
    }

    // 3. Qualification Alignment Score (0 - 15 points)
    let qualificationScore = 8;
    if (candidateData.education && candidateData.education.length > 0) {
      qualificationScore = 15;
    }

    // 4. Profile Completeness Score (0 - 10 points)
    let profileCompletenessScore = 5;
    if (candidateData.hasResumeExtraction) profileCompletenessScore += 3;
    if (candidateData.experience && candidateData.experience.length >= 2) profileCompletenessScore += 2;
    profileCompletenessScore = Math.min(10, profileCompletenessScore);

    const totalScore = Math.min(100, Math.max(0, skillsScore + experienceScore + qualificationScore + profileCompletenessScore));

    return {
      skillsScore,
      experienceScore,
      qualificationScore,
      profileCompletenessScore,
      totalScore,
    };
  }

  /**
   * Strips all protected personal characteristics from candidate data
   */
  sanitizeCandidateForFairScreening(rawCandidate: any, extractionData: any) {
    const skillsSet = new Set<string>();

    if (Array.isArray(extractionData?.skills)) {
      extractionData.skills.forEach((s: string) => skillsSet.add(s));
    }
    if (Array.isArray(rawCandidate.candidateSkills)) {
      rawCandidate.candidateSkills.forEach((s: any) => skillsSet.add(s.name));
    }

    const education = (rawCandidate.candidateEducation || []).map((edu: any) => ({
      degree: edu.degree || edu.qualification,
      institution: edu.institution,
      year: edu.yearOfPassing || edu.year || null,
    }));

    const experience = (rawCandidate.candidateExperience || []).map((exp: any) => ({
      role: exp.role || exp.designation,
      company: exp.company,
      duration: exp.duration,
      description: exp.description,
    }));

    return {
      designation: rawCandidate.candidateProfile?.designation || extractionData?.designation || null,
      currentCompany: rawCandidate.candidateProfile?.currentCompany || extractionData?.currentCompany || null,
      experienceYears: rawCandidate.candidateProfile?.experienceYears || (extractionData?.totalExperience ? parseFloat(extractionData.totalExperience) : null),
      skills: Array.from(skillsSet),
      education: education.length > 0 ? education : extractionData?.education || [],
      experience,
      hasResumeExtraction: !!extractionData,
    };
  }

  /**
   * Main candidate screening execution with caching and authorization
   */
  async screenApplication(
    applicationId: string,
    companyId: string,
    forceRescreen = false,
  ) {
    // 1. Verify Application and Job Ownership
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          include: {
            candidateProfile: true,
            candidateEducation: true,
            candidateExperience: true,
            candidateSkills: true,
            aiResumeExtractions: {
              where: { status: 'COMPLETED' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: application.jobId },
    });

    if (!job || job.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to screen applications for this job');
    }

    // 2. Check for existing cached screening if forceRescreen is false
    const existingScreening = await this.prisma.aICandidateScreening.findUnique({
      where: { applicationId },
    });

    if (
      existingScreening &&
      existingScreening.status === 'COMPLETED' &&
      !forceRescreen
    ) {
      return {
        success: true,
        cached: true,
        screening: existingScreening,
      };
    }

    // 3. Prepare sanitized, fair payloads
    const extractionData = application.user.aiResumeExtractions[0]?.extractedData || null;
    const sanitizedCandidate = this.sanitizeCandidateForFairScreening(
      application.user,
      extractionData,
    );

    const sanitizedJob = {
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      experienceRequired: job.experience || `${job.experienceYears || ''} years`,
      skills: job.skills,
      primarySkills: job.primarySkills,
      mandatorySkills: job.mandatorySkills,
      description: job.description,
      responsibilities: job.responsibilities,
      qualifications: job.qualifications,
    };

    // 4. Calculate deterministic score
    const scoreBreakdown = this.calculateDeterministicScore(job, sanitizedCandidate);

    const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';

    // 5. Create or update record to PROCESSING
    const pendingScreening = await this.prisma.aICandidateScreening.upsert({
      where: { applicationId },
      create: {
        applicationId,
        jobId: job.id,
        candidateId: application.userId,
        status: 'PROCESSING',
        model: modelName,
        promptVersion: ScreeningService.PROMPT_VERSION,
        screenerVersion: ScreeningService.SCREENER_VERSION,
      },
      update: {
        status: 'PROCESSING',
        model: modelName,
        promptVersion: ScreeningService.PROMPT_VERSION,
        screenerVersion: ScreeningService.SCREENER_VERSION,
        errorMessage: null,
      },
    });

    try {
      // 6. Invoke Gemini for semantic evaluation
      const assessment = await this.geminiService.screenCandidateApplication(
        sanitizedJob,
        sanitizedCandidate,
      );

      const overallFitEnumMap: Record<string, any> = {
        strong: 'STRONG',
        good: 'GOOD',
        partial: 'PARTIAL',
        weak: 'WEAK',
      };

      const fitEnum = overallFitEnumMap[assessment.overallFit] || 'PARTIAL';

      // 7. Persist completed screening
      const completed = await this.prisma.aICandidateScreening.update({
        where: { applicationId },
        data: {
          status: 'COMPLETED',
          overallFit: fitEnum,
          screeningScore: scoreBreakdown.totalScore,
          scoreBreakdown: scoreBreakdown as any,
          screeningData: assessment as any,
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        cached: false,
        screening: completed,
      };
    } catch (err: any) {
      this.logger.error(`AI screening failed for application ${applicationId}: ${err?.message}`);

      await this.prisma.aICandidateScreening.update({
        where: { applicationId },
        data: {
          status: 'FAILED',
          errorMessage: 'AI candidate screening encountered an error during assessment.',
        },
      });

      throw new InternalServerErrorException(
        'Failed to generate AI candidate screening assessment. Please try again.',
      );
    }
  }

  /**
   * Retrieve existing screening for authorized employer
   */
  async getScreening(applicationId: string, companyId: string) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: application.jobId },
    });

    if (!job || job.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to view screening for this job');
    }

    const screening = await this.prisma.aICandidateScreening.findUnique({
      where: { applicationId },
    });

    if (!screening) {
      return {
        success: true,
        exists: false,
        screening: null,
      };
    }

    return {
      success: true,
      exists: true,
      screening,
    };
  }
}
