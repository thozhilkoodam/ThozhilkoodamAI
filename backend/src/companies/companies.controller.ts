import { Controller, Get, Post, Patch, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyStatusDto } from './dto/create-company.dto';
import { CompanyOnboardingDto } from './dto/company-onboarding.dto';
import { InviteTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('companies')
@UseGuards(RolesGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  @Roles('super_admin', 'admin', 'support')
  async findAll(@Query('status') status?: string) {
    return this.companiesService.findAll(status);
  }

  @Get('stats')
  @Roles('super_admin', 'admin', 'support')
  async getStats() {
    return this.companiesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Put(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() dto: Partial<CompanyOnboardingDto>) {
    return this.companiesService.updateProfile(id, dto);
  }

  @Post(':id/onboarding')
  async completeOnboarding(@Param('id') id: string, @Body() dto: CompanyOnboardingDto) {
    return this.companiesService.completeOnboarding(id, dto);
  }

  @Get(':id/team')
  async getTeamMembers(@Param('id') id: string) {
    return this.companiesService.getTeamMembers(id);
  }

  @Post(':id/team/invite')
  async inviteTeamMember(@Param('id') id: string, @Body() dto: InviteTeamMemberDto) {
    return this.companiesService.inviteTeamMember(id, dto);
  }

  @Patch(':id/team/:memberId')
  async updateTeamMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.companiesService.updateTeamMember(id, memberId, dto);
  }

  @Delete(':id/team/:memberId')
  async removeTeamMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.companiesService.removeTeamMember(id, memberId);
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyStatusDto,
    @CurrentUser('name') adminName: string,
  ) {
    return this.companiesService.updateStatus(id, dto, adminName);
  }
}
