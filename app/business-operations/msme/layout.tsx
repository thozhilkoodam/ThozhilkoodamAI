'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MSMESidebar } from '@/components/layout/msme-sidebar'
import { MSMEHeader } from '@/components/layout/msme-header'

const authRoutes = ['/login', '/signup']

export default function MSMELayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [checking, setChecking] = useState(true)

  const isAuthPage = authRoutes.some((r) => pathname.endsWith(r))

  useEffect(() => {
    if (isAuthPage) {
      setChecking(false)
      return
    }
    const stored = localStorage.getItem('thozhil_client_user')
    if (!stored) {
      router.push('/business-operations/msme/login')
    } else {
      setChecking(false)
    }
  }, [router, isAuthPage])

  if (isAuthPage) {
    return <>{children}</>
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <MSMESidebar />
      </div>

      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebar(false)} />
          <div className="fixed left-0 top-0 h-full">
            <MSMESidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <MSMEHeader onMenuToggle={() => setMobileSidebar(!mobileSidebar)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
