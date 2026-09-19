import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OnboardingService } from './onboarding.service';
import {
  UpdateEmployerChecklistDto,
  UpdateCandidateChecklistDto,
} from './dto/update-checklist.dto';
import { ConfirmJoiningDto } from './dto/confirm-joining.dto';
import { CancelOnboardingDto } from './dto/cancel-onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('employer/onboarding')
@UseGuards(JwtAuthGuard)
export class EmployerOnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  async getOnboardings(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Employer authentication required');
    }
    return this.onboardingService.getEmployerOnboardings(companyId, { status, search });
  }

  @Get(':id')
  async getOnboarding(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Employer authentication required');
    }
    return this.onboardingService.getEmployerOnboarding(id, companyId);
  }

  @Patch(':id')
  async updateOnboarding(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateEmployerChecklistDto,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Employer authentication required');
    }
    return this.onboardingService.updateEmployerOnboarding(id, companyId, dto);
  }

  @Post(':id/confirm-joining')
  async confirmJoining(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ConfirmJoiningDto,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Employer authentication required');
    }
    return this.onboardingService.confirmJoining(id, companyId, dto);
  }

  @Post(':id/cancel')
  async cancelOnboarding(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CancelOnboardingDto,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Employer authentication required');
    }
    return this.onboardingService.cancelOnboarding(id, companyId, dto);
  }

  @Get(':id/documents/:documentId/download')
  async downloadDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Employer authentication required');
    }
    return this.onboardingService.getSignedDocumentDownloadUrl(id, documentId, {
      id: user.id,
      role: user.role || 'employer',
      companyId: user.id,
    });
  }
}

@Controller('candidate/onboarding')
@UseGuards(JwtAuthGuard)
export class CandidateOnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  async getOnboardings(@CurrentUser() user: any) {
    const candidateUserId = user?.id;
    if (!candidateUserId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.onboardingService.getCandidateOnboardings(candidateUserId);
  }

  @Get(':id')
  async getOnboarding(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const candidateUserId = user?.id;
    if (!candidateUserId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.onboardingService.getCandidateOnboarding(id, candidateUserId);
  }

  @Patch(':id')
  async updateChecklist(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCandidateChecklistDto,
  ) {
    const candidateUserId = user?.id;
    if (!candidateUserId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.onboardingService.updateCandidateChecklist(id, candidateUserId, dto);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('checklistItemId') checklistItemId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const candidateUserId = user?.id;
    if (!candidateUserId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    if (!file) {
      throw new BadRequestException('No document file was uploaded');
    }
    if (!checklistItemId) {
      throw new BadRequestException('checklistItemId is required');
    }
    return this.onboardingService.uploadCandidateDocument(
      id,
      candidateUserId,
      checklistItemId,
      file,
    );
  }

  @Get(':id/documents/:documentId/download')
  async downloadDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    const candidateUserId = user?.id;
    if (!candidateUserId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.onboardingService.getSignedDocumentDownloadUrl(id, documentId, {
      id: candidateUserId,
      role: 'candidate',
    });
  }
}
