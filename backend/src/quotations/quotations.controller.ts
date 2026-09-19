import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common'
import { QuotationsService } from './quotations.service'
import { CreateQuotationDto } from './dto/create-quotation.dto'
import { UpdateQuotationStatusDto } from './dto/update-quotation-status.dto'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'

@Controller('quotations')
@UseGuards(RolesGuard)
export class QuotationsController {
  constructor(private quotationsService: QuotationsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'hr_recruiter')
  async findAll(@Query('status') status?: string) {
    return this.quotationsService.findAll(status)
  }

  @Get('client/:clientId')
  @Roles('super_admin', 'admin', 'msme_client')
  async getByClient(@Param('clientId') clientId: string) {
    return this.quotationsService.getByClient(clientId)
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'msme_client')
  async findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id)
  }

  @Post()
  @Roles('super_admin', 'admin')
  async create(@Body() dto: CreateQuotationDto) {
    return this.quotationsService.create(dto)
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateQuotationStatusDto) {
    return this.quotationsService.updateStatus(id, dto)
  }
}
