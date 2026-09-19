'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, ArrowRight, Building2, Briefcase, Users, Clock, Sparkles, Mail, Phone, Globe } from 'lucide-react'

export default function RequirementSuccessPage() {
  const router = useRouter()
  const [requirement, setRequirement] = useState({
    companyName: 'Your Company',
    position: 'Position',
    vacancies: '0',
    status: 'Under Review',
    submittedAt: new Date().toISOString(),
  })

  useEffect(() => {
    const stored = localStorage.getItem('last_requirement')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setRequirement({
          companyName: data.companyName || 'Your Company',
          position: data.position || 'Position',
          vacancies: data.vacancies || '0',
          status: 'Under Review',
          submittedAt: new Date().toISOString(),
        })
      } catch { /* use defaults */ }
    }
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Requirement Submitted Successfully!</h1>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          We have received your recruitment requirement. Our team has started reviewing it and a quotation will be shared shortly.
        </p>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">{requirement.companyName}</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 text-sm px-3 py-1">
                {requirement.status}
              </Badge>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Briefcase className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="font-medium">{requirement.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Vacancies</p>
                  <p className="font-medium">{requirement.vacancies}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(requirement.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">What happens next?</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  Our recruitment team reviews your requirements
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  A detailed quotation with GST, service charges, and placement fees will be shared
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  Once approved, a dedicated recruiter is assigned to your requirement
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  We aim to respond within 24-48 business hours
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@thozhilkoodam.com</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 6374741641</div>
            <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.thozhilkoodam.com</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => router.push('/client/requirements')}>
          Post Another Requirement
        </Button>
        <Button onClick={() => router.push('/client/dashboard')} className="gap-2">
          Back to Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
