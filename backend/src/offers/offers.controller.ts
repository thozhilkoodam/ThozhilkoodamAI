import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateJobOfferDto } from './dto/create-offer.dto';
import { GenerateAiOfferDto } from './dto/generate-ai-offer.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('employer/applications/:id/offer')
@UseGuards(JwtAuthGuard)
export class EmployerOffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post('ai-draft')
  async generateAiDraft(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() dto: GenerateAiOfferDto,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.offersService.generateAiDraft(applicationId, companyId, dto);
  }

  @Post()
  async saveOffer(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() dto: CreateJobOfferDto,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.offersService.saveOffer(applicationId, companyId, dto);
  }

  @Get()
  async getOffer(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.offersService.getEmployerOffer(applicationId, companyId);
  }

  @Post('send')
  async sendOffer(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.offersService.sendOffer(applicationId, companyId);
  }

  @Post('withdraw')
  async withdrawOffer(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.offersService.withdrawOffer(applicationId, companyId);
  }
}

@Controller('candidate/applications/:id/offer')
@UseGuards(JwtAuthGuard)
export class CandidateOffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async getOffer(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
  ) {
    const candidateUserId = user?.id;
    if (!candidateUserId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.offersService.getCandidateOffer(applicationId, candidateUserId);
  }

  @Post('respond')
  async respondOffer(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() dto: RespondOfferDto,
  ) {
    const candidateUserId = user?.id;
    if (!candidateUserId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.offersService.respondToOffer(applicationId, candidateUserId, dto);
  }
}
