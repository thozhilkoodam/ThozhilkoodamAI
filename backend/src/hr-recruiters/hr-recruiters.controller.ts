import { Controller, Get, Post, Patch, Delete, Put, Param, Body, Query, ForbiddenException, UseGuards } from '@nestjs/common'
import { HrRecruitersService } from './hr-recruiters.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CurrentUser } from '../common/current-user.decorator'
import { Public } from '../common/public.decorator'

@Controller('hr-recruiters')
@UseGuards(RolesGuard)
export class HrRecruitersController {
  constructor(private hrRecruitersService: HrRecruitersService) {}

  @Get()
  @Roles('super_admin', 'admin')
  async findAll(@Query() query: any) {
    return this.hrRecruitersService.findAll(query)
  }

  @Get('performance')
  @Roles('super_admin', 'admin')
  async getPerformance() {
    return this.hrRecruitersService.getPerformance()
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'super_admin' && user.role !== 'admin' && user.id !== id) {
      throw new ForbiddenException('Access denied')
    }
    return this.hrRecruitersService.findOne(id)
  }

  @Post()
  @Roles('super_admin', 'admin')
  async create(@Body() dto: any) {
    return this.hrRecruitersService.create(dto)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    if (user.role !== 'super_admin' && user.role !== 'admin' && user.id !== id) {
      throw new ForbiddenException('Access denied')
    }
    return this.hrRecruitersService.update(id, dto)
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  async remove(@Param('id') id: string) {
    return this.hrRecruitersService.remove(id)
  }

  @Put(':id/approve')
  @Roles('super_admin', 'admin')
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.hrRecruitersService.approve(id, user.name || 'Admin')
  }

  @Put(':id/reject')
  @Roles('super_admin', 'admin')
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.hrRecruitersService.reject(id, reason || 'No reason provided')
  }

  @Put(':id/suspend')
  @Roles('super_admin', 'admin')
  async suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.hrRecruitersService.suspend(id, reason || 'No reason provided')
  }

  @Put(':id/reactivate')
  @Roles('super_admin', 'admin')
  async reactivate(@Param('id') id: string) {
    return this.hrRecruitersService.reactivate(id)
  }

  @Post(':id/reset-password')
  @Roles('super_admin', 'admin')
  async resetPassword(@Param('id') id: string) {
    return this.hrRecruitersService.resetPassword(id)
  }

  @Put(':id/assign-agency')
  @Roles('super_admin', 'admin')
  async assignAgency(@Param('id') id: string, @Body('agencyId') agencyId: string) {
    return this.hrRecruitersService.assignAgency(id, agencyId)
  }

  @Public()
  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    return this.hrRecruitersService.login(dto)
  }

  @Public()
  @Post('google-login')
  async googleLogin(@Body() dto: { googleId: string; email: string; name: string; photo?: string }) {
    return this.hrRecruitersService.googleLogin(dto)
  }
}
