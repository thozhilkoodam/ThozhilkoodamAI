import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'

@Controller('notifications')
@UseGuards(RolesGuard)
@Roles('super_admin', 'admin', 'support')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findAll() {
    return this.notificationsService.findAll()
  }

  @Post()
  async create(@Body() data: { type: string; title: string; message: string }) {
    return this.notificationsService.create(data)
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id)
  }

  @Post('mark-all-read')
  async markAllRead() {
    return this.notificationsService.markAllRead()
  }
}
