'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HrSidebar } from '@/components/layout/hr-sidebar'
import { HrHeader } from '@/components/layout/hr-header'

export default function HrLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('thozhil_hr_user') || localStorage.getItem('thozhil_user')
    if (!stored) {
      router.push('/hr/login')
    } else {
      setChecking(false)
    }
  }, [router])

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <HrSidebar />
      </div>

      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebar(false)} />
          <div className="fixed left-0 top-0 h-full">
            <HrSidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <HrHeader onMenuToggle={() => setMobileSidebar(!mobileSidebar)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
