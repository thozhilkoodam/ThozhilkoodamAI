'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AdminHeader } from '@/components/layout/admin-header'
import { useAuth } from '@/hooks/use-auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!user) {
        router.push('/admin/login')
      } else if (user.role === 'recruitment_agency') {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, router, isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user.role === 'recruitment_agency') {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebar(false)} />
          <div className="fixed left-0 top-0 h-full">
            <AdminSidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuToggle={() => setMobileSidebar(!mobileSidebar)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
