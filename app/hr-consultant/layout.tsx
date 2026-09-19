'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function HrConsultantRedirectLayout() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const newPath = pathname.replace('/hr-consultant', '/business-operations/hr-consultant')
    if (newPath !== pathname) {
      router.replace(newPath)
    }
  }, [pathname, router])

  return null
}
