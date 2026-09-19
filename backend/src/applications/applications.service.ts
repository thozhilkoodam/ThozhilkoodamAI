import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export const VALID_APPLICATION_STATUSES = [
  'applied',
  'screening',
  'shortlisted',
  'interview',
  'selected',
  'offer',
  'onboarding',
  'joined',
  'rejected',
] as const;

export type ValidApplicationStatus = typeof VALID_APPLICATION_STATUSES[number];

export class ApplicationFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * List applications for jobs owned by the authenticated company
   */
  async findAllForEmployer(companyId: string, filters?: ApplicationFilterDto) {
    // 1. Get all jobs belonging to the company
    const companyJobs = await this.prisma.job.findMany({
      where: { companyId },
      select: { id: true, title: true, location: true, department: true },
    });

    const jobIds = companyJobs.map((j) => j.id);
    if (jobIds.length === 0) {
      return {
        applications: [],
        total: 0,
        page: filters?.page || 1,
        limit: filters?.limit || 20,
      };
    }

    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      jobId: { in: jobIds },
    };

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status.toLowerCase();
    }

    if (filters?.jobId && filters.jobId !== 'all') {
      if (!jobIds.includes(filters.jobId)) {
        throw new ForbiddenException('You do not have permission to view applications for this job');
      }
      where.jobId = filters.jobId;
    }

    if (filters?.search && filters.search.trim()) {
      const search = filters.search.trim();
      where.OR = [
        { position: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.candidateApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              photo: true,
              candidateProfile: {
                select: {
                  experienceYears: true,
                  designation: true,
                  currentCompany: true,
                  city: true,
                  state: true,
                  expectedSalary: true,
                  currentSalary: true,
                  noticePeriod: true,
                  skills: {
                    select: {
                      skill: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.candidateApplication.count({ where }),
    ]);

    const jobMap = new Map(companyJobs.map((j) => [j.id, j]));

    const formatted = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: jobMap.get(app.jobId)?.title || app.position,
      department: jobMap.get(app.jobId)?.department || null,
      company: app.company,
      position: app.position,
      appliedAt: app.appliedAt,
      stage: app.stage,
      status: app.status,
      resumeUrl: app.resumeUrl,
      coverNote: app.coverNote,
      interviewDate: app.interviewDate,
      offerStatus: app.offerStatus,
      candidate: {
        id: app.user.id,
        name: app.user.name,
        email: app.user.email,
        phone: app.user.phone,
        photo: app.user.photo,
        experienceYears: app.user.candidateProfile?.experienceYears || null,
        designation: app.user.candidateProfile?.designation || null,
        currentCompany: app.user.candidateProfile?.currentCompany || null,
        location: [app.user.candidateProfile?.city, app.user.candidateProfile?.state]
          .filter(Boolean)
          .join(', ') || null,
        expectedSalary: app.user.candidateProfile?.expectedSalary || null,
        noticePeriod: app.user.candidateProfile?.noticePeriod || null,
        skills: app.user.candidateProfile?.skills?.map((s) => s.skill.name) || [],
      },
    }));

    return {
      applications: formatted,
      total,
      page,
      limit,
    };
  }

  /**
   * Get single application detail for authorized employer
   */
  async findOneForEmployer(id: string, companyId: string) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photo: true,
            candidateProfile: true,
            candidateEducation: {
              orderBy: { createdAt: 'desc' },
            },
            candidateExperience: {
              orderBy: { startDate: 'desc' },
            },
            candidateSkills: true,
            candidateCertifications: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify job belongs to employer company
    const job = await this.prisma.job.findUnique({
      where: { id: application.jobId },
    });

    if (!job || job.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to view this application');
    }

    return {
      id: application.id,
      jobId: application.jobId,
      job: {
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        employmentType: job.employmentType,
        workMode: job.workMode,
      },
      stage: application.stage,
      status: application.status,
      appliedAt: application.appliedAt,
      resumeUrl: application.resumeUrl,
      coverNote: application.coverNote,
      interviewDate: application.interviewDate,
      offerStatus: application.offerStatus,
      candidate: {
        id: application.user.id,
        name: application.user.name,
        email: application.user.email,
        phone: application.user.phone,
        photo: application.user.photo,
        profile: application.user.candidateProfile,
        education: application.user.candidateEducation,
        experience: application.user.candidateExperience,
        skills: application.user.candidateSkills,
        certifications: application.user.candidateCertifications,
      },
    };
  }

  /**
   * Update application status/stage with ownership validation
   */
  async updateStatusForEmployer(
    id: string,
    companyId: string,
    status: string,
    notes?: string,
  ) {
    const normalizedStatus = status.toLowerCase().trim();

    if (!VALID_APPLICATION_STATUSES.includes(normalizedStatus as ValidApplicationStatus)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Must be one of: ${VALID_APPLICATION_STATUSES.join(', ')}`,
      );
    }

    const application = await this.prisma.candidateApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check ownership of the job
    const job = await this.prisma.job.findUnique({
      where: { id: application.jobId },
    });

    if (!job || job.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    const updated = await this.prisma.candidateApplication.update({
      where: { id },
      data: {
        status: normalizedStatus,
        stage: normalizedStatus,
      },
    });

    // Notify candidate if possible
    try {
      await this.prisma.candidateNotification.create({
        data: {
          userId: application.userId,
          type: 'application_status',
          title: 'Application Status Updated',
          message: `Your application for ${application.position} at ${application.company} was updated to ${normalizedStatus}`,
        },
      });
    } catch {
      // Notification persistence failure should not block application update
    }

    return {
      success: true,
      message: `Application status updated to ${normalizedStatus}`,
      application: updated,
    };
  }
}
