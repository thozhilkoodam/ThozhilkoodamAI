import { IsString, IsOptional } from 'class-validator'

export class CreateSupportTicketDto {
  @IsString()
  clientId: string

  @IsString()
  subject: string

  @IsString()
  message: string

  @IsString()
  @IsOptional()
  attachment?: string
}
