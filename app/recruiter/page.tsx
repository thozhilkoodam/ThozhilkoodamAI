'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RecruiterRootPage() {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('thozhil_user')
    if (user) {
      router.replace('/dashboard')
    } else {
      router.replace('/recruiter/login')
    }
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
