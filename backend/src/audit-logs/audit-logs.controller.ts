import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuditLogsService } from './audit-logs.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'

@Controller('audit-logs')
@UseGuards(RolesGuard)
@Roles('super_admin', 'admin')
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  async findAll() {
    return this.auditLogsService.findAll()
  }
}
