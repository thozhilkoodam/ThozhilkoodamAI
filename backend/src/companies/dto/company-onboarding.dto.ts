import { InviteTeamMemberDto } from './team-member.dto';

export class CompanyOnboardingDto {
  agencyName?: string;
  contactPerson?: string;
  position?: string;
  employeeCount?: string;
  vacancyCount?: string;
  registrationNumber?: string;
  phone?: string;
  category?: string;
  address?: string;
  city?: string;
  countryId?: number;
  stateId?: number;
  districtId?: number;
  cityId?: number;

  // Initial team members to invite during onboarding (optional)
  teamMembers?: InviteTeamMemberDto[];
}
