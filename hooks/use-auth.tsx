'use client'

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react'

import { api } from '@/lib/api-client'
import { db } from '@/lib/db'

export interface AuthUser {
  id: string
  companyId: string
  name: string
  email: string
  role:
    | 'super_admin'
    | 'admin'
    | 'support'
    | 'recruitment_agency'
  logo: string
  status?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (
    email: string,
    password: string
  ) => Promise<AuthUser>
  register: (data: any) => Promise<any>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  useEffect(() => {
    const stored =
      localStorage.getItem('thozhil_user')

    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('thozhil_user')
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (
    email: string,
    password: string
  ): Promise<AuthUser> => {
    try {
      const admin = await api.auth.login(email, password)
      if (!admin) throw new Error('Invalid credentials')

      localStorage.setItem('access_token', admin.accessToken)
      localStorage.setItem('thozhil_user', JSON.stringify(admin.user))
      setUser(admin.user)
      return admin.user
    } catch (e: any) {
      if (e.message !== 'Invalid credentials') console.debug('[Auth] Admin login failed, trying agency...')
    }

    try {
      const company = await api.auth.companyLogin(email, password)
      if (!company) throw new Error('Invalid credentials')

      localStorage.setItem('access_token', company.accessToken)
      localStorage.setItem('thozhil_user', JSON.stringify(company.user))
      setUser(company.user)
      return company.user
    } catch {
      throw new Error('Invalid credentials')
    }
  }

  const register = async (data: any) => {
    return await db.companies.create({
      ...data,
      category: 'recruitment-agencies',
    })
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('thozhil_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return context
}
