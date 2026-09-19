import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { MeetingsService } from './meetings.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateMeetingStatusDto } from './dto/update-meeting-status.dto'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'

@Controller('meetings')
@UseGuards(RolesGuard)
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Get()
  @Roles('super_admin', 'admin')
  async findAll() {
    return this.meetingsService.findAll()
  }

  @Get('client/:clientId')
  @Roles('super_admin', 'admin', 'msme_client')
  async getByClient(@Param('clientId') clientId: string) {
    return this.meetingsService.getByClient(clientId)
  }

  @Post()
  @Roles('super_admin', 'admin', 'msme_client')
  async create(@Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(dto)
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateMeetingStatusDto) {
    return this.meetingsService.updateStatus(id, dto)
  }
}
