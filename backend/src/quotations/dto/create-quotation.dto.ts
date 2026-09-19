import { IsString, IsNumber, IsOptional, Min } from 'class-validator'

export class CreateQuotationDto {
  @IsString()
  requirementId: string

  @IsString()
  clientId: string

  @IsNumber()
  @Min(0)
  serviceCharges: number

  @IsNumber()
  @Min(0)
  placementCharges: number

  @IsNumber()
  @IsOptional()
  @Min(0)
  gstPercentage?: number

  @IsString()
  @IsOptional()
  terms?: string
}
