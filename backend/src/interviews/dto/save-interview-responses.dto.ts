import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InterviewResponseItemDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  response: string;

  @IsString()
  @IsOptional()
  interviewerNotes?: string;

  @IsString()
  @IsOptional()
  competencyArea?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

export class SaveInterviewResponsesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewResponseItemDto)
  responses: InterviewResponseItemDto[];

  @IsString()
  @IsOptional()
  overallNotes?: string;
}
