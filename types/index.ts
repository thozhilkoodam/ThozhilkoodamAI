export interface Company {
  id: string
  companyId: string
  logo: string
  name: string
  contactPerson: string
  position: string
  employeeCount: number
  vacancyCount: number
  registrationNumber: string
  documentUrl: string
  phone: string
  email: string
  password: string
  category: BusinessCategory
  createdAt: Date
}

export type BusinessCategory =
  | 'recruitment-agencies'
  | 'hr-consultants'
  | 'msmes'
  | 'startups'
  | 'enterprises'
  | 'staffing-companies'

export interface BusinessCategoryInfo {
  id: BusinessCategory
  title: string
  description: string
  icon: string
}

export interface JobPost {
  id: string
  companyId: string
  title: string
  department: string
  employmentType: string
  experience: string
  salaryRange: string
  location: string
  vacancyCount: number
  noticePeriod: string
  description: string
  skills: string[]
  companyInfo: string
  candidatePreferences: string[]
  screeningQuestions: string[]
  status: 'draft' | 'published'
  createdAt: Date
}

export interface Candidate {
  id: string
  name: string
  designation: string
  currentCompany: string
  experience: string
  skills: string[]
  location: string
  lastActive: Date
  photo: string
  gender: string
  currentCtc: number
  expectedCtc: number
  noticePeriod: string
  jobTitle: string
}

export interface PipelineStage {
  id: string
  title: string
  candidates: Candidate[]
}

export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  jobTitle: string
  date: Date
  startTime: string
  endTime: string
  type: 'online' | 'offline'
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'hr-manager' | 'recruiter' | 'interviewer' | 'viewer'
  status: 'active' | 'invited'
  joinedAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  jobPosts: number
  candidateAccess: number
  teamMembers: number
  validityMonths: number
  price: number
}

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: Date
}
