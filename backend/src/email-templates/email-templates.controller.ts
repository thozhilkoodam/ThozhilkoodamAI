import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common'
import { EmailTemplatesService } from './email-templates.service'
import { CurrentUser } from '../common/current-user.decorator'

@Controller('email-templates')
export class EmailTemplatesController {
  constructor(private emailTemplatesService: EmailTemplatesService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.emailTemplatesService.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.emailTemplatesService.findOne(id)
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string) {
    return this.emailTemplatesService.preview(id)
  }

  @Post()
  async create(@Body() dto: any, @CurrentUser() user: any) {
    return this.emailTemplatesService.create(dto, user?.id)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.emailTemplatesService.update(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.emailTemplatesService.remove(id)
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    return this.emailTemplatesService.duplicate(id)
  }

  @Post(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.emailTemplatesService.toggleStatus(id)
  }

  @Post(':id/send-test')
  async sendTest(@Param('id') id: string, @Body('email') email: string) {
    return this.emailTemplatesService.sendTest(id, email)
  }
}
