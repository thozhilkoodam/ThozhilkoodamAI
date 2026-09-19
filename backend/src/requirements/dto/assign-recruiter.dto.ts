import { IsString } from 'class-validator'

export class AssignRecruiterDto {
  @IsString()
  recruiterId: string
}
