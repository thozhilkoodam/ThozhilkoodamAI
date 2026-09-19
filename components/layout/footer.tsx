'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'

export function Footer() {
  const [year] = useState(() => new Date().getFullYear())

  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo size="small" />
          </div>
          <div>
            <h3 className="font-semibold">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/job-portal" className="text-sm text-muted-foreground hover:text-primary">Job Portal</Link></li>
              <li><Link href="/business-operations" className="text-sm text-muted-foreground hover:text-primary">Business Operations</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>support@thozhilkoodam.com</li>
              <li>+91 6374741641</li>
              <li>Chennai, Tamil Nadu, India</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {year} Thozhil Koodam. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
