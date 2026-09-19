import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { ApplicationsService, ApplicationFilterDto } from './applications.service';

@Controller('employer/applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query() query: ApplicationFilterDto,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.applicationsService.findAllForEmployer(companyId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.applicationsService.findOneForEmployer(id, companyId);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.applicationsService.updateStatusForEmployer(
      id,
      companyId,
      body.status,
      body.notes,
    );
  }
}
