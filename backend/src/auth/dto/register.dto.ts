import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class RegisterDto {
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
  @MinLength(8)
  password: string

  @IsString()
  @IsOptional()
  category?: string

  @IsString()
  @IsOptional()
  logo?: string

  @IsString()
  @IsOptional()
  documentUrl?: string
}
