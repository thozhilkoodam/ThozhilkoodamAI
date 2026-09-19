import { IsString, IsEnum, IsOptional } from 'class-validator'

export enum MeetingTypeEnum {
  online = 'online',
  offline = 'offline',
}

export class CreateMeetingDto {
  @IsString()
  clientId: string

  @IsString()
  date: string

  @IsString()
  time: string

  @IsString()
  purpose: string

  @IsEnum(MeetingTypeEnum)
  type: MeetingTypeEnum

  @IsString()
  @IsOptional()
  link?: string

  @IsString()
  @IsOptional()
  notes?: string
}
