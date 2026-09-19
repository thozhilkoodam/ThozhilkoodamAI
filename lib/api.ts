const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('candidate_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

const handleResponse = async (r: Response) => {
  if (!r.ok) {
    const err = await r.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || `HTTP ${r.status}`)
  }
  return r.json()
}

export const api = {
  candidate: {
    login: (data: { email: string; password: string }) =>
      fetch(`${API_BASE}/candidate-auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),

    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      fetch(`${API_BASE}/candidate-auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),

    sendOtp: (data: { phone: string }) =>
      fetch(`${API_BASE}/candidate-auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),

    verifyOtp: (data: { phone: string; otp: string }) =>
      fetch(`${API_BASE}/candidate-auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),

    googleLogin: (data: { googleId: string; email: string; name: string; photo?: string }) =>
      fetch(`${API_BASE}/candidate-auth/google-login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),

    googleSetup: (data: { googleId: string; email: string; name: string; photo?: string; phone: string; otp: string }) =>
      fetch(`${API_BASE}/candidate-auth/google-setup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),

    checkProfile: () =>
      fetch(`${API_BASE}/candidate-auth/check-profile`, { headers: getAuthHeaders() }).then(handleResponse),
  },

  resume: {
    parse: (documentId: string) =>
      fetch(`${API_BASE}/resume-parser/parse`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ documentId }) }).then(handleResponse),
    getExtraction: (documentId: string) =>
      fetch(`${API_BASE}/resume-parser/${documentId}`, { headers: getAuthHeaders() }).then(handleResponse),
  },

  resumeAnalysis: {
    generate: (documentId: string) =>
      fetch(`${API_BASE}/resume-analysis/${documentId}`, { method: 'POST', headers: getAuthHeaders() }).then(handleResponse),
    get: (documentId: string) =>
      fetch(`${API_BASE}/resume-analysis/${documentId}`, { headers: getAuthHeaders() }).then(handleResponse),
  },

  jobMatching: {
    getRecommended: () =>
      fetch(`${API_BASE}/job-matching/recommended`, { headers: getAuthHeaders() }).then(handleResponse),
    getJobMatch: (jobId: string) =>
      fetch(`${API_BASE}/job-matching/${jobId}`, { headers: getAuthHeaders() }).then(handleResponse),
  },




  portal: {
    profile: {
      get: () => fetch(`${API_BASE}/candidate-portal/profile`, { headers: getAuthHeaders() }).then(handleResponse),
      update: (data: any) => fetch(`${API_BASE}/candidate-portal/profile`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    },
    education: {
      list: () => fetch(`${API_BASE}/candidate-portal/education`, { headers: getAuthHeaders() }).then(handleResponse),
      create: (data: any) => fetch(`${API_BASE}/candidate-portal/education`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
      update: (id: string, data: any) => fetch(`${API_BASE}/candidate-portal/education/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
      delete: (id: string) => fetch(`${API_BASE}/candidate-portal/education/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse),
    },
    experience: {
      list: () => fetch(`${API_BASE}/candidate-portal/experience`, { headers: getAuthHeaders() }).then(handleResponse),
      create: (data: any) => fetch(`${API_BASE}/candidate-portal/experience`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
      update: (id: string, data: any) => fetch(`${API_BASE}/candidate-portal/experience/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
      delete: (id: string) => fetch(`${API_BASE}/candidate-portal/experience/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse),
    },
    skills: {
      list: () => fetch(`${API_BASE}/candidate-portal/skills`, { headers: getAuthHeaders() }).then(handleResponse),
      add: (data: { name: string; type?: string }) => fetch(`${API_BASE}/candidate-portal/skills`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
      delete: (id: string) => fetch(`${API_BASE}/candidate-portal/skills/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse),
    },
    documents: {
      list: () => fetch(`${API_BASE}/candidate-portal/documents`, { headers: getAuthHeaders() }).then(handleResponse),
      create: (data: any) => fetch(`${API_BASE}/candidate-portal/documents`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
      delete: (id: string) => fetch(`${API_BASE}/candidate-portal/documents/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse),
    },
    certifications: {
      list: () => fetch(`${API_BASE}/candidate-portal/certifications`, { headers: getAuthHeaders() }).then(handleResponse),
      create: (data: any) => fetch(`${API_BASE}/candidate-portal/certifications`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
      delete: (id: string) => fetch(`${API_BASE}/candidate-portal/certifications/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse),
    },
    applications: {
      list: () => fetch(`${API_BASE}/candidate-portal/applications`, { headers: getAuthHeaders() }).then(handleResponse),
      create: (data: any) => fetch(`${API_BASE}/candidate-portal/applications`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    },
    savedJobs: {
      list: () => fetch(`${API_BASE}/candidate-portal/saved-jobs`, { headers: getAuthHeaders() }).then(handleResponse),
      save: (data: any) => fetch(`${API_BASE}/candidate-portal/saved-jobs`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
      unsave: (id: string) => fetch(`${API_BASE}/candidate-portal/saved-jobs/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse),
    },
    notifications: {
      list: () => fetch(`${API_BASE}/candidate-portal/notifications`, { headers: getAuthHeaders() }).then(handleResponse),
      markRead: (id: string) => fetch(`${API_BASE}/candidate-portal/notifications/${id}/read`, { method: 'PATCH', headers: getAuthHeaders() }).then(handleResponse),
      markAllRead: () => fetch(`${API_BASE}/candidate-portal/notifications/read-all`, { method: 'PATCH', headers: getAuthHeaders() }).then(handleResponse),
    },
    interviews: {
      list: () => fetch(`${API_BASE}/candidate-portal/interviews`, { headers: getAuthHeaders() }).then(handleResponse),
      updateStatus: (id: string, status: string) => fetch(`${API_BASE}/candidate-portal/interviews/${id}/status`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
    },
    dashboard: {
      stats: () => fetch(`${API_BASE}/candidate-portal/dashboard/stats`, { headers: getAuthHeaders() }).then(handleResponse),
    },
  },
  masterData: {
    getJobRoles: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return fetch(`${API_BASE}/master-data/job-roles${params}`, { headers: getAuthHeaders() }).then(handleResponse)
    },
    getIndustries: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return fetch(`${API_BASE}/master-data/industries${params}`, { headers: getAuthHeaders() }).then(handleResponse)
    },
    getLocations: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      return fetch(`${API_BASE}/master-data/locations${params}`, { headers: getAuthHeaders() }).then(handleResponse)
    },
  },
  skills: {
    getList: (category?: string, search?: string) => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      const qs = params.toString()
      return fetch(`${API_BASE}/skills${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() }).then(handleResponse)
    },
  },
  files: {
    resume: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const headers = getAuthHeaders()
      delete headers['Content-Type']
      const res = await fetch(`${API_BASE}/v1/files/resume`, {
        method: 'POST',
        headers,
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Upload failed')
      }
      return res.json()
    },
    certificate: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const headers = getAuthHeaders()
      delete headers['Content-Type']
      const res = await fetch(`${API_BASE}/v1/files/certificate`, {
        method: 'POST',
        headers,
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Upload failed')
      }
      return res.json()
    },
    profileImage: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const headers = getAuthHeaders()
      delete headers['Content-Type']
      const res = await fetch(`${API_BASE}/v1/files/profile-image`, {
        method: 'POST',
        headers,
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Upload failed')
      }
      return res.json()
    },
  },
  upload: {
    resume: async (file: File) => {
      return api.files.resume(file)
    },
    certificates: async (files: File[]) => {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const res = await fetch(`${API_BASE}/upload/certificate`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Upload failed') }
      return res.json()
    },
    portfolio: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/upload/portfolio`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Upload failed') }
      return res.json()
    },
    photo: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/upload/photo`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Upload failed') }
      return res.json()
    },
  },
}
