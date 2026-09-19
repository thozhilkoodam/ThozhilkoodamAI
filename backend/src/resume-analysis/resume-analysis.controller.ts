import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ResumeAnalysisService } from './resume-analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('resume-analysis')
@UseGuards(JwtAuthGuard)
export class ResumeAnalysisController {
  constructor(private readonly service: ResumeAnalysisService) {}

  @Post(':documentId')
  async generateAnalysis(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
  ) {
    if (!documentId) {
      throw new BadRequestException('documentId parameter is required');
    }

    return this.service.generateAnalysis(user, documentId);
  }

  @Get(':documentId')
  async getAnalysis(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
  ) {
    if (!documentId) {
      throw new BadRequestException('documentId parameter is required');
    }

    return this.service.getAnalysis(user, documentId);
  }
}
