import { IsEnum, IsOptional, IsString } from 'class-validator'

export enum RequirementStatusEnum {
  pending = 'pending',
  under_review = 'under_review',
  quoted = 'quoted',
  client_approved = 'client_approved',
  recruiter_assigned = 'recruiter_assigned',
  candidate_search = 'candidate_search',
  interview = 'interview',
  offer = 'offer',
  joining = 'joining',
  completed = 'completed',
}

export class UpdateRequirementStatusDto {
  @IsEnum(RequirementStatusEnum)
  status: RequirementStatusEnum

  @IsString()
  @IsOptional()
  notes?: string
}
