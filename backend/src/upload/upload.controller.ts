import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/public.decorator';
import { UploadService } from './upload.service';

const ALLOWED_MIME = {
  resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  certificate: ['application/pdf', 'image/jpeg', 'image/png'],
  portfolio: ['application/pdf'],
  photo: ['image/jpeg', 'image/png'],
} as const;

function validateFile(file: Express.Multer.File, type: string, maxSize: number) {
  if (!file) throw new BadRequestException('No file provided');
  const allowed = (ALLOWED_MIME as any)[type] as string[] | undefined;
  if (allowed && !allowed.includes(file.mimetype)) {
    throw new BadRequestException(`Invalid file type for ${type}. Allowed: ${allowed.join(', ')}`);
  }
  if (file.size > maxSize) {
    throw new BadRequestException(`File too large. Maximum size: ${maxSize / 1024 / 1024} MB`);
  }
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post('resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    validateFile(file, 'resume', 5 * 1024 * 1024);
    return this.uploadService.uploadFile(file, 'resumes');
  }

  @Public()
  @Post('certificate')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadCertificates(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');
    const results = await Promise.all(
      files.map((file) => {
        validateFile(file, 'certificate', 5 * 1024 * 1024);
        return this.uploadService.uploadFile(file, 'certificates');
      })
    );
    return { success: true, files: results };
  }

  @Public()
  @Post('portfolio')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPortfolio(@UploadedFile() file: Express.Multer.File) {
    validateFile(file, 'portfolio', 5 * 1024 * 1024);
    return this.uploadService.uploadFile(file, 'portfolios');
  }

  @Public()
  @Post('photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    validateFile(file, 'photo', 5 * 1024 * 1024);
    return this.uploadService.uploadFile(file, 'photos');
  }

  @Public()
  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.uploadService.uploadFile(file, 'logos');
  }

  @Public()
  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.uploadService.uploadFile(file, 'documents');
  }
}
