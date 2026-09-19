import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateCompanyDto, UpdateCompanyStatusDto } from './dto/create-company.dto';
import { CompanyOnboardingDto } from './dto/company-onboarding.dto';
import { InviteTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
import { getCompanyPlaceholderSvgDataUri } from '../common/utils/avatar-placeholder.util';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {};
    const companies = await this.prisma.company.findMany({ where, orderBy: { createdAt: 'desc' } });
    return companies.map((c) => ({
      ...c,
      defaultLogoUrl: getCompanyPlaceholderSvgDataUri(c.agencyName),
    }));
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { documents: true, teamMembers: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return {
      ...company,
      defaultLogoUrl: getCompanyPlaceholderSvgDataUri(company.agencyName),
    };
  }

  async create(dto: CreateCompanyDto) {
    const count = await this.prisma.company.count();
    const companyId = `KIKTK${String(count + 1).padStart(6, '0')}`;
    return this.prisma.company.create({
      data: {
        companyId,
        ...dto,
        passwordHash: await bcrypt.hash(dto.password, 10),
        status: 'pending',
      },
    });
  }

  async updateStatus(id: string, dto: UpdateCompanyStatusDto, adminName: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');

    const updateData: any = { status: dto.status };
    if (dto.status === 'approved') {
      updateData.approvedBy = adminName;
      updateData.approvedDate = new Date();
    }
    if (dto.status === 'rejected') {
      updateData.rejectionReason = dto.rejectionReason || 'Not specified';
      updateData.rejectedBy = adminName;
      updateData.rejectedAt = new Date();
    }
    if (dto.status === 'suspended') {
      updateData.suspendedBy = adminName;
      updateData.suspendedAt = new Date();
    }

    await this.prisma.auditLog.create({
      data: {
        userName: adminName,
        action: dto.status === 'approved' ? 'Approval' : dto.status === 'rejected' ? 'Rejection' : 'Suspension',
        details: `${dto.status === 'approved' ? 'Approved' : dto.status === 'rejected' ? 'Rejected' : 'Suspended'} ${company.agencyName} (${company.companyId})`,
      },
    });

    await this.prisma.notification.create({
      data: {
        type: 'agency_status',
        title: `Registration ${dto.status.charAt(0).toUpperCase() + dto.status.slice(1)}`,
        message: `${company.agencyName} has been ${dto.status}.`,
      },
    });

    if (dto.status === 'approved') {
      this.mailService.sendApprovalEmail(company.email, {
        agencyName: company.agencyName,
        companyId: company.companyId,
      });
    } else if (dto.status === 'rejected') {
      this.mailService.sendRejectionEmail(company.email, {
        agencyName: company.agencyName,
        reason: dto.rejectionReason || 'Not specified',
      });
    }

    return this.prisma.company.update({ where: { id }, data: updateData });
  }

  async updateProfile(id: string, dto: Partial<CompanyOnboardingDto>) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');

    const data: any = {};
    if (dto.agencyName !== undefined) data.agencyName = dto.agencyName;
    if (dto.contactPerson !== undefined) data.contactPerson = dto.contactPerson;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.employeeCount !== undefined) data.employeeCount = dto.employeeCount;
    if (dto.vacancyCount !== undefined) data.vacancyCount = dto.vacancyCount;
    if (dto.registrationNumber !== undefined) data.registrationNumber = dto.registrationNumber;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.countryId !== undefined) data.countryId = dto.countryId;
    if (dto.stateId !== undefined) data.stateId = dto.stateId;
    if (dto.districtId !== undefined) data.districtId = dto.districtId;
    if (dto.cityId !== undefined) data.cityId = dto.cityId;

    const updated = await this.prisma.company.update({
      where: { id },
      data,
    });

    return {
      ...updated,
      defaultLogoUrl: getCompanyPlaceholderSvgDataUri(updated.agencyName),
    };
  }

  async completeOnboarding(id: string, dto: CompanyOnboardingDto) {
    const company = await this.updateProfile(id, dto);

    if (Array.isArray(dto.teamMembers) && dto.teamMembers.length > 0) {
      for (const tm of dto.teamMembers) {
        await this.inviteTeamMember(id, tm);
      }
    }

    const fullCompany = await this.findOne(id);

    return {
      message: 'Company onboarding completed successfully',
      company: fullCompany,
    };
  }

  async getTeamMembers(companyId: string) {
    return this.prisma.teamMember.findMany({
      where: { companyId },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async inviteTeamMember(companyId: string, dto: InviteTeamMemberDto) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');

    return this.prisma.teamMember.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        role: dto.role,
        status: 'invited',
      },
    });
  }

  async updateTeamMember(companyId: string, memberId: string, dto: UpdateTeamMemberDto) {
    const member = await this.prisma.teamMember.findFirst({
      where: { id: memberId, companyId },
    });
    if (!member) throw new NotFoundException('Team member not found');

    return this.prisma.teamMember.update({
      where: { id: memberId },
      data: dto,
    });
  }

  async removeTeamMember(companyId: string, memberId: string) {
    const member = await this.prisma.teamMember.findFirst({
      where: { id: memberId, companyId },
    });
    if (!member) throw new NotFoundException('Team member not found');

    return this.prisma.teamMember.delete({
      where: { id: memberId },
    });
  }

  async getStats() {
    const [total, pending, approved, rejected, suspended] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: 'pending' } }),
      this.prisma.company.count({ where: { status: 'approved' } }),
      this.prisma.company.count({ where: { status: 'rejected' } }),
      this.prisma.company.count({ where: { status: 'suspended' } }),
    ]);
    return { total, pending, approved, rejected, suspended };
  }
}
