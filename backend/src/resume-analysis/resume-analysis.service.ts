import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService, ParsedResumeData, ParsedResumeAnalysisData } from '../common/ai/gemini.service';

export interface UserContext {
  id: string;
  role: string;
  companyId?: string;
}

@Injectable()
export class ResumeAnalysisService {
  private readonly logger = new Logger(ResumeAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async generateAnalysis(user: UserContext, documentId: string) {
    if (!user || !user.id) {
      throw new ForbiddenException('Authentication is required.');
    }

    // 1. Verify candidate document ownership
    const doc = await this.prisma.candidateDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found.');
    }

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isEmployer = ['msme_client', 'recruitment_agency', 'hr_recruiter'].includes(user.role);
    const isOwner = doc.userId === user.id;

    if (!isOwner && !isAdmin && !isEmployer) {
      throw new ForbiddenException('You are not authorized to analyze this document.');
    }

    if (doc.type !== 'resume') {
      throw new BadRequestException('Document is not a resume.');
    }

    // 2. Retrieve completed AIResumeExtraction
    const extraction = await this.prisma.aIResumeExtraction.findUnique({
      where: { documentId: doc.id },
    });

    if (!extraction || extraction.status !== 'COMPLETED' || !extraction.extractedData) {
      throw new BadRequestException('Completed AI resume extraction is required before generating analysis.');
    }

    // 3. Load optional candidate profile context
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId: doc.userId },
    });

    const profileContext = profile
      ? {
          preferredRole: profile.preferredRole || null,
          preferredIndustry: profile.preferredIndustry || null,
          experienceYears: profile.experienceYears || null,
        }
      : undefined;

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const promptVersion = 'v1.0';
    const analyzerVersion = 'v1.0';

    // 4. Create or update AIResumeAnalysis row set to PROCESSING
    const analysisRecord = await this.prisma.aIResumeAnalysis.upsert({
      where: { documentId: doc.id },
      create: {
        userId: doc.userId,
        documentId: doc.id,
        extractionId: extraction.id,
        status: 'PROCESSING',
        model: modelName,
        promptVersion,
        analyzerVersion,
      },
      update: {
        extractionId: extraction.id,
        status: 'PROCESSING',
        model: modelName,
        promptVersion,
        analyzerVersion,
        errorMessage: null,
      },
    });

    try {
      // 5. Send extracted facts to Gemini for analysis
      const extractedFacts = extraction.extractedData as unknown as ParsedResumeData;
      const analysisData: ParsedResumeAnalysisData = await this.geminiService.analyzeResume(
        extractedFacts,
        profileContext,
      );

      // Validate output structure
      this.validateAnalysisData(analysisData);

      // 6. Update AIResumeAnalysis status COMPLETED
      const updated = await this.prisma.aIResumeAnalysis.update({
        where: { id: analysisRecord.id },
        data: {
          status: 'COMPLETED',
          analysisData: analysisData as any,
          errorMessage: null,
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        analysis: {
          id: updated.id,
          userId: updated.userId,
          documentId: updated.documentId,
          extractionId: updated.extractionId,
          status: updated.status,
          analysisData: updated.analysisData,
          model: updated.model,
          promptVersion: updated.promptVersion,
          analyzerVersion: updated.analyzerVersion,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          completedAt: updated.completedAt,
        },
      };
    } catch (err: any) {
      const sanitizedError = this.sanitizeErrorMessage(err?.message || 'Processing error');

      await this.prisma.aIResumeAnalysis.update({
        where: { id: analysisRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: sanitizedError,
        },
      }).catch(() => {});

      if (
        err instanceof ForbiddenException ||
        err instanceof NotFoundException ||
        err instanceof BadRequestException ||
        err instanceof ServiceUnavailableException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(`AI resume analysis failed: ${sanitizedError}`);
    }
  }

  async getAnalysis(user: UserContext, documentId: string) {
    if (!user || !user.id) {
      throw new ForbiddenException('Authentication is required.');
    }

    const doc = await this.prisma.candidateDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found.');
    }

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isEmployer = ['msme_client', 'recruitment_agency', 'hr_recruiter'].includes(user.role);
    const isOwner = doc.userId === user.id;

    if (!isOwner && !isAdmin && !isEmployer) {
      throw new ForbiddenException('You are not authorized to view this analysis.');
    }

    const analysis = await this.prisma.aIResumeAnalysis.findUnique({
      where: { documentId: doc.id },
    });

    if (!analysis) {
      throw new NotFoundException('No AI analysis found for this document.');
    }

    return {
      success: true,
      analysis: {
        id: analysis.id,
        userId: analysis.userId,
        documentId: analysis.documentId,
        extractionId: analysis.extractionId,
        status: analysis.status,
        analysisData: analysis.analysisData,
        model: analysis.model,
        promptVersion: analysis.promptVersion,
        analyzerVersion: analysis.analyzerVersion,
        errorMessage: analysis.errorMessage,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
        completedAt: analysis.completedAt,
      },
    };
  }

  private validateAnalysisData(data: ParsedResumeAnalysisData) {
    if (!data || typeof data !== 'object') {
      throw new InternalServerErrorException('Invalid structured AI analysis format returned.');
    }
    if (!Array.isArray(data.keyStrengths)) {
      throw new InternalServerErrorException('Analysis keyStrengths must be an array.');
    }
    if (!Array.isArray(data.technicalSkills)) {
      throw new InternalServerErrorException('Analysis technicalSkills must be an array.');
    }
    if (!Array.isArray(data.skillGaps)) {
      throw new InternalServerErrorException('Analysis skillGaps must be an array.');
    }
  }

  private sanitizeErrorMessage(msg: string): string {
    if (!msg) return 'Unknown error';
    let safe = msg
      .replace(/AIzaSy[A-Za-z0-9_-]+/gi, '[REDACTED_API_KEY]')
      .replace(/key\s+[A-Za-z0-9_-]+/gi, 'key [REDACTED_KEY]')
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, '[REDACTED_TOKEN]')
      .replace(/ey[A-Za-z0-9_-]+\.ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]')
      .replace(/https:\/\/[^\s]+/g, '[REDACTED_URL]');
    return safe.substring(0, 500);
  }
}
