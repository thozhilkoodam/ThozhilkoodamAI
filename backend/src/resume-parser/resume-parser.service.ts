import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageRepository } from '../common/storage/file-storage.repository';
import { GeminiService, ParsedResumeData } from '../common/ai/gemini.service';
import { BUCKET_NAMES } from '../common/utils/file-validation.util';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

export interface UserContext {
  id: string;
  role: string;
  companyId?: string;
}

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('FileStorageRepository')
    private readonly storageRepository: FileStorageRepository,
    private readonly geminiService: GeminiService,
  ) {}

  async parseDocument(user: UserContext, documentIdOrUrl: string) {
    if (!user || !user.id) {
      throw new ForbiddenException('Authentication is required.');
    }

    // 1. Locate CandidateDocument record safely in database
    const doc = await this.prisma.candidateDocument.findFirst({
      where: {
        OR: [
          { id: documentIdOrUrl },
          { url: documentIdOrUrl },
        ],
      },
    });

    if (!doc) {
      throw new NotFoundException('Document not found in record.');
    }

    // 2. Enforce candidate document ownership and role authorization
    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isEmployer = ['msme_client', 'recruitment_agency', 'hr_recruiter'].includes(user.role);
    const isOwner = doc.userId === user.id;

    if (!isOwner && !isAdmin && !isEmployer) {
      throw new ForbiddenException('You are not authorized to parse this document.');
    }

    if (doc.type !== 'resume') {
      throw new BadRequestException('Document is not a resume.');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const promptVersion = 'v1.0';
    const parserVersion = 'v1.0';

    // 3. Create or update AIResumeExtraction row set to PROCESSING
    const extractionRecord = await this.prisma.aIResumeExtraction.upsert({
      where: { documentId: doc.id },
      create: {
        userId: doc.userId,
        documentId: doc.id,
        status: 'PROCESSING',
        model: modelName,
        promptVersion,
        parserVersion,
      },
      update: {
        status: 'PROCESSING',
        model: modelName,
        promptVersion,
        parserVersion,
        errorMessage: null,
      },
    });

    try {
      // 4. Retrieve file binary directly from FileStorageRepository without public HTTP fetch
      const bucket = BUCKET_NAMES.resume || 'candidate-resumes';
      const buffer = await this.storageRepository.getFileBuffer(bucket, doc.url);

      if (!buffer || buffer.length === 0) {
        throw new InternalServerErrorException('Could not retrieve resume file binary from storage.');
      }

      // 5. Extract text using pdf-parse or mammoth
      const text = await this.extractTextFromBuffer(buffer, doc.name);
      if (!text || text.trim().length < 10) {
        throw new BadRequestException('Could not extract meaningful text from the resume.');
      }

      // Limit text length sent to Gemini (max 50,000 characters)
      const MAX_TEXT_LENGTH = 50000;
      const safeText = text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) : text;

      // 6. Send text to Gemini Service for structured extraction
      const parsedData: ParsedResumeData = await this.geminiService.extractResumeData(safeText);

      // Validate structured payload
      this.validateExtractedData(parsedData);

      // 7. Update AIResumeExtraction status COMPLETED and store payload
      const updated = await this.prisma.aIResumeExtraction.update({
        where: { id: extractionRecord.id },
        data: {
          status: 'COMPLETED',
          extractedData: parsedData as any,
          rawText: safeText,
          errorMessage: null,
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        extraction: {
          id: updated.id,
          userId: updated.userId,
          documentId: updated.documentId,
          status: updated.status,
          extractedData: updated.extractedData,
          model: updated.model,
          promptVersion: updated.promptVersion,
          parserVersion: updated.parserVersion,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          completedAt: updated.completedAt,
        },
      };
    } catch (err: any) {
      const sanitizedError = this.sanitizeErrorMessage(err?.message || 'Processing error');

      // Update record to FAILED status safely
      await this.prisma.aIResumeExtraction.update({
        where: { id: extractionRecord.id },
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

      throw new InternalServerErrorException(`AI resume extraction failed: ${sanitizedError}`);
    }
  }

  async getExtraction(user: UserContext, documentId: string) {
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
      throw new ForbiddenException('You are not authorized to view this extraction.');
    }

    const extraction = await this.prisma.aIResumeExtraction.findUnique({
      where: { documentId: doc.id },
    });

    if (!extraction) {
      throw new NotFoundException('No AI extraction found for this document.');
    }

    return {
      success: true,
      extraction: {
        id: extraction.id,
        userId: extraction.userId,
        documentId: extraction.documentId,
        status: extraction.status,
        extractedData: extraction.extractedData,
        model: extraction.model,
        promptVersion: extraction.promptVersion,
        parserVersion: extraction.parserVersion,
        errorMessage: extraction.errorMessage,
        createdAt: extraction.createdAt,
        updatedAt: extraction.updatedAt,
        completedAt: extraction.completedAt,
      },
    };
  }

  private validateExtractedData(data: ParsedResumeData) {
    if (!data || typeof data !== 'object') {
      throw new InternalServerErrorException('Invalid structured AI extraction format returned.');
    }
    if (!Array.isArray(data.skills)) {
      throw new InternalServerErrorException('Extracted skills must be an array.');
    }
    if (!Array.isArray(data.education)) {
      throw new InternalServerErrorException('Extracted education must be an array.');
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


  private async extractTextFromBuffer(buffer: Buffer, fileName: string): Promise<string> {
    const ext = fileName.match(/\.(\w+)$/)?.[1]?.toLowerCase() || '';

    try {
      if (ext === 'docx' || ext === 'doc' || fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      }

      if (ext === 'pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        try {
          const parser = new PDFParse({ data: buffer });
          const result = await parser.getText();
          if (result && result.text && result.text.trim().length > 0) {
            return result.text;
          }
        } catch (pdfErr) {
          const utf8Str = buffer.toString('utf-8');
          if (utf8Str && utf8Str.trim().length >= 10) {
            return utf8Str;
          }
          throw pdfErr;
        }
      }

      const utf8Str = buffer.toString('utf-8');
      if (utf8Str && utf8Str.trim().length >= 10) {
        return utf8Str;
      }

      return '';
    } catch (err: any) {
      this.logger.error(`Text extraction failed for file '${fileName}': ${err?.message}`);
      throw new BadRequestException(`Failed to extract text from document '${fileName}': ${err?.message}`);
    }
  }
}
