'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { ContactSalesFloat } from '@/components/layout/contact-sales-float'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/recruiter')
    }
    if (!isLoading && user && user.role === 'recruitment_agency' && user.status === 'pending') {
      router.push('/business-operations/recruitment-agency/pending')
    }
    if (!isLoading && user && user.role === 'recruitment_agency' && user.status === 'rejected') {
      router.push('/login')
    }
    if (!isLoading && user && user.role === 'recruitment_agency' && user.status === 'suspended') {
      router.push('/login')
    }
  }, [user, isLoading, router])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebar(false)} />
          <div className="fixed left-0 top-0 h-full">
            <DashboardSidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onMenuToggle={() => setMobileSidebar(!mobileSidebar)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <ContactSalesFloat />
    </div>
  )
}
