import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { CandidateInterviewType, CandidateInterviewStatus } from '@prisma/client';

export class UpdateInterviewDto {
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

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

  @IsEnum(CandidateInterviewStatus)
  @IsOptional()
  status?: CandidateInterviewStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
