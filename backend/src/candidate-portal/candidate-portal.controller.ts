import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CandidatePortalService } from './candidate-portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CandidateOnboardingDto } from './dto/candidate-onboarding.dto';

@Controller('candidate-portal')
@UseGuards(JwtAuthGuard)
export class CandidatePortalController {
  constructor(private service: CandidatePortalService) {}

  @Get('profile')
  getProfile(@CurrentUser('id') userId: string) {
    return this.service.getProfile(userId);
  }

  @Put('profile')
  upsertProfile(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.upsertProfile(userId, dto);
  }

  @Get('profile-completion')
  getProfileCompletion(@CurrentUser('id') userId: string) {
    return this.service.getProfileCompletion(userId);
  }

  @Post('onboarding')
  completeOnboarding(@CurrentUser('id') userId: string, @Body() dto: CandidateOnboardingDto) {
    return this.service.completeOnboarding(userId, dto);
  }

  @Get('education')
  getEducation(@CurrentUser('id') userId: string) {
    return this.service.getEducation(userId);
  }

  @Post('education')
  createEducation(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.createEducation(userId, dto);
  }

  @Put('education/:id')
  updateEducation(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.updateEducation(id, userId, dto);
  }

  @Delete('education/:id')
  deleteEducation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.deleteEducation(id, userId);
  }

  @Get('experience')
  getExperience(@CurrentUser('id') userId: string) {
    return this.service.getExperience(userId);
  }

  @Post('experience')
  createExperience(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.createExperience(userId, dto);
  }

  @Put('experience/:id')
  updateExperience(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.updateExperience(id, userId, dto);
  }

  @Delete('experience/:id')
  deleteExperience(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.deleteExperience(id, userId);
  }

  @Get('skills')
  getSkills(@CurrentUser('id') userId: string) {
    return this.service.getSkills(userId);
  }

  @Post('skills')
  addSkill(@CurrentUser('id') userId: string, @Body() dto: { name: string; type?: string }) {
    return this.service.addSkill(userId, dto);
  }

  @Delete('skills/:id')
  deleteSkill(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.deleteSkill(id, userId);
  }

  @Get('documents')
  getDocuments(@CurrentUser('id') userId: string) {
    return this.service.getDocuments(userId);
  }

  @Post('documents')
  createDocument(@CurrentUser('id') userId: string, @Body() dto: { name: string; type: string; url: string; size?: string }) {
    return this.service.createDocument(userId, dto);
  }

  @Delete('documents/:id')
  deleteDocument(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.deleteDocument(id, userId);
  }

  @Get('certifications')
  getCertifications(@CurrentUser('id') userId: string) {
    return this.service.getCertifications(userId);
  }

  @Post('certifications')
  createCertification(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.createCertification(userId, dto);
  }

  @Delete('certifications/:id')
  deleteCertification(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.deleteCertification(id, userId);
  }

  @Get('applications')
  getApplications(@CurrentUser('id') userId: string) {
    return this.service.getApplications(userId);
  }

  @Get('saved-jobs')
  getSavedJobs(@CurrentUser('id') userId: string) {
    return this.service.getSavedJobs(userId);
  }

  @Post('applications')
  applyToJob(@CurrentUser('id') userId: string, @Body() dto: { jobId: string; company: string; position: string; agency?: string; consultant?: string; resumeUrl?: string; coverNote?: string }) {
    return this.service.applyToJob(userId, dto);
  }

  @Post('saved-jobs')
  saveJob(@CurrentUser('id') userId: string, @Body() dto: { jobId: string; company: string; position: string; salary?: string; location?: string; jobType?: string }) {
    return this.service.saveJob(userId, dto);
  }

  @Delete('saved-jobs/:id')
  unsaveJob(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.unsaveJob(id, userId);
  }

  @Get('notifications')
  getNotifications(@CurrentUser('id') userId: string) {
    return this.service.getNotifications(userId);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.markNotificationRead(id, userId);
  }

  @Patch('notifications/read-all')
  markAllNotificationsRead(@CurrentUser('id') userId: string) {
    return this.service.markAllNotificationsRead(userId);
  }

  @Get('interviews')
  getInterviews(@CurrentUser('id') userId: string) {
    return this.service.getInterviews(userId);
  }

  @Patch('interviews/:id/status')
  updateInterviewStatus(@Param('id') id: string, @CurrentUser('id') userId: string, @Body('status') status: string) {
    return this.service.updateInterviewStatus(id, userId, status);
  }

  @Get('dashboard/stats')
  getDashboardStats(@CurrentUser('id') userId: string) {
    return this.service.getDashboardStats(userId);
  }
}
