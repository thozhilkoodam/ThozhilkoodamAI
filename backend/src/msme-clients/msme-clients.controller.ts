import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common'
import { MsmeClientsService } from './msme-clients.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CurrentUser } from '../common/current-user.decorator'
import { Public } from '../common/public.decorator'

@Controller('msme-clients')
@UseGuards(RolesGuard)
export class MsmeClientsController {
  constructor(private msmeClientsService: MsmeClientsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'support')
  async findAll(@Query('status') status?: string) {
    return this.msmeClientsService.findAll(status)
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'support', 'msme_client')
  async findOne(@Param('id') id: string) {
    return this.msmeClientsService.findOne(id)
  }

  @Public()
  @Post()
  async create(@Body() dto: any) {
    return this.msmeClientsService.create(dto)
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'msme_client')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.msmeClientsService.update(id, dto)
  }

  @Public()
  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    return this.msmeClientsService.login(dto)
  }

  @Public()
  @Post('google-login')
  async googleLogin(@Body() dto: { googleId: string; email: string; companyName: string; logo?: string }) {
    return this.msmeClientsService.googleLogin(dto)
  }

  @Patch(':id/verify')
  @Roles('super_admin', 'admin')
  async verify(@Param('id') id: string, @CurrentUser('name') adminName: string) {
    return this.msmeClientsService.verify(id, adminName)
  }

  @Patch(':id/reject')
  @Roles('super_admin', 'admin')
  async reject(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser('name') adminName: string) {
    return this.msmeClientsService.reject(id, reason, adminName)
  }
}
