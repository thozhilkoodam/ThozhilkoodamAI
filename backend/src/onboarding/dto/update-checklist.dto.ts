import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsBoolean()
  completed: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEmployerChecklistDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChecklistItemDto)
  items?: UpdateChecklistItemDto[];

  @IsOptional()
  @IsString()
  joiningDate?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class UpdateCandidateChecklistDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChecklistItemDto)
  items: UpdateChecklistItemDto[];
}
