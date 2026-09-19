import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UploadOnboardingDocumentDto {
  @IsString()
  @IsNotEmpty()
  checklistItemId: string;

  @IsOptional()
  @IsString()
  documentCategory?: string;
}
