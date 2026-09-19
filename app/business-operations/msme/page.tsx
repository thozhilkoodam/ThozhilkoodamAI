'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MSMEPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/business-operations/msme/dashboard')
  }, [router])

  return null
}
