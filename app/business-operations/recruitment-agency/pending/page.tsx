'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Copy, ArrowLeft, Building2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

interface PendingData {
  companyId: string
  agencyName: string
  email: string
}

export default function PendingApproval() {
  const [data, setData] = useState<PendingData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('thozhil_registration_pending')
    if (stored) setData(JSON.parse(stored))
  }, [])

  const copyId = () => {
    if (data?.companyId) {
      navigator.clipboard.writeText(data.companyId)
      toast.success('Company ID copied!')
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-20">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="mt-6 text-2xl font-bold">Registration Submitted</h1>
              <p className="mt-2 text-muted-foreground">
                Your agency registration is under review. We will notify you once your account is approved.
              </p>

              <div className="mt-8 rounded-lg bg-muted p-6">
                <p className="text-sm text-muted-foreground">Your Company ID</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {data?.companyId || 'KIKTK---'}
                  </span>
                  <button onClick={copyId} className="text-muted-foreground hover:text-primary">
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Confirmation sent to {data?.email || 'your email'}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/">
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
