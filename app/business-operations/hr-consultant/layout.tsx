'use client'

import { usePathname } from 'next/navigation'
import { HrConsultantSidebar } from '@/components/layout/hr-consultant-sidebar'
import { HrConsultantHeader } from '@/components/layout/hr-consultant-header'

const authRoutes = [
  '/business-operations/hr-consultant/login',
  '/business-operations/hr-consultant/signup',
  '/hr-consultant/login',
  '/hr-consultant/signup',
]

export default function HrConsultantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = authRoutes.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background">
      <HrConsultantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <HrConsultantHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
