import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { SaveInterviewResponsesDto } from './dto/save-interview-responses.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  // ==========================================
  // EMPLOYER ENDPOINTS
  // ==========================================

  @Post('employer/applications/:id/interviews')
  async scheduleInterview(
    @Param('id') applicationId: string,
    @CurrentUser('id') companyId: string,
    @Body() dto: CreateInterviewDto,
  ) {
    return this.interviewsService.scheduleInterview(companyId, applicationId, dto);
  }

  @Get('employer/interviews')
  async getEmployerInterviews(
    @CurrentUser('id') companyId: string,
    @Query('status') status?: string,
    @Query('jobId') jobId?: string,
  ) {
    return this.interviewsService.getEmployerInterviews(companyId, { status, jobId });
  }

  @Get('employer/interviews/:id')
  async getEmployerInterviewById(
    @Param('id') id: string,
    @CurrentUser('id') companyId: string,
  ) {
    return this.interviewsService.getEmployerInterviewById(companyId, id);
  }

  @Patch('employer/interviews/:id')
  async updateInterview(
    @Param('id') id: string,
    @CurrentUser('id') companyId: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.interviewsService.updateInterview(companyId, id, dto);
  }

  @Delete('employer/interviews/:id')
  async cancelInterview(
    @Param('id') id: string,
    @CurrentUser('id') companyId: string,
    @Body('reason') reason?: string,
  ) {
    return this.interviewsService.cancelInterview(companyId, id, reason);
  }

  @Post('employer/interviews/:id/responses')
  async saveInterviewResponses(
    @Param('id') id: string,
    @CurrentUser('id') companyId: string,
    @Body() dto: SaveInterviewResponsesDto,
  ) {
    return this.interviewsService.saveInterviewResponses(companyId, id, dto);
  }

  @Get('employer/interviews/:id/responses')
  async getInterviewResponses(
    @Param('id') id: string,
    @CurrentUser('id') companyId: string,
  ) {
    return this.interviewsService.getInterviewResponses(companyId, id);
  }

  @Post('employer/interviews/:id/evaluation')
  async evaluateInterview(
    @Param('id') id: string,
    @CurrentUser('id') companyId: string,
    @Query('reEvaluate') reEvaluate?: string,
  ) {
    const reEvaluateFlag = reEvaluate === 'true' || reEvaluate === '1';
    return this.interviewsService.evaluateInterview(companyId, id, reEvaluateFlag);
  }

  @Get('employer/interviews/:id/evaluation')
  async getInterviewEvaluation(
    @Param('id') id: string,
    @CurrentUser('id') companyId: string,
  ) {
    return this.interviewsService.getInterviewEvaluation(companyId, id);
  }

  // ==========================================
  // CANDIDATE ENDPOINTS
  // ==========================================

  @Get('candidate/interviews')
  async getCandidateInterviews(@CurrentUser('id') candidateId: string) {
    return this.interviewsService.getCandidateInterviews(candidateId);
  }

  @Get('candidate/interviews/:id')
  async getCandidateInterviewById(
    @Param('id') id: string,
    @CurrentUser('id') candidateId: string,
  ) {
    return this.interviewsService.getCandidateInterviewById(candidateId, id);
  }

  @Post('candidate/interviews/:id/ai-preparation')
  async generateCandidatePreparation(
    @Param('id') id: string,
    @CurrentUser('id') candidateId: string,
    @Query('force') force?: string,
  ) {
    const forceFlag = force === 'true' || force === '1';
    return this.interviewsService.generateOrGetCandidatePreparation(candidateId, id, forceFlag);
  }

  @Get('candidate/interviews/:id/ai-preparation')
  async getCandidatePreparation(
    @Param('id') id: string,
    @CurrentUser('id') candidateId: string,
  ) {
    return this.interviewsService.generateOrGetCandidatePreparation(candidateId, id, false);
  }
}
