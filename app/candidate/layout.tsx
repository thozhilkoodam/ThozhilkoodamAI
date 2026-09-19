'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CandidateSidebar } from '@/components/layout/candidate-sidebar'
import { CandidateHeader } from '@/components/layout/candidate-header'

const authPages = ['/candidate/login', '/candidate/register', '/candidate/register/success']

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const isAuthPage = authPages.includes(pathname)

  useEffect(() => {
    const token = localStorage.getItem('candidate_token')

    if (!isAuthPage && !token) {
      router.replace('/candidate/login')
      return
    }

    if (!isAuthPage && token) {
      // Profile completion check removed — dashboard displays actual data from API
    }

    setChecking(false)
  }, [pathname, router, isAuthPage])

  if (checking) return null

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex">
        <CandidateSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <CandidateSidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <CandidateHeader onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
