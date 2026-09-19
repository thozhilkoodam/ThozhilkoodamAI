import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common'
import { SupportTicketsService } from './support-tickets.service'
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto'
import { ReplySupportTicketDto } from './dto/reply-support-ticket.dto'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'

@Controller('support-tickets')
@UseGuards(RolesGuard)
export class SupportTicketsController {
  constructor(private supportTicketsService: SupportTicketsService) {}

  @Get()
  @Roles('super_admin', 'admin')
  async findAll(@Query('status') status?: string) {
    return this.supportTicketsService.findAll(status)
  }

  @Get('client/:clientId')
  @Roles('super_admin', 'admin', 'msme_client')
  async getByClient(@Param('clientId') clientId: string) {
    return this.supportTicketsService.getByClient(clientId)
  }

  @Post()
  @Roles('super_admin', 'admin', 'msme_client')
  async create(@Body() dto: CreateSupportTicketDto) {
    return this.supportTicketsService.create(dto)
  }

  @Post(':id/reply')
  @Roles('super_admin', 'admin')
  async reply(@Param('id') id: string, @Body() dto: ReplySupportTicketDto) {
    return this.supportTicketsService.reply(id, dto)
  }

  @Patch(':id/resolve')
  @Roles('super_admin', 'admin', 'msme_client')
  async resolve(@Param('id') id: string) {
    return this.supportTicketsService.resolve(id)
  }
}
