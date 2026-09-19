import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { DocumentsService } from '../documents/documents.service';

@Controller('v1/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.documentsService.uploadDocument(user, 'resume', file);
  }

  @Post('certificate')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificate(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.documentsService.uploadDocument(user, 'certificate', file);
  }

  @Post('profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.documentsService.uploadDocument(user, 'profile_image', file);
  }

  @Post('company-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanyLogo(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('companyId') companyId?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.documentsService.uploadDocument(user, 'company_logo', file, companyId);
  }

  @Get(':documentId/metadata')
  async getMetadata(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.getDocumentMetadata(user, documentId);
  }

  @Get(':documentId/download')
  async getDownloadUrl(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.getSignedDownloadUrl(user, documentId);
  }

  @Delete(':documentId')
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.deleteDocument(user, documentId);
  }

  @Put(':documentId/replace')
  @UseInterceptors(FileInterceptor('file'))
  async replaceDocument(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No replacement file provided');
    return this.documentsService.replaceDocument(user, documentId, file);
  }
}
