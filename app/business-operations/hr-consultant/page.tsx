'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HrConsultantLandingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/business-operations/hr-consultant/login')
  }, [router])

  return null
}
