import { IsString, IsInt, IsOptional, IsNumber, IsDateString, IsEnum, Min } from 'class-validator'

export class CreateRequirementDto {
  @IsString()
  clientId: string

  @IsString()
  companyName: string

  @IsString()
  @IsOptional()
  department?: string

  @IsString()
  position: string

  @IsInt()
  @Min(1)
  vacancies: number

  @IsString()
  @IsOptional()
  experience?: string

  @IsString()
  @IsOptional()
  education?: string

  @IsString()
  @IsOptional()
  skills?: string

  @IsNumber()
  @IsOptional()
  minSalary?: number

  @IsNumber()
  @IsOptional()
  maxSalary?: number

  @IsDateString()
  @IsOptional()
  hiringDeadline?: string

  @IsDateString()
  @IsOptional()
  joiningDate?: string

  @IsString()
  @IsOptional()
  location?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  employmentType?: string

  @IsString()
  @IsOptional()
  interviewMode?: string

  @IsString()
  @IsOptional()
  venue?: string

  @IsDateString()
  @IsOptional()
  interviewDate?: string

  @IsString()
  @IsOptional()
  interviewTime?: string

  @IsString()
  @IsOptional()
  contactPerson?: string

  @IsString()
  @IsOptional()
  contactPhone?: string

  @IsString()
  @IsOptional()
  googleMap?: string

  @IsString()
  @IsOptional()
  instructions?: string

  @IsString()
  @IsOptional()
  meetingLink?: string

  @IsString()
  @IsOptional()
  meetingPlatform?: string

  @IsString()
  @IsOptional()
  priority?: string

  @IsNumber()
  @IsOptional()
  budget?: number

  @IsString()
  @IsOptional()
  timeline?: string
}
