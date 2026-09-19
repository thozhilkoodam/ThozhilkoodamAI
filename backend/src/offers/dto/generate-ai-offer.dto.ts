import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';

export class GenerateAiOfferDto {
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  workLocation?: string;

  @IsString()
  @IsOptional()
  employmentType?: string;

  @IsDateString()
  @IsOptional()
  joiningDate?: string;

  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsString()
  @IsOptional()
  salaryPeriod?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  variableBonus?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[];

  @IsString()
  @IsOptional()
  additionalNotes?: string;
}
