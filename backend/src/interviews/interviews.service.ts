import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService, CandidateInterviewPreparation } from '../common/ai/gemini.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { SaveInterviewResponsesDto } from './dto/save-interview-responses.dto';
import { CandidateInterviewStatus, AIPreparationStatus, AIEvaluationStatus } from '@prisma/client';
import { StructuredInterviewEvaluation } from '../common/ai/gemini.service';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * Schedule an interview for an application belonging to the employer's company.
   */
  async scheduleInterview(companyId: string, applicationId: string, dto: CreateInterviewDto) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    const job = await this.prisma.job.findUnique({
      where: { id: application.jobId },
    });

    if (!job || job.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to schedule interviews for this application');
    }

    const scheduledDate = new Date(dto.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid scheduledAt timestamp provided');
    }

    const interview = await this.prisma.candidateInterview.create({
      data: {
        applicationId: application.id,
        jobId: application.jobId,
        candidateId: application.userId,
        companyId: companyId,
        scheduledAt: scheduledDate,
        interviewType: dto.interviewType || 'online',
        durationMinutes: dto.durationMinutes || 45,
        meetingLink: dto.meetingLink || null,
        locationVenue: dto.locationVenue || null,
        interviewerName: dto.interviewerName || null,
        interviewerRole: dto.interviewerRole || null,
        interviewerEmail: dto.interviewerEmail || null,
        notes: dto.notes || null,
        status: 'scheduled',
      },
    });

    // Update application stage & status
    await this.prisma.candidateApplication.update({
      where: { id: application.id },
      data: {
        status: 'interview',
        stage: 'interview',
        interviewDate: scheduledDate,
      },
    });

    // Notify candidate
    try {
      await this.prisma.candidateNotification.create({
        data: {
          userId: application.userId,
          type: 'interview_scheduled',
          title: 'Interview Scheduled',
          message: `An interview has been scheduled for ${application.position} at ${application.company} on ${scheduledDate.toLocaleDateString('en-IN')}.`,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to create candidate notification: ${err?.message}`);
    }

    return interview;
  }

  /**
   * Get all interviews for the employer's company.
   */
  async getEmployerInterviews(companyId: string, filters?: { status?: string; jobId?: string }) {
    const whereClause: any = { companyId };

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.jobId) {
      whereClause.jobId = filters.jobId;
    }

    return this.prisma.candidateInterview.findMany({
      where: whereClause,
      include: {
        application: {
          select: {
            id: true,
            position: true,
            company: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            companyId: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Get single interview by ID for an authorized employer.
   */
  async getEmployerInterviewById(companyId: string, interviewId: string) {
    const interview = await this.prisma.candidateInterview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                candidateProfile: true,
              },
            },
          },
        },
        job: true,
        aiPreparation: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    if (interview.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to view this interview');
    }

    return interview;
  }

  /**
   * Update or reschedule an interview.
   */
  async updateInterview(companyId: string, interviewId: string, dto: UpdateInterviewDto) {
    const interview = await this.prisma.candidateInterview.findUnique({
      where: { id: interviewId },
      include: {
        application: true,
        job: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    if (interview.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to modify this interview');
    }

    const dataToUpdate: any = {};

    if (dto.scheduledAt) {
      const parsed = new Date(dto.scheduledAt);
      if (isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid scheduledAt timestamp');
      }
      dataToUpdate.scheduledAt = parsed;
      if (!dto.status) {
        dataToUpdate.status = 'rescheduled';
      }
    }

    if (dto.interviewType !== undefined) dataToUpdate.interviewType = dto.interviewType;
    if (dto.durationMinutes !== undefined) dataToUpdate.durationMinutes = dto.durationMinutes;
    if (dto.meetingLink !== undefined) dataToUpdate.meetingLink = dto.meetingLink;
    if (dto.locationVenue !== undefined) dataToUpdate.locationVenue = dto.locationVenue;
    if (dto.interviewerName !== undefined) dataToUpdate.interviewerName = dto.interviewerName;
    if (dto.interviewerRole !== undefined) dataToUpdate.interviewerRole = dto.interviewerRole;
    if (dto.interviewerEmail !== undefined) dataToUpdate.interviewerEmail = dto.interviewerEmail;
    if (dto.notes !== undefined) dataToUpdate.notes = dto.notes;
    if (dto.cancellationReason !== undefined) dataToUpdate.cancellationReason = dto.cancellationReason;
    if (dto.status !== undefined) dataToUpdate.status = dto.status;

    const updated = await this.prisma.candidateInterview.update({
      where: { id: interviewId },
      data: dataToUpdate,
    });

    // If rescheduled or cancelled, create notification
    if (dataToUpdate.status === 'cancelled') {
      try {
        await this.prisma.candidateNotification.create({
          data: {
            userId: interview.candidateId,
            type: 'interview_cancelled',
            title: 'Interview Cancelled',
            message: `Your interview for ${interview.application.position} at ${interview.application.company} has been cancelled.${dto.cancellationReason ? ` Reason: ${dto.cancellationReason}` : ''}`,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to notify candidate of cancellation: ${err?.message}`);
      }
    } else if (dataToUpdate.status === 'rescheduled' || dto.scheduledAt) {
      try {
        await this.prisma.candidateNotification.create({
          data: {
            userId: interview.candidateId,
            type: 'interview_rescheduled',
            title: 'Interview Rescheduled',
            message: `Your interview for ${interview.application.position} at ${interview.application.company} has been rescheduled to ${new Date(dataToUpdate.scheduledAt || interview.scheduledAt).toLocaleDateString('en-IN')}.`,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to notify candidate of reschedule: ${err?.message}`);
      }
    }

    return updated;
  }

  /**
   * Cancel an interview.
   */
  async cancelInterview(companyId: string, interviewId: string, reason?: string) {
    return this.updateInterview(companyId, interviewId, {
      status: CandidateInterviewStatus.cancelled,
      cancellationReason: reason,
    });
  }

  /**
   * Get all interviews for a candidate user.
   */
  async getCandidateInterviews(candidateId: string) {
    return this.prisma.candidateInterview.findMany({
      where: { candidateId },
      include: {
        application: {
          select: {
            id: true,
            position: true,
            company: true,
            status: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            workMode: true,
            employmentType: true,
            company: {
              select: {
                id: true,
                agencyName: true,
                logo: true,
              },
            },
          },
        },
        aiPreparation: {
          select: {
            id: true,
            status: true,
            completedAt: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Get single candidate interview by ID with ownership verification.
   */
  async getCandidateInterviewById(candidateId: string, interviewId: string) {
    const interview = await this.prisma.candidateInterview.findUnique({
      where: { id: interviewId },
      include: {
        application: true,
        job: {
          include: {
            company: {
              select: {
                id: true,
                agencyName: true,
                logo: true,
                city: true,
              },
            },
          },
        },
        aiPreparation: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    if (interview.candidateId !== candidateId) {
      throw new ForbiddenException('You are not authorized to view this interview');
    }

    return interview;
  }

  /**
   * Generate or retrieve cached AI Interview Preparation for a candidate.
   */
  async generateOrGetCandidatePreparation(candidateId: string, interviewId: string, force = false) {
    const interview = await this.prisma.candidateInterview.findUnique({
      where: { id: interviewId },
      include: {
        application: true,
        job: {
          include: {
            company: {
              select: {
                id: true,
                agencyName: true,
              },
            },
          },
        },
        candidate: {
          include: {
            candidateProfile: true,
            candidateEducation: true,
            candidateExperience: true,
            candidateSkills: true,
          },
        },
        aiPreparation: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    if (interview.candidateId !== candidateId) {
      throw new ForbiddenException('You are not authorized to access preparation for this interview');
    }

    // Return cached preparation if available and valid
    if (
      interview.aiPreparation &&
      interview.aiPreparation.status === AIPreparationStatus.COMPLETED &&
      !force
    ) {
      return {
        cached: true,
        preparation: interview.aiPreparation,
      };
    }

    // Prepare job facts
    const jobData = {
      title: interview.job.title,
      companyName: interview.job.company?.agencyName || interview.application.company,
      description: interview.job.description,
      responsibilities: interview.job.responsibilities,
      skills: interview.job.skills,
      mandatorySkills: interview.job.mandatorySkills,
      qualifications: interview.job.qualifications,
      experience: interview.job.experience,
      employmentType: interview.job.employmentType,
      workMode: interview.job.workMode,
    };

    // Sanitize candidate data - EXCLUDE protected attributes
    const sanitizedCandidate = this.sanitizeCandidateForFairPreparation(interview.candidate);

    const interviewInfo = {
      interviewType: interview.interviewType,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
    };

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    try {
      const generatedPrep: CandidateInterviewPreparation =
        await this.geminiService.generateCandidateInterviewPreparation(
          jobData,
          sanitizedCandidate,
          interviewInfo,
        );

      const savedPrep = await this.prisma.aIInterviewPreparation.upsert({
        where: { interviewId: interview.id },
        update: {
          status: AIPreparationStatus.COMPLETED,
          preparationData: generatedPrep as any,
          model: modelName,
          promptVersion: '1.0',
          assistantVersion: '1.0',
          completedAt: new Date(),
          errorMessage: null,
        },
        create: {
          interviewId: interview.id,
          applicationId: interview.applicationId,
          candidateId: interview.candidateId,
          jobId: interview.jobId,
          status: AIPreparationStatus.COMPLETED,
          preparationData: generatedPrep as any,
          model: modelName,
          promptVersion: '1.0',
          assistantVersion: '1.0',
          completedAt: new Date(),
        },
      });

      return {
        cached: false,
        preparation: savedPrep,
      };
    } catch (err: any) {
      this.logger.error(`Failed to generate AI interview preparation: ${err?.message}`);

      await this.prisma.aIInterviewPreparation.upsert({
        where: { interviewId: interview.id },
        update: {
          status: AIPreparationStatus.FAILED,
          errorMessage: err?.message || 'Processing error',
        },
        create: {
          interviewId: interview.id,
          applicationId: interview.applicationId,
          candidateId: interview.candidateId,
          jobId: interview.jobId,
          status: AIPreparationStatus.FAILED,
          model: modelName,
          promptVersion: '1.0',
          assistantVersion: '1.0',
          errorMessage: err?.message || 'Processing error',
        },
      });

      throw err;
    }
  }

  /**
   * Sanitizes candidate profile facts by strictly omitting protected personal attributes
   * (gender, race, ethnicity, religion, age/DOB, marital status, disability, photographs, contact credentials).
   */
  sanitizeCandidateForFairPreparation(candidateUser: any) {
    if (!candidateUser) return {};

    const profile = candidateUser.candidateProfile || {};
    const skills = (candidateUser.candidateSkills || []).map((s: any) => s.name);
    const education = (candidateUser.candidateEducation || []).map((e: any) => ({
      degree: e.degree || e.qualification,
      specialization: e.specialization,
      institution: e.college || e.university,
      passingYear: e.passingYear,
    }));
    const experience = (candidateUser.candidateExperience || []).map((exp: any) => ({
      role: exp.role,
      company: exp.company,
      duration: exp.duration,
      description: exp.description,
    }));

    return {
      skills,
      education,
      experience,
      experienceYears: profile.experienceYears || null,
      preferredRole: profile.preferredRole || null,
      preferredIndustry: profile.preferredIndustry || null,
    };
  }

  /**
   * Save or update structured interview Q&A responses and interviewer notes.
   */
  async saveInterviewResponses(companyId: string, interviewId: string, dto: SaveInterviewResponsesDto) {
    const interview = await this.prisma.candidateInterview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    if (interview.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to manage responses for this interview');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. If overall notes provided, update CandidateInterview
      if (dto.overallNotes !== undefined) {
        await tx.candidateInterview.update({
          where: { id: interviewId },
          data: { notes: dto.overallNotes },
        });
      }

      // 2. Clear existing responses and insert new normalized responses
      await tx.interviewResponse.deleteMany({
        where: { interviewId },
      });

      if (Array.isArray(dto.responses) && dto.responses.length > 0) {
        await tx.interviewResponse.createMany({
          data: dto.responses.map((r, idx) => ({
            interviewId,
            question: r.question,
            response: r.response,
            interviewerNotes: r.interviewerNotes || null,
            competencyArea: r.competencyArea || null,
            score: r.score !== undefined ? Number(r.score) : null,
            orderIndex: r.orderIndex !== undefined ? Number(r.orderIndex) : idx,
          })),
        });
      }

      const savedResponses = await tx.interviewResponse.findMany({
        where: { interviewId },
        orderBy: { orderIndex: 'asc' },
      });

      return {
        success: true,
        count: savedResponses.length,
        responses: savedResponses,
      };
    });
  }

  /**
   * Retrieve structured interview responses for authorized employer.
   */
  async getInterviewResponses(companyId: string, interviewId: string) {
    const interview = await this.prisma.candidateInterview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    if (interview.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to view responses for this interview');
    }

    const responses = await this.prisma.interviewResponse.findMany({
      where: { interviewId },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      interviewId,
      overallNotes: interview.notes,
      responses,
    };
  }

  /**
   * Run or retrieve AI Interview Evaluation for employer decision support.
   * Grounded in observable interview evidence without protected attributes.
   * Strictly decision support: Does NOT change application status or make autonomous decisions.
   */
  async evaluateInterview(companyId: string, interviewId: string, reEvaluate = false) {
    const interview = await this.prisma.candidateInterview.findUnique({
      where: { id: interviewId },
      include: {
        application: true,
        job: true,
        candidate: {
          include: {
            candidateProfile: true,
            candidateEducation: true,
            candidateExperience: true,
            candidateSkills: true,
          },
        },
        responses: {
          orderBy: { orderIndex: 'asc' },
        },
        aiEvaluation: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    if (interview.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to evaluate this interview');
    }

    // Check for cached evaluation
    if (
      interview.aiEvaluation &&
      interview.aiEvaluation.status === AIEvaluationStatus.COMPLETED &&
      !reEvaluate
    ) {
      return {
        cached: true,
        evaluation: interview.aiEvaluation,
      };
    }

    const responses = interview.responses || [];
    if (responses.length === 0 && (!interview.notes || interview.notes.trim().length === 0)) {
      throw new BadRequestException(
        'At least one interview question/response or interviewer notes are required to perform AI evaluation.',
      );
    }

    // Sanitize candidate data - EXCLUDE protected attributes
    const sanitizedCandidate = this.sanitizeCandidateForFairPreparation(interview.candidate);

    const jobData = {
      title: interview.job.title,
      department: interview.job.department,
      description: interview.job.description,
      responsibilities: interview.job.responsibilities,
      skills: interview.job.skills,
      mandatorySkills: interview.job.mandatorySkills,
      qualifications: interview.job.qualifications,
      experience: interview.job.experience,
    };

    const responsesPayload = responses.map((r) => ({
      question: r.question,
      response: r.response,
      interviewerNotes: r.interviewerNotes,
      competencyArea: r.competencyArea,
    }));

    // Calculate deterministic rubric score
    const deterministicScoreData = this.calculateDeterministicEvaluationScore(responses, interview.notes);

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    try {
      const evaluationResult: StructuredInterviewEvaluation =
        await this.geminiService.evaluateInterviewResponses(
          jobData,
          sanitizedCandidate,
          responsesPayload,
          interview.notes,
        );

      const savedEval = await this.prisma.aIInterviewEvaluation.upsert({
        where: { interviewId: interview.id },
        update: {
          status: AIEvaluationStatus.COMPLETED,
          evaluationData: evaluationResult as any,
          deterministicScore: deterministicScoreData.totalScore,
          scoreBreakdown: deterministicScoreData.breakdown as any,
          model: modelName,
          promptVersion: '1.0',
          evaluatorVersion: '1.0',
          completedAt: new Date(),
          errorMessage: null,
        },
        create: {
          interviewId: interview.id,
          applicationId: interview.applicationId,
          candidateId: interview.candidateId,
          jobId: interview.jobId,
          status: AIEvaluationStatus.COMPLETED,
          evaluationData: evaluationResult as any,
          deterministicScore: deterministicScoreData.totalScore,
          scoreBreakdown: deterministicScoreData.breakdown as any,
          model: modelName,
          promptVersion: '1.0',
          evaluatorVersion: '1.0',
          completedAt: new Date(),
        },
      });

      return {
        cached: false,
        evaluation: savedEval,
      };
    } catch (err: any) {
      this.logger.error(`Failed to generate AI interview evaluation: ${err?.message}`);

      await this.prisma.aIInterviewEvaluation.upsert({
        where: { interviewId: interview.id },
        update: {
          status: AIEvaluationStatus.FAILED,
          errorMessage: err?.message || 'Processing error',
        },
        create: {
          interviewId: interview.id,
          applicationId: interview.applicationId,
          candidateId: interview.candidateId,
          jobId: interview.jobId,
          status: AIEvaluationStatus.FAILED,
          model: modelName,
          promptVersion: '1.0',
          evaluatorVersion: '1.0',
          errorMessage: err?.message || 'Processing error',
        },
      });

      throw err;
    }
  }

  /**
   * Retrieve AI Interview Evaluation for authorized employer.
   */
  async getInterviewEvaluation(companyId: string, interviewId: string) {
    const interview = await this.prisma.candidateInterview.findUnique({
      where: { id: interviewId },
      include: {
        aiEvaluation: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    if (interview.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to view evaluation for this interview');
    }

    if (!interview.aiEvaluation) {
      throw new NotFoundException('AI interview evaluation has not yet been generated for this interview');
    }

    return {
      cached: true,
      evaluation: interview.aiEvaluation,
    };
  }

  /**
   * Calculate deterministic scoring criteria on the backend (40% Technical Evidence, 30% Communication, 30% Problem Solving).
   * Separate from qualitative AI observations. Clearly labeled as evaluation support.
   */
  calculateDeterministicEvaluationScore(
    responses: Array<{ question: string; response: string; score?: number | null }>,
    interviewerNotes?: string | null,
  ) {
    // If human interviewer scored individual responses, use weighted average
    const scoredResponses = responses.filter((r) => r.score !== null && r.score !== undefined);

    let technicalScore = 0;
    let communicationScore = 0;
    let problemSolvingScore = 0;

    if (scoredResponses.length > 0) {
      const avgScore = scoredResponses.reduce((sum, r) => sum + Number(r.score), 0) / scoredResponses.length;
      technicalScore = Math.round((avgScore * 0.40) * 10) / 10;
      communicationScore = Math.round((avgScore * 0.30) * 10) / 10;
      problemSolvingScore = Math.round((avgScore * 0.30) * 10) / 10;
    } else {
      // Deterministic evidence depth calculation based on documented response details
      const totalWords = responses.reduce((acc, r) => acc + (r.response?.trim().split(/\s+/).length || 0), 0);
      const hasNotes = Boolean(interviewerNotes && interviewerNotes.trim().length > 10);

      // Technical Evidence: up to 40
      technicalScore = Math.min(40, Math.round(15 + Math.min(responses.length * 7, 25)));

      // Communication Clarity: up to 30
      communicationScore = Math.min(30, Math.round(10 + Math.min(totalWords > 50 ? 20 : totalWords > 20 ? 12 : 5, 20)));

      // Practical Problem Solving / Evidence: up to 30
      problemSolvingScore = Math.min(30, Math.round(12 + (hasNotes ? 12 : 6) + Math.min(responses.length * 3, 6)));
    }

    const totalScore = Math.min(100, Math.round((technicalScore + communicationScore + problemSolvingScore) * 10) / 10);

    return {
      totalScore,
      breakdown: {
        technicalScore,
        technicalMax: 40,
        communicationScore,
        communicationMax: 30,
        problemSolvingScore,
        problemSolvingMax: 30,
        label: 'Interview Evaluation Support Score',
        methodology: 'Deterministic rubric based on documented candidate evidence (40% Technical, 30% Communication, 30% Practical Problem Solving)',
        disclaimer: 'This score is decision support only and does not predict or guarantee employment outcomes.',
      },
    };
  }
}
