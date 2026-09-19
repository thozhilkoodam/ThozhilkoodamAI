import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ResumeParserService } from './resume-parser.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('resume-parser')
@UseGuards(JwtAuthGuard)
export class ResumeParserController {
  constructor(private readonly service: ResumeParserService) {}

  @Post('parse')
  async parse(
    @CurrentUser() user: any,
    @Body() dto: { documentId?: string; fileUrl?: string },
  ) {
    const documentId = dto.documentId || dto.fileUrl;
    if (!documentId) {
      throw new BadRequestException('documentId or fileUrl is required');
    }

    return this.service.parseDocument(user, documentId);
  }

  @Get(':documentId')
  async getExtraction(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
  ) {
    if (!documentId) {
      throw new BadRequestException('documentId parameter is required');
    }

    return this.service.getExtraction(user, documentId);
  }
}
