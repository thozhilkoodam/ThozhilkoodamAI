import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.statusText}`)
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: any) =>
      fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchAPI('/auth/logout'),
  },
  jobs: {
    create: (data: any) =>
      fetchAPI('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => fetchAPI('/jobs'),
    getById: (id: string) => fetchAPI(`/jobs/${id}`),
    update: (id: string, data: any) =>
      fetchAPI(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  candidates: {
    getAll: (filters?: any) =>
      fetchAPI(`/candidates?${new URLSearchParams(filters).toString()}`),
    getById: (id: string) => fetchAPI(`/candidates/${id}`),
  },
  pipeline: {
    get: () => fetchAPI('/pipeline'),
    update: (stageId: string, candidates: any[]) =>
      fetchAPI(`/pipeline/${stageId}`, { method: 'PUT', body: JSON.stringify({ candidates }) }),
  },
  interviews: {
    getAll: () => fetchAPI('/interviews'),
    create: (data: any) =>
      fetchAPI('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  },
  billing: {
    createOrder: (planId: string) =>
      fetchAPI('/billing/create-order', { method: 'POST', body: JSON.stringify({ planId }) }),
    verifyPayment: (data: any) =>
      fetchAPI('/billing/verify', { method: 'POST', body: JSON.stringify(data) }),
  },
  team: {
    invite: (data: any) =>
      fetchAPI('/team/invite', { method: 'POST', body: JSON.stringify(data) }),
    getMembers: () => fetchAPI('/team'),
  },
}
