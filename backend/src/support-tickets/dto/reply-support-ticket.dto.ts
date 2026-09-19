import { IsString } from 'class-validator'

export class ReplySupportTicketDto {
  @IsString()
  adminReply: string
}
