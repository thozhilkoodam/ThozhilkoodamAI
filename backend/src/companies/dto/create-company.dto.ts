import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator'

export enum CompanyStatusEnum {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  suspended = 'suspended',
}

export class CreateCompanyDto {
  @IsString()
  agencyName: string

  @IsString()
  contactPerson: string

  @IsString()
  @IsOptional()
  position?: string

  @IsString()
  @IsOptional()
  employeeCount?: string

  @IsString()
  @IsOptional()
  vacancyCount?: string

  @IsString()
  @IsOptional()
  registrationNumber?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsEmail()
  email: string

  @IsString()
  password: string

  @IsString()
  @IsOptional()
  category?: string
}

export class UpdateCompanyStatusDto {
  @IsEnum(CompanyStatusEnum)
  status: CompanyStatusEnum

  @IsString()
  @IsOptional()
  rejectionReason?: string
}
