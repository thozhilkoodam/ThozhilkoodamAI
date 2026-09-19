import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { CandidateInterviewType } from '@prisma/client';

export class CreateInterviewDto {
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsEnum(CandidateInterviewType)
  @IsOptional()
  interviewType?: CandidateInterviewType;

  @IsInt()
  @Min(5)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsString()
  @IsOptional()
  locationVenue?: string;

  @IsString()
  @IsOptional()
  interviewerName?: string;

  @IsString()
  @IsOptional()
  interviewerRole?: string;

  @IsString()
  @IsOptional()
  interviewerEmail?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
