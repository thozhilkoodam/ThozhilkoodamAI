import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { OnboardingStatus, JobOfferStatus } from '@prisma/client';
import {
  UpdateEmployerChecklistDto,
  UpdateCandidateChecklistDto,
} from './dto/update-checklist.dto';
import { ConfirmJoiningDto } from './dto/confirm-joining.dto';
import { CancelOnboardingDto } from './dto/cancel-onboarding.dto';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  requiredBy: 'candidate' | 'employer';
  category: 'document' | 'form' | 'task';
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  documentId?: string;
  documentName?: string;
  notes?: string;
}

export const DEFAULT_ONBOARDING_CHECKLIST: ChecklistItem[] = [
  {
    id: 'item-cand-personal',
    title: 'Personal & Emergency Contact Details',
    description: 'Verify and submit candidate contact, emergency contact, and address details.',
    requiredBy: 'candidate',
    category: 'form',
    completed: false,
  },
  {
    id: 'item-cand-govtid',
    title: 'Government Identity Proof',
    description: 'Upload valid government-issued photo ID (Aadhaar / Passport / Voter ID / Driving License).',
    requiredBy: 'candidate',
    category: 'document',
    completed: false,
  },
  {
    id: 'item-cand-education',
    title: 'Educational Degree Certificates',
    description: 'Upload degree completion certificate or highest qualification marksheets.',
    requiredBy: 'candidate',
    category: 'document',
    completed: false,
  },
  {
    id: 'item-cand-relieving',
    title: 'Previous Relieving / Experience Letter',
    description: 'Upload relieving letter or experience proof from last organization.',
    requiredBy: 'candidate',
    category: 'document',
    completed: false,
  },
  {
    id: 'item-cand-bank',
    title: 'Bank Account & Compensation Details',
    description: 'Submit bank account details (account number, IFSC code) for official salary processing.',
    requiredBy: 'candidate',
    category: 'form',
    completed: false,
  },
  {
    id: 'item-emp-bgv',
    title: 'Background Verification (BGV) Clearance',
    description: 'Review candidate credentials, references, and record internal BGV clearance.',
    requiredBy: 'employer',
    category: 'task',
    completed: false,
  },
  {
    id: 'item-emp-assets',
    title: 'Workstation & IT Asset Provisioning',
    description: 'Allocate laptop/desktop, official company email address, and required software licenses.',
    requiredBy: 'employer',
    category: 'task',
    completed: false,
  },
  {
    id: 'item-emp-orientation',
    title: 'Team & Manager Welcome Schedule',
    description: 'Schedule day-one welcome session, team introductions, and manager briefing.',
    requiredBy: 'employer',
    category: 'task',
    completed: false,
  },
  {
    id: 'item-emp-formalities',
    title: 'Official Joining Formalities & Document Verification',
    description: 'Inspect uploaded documents, complete HR policy briefing, and prepare for joining confirmation.',
    requiredBy: 'employer',
    category: 'task',
    completed: false,
  },
];

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  /**
   * Helper to calculate checklist completion percentage
   */
  private calculateCompletion(checklist: ChecklistItem[]): number {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter((item) => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  }

  /**
   * Automatically initializes onboarding records for any accepted offers belonging to a company
   */
  async syncAcceptedOffersForCompany(companyId: string) {
    const acceptedOffers = await this.prisma.jobOffer.findMany({
      where: {
        companyId,
        status: JobOfferStatus.ACCEPTED,
      },
    });

    for (const offer of acceptedOffers) {
      const existing = await this.prisma.candidateOnboarding.findUnique({
        where: { applicationId: offer.applicationId },
      });

      if (!existing) {
        await this.prisma.candidateOnboarding.create({
          data: {
            applicationId: offer.applicationId,
            offerId: offer.id,
            candidateId: offer.candidateId,
            companyId: offer.companyId,
            jobId: offer.jobId,
            status: OnboardingStatus.NOT_STARTED,
            joiningDate: offer.joiningDate,
            checklist: DEFAULT_ONBOARDING_CHECKLIST as any,
            completionPercentage: 0,
            documents: [],
          },
        });
      }
    }
  }

  /**
   * Automatically initializes onboarding records for any accepted offers belonging to a candidate
   */
  async syncAcceptedOffersForCandidate(candidateId: string) {
    const acceptedOffers = await this.prisma.jobOffer.findMany({
      where: {
        candidateId,
        status: JobOfferStatus.ACCEPTED,
      },
    });

    for (const offer of acceptedOffers) {
      const existing = await this.prisma.candidateOnboarding.findUnique({
        where: { applicationId: offer.applicationId },
      });

      if (!existing) {
        await this.prisma.candidateOnboarding.create({
          data: {
            applicationId: offer.applicationId,
            offerId: offer.id,
            candidateId: offer.candidateId,
            companyId: offer.companyId,
            jobId: offer.jobId,
            status: OnboardingStatus.NOT_STARTED,
            joiningDate: offer.joiningDate,
            checklist: DEFAULT_ONBOARDING_CHECKLIST as any,
            completionPercentage: 0,
            documents: [],
          },
        });
      }
    }
  }

  /**
   * List onboarding records for employer's company
   */
  async getEmployerOnboardings(companyId: string, filters?: { status?: string; search?: string }) {
    await this.syncAcceptedOffersForCompany(companyId);

    const where: any = { companyId };

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status.toUpperCase();
    }

    const onboardings = await this.prisma.candidateOnboarding.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            candidateProfile: {
              select: {
                designation: true,
                experienceYears: true,
                currentCompany: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
          },
        },
        offer: {
          select: {
            id: true,
            baseSalary: true,
            currency: true,
            employmentType: true,
            joiningDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      return onboardings.filter(
        (o) =>
          o.candidate?.name?.toLowerCase().includes(q) ||
          o.candidate?.email?.toLowerCase().includes(q) ||
          o.job?.title?.toLowerCase().includes(q),
      );
    }

    return onboardings;
  }

  /**
   * Get single onboarding record with strict company authorization
   */
  async getEmployerOnboarding(id: string, companyId: string) {
    const onboarding = await this.prisma.candidateOnboarding.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            candidateProfile: true,
          },
        },
        job: true,
        offer: true,
        application: true,
      },
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding record ${id} not found`);
    }

    if (onboarding.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to access onboarding for this company');
    }

    return onboarding;
  }

  /**
   * Employer updates checklist items, joining date, or internal notes
   */
  async updateEmployerOnboarding(id: string, companyId: string, dto: UpdateEmployerChecklistDto) {
    const onboarding = await this.getEmployerOnboarding(id, companyId);

    if (onboarding.status === OnboardingStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled onboarding record');
    }

    let checklist = (onboarding.checklist as unknown as ChecklistItem[]) || [];

    if (dto.items && dto.items.length > 0) {
      checklist = checklist.map((item) => {
        const update = dto.items?.find((u) => u.id === item.id);
        if (update) {
          return {
            ...item,
            completed: update.completed,
            completedAt: update.completed ? new Date().toISOString() : undefined,
            completedBy: update.completed ? companyId : undefined,
            notes: update.notes !== undefined ? update.notes : item.notes,
          };
        }
        return item;
      });
    }

    const completionPercentage = this.calculateCompletion(checklist);

    let nextStatus = onboarding.status;
    if (nextStatus === OnboardingStatus.NOT_STARTED && completionPercentage > 0) {
      nextStatus = OnboardingStatus.IN_PROGRESS;
    }
    if (completionPercentage === 100 && nextStatus === OnboardingStatus.IN_PROGRESS) {
      nextStatus = OnboardingStatus.COMPLETED;
    }

    const updated = await this.prisma.candidateOnboarding.update({
      where: { id },
      data: {
        checklist: checklist as any,
        completionPercentage,
        status: nextStatus,
        completedAt: nextStatus === OnboardingStatus.COMPLETED ? new Date() : onboarding.completedAt,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : onboarding.joiningDate,
        internalNotes: dto.internalNotes !== undefined ? dto.internalNotes : onboarding.internalNotes,
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: true,
        offer: true,
      },
    });

    return {
      success: true,
      onboarding: updated,
    };
  }

  /**
   * Explicit joining confirmation by authorized employer
   */
  async confirmJoining(id: string, companyId: string, dto?: ConfirmJoiningDto) {
    const onboarding = await this.getEmployerOnboarding(id, companyId);

    if (onboarding.status === OnboardingStatus.CANCELLED) {
      throw new BadRequestException('Cannot confirm joining for a cancelled onboarding record');
    }

    const joinedAt = new Date();
    const actualJoiningDate = dto?.actualJoiningDate
      ? new Date(dto.actualJoiningDate)
      : onboarding.joiningDate || joinedAt;

    // 1. Update CandidateOnboarding to JOINED
    const updatedOnboarding = await this.prisma.candidateOnboarding.update({
      where: { id },
      data: {
        status: OnboardingStatus.JOINED,
        joinedAt,
        joiningDate: actualJoiningDate,
        internalNotes: dto?.notes
          ? `${onboarding.internalNotes ? onboarding.internalNotes + '\n' : ''}Joining Note: ${dto.notes}`
          : onboarding.internalNotes,
      },
      include: {
        candidate: true,
        job: true,
        company: true,
      },
    });

    // 2. Explicitly update CandidateApplication status to 'joined'
    await this.prisma.candidateApplication.update({
      where: { id: onboarding.applicationId },
      data: {
        status: 'joined',
      },
    });

    // 3. Activate candidate employment profile
    try {
      const company = updatedOnboarding.company;
      const job = updatedOnboarding.job;

      // Update candidateProfile currentCompany and designation
      await this.prisma.candidateProfile.upsert({
        where: { userId: onboarding.candidateId },
        update: {
          currentCompany: company?.agencyName || 'Company',
          designation: job?.title || 'Employee',
        },
        create: {
          userId: onboarding.candidateId,
          currentCompany: company?.agencyName || 'Company',
          designation: job?.title || 'Employee',
        },
      });

      // Create employment experience entry if not already present
      const existingExp = await this.prisma.candidateExperience.findFirst({
        where: {
          userId: onboarding.candidateId,
          company: company?.agencyName || 'Company',
          role: job?.title || 'Employee',
        },
      });

      if (!existingExp) {
        await this.prisma.candidateExperience.create({
          data: {
            userId: onboarding.candidateId,
            company: company?.agencyName || 'Company',
            role: job?.title || 'Employee',
            startDate: actualJoiningDate,
            description: `Joined through Thozhil Koodam recruitment. Position: ${job?.title}`,
          },
        });
      }
    } catch (profileErr: any) {
      this.logger.warn(`Could not update candidate employment profile: ${profileErr?.message}`);
    }

    return {
      success: true,
      message: 'Candidate joining confirmed and employment activated successfully.',
      onboarding: updatedOnboarding,
    };
  }

  /**
   * Cancel onboarding
   */
  async cancelOnboarding(id: string, companyId: string, dto: CancelOnboardingDto) {
    const onboarding = await this.getEmployerOnboarding(id, companyId);

    const updated = await this.prisma.candidateOnboarding.update({
      where: { id },
      data: {
        status: OnboardingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
      },
    });

    return {
      success: true,
      message: 'Onboarding cancelled.',
      onboarding: updated,
    };
  }

  /**
   * Candidate lists their onboarding records
   */
  async getCandidateOnboardings(candidateUserId: string) {
    await this.syncAcceptedOffersForCandidate(candidateUserId);

    return this.prisma.candidateOnboarding.findMany({
      where: { candidateId: candidateUserId },
      include: {
        company: {
          select: {
            id: true,
            agencyName: true,
            city: true,
            logo: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            employmentType: true,
          },
        },
        offer: {
          select: {
            id: true,
            baseSalary: true,
            currency: true,
            salaryPeriod: true,
            joiningDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Candidate gets a specific onboarding record with candidate isolation
   */
  async getCandidateOnboarding(id: string, candidateUserId: string) {
    const onboarding = await this.prisma.candidateOnboarding.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            agencyName: true,
            city: true,
            logo: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            employmentType: true,
          },
        },
        offer: {
          select: {
            id: true,
            baseSalary: true,
            currency: true,
            salaryPeriod: true,
            joiningDate: true,
          },
        },
      },
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding record ${id} not found`);
    }

    if (onboarding.candidateId !== candidateUserId) {
      throw new ForbiddenException('You do not have permission to access this onboarding record');
    }

    return onboarding;
  }

  /**
   * Candidate updates their required checklist items
   */
  async updateCandidateChecklist(
    id: string,
    candidateUserId: string,
    dto: UpdateCandidateChecklistDto,
  ) {
    const onboarding = await this.getCandidateOnboarding(id, candidateUserId);

    if (onboarding.status === OnboardingStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled onboarding record');
    }

    let checklist = (onboarding.checklist as unknown as ChecklistItem[]) || [];

    for (const itemUpdate of dto.items) {
      const targetItem = checklist.find((i) => i.id === itemUpdate.id);
      if (targetItem && targetItem.requiredBy !== 'candidate') {
        throw new ForbiddenException('Candidates can only update candidate-assigned checklist items');
      }
    }

    checklist = checklist.map((item) => {
      const update = dto.items.find((u) => u.id === item.id);
      if (update && item.requiredBy === 'candidate') {
        return {
          ...item,
          completed: update.completed,
          completedAt: update.completed ? new Date().toISOString() : undefined,
          completedBy: update.completed ? candidateUserId : undefined,
          notes: update.notes !== undefined ? update.notes : item.notes,
        };
      }
      return item;
    });

    const completionPercentage = this.calculateCompletion(checklist);

    let nextStatus = onboarding.status;
    if (nextStatus === OnboardingStatus.NOT_STARTED && completionPercentage > 0) {
      nextStatus = OnboardingStatus.IN_PROGRESS;
    }
    if (completionPercentage === 100 && nextStatus === OnboardingStatus.IN_PROGRESS) {
      nextStatus = OnboardingStatus.COMPLETED;
    }

    const updated = await this.prisma.candidateOnboarding.update({
      where: { id },
      data: {
        checklist: checklist as any,
        completionPercentage,
        status: nextStatus,
        completedAt: nextStatus === OnboardingStatus.COMPLETED ? new Date() : onboarding.completedAt,
      },
      include: {
        company: { select: { agencyName: true, logo: true } },
        job: true,
      },
    });

    return {
      success: true,
      onboarding: updated,
    };
  }

  /**
   * Candidate uploads required onboarding document
   */
  async uploadCandidateDocument(
    id: string,
    candidateUserId: string,
    checklistItemId: string,
    file: Express.Multer.File,
  ) {
    const onboarding = await this.getCandidateOnboarding(id, candidateUserId);

    if (onboarding.status === OnboardingStatus.CANCELLED) {
      throw new BadRequestException('Cannot upload documents for a cancelled onboarding record');
    }

    const userContext = {
      id: candidateUserId,
      role: 'candidate',
    };

    // Upload using standard private storage abstraction
    const uploadResult = await this.documentsService.uploadDocument(
      userContext,
      'certificate',
      file,
      candidateUserId,
    );

    let checklist = (onboarding.checklist as unknown as ChecklistItem[]) || [];
    let matched = false;

    checklist = checklist.map((item) => {
      if (item.id === checklistItemId && item.requiredBy === 'candidate') {
        matched = true;
        return {
          ...item,
          completed: true,
          completedAt: new Date().toISOString(),
          completedBy: candidateUserId,
          documentId: uploadResult.documentId,
          documentName: uploadResult.fileName,
        };
      }
      return item;
    });

    const documents = ((onboarding.documents as any[]) || []).concat({
      documentId: uploadResult.documentId,
      name: uploadResult.fileName,
      checklistItemId,
      uploadedAt: new Date().toISOString(),
    });

    const completionPercentage = this.calculateCompletion(checklist);

    let nextStatus = onboarding.status;
    if (nextStatus === OnboardingStatus.NOT_STARTED) {
      nextStatus = OnboardingStatus.IN_PROGRESS;
    }
    if (completionPercentage === 100 && nextStatus === OnboardingStatus.IN_PROGRESS) {
      nextStatus = OnboardingStatus.COMPLETED;
    }

    const updated = await this.prisma.candidateOnboarding.update({
      where: { id },
      data: {
        checklist: checklist as any,
        documents: documents as any,
        completionPercentage,
        status: nextStatus,
        completedAt: nextStatus === OnboardingStatus.COMPLETED ? new Date() : onboarding.completedAt,
      },
    });

    return {
      success: true,
      document: uploadResult,
      onboarding: updated,
    };
  }

  /**
   * Authenticated, secure signed URL for onboarding document download
   */
  async getSignedDocumentDownloadUrl(
    id: string,
    documentId: string,
    user: { id: string; role: string; companyId?: string },
  ) {
    const onboarding = await this.prisma.candidateOnboarding.findUnique({
      where: { id },
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding record ${id} not found`);
    }

    const isCandidate = onboarding.candidateId === user.id;
    const isEmployer = onboarding.companyId === user.id || onboarding.companyId === user.companyId;
    const isAdmin = ['admin', 'super_admin'].includes(user.role);

    if (!isCandidate && !isEmployer && !isAdmin) {
      throw new ForbiddenException('You do not have permission to access this onboarding document');
    }

    return this.documentsService.getSignedDownloadUrl(
      { id: user.id, role: user.role, companyId: user.companyId },
      documentId,
    );
  }
}
