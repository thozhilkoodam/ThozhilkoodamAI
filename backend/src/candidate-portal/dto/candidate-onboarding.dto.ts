export class CandidateOnboardingDto {
  // Basic Info
  gender?: string;
  dob?: string;
  nationality?: string;
  address?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  countryId?: number;
  stateId?: number;
  districtId?: number;
  cityId?: number;
  linkedin?: string;
  github?: string;
  portfolio?: string;

  // Career details
  currentCompany?: string;
  designation?: string;
  experienceYears?: string;
  currentSalary?: string;
  expectedSalary?: string;
  noticePeriod?: any;
  preferredRole?: string;
  preferredIndustry?: string;
  preferredLocation?: string;
  employmentType?: string;

  // Multi-select relations
  preferredRoles?: number[];
  preferredIndustries?: number[];
  preferredLocations?: number[];
  skillIds?: number[];
  skillLevel?: string;

  // Arrays for inline onboarding setup
  education?: Array<{
    qualification: string;
    qualificationType?: string;
    degree?: string;
    specialization?: string;
    college?: string;
    university?: string;
    passingYear?: string;
    percentage?: string;
    gradingType?: string;
    backlogs?: string;
  }>;

  experience?: Array<{
    company: string;
    role: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;

  skills?: Array<{
    name: string;
    type?: string;
  }>;

  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: string;
  }>;
}
