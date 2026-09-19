import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common'
import { RequirementsService } from './requirements.service'
import { CreateRequirementDto } from './dto/create-requirement.dto'
import { UpdateRequirementStatusDto } from './dto/update-requirement-status.dto'
import { AssignRecruiterDto } from './dto/assign-recruiter.dto'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Public } from '../common/public.decorator'
import { CurrentUser } from '../common/current-user.decorator'

@Controller('requirements')
@UseGuards(RolesGuard)
export class RequirementsController {
  constructor(private requirementsService: RequirementsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'support', 'hr_recruiter')
  async findAll(@Query('status') status?: string) {
    return this.requirementsService.findAll(status)
  }

  @Get('stats')
  @Roles('super_admin', 'admin')
  async getStats() {
    return this.requirementsService.getStats()
  }

  @Get('client/:clientId')
  @Roles('super_admin', 'admin', 'msme_client')
  async getByClient(@Param('clientId') clientId: string) {
    return this.requirementsService.getByClient(clientId)
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'hr_recruiter', 'msme_client')
  async findOne(@Param('id') id: string) {
    return this.requirementsService.findOne(id)
  }

  @Post()
  @Public()
  async create(@Body() dto: CreateRequirementDto) {
    return this.requirementsService.create(dto)
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRequirementStatusDto,
    @CurrentUser('name') adminName: string,
  ) {
    return this.requirementsService.updateStatus(id, dto, adminName)
  }

  @Post(':id/assign')
  @Roles('super_admin', 'admin')
  async assignRecruiter(
    @Param('id') id: string,
    @Body() dto: AssignRecruiterDto,
    @CurrentUser('name') assignedBy: string,
  ) {
    return this.requirementsService.assignRecruiter(id, dto, assignedBy)
  }
}
