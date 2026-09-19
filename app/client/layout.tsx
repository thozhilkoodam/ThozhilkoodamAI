'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function ClientRedirectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const newPath = pathname.replace('/client', '/business-operations/msme')
    if (newPath !== pathname) {
      router.replace(newPath)
    }
  }, [pathname, router])

  return <>{children}</>
}
