import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CandidateOnboardingDto } from './dto/candidate-onboarding.dto';
import { getInitialsAvatarSvgDataUri } from '../common/utils/avatar-placeholder.util';

@Injectable()
export class CandidatePortalService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, photo: true } },
        jobRoles: { include: { jobRole: true } },
        industries: { include: { industry: true } },
        locations: { include: { location: true } },
        skills: { include: { skill: true } },
      },
    });

    const defaultAvatarUrl = getInitialsAvatarSvgDataUri(profile?.user?.name || 'Candidate');

    if (!profile) {
      const user = await this.getUserBasic(userId);
      return {
        user,
        photo: null,
        profilePhotoUrl: null,
        defaultAvatarUrl: getInitialsAvatarSvgDataUri(user?.name || 'Candidate'),
        education: [],
        experience: [],
        certifications: [],
        documents: [],
      };
    }

    const [education, experience, certifications, documents] = await Promise.all([
      this.prisma.candidateEducation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.candidateExperience.findMany({ where: { userId }, orderBy: { startDate: 'desc' } }),
      this.prisma.candidateCertification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.candidateDocument.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      ...profile,
      defaultAvatarUrl,
      education,
      experience,
      certifications,
      documents,
    };
  }

  async getProfileCompletion(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        jobRoles: true,
        industries: true,
        locations: true,
      },
    });

    const [educationCount, experienceCount, skillsCount, certsCount] = await Promise.all([
      this.prisma.candidateEducation.count({ where: { userId } }),
      this.prisma.candidateExperience.count({ where: { userId } }),
      this.prisma.candidateSkill.count({ where: { userId } }),
      this.prisma.candidateCertification.count({ where: { userId } }),
    ]);

    const breakdown = {
      basicProfile: 0,
      education: 0,
      experience: 0,
      skills: 0,
      certifications: 0,
      jobPreferences: 0,
    };

    if (profile) {
      if (profile.gender && (profile.city || profile.state || profile.address)) {
        breakdown.basicProfile = 20;
      } else if (profile.gender || profile.city || profile.state) {
        breakdown.basicProfile = 10;
      }

      if (
        profile.preferredRole ||
        profile.preferredIndustry ||
        profile.preferredLocation ||
        profile.jobRoles.length > 0
      ) {
        breakdown.jobPreferences = 15;
      }
    }

    if (educationCount > 0) breakdown.education = 20;
    if (experienceCount > 0) breakdown.experience = 20;
    if (skillsCount > 0) breakdown.skills = 15;
    if (certsCount > 0) breakdown.certifications = 10;

    const percentage =
      breakdown.basicProfile +
      breakdown.education +
      breakdown.experience +
      breakdown.skills +
      breakdown.certifications +
      breakdown.jobPreferences;

    return {
      percentage,
      breakdown,
      isComplete: percentage >= 80,
    };
  }

  async completeOnboarding(userId: string, dto: CandidateOnboardingDto) {
    await this.upsertProfile(userId, dto);

    if (Array.isArray(dto.education) && dto.education.length > 0) {
      for (const edu of dto.education) {
        await this.createEducation(userId, edu);
      }
    }

    if (Array.isArray(dto.experience) && dto.experience.length > 0) {
      for (const exp of dto.experience) {
        await this.createExperience(userId, exp);
      }
    }

    if (Array.isArray(dto.skills) && dto.skills.length > 0) {
      for (const sk of dto.skills) {
        await this.addSkill(userId, sk);
      }
    }

    if (Array.isArray(dto.certifications) && dto.certifications.length > 0) {
      for (const cert of dto.certifications) {
        await this.createCertification(userId, cert);
      }
    }

    const profile = await this.getProfile(userId);
    const completion = await this.getProfileCompletion(userId);

    return {
      message: 'Candidate onboarding completed successfully',
      profile,
      completion,
    };
  }

  async upsertProfile(userId: string, dto: any) {
    const data: any = {};
    const profileFields = [
      'photo', 'gender', 'dob', 'nationality', 'address', 'state', 'district',
      'city', 'pincode', 'linkedin', 'github', 'portfolio', 'currentCompany',
      'designation', 'experienceYears', 'currentSalary', 'expectedSalary',
      'noticePeriod', 'preferredRole', 'preferredIndustry', 'preferredLocation',
      'employmentType', 'resumeUrl', 'portfolioUrl', 'portfolioType', 'profilePhoto',
    ];
    for (const f of profileFields) {
      if (dto[f] !== undefined) data[f] = dto[f];
    }
    if (dto.countryId !== undefined) data.countryId = dto.countryId;
    if (dto.stateId !== undefined) data.stateId = dto.stateId;
    if (dto.districtId !== undefined) data.districtId = dto.districtId;
    if (dto.cityId !== undefined) data.cityId = dto.cityId;
    if (dto.dob) data.dob = new Date(dto.dob);

    const profile = await this.prisma.candidateProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    if (Array.isArray(dto.preferredRoles)) {
      await this.prisma.candidateJobRole.deleteMany({ where: { candidateProfileId: profile.id } });
      if (dto.preferredRoles.length > 0) {
        await this.prisma.candidateJobRole.createMany({
          data: dto.preferredRoles.map((id: number) => ({ candidateProfileId: profile.id, jobRoleId: id })),
        });
      }
    }

    if (Array.isArray(dto.preferredIndustries)) {
      await this.prisma.candidateIndustry.deleteMany({ where: { candidateProfileId: profile.id } });
      if (dto.preferredIndustries.length > 0) {
        await this.prisma.candidateIndustry.createMany({
          data: dto.preferredIndustries.map((id: number) => ({ candidateProfileId: profile.id, industryId: id })),
        });
      }
    }

    if (Array.isArray(dto.preferredLocations)) {
      await this.prisma.candidateLocation.deleteMany({ where: { candidateProfileId: profile.id } });
      if (dto.preferredLocations.length > 0) {
        await this.prisma.candidateLocation.createMany({
          data: dto.preferredLocations.map((id: number) => ({ candidateProfileId: profile.id, locationId: id })),
        });
      }
    }

    if (Array.isArray(dto.skillIds)) {
      await this.prisma.candidateProfileSkill.deleteMany({ where: { candidateProfileId: profile.id } });
      if (dto.skillIds.length > 0) {
        await this.prisma.candidateProfileSkill.createMany({
          data: dto.skillIds.map((skillId: number) => ({
            candidateProfileId: profile.id,
            skillId,
            level: dto.skillLevel || 'intermediate',
          })),
        });
      }
    }

    return this.getProfile(userId);
  }

  async getEducation(userId: string) {
    return this.prisma.candidateEducation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async createEducation(userId: string, dto: any) {
    return this.prisma.candidateEducation.create({ data: { userId, ...dto } });
  }

  async updateEducation(id: string, userId: string, dto: any) {
    const item = await this.prisma.candidateEducation.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Education record not found');
    return this.prisma.candidateEducation.update({ where: { id }, data: dto });
  }

  async deleteEducation(id: string, userId: string) {
    const item = await this.prisma.candidateEducation.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Education record not found');
    return this.prisma.candidateEducation.delete({ where: { id } });
  }

  async getExperience(userId: string) {
    return this.prisma.candidateExperience.findMany({ where: { userId }, orderBy: { startDate: 'desc' } });
  }

  async createExperience(userId: string, dto: any) {
    const data: any = { userId, company: dto.company, role: dto.role };
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.description !== undefined) data.description = dto.description;
    return this.prisma.candidateExperience.create({ data });
  }

  async updateExperience(id: string, userId: string, dto: any) {
    const item = await this.prisma.candidateExperience.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Experience record not found');
    return this.prisma.candidateExperience.update({ where: { id }, data: dto });
  }

  async deleteExperience(id: string, userId: string) {
    const item = await this.prisma.candidateExperience.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Experience record not found');
    return this.prisma.candidateExperience.delete({ where: { id } });
  }

  async getSkills(userId: string) {
    return this.prisma.candidateSkill.findMany({ where: { userId } });
  }

  async addSkill(userId: string, dto: { name: string; type?: string }) {
    const existing = await this.prisma.candidateSkill.findFirst({
      where: { userId, name: { equals: dto.name, mode: 'insensitive' } },
    });
    if (existing) return existing;
    return this.prisma.candidateSkill.create({ data: { userId, name: dto.name, type: dto.type || 'technical' } });
  }

  async deleteSkill(id: string, userId: string) {
    const item = await this.prisma.candidateSkill.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Skill not found');
    return this.prisma.candidateSkill.delete({ where: { id } });
  }

  async getDocuments(userId: string) {
    return this.prisma.candidateDocument.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async createDocument(userId: string, dto: { name: string; type: string; url: string; size?: string }) {
    return this.prisma.candidateDocument.create({ data: { userId, ...dto } });
  }

  async deleteDocument(id: string, userId: string) {
    const item = await this.prisma.candidateDocument.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Document not found');
    return this.prisma.candidateDocument.delete({ where: { id } });
  }

  async getCertifications(userId: string) {
    return this.prisma.candidateCertification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async createCertification(userId: string, dto: any) {
    return this.prisma.candidateCertification.create({ data: { userId, ...dto, status: 'pending' } });
  }

  async deleteCertification(id: string, userId: string) {
    const item = await this.prisma.candidateCertification.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Certification not found');
    return this.prisma.candidateCertification.delete({ where: { id } });
  }

  async getApplications(userId: string) {
    return this.prisma.candidateApplication.findMany({ where: { userId }, orderBy: { appliedAt: 'desc' } });
  }

  async applyToJob(userId: string, dto: { jobId: string; company: string; position: string; agency?: string; consultant?: string; resumeUrl?: string; coverNote?: string }) {
    const existing = await this.prisma.candidateApplication.findFirst({
      where: { userId, jobId: dto.jobId },
    });
    if (existing) throw new Error('Already applied to this job');

    const application = await this.prisma.candidateApplication.create({
      data: {
        userId,
        jobId: dto.jobId,
        company: dto.company,
        position: dto.position,
        agency: dto.agency,
        consultant: dto.consultant,
        resumeUrl: dto.resumeUrl,
        coverNote: dto.coverNote,
        stage: 'applied',
        status: 'applied',
      },
    });

    await this.prisma.candidateNotification.create({
      data: {
        userId,
        type: 'application',
        title: 'Application Submitted',
        message: `You applied for ${dto.position} at ${dto.company}`,
      },
    });

    return application;
  }

  async getSavedJobs(userId: string) {
    return this.prisma.savedJob.findMany({ where: { userId }, orderBy: { savedAt: 'desc' } });
  }

  async saveJob(userId: string, dto: { jobId: string; company: string; position: string; salary?: string; location?: string; jobType?: string }) {
    const existing = await this.prisma.savedJob.findFirst({ where: { userId, jobId: dto.jobId } });
    if (existing) return existing;
    return this.prisma.savedJob.create({ data: { userId, ...dto } });
  }

  async unsaveJob(id: string, userId: string) {
    const item = await this.prisma.savedJob.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Saved job not found');
    return this.prisma.savedJob.delete({ where: { id } });
  }

  async getNotifications(userId: string) {
    return this.prisma.candidateNotification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async markNotificationRead(id: string, userId: string) {
    return this.prisma.candidateNotification.updateMany({ where: { id, userId }, data: { read: true } });
  }

  async markAllNotificationsRead(userId: string) {
    return this.prisma.candidateNotification.updateMany({ where: { userId }, data: { read: true } });
  }

  async getInterviews(userId: string) {
    return this.prisma.interviewInvitation.findMany({ where: { userId }, orderBy: { date: 'desc' } });
  }

  async updateInterviewStatus(id: string, userId: string, status: string) {
    const item = await this.prisma.interviewInvitation.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Interview not found');
    return this.prisma.interviewInvitation.update({ where: { id }, data: { status } });
  }

  async getDashboardStats(userId: string) {
    const [applications, savedJobs, interviews, offers] = await Promise.all([
      this.prisma.candidateApplication.count({ where: { userId } }),
      this.prisma.savedJob.count({ where: { userId } }),
      this.prisma.interviewInvitation.count({ where: { userId, status: 'scheduled' } }),
      this.prisma.interviewInvitation.count({ where: { userId, status: 'offer' } }),
    ]);
    return { appliedJobs: applications, savedJobs, interviews, offers };
  }

  private async getUserBasic(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true, photo: true } });
  }
}
