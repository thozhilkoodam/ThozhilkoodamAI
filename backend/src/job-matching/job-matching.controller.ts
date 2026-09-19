import {
  Controller,
  Get,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JobMatchingService } from './job-matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('job-matching')
@UseGuards(JwtAuthGuard)
export class JobMatchingController {
  constructor(private readonly service: JobMatchingService) {}

  @Get('recommended')
  async getRecommendedJobs(@CurrentUser() user: any) {
    return this.service.getRecommendedJobs(user);
  }

  @Get(':jobId')
  async getJobMatch(
    @CurrentUser() user: any,
    @Param('jobId') jobId: string,
  ) {
    if (!jobId) {
      throw new BadRequestException('jobId parameter is required.');
    }

    return this.service.getJobMatch(user, jobId);
  }
}
