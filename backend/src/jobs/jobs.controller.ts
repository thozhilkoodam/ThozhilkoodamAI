import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/current-user.decorator'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Public } from '../common/public.decorator'

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Public()
  @Get('published')
  async findPublished(@Query() query: any) {
    return this.jobsService.findAllPublished(query)
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @CurrentUser() user?: any,
    @Query('companyId') companyId?: string,
  ) {
    return this.jobsService.findAll(status, user, companyId)
  }

  @Get('admin-stats')
  @Roles('super_admin', 'admin')
  async getAdminStats() {
    return this.jobsService.getAdminStats()
  }

  @Get('by-status/:status')
  @Roles('super_admin', 'admin')
  async findByStatus(@Param('status') status: string, @Query() query: any) {
    return this.jobsService.findJobsByStatus(status, query)
  }

  @Get('stats')
  async getStats() {
    return this.jobsService.getStats()
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id)
  }

  @Post()
  async create(@Body() data: any, @CurrentUser() user: any) {
    return this.jobsService.create(data, user)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.jobsService.update(id, data, user)
  }

  @Put(':id/submit')
  async submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.submitJob(id, user)
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.publishJob(id, user)
  }

  @Put(':id/close')
  async close(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.closeJob(id, user)
  }

  @Put(':id/approve')
  @Roles('super_admin', 'admin')
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.approveJob(id, user.id, user.name)
  }

  @Put(':id/reject')
  @Roles('super_admin', 'admin')
  async reject(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: any) {
    return this.jobsService.rejectJob(id, reason || 'No reason provided', user.name)
  }

  @Put(':id/request-changes')
  @Roles('super_admin', 'admin')
  async requestChanges(@Param('id') id: string, @Body('changes') changes: string, @CurrentUser() user: any) {
    return this.jobsService.requestChanges(id, changes, user.name)
  }

  @Put(':id/feature')
  @Roles('super_admin', 'admin')
  async featureJob(@Param('id') id: string) {
    return this.jobsService.featureJob(id)
  }

  @Put(':id/unfeature')
  @Roles('super_admin', 'admin')
  async unfeatureJob(@Param('id') id: string) {
    return this.jobsService.unfeatureJob(id)
  }

  @Put(':id/archive')
  async archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.archiveJob(id, user)
  }

  @Delete(':id')
  async deleteJob(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jobsService.deleteJob(id, user)
  }

  @Put(':id/suspend')
  @Roles('super_admin', 'admin')
  async suspend(@Param('id') id: string) {
    return this.jobsService.suspendJob(id)
  }

  @Post('bulk-approve')
  @Roles('super_admin', 'admin')
  async bulkApprove(@Body('ids') ids: string[], @CurrentUser() user: any) {
    return this.jobsService.bulkApprove(ids, user.id, user.name)
  }

  @Post('bulk-reject')
  @Roles('super_admin', 'admin')
  async bulkReject(@Body('ids') ids: string[], @Body('reason') reason: string, @CurrentUser() user: any) {
    return this.jobsService.bulkReject(ids, reason, user.name)
  }

  @Post('bulk-archive')
  @Roles('super_admin', 'admin')
  async bulkArchive(@Body('ids') ids: string[]) {
    return this.jobsService.bulkArchive(ids)
  }

  @Post('bulk-delete')
  @Roles('super_admin', 'admin')
  async bulkDelete(@Body('ids') ids: string[]) {
    return this.jobsService.bulkDelete(ids)
  }
}
