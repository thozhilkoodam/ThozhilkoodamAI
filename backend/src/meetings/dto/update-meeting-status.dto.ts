import { IsEnum } from 'class-validator'

export enum MeetingStatusEnum {
  scheduled = 'scheduled',
  completed = 'completed',
  cancelled = 'cancelled',
}

export class UpdateMeetingStatusDto {
  @IsEnum(MeetingStatusEnum)
  status: MeetingStatusEnum
}
