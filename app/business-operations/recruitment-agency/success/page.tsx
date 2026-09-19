'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Copy, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface CompanyData {
  companyId: string
  agencyName: string
  contactPerson: string
  email: string
}

export default function RegistrationSuccess() {
  const [company, setCompany] = useState<CompanyData | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('thozhil_registration_success')
    if (data) setCompany(JSON.parse(data))
  }, [])

  const copyId = () => {
    if (company?.companyId) {
      navigator.clipboard.writeText(company.companyId)
      toast.success('Company ID copied to clipboard!')
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-20">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="mt-6 text-2xl font-bold">Registration Successful!</h1>
              <p className="mt-2 text-muted-foreground">
                Your recruitment agency account has been created.
              </p>

              <div className="mt-8 rounded-lg bg-muted p-6">
                <p className="text-sm text-muted-foreground">Your Company ID</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {company?.companyId || 'KIKTK000001'}
                  </span>
                  <button onClick={copyId} className="text-muted-foreground hover:text-primary">
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Save this ID for future reference. It cannot be modified.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
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
