import { api } from './api-client'

export interface DBUser {
  id: string
  name: string
  email: string
  password?: string
  role: 'super_admin' | 'admin' | 'support' | 'recruitment_agency'
  status: string
  createdAt: string
  lastLogin?: string
}

export interface DBCompany {
  id: string
  companyId?: string
  agencyName: string
  contactPerson: string
  position?: string
  employeeCount?: string
  vacancyCount?: string
  registrationNumber?: string
  phone?: string
  email: string
  password?: string
  category?: string
  status?: 'pending' | 'approved' | 'rejected' | 'suspended'
  logo?: string
  documentUrl?: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
  createdAt?: string
}

export interface DBNotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface DBAuditLog {
  id: string
  user: string
  action: string
  details: string
  ip: string
  createdAt: string
}

type Status =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'

export const db = {
  users: {
    getAll: async () => {
      const res = await api.users.getAll()
      return res ?? []
    },

    getByEmail: async (email: string) => {
      const users = await db.users.getAll()
      return users.find((u: any) => u.email === email)
    },

    create: (data: Omit<DBUser, 'id'>) =>
      api.users.create(data),

    async updateLastLogin(_: string) {
      return
    },
  },

  companies: {
    getAll: async (status?: Status) => {
      const res = await api.companies.getAll(status)
      return res ?? []
    },

    async getByEmail(email: string) {
      const companies = await db.companies.getAll()
      return companies.find((c: any) => c.email === email)
    },

    getById: (id: string) =>
      api.companies.getOne(id),

    getByStatus: async (status: Status) => {
      const res = await api.companies.getAll(status)
      return res ?? []
    },

    create: (data: Omit<DBCompany, 'id'>) =>
      api.auth.register(data),

    updateStatus: (
      id: string,
      status: Status,
      options?: {
        rejectionReason?: string
      }
    ) =>
      api.companies.updateStatus(id, {
        status,
        rejectionReason:
          options?.rejectionReason,
      }),

    async update(
      id: string,
      updates: Partial<DBCompany>
    ) {
      return api.companies.updateStatus(
        id,
        updates as any
      )
    },

    async getNextCompanyId() {
      return ''
    },
  },

  notifications: {
    getAll: async () => {
      const res = await api.notifications.getAll()
      return res ?? []
    },

    create: (data: Omit<DBNotification, 'id'>) =>
      api.notifications.create(data),

    async seed() {
      return
    },
  },

  auditLogs: {
    getAll: async () => {
      const res = await api.auditLogs.getAll()
      return res ?? []
    },

    create: async (
      _: Omit<DBAuditLog, 'id'>
    ) => {
      return
    },

    async seed() {
      return
    },
  },
}
