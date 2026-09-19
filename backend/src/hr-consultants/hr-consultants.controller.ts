import { Controller, Get, Post, Patch, Delete, Param, Body, ForbiddenException, Query, UseGuards } from '@nestjs/common'
import { HrConsultantsService } from './hr-consultants.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CurrentUser } from '../common/current-user.decorator'
import { Public } from '../common/public.decorator'

@Controller('hr-consultants')
@UseGuards(RolesGuard)
export class HrConsultantsController {
  constructor(private hrConsultantsService: HrConsultantsService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    return this.hrConsultantsService.login(dto)
  }

  @Public()
  @Post('google-login')
  async googleLogin(@Body() dto: { googleId: string; email: string; name: string; photo?: string }) {
    return this.hrConsultantsService.googleLogin(dto)
  }

  @Public()
  @Post('send-otp')
  async sendOtp(@Body() dto: { phone: string }) {
    return this.hrConsultantsService.sendOtp(dto)
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() dto: { phone: string; otp: string }) {
    return this.hrConsultantsService.verifyOtp(dto)
  }

  @Public()
  @Post('signup')
  async signup(@Body() dto: { name: string; email: string; phone?: string; password: string; confirmPassword?: string }) {
    return this.hrConsultantsService.signup(dto)
  }

  @Public()
  @Get('activation/:token')
  async getActivation(@Param('token') token: string) {
    return this.hrConsultantsService.getActivation(token)
  }

  @Public()
  @Post('activate')
  async activate(@Body() dto: { token: string; password: string; confirmPassword: string; acceptTerms: boolean }) {
    return this.hrConsultantsService.activate(dto)
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.hrConsultantsService.getProfile(user.sub)
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: any, @Body() dto: any) {
    return this.hrConsultantsService.updateProfile(user.sub, dto)
  }

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.hrConsultantsService.getDashboard(user.sub)
  }

  @Get('requirements')
  async getRequirements(@CurrentUser() user: any, @Query() query: any) {
    return this.hrConsultantsService.getRequirements(user.sub, query)
  }

  @Get('candidates')
  async getCandidates(@CurrentUser() user: any, @Query() query: any) {
    return this.hrConsultantsService.getCandidates(user.sub, query)
  }

  @Get('candidates/:id')
  async getCandidate(@CurrentUser() user: any, @Param('id') id: string) {
    return this.hrConsultantsService.getCandidate(user.sub, id)
  }

  @Post('candidates')
  async createCandidate(@CurrentUser() user: any, @Body() dto: any) {
    return this.hrConsultantsService.createCandidate(user.sub, dto)
  }

  @Patch('candidates/:id')
  async updateCandidate(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.hrConsultantsService.updateCandidate(user.sub, id, dto)
  }

  @Patch('candidates/:id/pipeline')
  async movePipeline(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: { stage: string }) {
    return this.hrConsultantsService.movePipeline(user.sub, id, dto.stage)
  }

  @Get('interviews')
  async getInterviews(@CurrentUser() user: any, @Query() query: any) {
    return this.hrConsultantsService.getInterviews(user.sub, query)
  }

  @Post('interviews')
  async createInterview(@CurrentUser() user: any, @Body() dto: any) {
    return this.hrConsultantsService.createInterview(user.sub, dto)
  }

  @Patch('interviews/:id')
  async updateInterview(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.hrConsultantsService.updateInterview(user.sub, id, dto)
  }

  @Get('reports')
  async getReports(@CurrentUser() user: any) {
    return this.hrConsultantsService.getReports(user.sub)
  }

  @Get('billing')
  async getBilling(@CurrentUser() user: any) {
    return this.hrConsultantsService.getBilling(user.sub)
  }

  @Get('notifications')
  async getNotifications(@CurrentUser() user: any) {
    return this.hrConsultantsService.getNotifications(user.sub)
  }

  @Patch('notifications/:id/read')
  async markNotificationRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.hrConsultantsService.markNotificationRead(user.sub, id)
  }

  @Post('notifications/read-all')
  async markAllNotificationsRead(@CurrentUser() user: any) {
    return this.hrConsultantsService.markAllNotificationsRead(user.sub)
  }

  @Get('activity')
  async getActivity(@CurrentUser() user: any) {
    return this.hrConsultantsService.getActivity(user.sub)
  }

  @Roles('super_admin', 'admin', 'recruitment_agency')
  @Get()
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.hrConsultantsService.findAll(query, user)
  }

  @Roles('super_admin', 'admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hrConsultantsService.findOne(id)
  }

  @Roles('super_admin', 'admin', 'recruitment_agency')
  @Post()
  async create(@Body() dto: any, @CurrentUser() user: any) {
    return this.hrConsultantsService.create(dto, user)
  }

  @Roles('super_admin', 'admin', 'recruitment_agency')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.hrConsultantsService.update(id, dto)
  }

  @Roles('super_admin', 'admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.hrConsultantsService.remove(id)
  }
}
