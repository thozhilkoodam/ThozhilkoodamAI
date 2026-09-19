import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common'
import { SmsTemplatesService } from './sms-templates.service'
import { CurrentUser } from '../common/current-user.decorator'

@Controller('sms-templates')
export class SmsTemplatesController {
  constructor(private smsTemplatesService: SmsTemplatesService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.smsTemplatesService.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.smsTemplatesService.findOne(id)
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string) {
    return this.smsTemplatesService.preview(id)
  }

  @Post()
  async create(@Body() dto: any, @CurrentUser() user: any) {
    return this.smsTemplatesService.create(dto, user?.id)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.smsTemplatesService.update(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.smsTemplatesService.remove(id)
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    return this.smsTemplatesService.duplicate(id)
  }

  @Post(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.smsTemplatesService.toggleStatus(id)
  }

  @Post(':id/send-test')
  async sendTest(@Param('id') id: string, @Body('phone') phone: string) {
    return this.smsTemplatesService.sendTest(id, phone)
  }
}
