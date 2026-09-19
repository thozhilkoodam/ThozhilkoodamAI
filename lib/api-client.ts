const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const isHrOrEmployer =
      window.location.pathname.startsWith('/hr') ||
      window.location.pathname.startsWith('/recruiter') ||
      window.location.pathname.startsWith('/employer')
    if (isHrOrEmployer) {
      return localStorage.getItem('access_token') || localStorage.getItem('candidate_token')
    }
    return localStorage.getItem('candidate_token') || localStorage.getItem('access_token')
  } catch {
    return null
  }
}

function getToken(): string | null {
  const token = getAccessToken()
  if (token) return token
  try {
    const isHrOrEmployer =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/hr') ||
        window.location.pathname.startsWith('/recruiter') ||
        window.location.pathname.startsWith('/employer'))
    if (isHrOrEmployer) {
      const stored = localStorage.getItem('thozhil_user') || localStorage.getItem('thozhil_hr_user')
      if (stored) {
        const u = JSON.parse(stored)
        return u.accessToken || u.token || null
      }
    }
    const candidateUser = localStorage.getItem('candidate_user')
    if (candidateUser) {
      const cu = JSON.parse(candidateUser)
      if (cu.accessToken || cu.token) return cu.accessToken || cu.token
    }
    const stored = localStorage.getItem('thozhil_user')
    if (stored) {
      const u = JSON.parse(stored)
      return u.accessToken || null
    }
  } catch {}
  return null
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const token = getToken()
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
  },
      ...options,
    })
    if (!res.ok) {
      if (res.status === 401) {
        console.warn(`[API] Unauthorized: ${endpoint} — returning null`)
        return null
      }
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || `API Error: ${res.statusText}`)
    }
    return res.json()
  } catch (e) {
    if (e instanceof TypeError && (e as any).cause?.code === 'ECONNREFUSED') {
      console.warn(`[API] Backend unavailable: ${endpoint}`)
      return null
    }
    throw e
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: any) =>
      request<{ companyId: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    companyLogin: (email: string, password: string) =>
      request<{ accessToken: string; user: any }>('/auth/company-login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },
  companies: {
    getAll: (status?: string) =>
      request<any[]>(`/companies${status ? `?status=${status}` : ''}`),
    getOne: (id: string) => request<any>(`/companies/${id}`),
    getStats: () => request<any>('/companies/stats'),
    updateStatus: (id: string, data: { status: string; rejectionReason?: string }) =>
      request<any>(`/companies/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  users: {
    getAll: () => request<any[]>('/users'),
    create: (data: any) =>
      request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  notifications: {
    getAll: () => request<any[]>('/notifications'),
    create: (data: any) =>
      request<any>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
    markRead: (id: string) =>
      request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request<any>('/notifications/mark-all-read', { method: 'POST' }),
  },
  auditLogs: {
    getAll: () => request<any[]>('/audit-logs'),
  },
  jobs: {
    getAll: (status?: string) => request<any[]>(`/jobs${status ? `?status=${status}` : ''}`),
    getPublished: (query?: Record<string, string | undefined>) => {
      const cleaned = Object.fromEntries(
        Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== '')
      )
      const params = Object.keys(cleaned).length ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}` : ''
      return request<any>(`/jobs/published${params}`)
    },
    getOne: (id: string) => request<any>(`/jobs/${id}`),
    create: (data: any) =>
      request<any>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    approve: (id: string) =>
      request<any>(`/jobs/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason?: string) =>
      request<any>(`/jobs/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    requestChanges: (id: string, changes: string) =>
      request<any>(`/jobs/${id}/request-changes`, { method: 'PUT', body: JSON.stringify({ changes }) }),
    submit: (id: string) =>
      request<any>(`/jobs/${id}/submit`, { method: 'PUT' }),
    publish: (id: string) =>
      request<any>(`/jobs/${id}/publish`, { method: 'PUT' }),
    close: (id: string) =>
      request<any>(`/jobs/${id}/close`, { method: 'PUT' }),
    feature: (id: string) =>
      request<any>(`/jobs/${id}/feature`, { method: 'PUT' }),
    unfeature: (id: string) =>
      request<any>(`/jobs/${id}/unfeature`, { method: 'PUT' }),
    archive: (id: string) =>
      request<any>(`/jobs/${id}/archive`, { method: 'PUT' }),
    suspend: (id: string) =>
      request<any>(`/jobs/${id}/suspend`, { method: 'PUT' }),
    delete: (id: string) =>
      request<any>(`/jobs/${id}`, { method: 'DELETE' }),
    getByStatus: (status: string, query?: Record<string, string | undefined>) => {
      const cleaned = Object.fromEntries(
        Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== '')
      )
      const params = Object.keys(cleaned).length ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}` : ''
      return request<any>(`/jobs/by-status/${status}${params}`)
    },
    getAdminStats: () => request<any>('/jobs/admin-stats'),
    getStats: () => request<any>('/jobs/stats'),
    bulkApprove: (ids: string[]) =>
      request<any>('/jobs/bulk-approve', { method: 'POST', body: JSON.stringify({ ids }) }),
    bulkReject: (ids: string[], reason?: string) =>
      request<any>('/jobs/bulk-reject', { method: 'POST', body: JSON.stringify({ ids, reason }) }),
    bulkArchive: (ids: string[]) =>
      request<any>('/jobs/bulk-archive', { method: 'POST', body: JSON.stringify({ ids }) }),
    bulkDelete: (ids: string[]) =>
      request<any>('/jobs/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
  },
  candidates: {
    getAll: (filters?: any) => {
      const params = filters ? `?${new URLSearchParams(filters).toString()}` : ''
      return request<any[]>(`/candidates${params}`)
    },
  },
  employerApplications: {
    getAll: (filters?: { status?: string; jobId?: string; search?: string; page?: number; limit?: number }) => {
      const cleaned = Object.fromEntries(
        Object.entries(filters || {}).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
      )
      const params = Object.keys(cleaned).length ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}` : ''
      return request<{ applications: any[]; total: number; page: number; limit: number }>(`/employer/applications${params}`)
    },
    getOne: (id: string) => request<any>(`/employer/applications/${id}`),
    updateStatus: (id: string, status: string, notes?: string) =>
      request<any>(`/employer/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }),
  },
  screening: {
    getScreening: (applicationId: string) =>
      request<{ success: boolean; exists: boolean; screening: any }>(
        `/employer/applications/${applicationId}/ai-screen`
      ),
    triggerScreening: (applicationId: string, forceRescreen = false) =>
      request<{ success: boolean; cached: boolean; screening: any }>(
        `/employer/applications/${applicationId}/ai-screen${forceRescreen ? '?reScreen=true' : ''}`,
        { method: 'POST' }
      ),
  },
  pipeline: {
    get: () => request<any[]>('/pipeline'),
    update: (stageId: string, candidates: any[]) =>
      request<any>(`/pipeline/${stageId}`, {
        method: 'PUT',
        body: JSON.stringify({ candidates }),
      }),
  },
  employerInterviews: {
    getAll: (filters?: { status?: string; jobId?: string }) => {
      const cleaned = Object.fromEntries(
        Object.entries(filters || {}).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
      )
      const params = Object.keys(cleaned).length ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}` : ''
      return request<any[]>(`/employer/interviews${params}`)
    },
    getOne: (id: string) => request<any>(`/employer/interviews/${id}`),
    scheduleForApplication: (applicationId: string, data: any) =>
      request<any>(`/employer/applications/${applicationId}/interviews`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/employer/interviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    cancel: (id: string, reason?: string) =>
      request<any>(`/employer/interviews/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      }),
    getResponses: (interviewId: string) =>
      request<{ interviewId: string; overallNotes?: string; responses: any[] }>(
        `/employer/interviews/${interviewId}/responses`
      ),
    saveResponses: (interviewId: string, data: { responses: any[]; overallNotes?: string }) =>
      request<any>(`/employer/interviews/${interviewId}/responses`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getEvaluation: (interviewId: string) =>
      request<{ cached: boolean; evaluation: any }>(
        `/employer/interviews/${interviewId}/evaluation`
      ),
    triggerEvaluation: (interviewId: string, reEvaluate = false) =>
      request<{ cached: boolean; evaluation: any }>(
        `/employer/interviews/${interviewId}/evaluation${reEvaluate ? '?reEvaluate=true' : ''}`,
        { method: 'POST' }
      ),
  },
  candidateInterviews: {
    getAll: () => request<any[]>('/candidate/interviews'),
    getOne: (id: string) => request<any>(`/candidate/interviews/${id}`),
    getPreparation: (interviewId: string) =>
      request<{ cached: boolean; preparation: any }>(`/candidate/interviews/${interviewId}/ai-preparation`),
    generatePreparation: (interviewId: string, force = false) =>
      request<{ cached: boolean; preparation: any }>(
        `/candidate/interviews/${interviewId}/ai-preparation${force ? '?force=true' : ''}`,
        { method: 'POST' }
      ),
  },
  employerOffers: {
    getOffer: (applicationId: string) =>
      request<{ offer: any }>(`/employer/applications/${applicationId}/offer`),
    saveOffer: (applicationId: string, data: any) =>
      request<{ success: boolean; offer: any }>(`/employer/applications/${applicationId}/offer`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    generateAiDraft: (applicationId: string, data: any) =>
      request<{ success: boolean; aiDraft: any }>(`/employer/applications/${applicationId}/offer/ai-draft`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    sendOffer: (applicationId: string) =>
      request<{ success: boolean; offer: any }>(`/employer/applications/${applicationId}/offer/send`, {
        method: 'POST',
      }),
    withdrawOffer: (applicationId: string) =>
      request<{ success: boolean; offer: any }>(`/employer/applications/${applicationId}/offer/withdraw`, {
        method: 'POST',
      }),
  },
  candidateOffers: {
    getOffer: (applicationId: string) =>
      request<{ offer: any }>(`/candidate/applications/${applicationId}/offer`),
    respond: (applicationId: string, data: { action: 'accept' | 'decline'; reason?: string }) =>
      request<{ success: boolean; action: string; offer: any }>(
        `/candidate/applications/${applicationId}/offer/respond`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
  },
  interviews: {
    getAll: () => request<any[]>('/interviews'),
    create: (data: any) =>
      request<any>('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  },
  billing: {
    getMySubscription: () => request<any>('/billing/my-subscription'),
    getMyPayments: () => request<any[]>('/billing/my-payments'),
    createOrder: (planId: string) =>
      request<any>('/billing/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      }),
    verifyPayment: (data: any) =>
      request<any>('/billing/verify', { method: 'POST', body: JSON.stringify(data) }),
  },
  team: {
    getMembers: () => request<any[]>('/team'),
    invite: (data: any) =>
      request<any>('/team/invite', { method: 'POST', body: JSON.stringify(data) }),
  },
  hrConsultants: {
    getAll: (filters?: any) => {
      const cleaned = Object.fromEntries(
        Object.entries(filters || {}).filter(([, value]) => value !== undefined && value !== '' && value !== 'all')
      )
      const params = Object.keys(cleaned).length ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}` : ''
      return request<any[]>(`/hr-consultants${params}`)
    },
    create: (data: any) =>
      request<any>('/hr-consultants', { method: 'POST', body: JSON.stringify(data) }),
    getActivation: (token: string) =>
      request<any>(`/hr-consultants/activation/${token}`),
    activate: (data: any) =>
      request<any>('/hr-consultants/activate', { method: 'POST', body: JSON.stringify(data) }),
    signup: (data: any) =>
      request<any>('/hr-consultants/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (email: string, password: string) =>
      request<{ accessToken: string; consultant: any }>('/hr-consultants/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    googleLogin: (data: { googleId: string; email: string; name: string; photo?: string }) =>
      request<{ accessToken: string; consultant: any }>('/hr-consultants/google-login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    sendOtp: (phone: string) =>
      request<any>('/hr-consultants/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
    verifyOtp: (phone: string, otp: string) =>
      request<{ accessToken: string; consultant: any }>('/hr-consultants/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      }),
  },
  portal: {
    profile: {
      get: () => request<any>('/candidate-portal/profile'),
      upsert: (data: any) =>
        request<any>('/candidate-portal/profile', { method: 'PUT', body: JSON.stringify(data) }),
    },
    education: {
      list: () => request<any[]>('/candidate-portal/education'),
      create: (data: any) =>
        request<any>('/candidate-portal/education', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) =>
        request<any>(`/candidate-portal/education/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<any>(`/candidate-portal/education/${id}`, { method: 'DELETE' }),
    },
    experience: {
      list: () => request<any[]>('/candidate-portal/experience'),
      create: (data: any) =>
        request<any>('/candidate-portal/experience', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) =>
        request<any>(`/candidate-portal/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<any>(`/candidate-portal/experience/${id}`, { method: 'DELETE' }),
    },
    skills: {
      list: () => request<any[]>('/candidate-portal/skills'),
      add: (data: { name: string; type?: string }) =>
        request<any>('/candidate-portal/skills', { method: 'POST', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<any>(`/candidate-portal/skills/${id}`, { method: 'DELETE' }),
    },
    documents: {
      list: () => request<any[]>('/candidate-portal/documents'),
      create: (data: any) =>
        request<any>('/candidate-portal/documents', { method: 'POST', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<any>(`/candidate-portal/documents/${id}`, { method: 'DELETE' }),
    },
    certifications: {
      list: () => request<any[]>('/candidate-portal/certifications'),
      create: (data: any) =>
        request<any>('/candidate-portal/certifications', { method: 'POST', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<any>(`/candidate-portal/certifications/${id}`, { method: 'DELETE' }),
    },
    applications: {
      list: () => request<any[]>('/candidate-portal/applications'),
      create: (data: { jobId: string; company: string; position: string; agency?: string; consultant?: string; resumeUrl?: string; coverNote?: string }) =>
        request<any>('/candidate-portal/applications', { method: 'POST', body: JSON.stringify(data) }),
    },
    savedJobs: {
      list: () => request<any[]>('/candidate-portal/saved-jobs'),
      save: (data: { jobId: string; company: string; position: string; salary?: string; location?: string; jobType?: string }) =>
        request<any>('/candidate-portal/saved-jobs', { method: 'POST', body: JSON.stringify(data) }),
      remove: (id: string) =>
        request<any>(`/candidate-portal/saved-jobs/${id}`, { method: 'DELETE' }),
    },
    interviews: {
      list: () => request<any[]>('/candidate-portal/interviews'),
      updateStatus: (id: string, status: string) =>
        request<any>(`/candidate-portal/interviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    },
    notifications: {
      list: () => request<any[]>('/candidate-portal/notifications'),
      markRead: (id: string) =>
        request<any>(`/candidate-portal/notifications/${id}/read`, { method: 'PATCH' }),
      markAllRead: () =>
        request<any>('/candidate-portal/notifications/read-all', { method: 'PATCH' }),
    },
    dashboard: {
      stats: () => request<any>('/candidate-portal/dashboard/stats'),
    },
  },
  hrRecruiters: {
    getAll: (query?: Record<string, string | undefined>) => {
      const cleaned = Object.fromEntries(
        Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
      )
      const params = Object.keys(cleaned).length ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}` : ''
      return request<any>(`/hr-recruiters${params}`)
    },
    getOne: (id: string) => request<any>(`/hr-recruiters/${id}`),
    create: (data: any) =>
      request<any>('/hr-recruiters', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/hr-recruiters/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>(`/hr-recruiters/${id}`, { method: 'DELETE' }),
    approve: (id: string) =>
      request<any>(`/hr-recruiters/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) =>
      request<any>(`/hr-recruiters/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    suspend: (id: string, reason: string) =>
      request<any>(`/hr-recruiters/${id}/suspend`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    reactivate: (id: string) =>
      request<any>(`/hr-recruiters/${id}/reactivate`, { method: 'PUT' }),
    resetPassword: (id: string) =>
      request<any>(`/hr-recruiters/${id}/reset-password`, { method: 'POST' }),
    assignAgency: (id: string, agencyId: string) =>
      request<any>(`/hr-recruiters/${id}/assign-agency`, { method: 'PUT', body: JSON.stringify({ agencyId }) }),
    getPerformance: () => request<any>('/hr-recruiters/performance'),
  },
  emailTemplates: {
    getAll: (query?: Record<string, string | undefined>) => {
      const cleaned = Object.fromEntries(
        Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
      )
      const params = Object.keys(cleaned).length ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}` : ''
      return request<any>(`/email-templates${params}`)
    },
    getOne: (id: string) => request<any>(`/email-templates/${id}`),
    preview: (id: string) => request<any>(`/email-templates/${id}/preview`),
    create: (data: any) =>
      request<any>('/email-templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/email-templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>(`/email-templates/${id}`, { method: 'DELETE' }),
    duplicate: (id: string) =>
      request<any>(`/email-templates/${id}/duplicate`, { method: 'POST' }),
    toggleStatus: (id: string) =>
      request<any>(`/email-templates/${id}/toggle-status`, { method: 'POST' }),
    sendTest: (id: string, email: string) =>
      request<any>(`/email-templates/${id}/send-test`, { method: 'POST', body: JSON.stringify({ email }) }),
  },
  smsTemplates: {
    getAll: (query?: Record<string, string | undefined>) => {
      const cleaned = Object.fromEntries(
        Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
      )
      const params = Object.keys(cleaned).length ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}` : ''
      return request<any>(`/sms-templates${params}`)
    },
    getOne: (id: string) => request<any>(`/sms-templates/${id}`),
    preview: (id: string) => request<any>(`/sms-templates/${id}/preview`),
    create: (data: any) =>
      request<any>('/sms-templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/sms-templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>(`/sms-templates/${id}`, { method: 'DELETE' }),
    duplicate: (id: string) =>
      request<any>(`/sms-templates/${id}/duplicate`, { method: 'POST' }),
    toggleStatus: (id: string) =>
      request<any>(`/sms-templates/${id}/toggle-status`, { method: 'POST' }),
    sendTest: (id: string, phone: string) =>
      request<any>(`/sms-templates/${id}/send-test`, { method: 'POST', body: JSON.stringify({ phone }) }),
  },
  locations: {
    getCountries: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return request<any[]>(`/locations/countries${params}`)
    },
    getStates: (countryId: number, search?: string) => {
      const params = new URLSearchParams({ countryId: String(countryId) })
      if (search) params.set('search', search)
      return request<any[]>(`/locations/states?${params.toString()}`)
    },
    getDistricts: (stateId: number, search?: string) => {
      const params = new URLSearchParams({ stateId: String(stateId) })
      if (search) params.set('search', search)
      return request<any[]>(`/locations/districts?${params.toString()}`)
    },
    getCities: (districtId: number, search?: string) => {
      const params = new URLSearchParams({ districtId: String(districtId) })
      if (search) params.set('search', search)
      return request<any[]>(`/locations/cities?${params.toString()}`)
    },
  },
  institutions: {
    getColleges: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return request<any[]>(`/institutions/colleges${params}`)
    },
    getUniversities: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return request<any[]>(`/institutions/universities${params}`)
    },
    createCollege: (name: string) =>
      request<any>('/institutions/colleges', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    createUniversity: (name: string) =>
      request<any>('/institutions/universities', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    getAdminColleges: (status?: string) => {
      const params = status ? `?status=${status}` : ''
      return request<any[]>(`/institutions/admin/colleges${params}`)
    },
    getAdminUniversities: (status?: string) => {
      const params = status ? `?status=${status}` : ''
      return request<any[]>(`/institutions/admin/universities${params}`)
    },
    updateCollegeStatus: (id: number, status: string) =>
      request<any>(`/institutions/admin/colleges/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    updateUniversityStatus: (id: number, status: string) =>
      request<any>(`/institutions/admin/universities/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  masterData: {
    getJobRoles: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return request<any[]>(`/master-data/job-roles${params}`)
    },
    createJobRole: (name: string) =>
      request<any>('/master-data/job-roles', { method: 'POST', body: JSON.stringify({ name }) }),
    updateJobRole: (id: number, name: string) =>
      request<any>(`/master-data/job-roles/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
    deleteJobRole: (id: number) =>
      request<any>(`/master-data/job-roles/${id}`, { method: 'DELETE' }),
    getIndustries: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return request<any[]>(`/master-data/industries${params}`)
    },
    createIndustry: (name: string) =>
      request<any>('/master-data/industries', { method: 'POST', body: JSON.stringify({ name }) }),
    updateIndustry: (id: number, name: string) =>
      request<any>(`/master-data/industries/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
    deleteIndustry: (id: number) =>
      request<any>(`/master-data/industries/${id}`, { method: 'DELETE' }),
    getLocations: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return request<any[]>(`/master-data/locations${params}`)
    },
    createLocation: (name: string) =>
      request<any>('/master-data/locations', { method: 'POST', body: JSON.stringify({ name }) }),
    updateLocation: (id: number, name: string) =>
      request<any>(`/master-data/locations/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
    deleteLocation: (id: number) =>
      request<any>(`/master-data/locations/${id}`, { method: 'DELETE' }),
  },
  skills: {
    getList: (category?: string, search?: string) => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      const qs = params.toString()
      return request<any[]>(`/skills${qs ? `?${qs}` : ''}`)
    },
    getCategories: () => request<string[]>('/skills/categories'),
    create: (name: string, category: string) =>
      request<any>('/skills', { method: 'POST', body: JSON.stringify({ name, category }) }),
    update: (id: number, name: string) =>
      request<any>(`/skills/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
    delete: (id: number) => request<any>(`/skills/${id}`, { method: 'DELETE' }),
  },
  upload: {
    resume: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/upload/resume`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Resume upload failed') }
      return res.json()
    },
    certificates: async (files: File[]) => {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const res = await fetch(`${API_BASE}/upload/certificate`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Certificate upload failed') }
      return res.json()
    },
    portfolio: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/upload/portfolio`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Portfolio upload failed') }
      return res.json()
    },
    photo: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/upload/photo`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Photo upload failed') }
      return res.json()
    },
    logo: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/upload/logo`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Logo upload failed') }
      return res.json()
    },
    document: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/upload/document`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Document upload failed') }
      return res.json()
    },
  },
  resume: {
    parse: (fileUrl: string) =>
      request<any>('/resume-parser/parse', { method: 'POST', body: JSON.stringify({ fileUrl }) }),
  },
  employerOnboarding: {
    list: (params?: { status?: string; search?: string }) => {
      const qs = new URLSearchParams()
      if (params?.status) qs.set('status', params.status)
      if (params?.search) qs.set('search', params.search)
      const q = qs.toString()
      return request<any[]>(`/employer/onboarding${q ? `?${q}` : ''}`)
    },
    get: (id: string) => request<any>(`/employer/onboarding/${id}`),
    update: (id: string, data: any) =>
      request<any>(`/employer/onboarding/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    confirmJoining: (id: string, data?: { actualJoiningDate?: string; notes?: string }) =>
      request<any>(`/employer/onboarding/${id}/confirm-joining`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    cancel: (id: string, reason: string) =>
      request<any>(`/employer/onboarding/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    getDocumentDownloadUrl: (id: string, docId: string) =>
      request<{ signedUrl: string }>(`/employer/onboarding/${id}/documents/${docId}/download`),
  },
  candidateOnboarding: {
    list: () => request<any[]>('/candidate/onboarding'),
    get: (id: string) => request<any>(`/candidate/onboarding/${id}`),
    updateChecklist: (id: string, items: any[]) =>
      request<any>(`/candidate/onboarding/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      }),
    uploadDocument: async (id: string, checklistItemId: string, file: File) => {
      const token = getToken()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('checklistItemId', checklistItemId)
      const res = await fetch(`${API_BASE}/candidate/onboarding/${id}/documents`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Failed to upload document')
      }
      return res.json()
    },
    getDocumentDownloadUrl: (id: string, docId: string) =>
      request<{ signedUrl: string }>(`/candidate/onboarding/${id}/documents/${docId}/download`),
  },
}
