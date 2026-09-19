import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/ai/gemini.service';
import { CreateJobOfferDto } from './dto/create-offer.dto';
import { GenerateAiOfferDto } from './dto/generate-ai-offer.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';
import { JobOfferStatus } from '@prisma/client';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * Helper to verify employer company authorization on application
   */
  private async getAuthorizedApplication(applicationId: string, companyId: string) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          include: {
            candidateProfile: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }

    const job = await this.prisma.job.findUnique({
      where: { id: application.jobId },
      include: {
        company: true,
      },
    });

    if (!job) {
      throw new NotFoundException(`Job ${application.jobId} not found`);
    }

    if (job.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to manage offers for this application');
    }

    return { application, job };
  }

  /**
   * Generate AI offer letter draft for employer review
   */
  async generateAiDraft(
    applicationId: string,
    companyId: string,
    dto: GenerateAiOfferDto,
  ) {
    const { application, job } = await this.getAuthorizedApplication(applicationId, companyId);

    const candidateName = application.user.name || 'Candidate';

    const offerLetter = await this.geminiService.generateOfferLetter(
      {
        title: dto.jobTitle || job.title,
        companyName: job.company?.agencyName || 'Our Company',
        location: dto.workLocation || job.location,
        department: dto.department,
        employmentType: dto.employmentType,
      },
      {
        name: candidateName,
        email: application.user.email,
        currentRole: application.user.candidateProfile?.designation,
      },
      {
        baseSalary: dto.baseSalary,
        salaryPeriod: dto.salaryPeriod,
        currency: dto.currency,
        variableBonus: dto.variableBonus,
        joiningDate: dto.joiningDate,
        benefits: dto.benefits,
        additionalNotes: dto.additionalNotes,
      },
    );

    return {
      success: true,
      aiDraft: offerLetter,
    };
  }

  /**
   * Save or update a JobOffer (Draft)
   */
  async saveOffer(
    applicationId: string,
    companyId: string,
    dto: CreateJobOfferDto,
  ) {
    const { application, job } = await this.getAuthorizedApplication(applicationId, companyId);

    const existingOffer = await this.prisma.jobOffer.findUnique({
      where: { applicationId },
    });

    const offerData = {
      jobId: job.id,
      candidateId: application.userId,
      companyId: job.companyId,
      jobTitle: dto.jobTitle,
      department: dto.department,
      workLocation: dto.workLocation,
      employmentType: dto.employmentType || 'full_time',
      joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : null,
      baseSalary: dto.baseSalary,
      salaryPeriod: dto.salaryPeriod || 'annual',
      currency: dto.currency || 'INR',
      variableBonus: dto.variableBonus || 0,
      benefits: dto.benefits ? JSON.stringify(dto.benefits) : null,
      offerLetterContent: dto.offerLetterContent,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      internalNotes: dto.internalNotes,
    };

    let offer;
    if (existingOffer) {
      offer = await this.prisma.jobOffer.update({
        where: { applicationId },
        data: offerData,
      });
    } else {
      offer = await this.prisma.jobOffer.create({
        data: {
          ...offerData,
          applicationId,
          status: JobOfferStatus.DRAFT,
        },
      });
    }

    return {
      success: true,
      offer: this.formatOfferResponse(offer),
    };
  }

  /**
   * Get current offer for employer
   */
  async getEmployerOffer(applicationId: string, companyId: string) {
    const { application, job } = await this.getAuthorizedApplication(applicationId, companyId);

    const offer = await this.prisma.jobOffer.findUnique({
      where: { applicationId },
      include: {
        candidate: {
          include: {
            candidateProfile: true,
          },
        },
      },
    });

    if (!offer) {
      return { offer: null };
    }

    return {
      offer: this.formatOfferResponse(offer),
    };
  }

  /**
   * Send offer to candidate
   */
  async sendOffer(applicationId: string, companyId: string) {
    const { application, job } = await this.getAuthorizedApplication(applicationId, companyId);

    const offer = await this.prisma.jobOffer.findUnique({
      where: { applicationId },
    });

    if (!offer) {
      throw new BadRequestException('Please create and save an offer before sending');
    }

    const updatedOffer = await this.prisma.jobOffer.update({
      where: { applicationId },
      data: {
        status: JobOfferStatus.SENT,
        sentAt: new Date(),
      },
    });

    // Update application stage to offer
    await this.prisma.candidateApplication.update({
      where: { id: applicationId },
      data: {
        status: 'offer',
        offerStatus: 'sent',
      },
    });

    return {
      success: true,
      offer: this.formatOfferResponse(updatedOffer),
    };
  }

  /**
   * Withdraw offer
   */
  async withdrawOffer(applicationId: string, companyId: string) {
    await this.getAuthorizedApplication(applicationId, companyId);

    const offer = await this.prisma.jobOffer.findUnique({
      where: { applicationId },
    });

    if (!offer) {
      throw new NotFoundException('No offer exists for this application');
    }

    const updatedOffer = await this.prisma.jobOffer.update({
      where: { applicationId },
      data: {
        status: JobOfferStatus.WITHDRAWN,
      },
    });

    await this.prisma.candidateApplication.update({
      where: { id: applicationId },
      data: {
        offerStatus: 'withdrawn',
      },
    });

    return {
      success: true,
      offer: this.formatOfferResponse(updatedOffer),
    };
  }

  /**
   * Candidate: Get offer for application
   */
  async getCandidateOffer(applicationId: string, candidateUserId: string) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: {
          include: {
            company: {
              select: {
                id: true,
                agencyName: true,
                logo: true,
                city: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }

    if (application.userId !== candidateUserId) {
      throw new ForbiddenException('You do not have permission to view this offer');
    }

    const offer = application.jobOffer;
    if (!offer || offer.status === JobOfferStatus.DRAFT) {
      throw new NotFoundException('No active offer is available for this application');
    }

    return {
      offer: this.formatOfferResponse(offer),
    };
  }

  /**
   * Candidate: Respond to offer (accept / decline)
   */
  async respondToOffer(
    applicationId: string,
    candidateUserId: string,
    dto: RespondOfferDto,
  ) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: applicationId },
      include: { jobOffer: true },
    });

    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }

    if (application.userId !== candidateUserId) {
      throw new ForbiddenException('You do not have permission to respond to this offer');
    }

    const offer = application.jobOffer;
    if (!offer || offer.status !== JobOfferStatus.SENT) {
      throw new BadRequestException('This offer is not open for response (it may already be accepted, declined, or withdrawn)');
    }

    if (dto.action === 'accept') {
      const updatedOffer = await this.prisma.jobOffer.update({
        where: { applicationId },
        data: {
          status: JobOfferStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      await this.prisma.candidateApplication.update({
        where: { id: applicationId },
        data: {
          status: 'onboarding',
          offerStatus: 'accepted',
        },
      });

      return {
        success: true,
        action: 'accepted',
        offer: this.formatOfferResponse(updatedOffer),
      };
    } else {
      const updatedOffer = await this.prisma.jobOffer.update({
        where: { applicationId },
        data: {
          status: JobOfferStatus.DECLINED,
          declinedAt: new Date(),
          declineReason: dto.reason || 'Candidate declined offer',
        },
      });

      await this.prisma.candidateApplication.update({
        where: { id: applicationId },
        data: {
          offerStatus: 'declined',
        },
      });

      return {
        success: true,
        action: 'declined',
        offer: this.formatOfferResponse(updatedOffer),
      };
    }
  }

  private formatOfferResponse(offer: any) {
    let parsedBenefits: string[] = [];
    if (offer.benefits) {
      try {
        parsedBenefits = JSON.parse(offer.benefits);
      } catch {
        parsedBenefits = [offer.benefits];
      }
    }

    return {
      ...offer,
      parsedBenefits,
    };
  }
}
