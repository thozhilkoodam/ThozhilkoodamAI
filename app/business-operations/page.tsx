'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, Briefcase, ArrowRight, CheckCircle } from 'lucide-react'

const categories = [
  {
    id: 'recruitment-agencies',
    title: 'Recruitment Agencies / Staffing Company',
    description: 'Complete Hiring platform for recruitment agencies. Post jobs, Search candidates, and track placements efficiently.',
    icon: Building2,
    benefits: ['Unlimited job posting', 'Candidate database access', 'Team collaboration'],
    href: '/recruiter',
    status: 'completed',
  },
  {
    id: 'hr-consultants',
    title: 'HR Recruiters',
    description: 'Streamline client management and recruitment processes with our integrated platform. Manage candidates, interviews, and hiring activities under your recruitment agency.',
    icon: Users,
    benefits: ['Client management', 'Multi-company support', 'Reports & analytics', 'Billing management'],
    href: '/business-operations/hr-consultant/login',
    status: 'completed',
  },
  {
    id: 'msmes',
    title: 'MSMEs / Startups',
    description: 'Affordable hiring solutions designed for small, medium enterprises and startups.',
    icon: Briefcase,
    benefits: ['Cost-effective plans', 'Easy to use', 'Quick setup', 'Local support'],
    href: '/business-operations/msme/login',
    status: 'completed',
  },
]

export default function BusinessOperations() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold">Business Opportunities</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Choose your business category to get started with our tailored recruitment solutions.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {categories.map((category) => {
              const isDisabled = category.status === 'coming-soon'
              const content = (
                <Card className={`group h-full transition-all ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:shadow-lg'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${isDisabled ? 'bg-muted' : 'bg-primary/10 group-hover:bg-primary/20'} transition-colors`}>
                        <category.icon className={`h-7 w-7 ${isDisabled ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      {category.status === 'completed' && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                          <CheckCircle className="h-3 w-3 mr-1" /> Completed
                        </Badge>
                      )}
                      {category.status === 'active' && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] animate-pulse">
                          Active Development
                        </Badge>
                      )}
                      {category.status === 'coming-soon' && (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{category.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                    <ul className="mt-4 space-y-2">
                      {category.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className={`h-1.5 w-1.5 rounded-full ${isDisabled ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    {!isDisabled && (
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                        {category.status === 'completed' ? 'View Portal' : 'Open Portal'} <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                    {isDisabled && (
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        Coming Soon
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
              return isDisabled ? (
                <div key={category.id}>{content}</div>
              ) : (
                <Link key={category.id} href={category.href}>{content}</Link>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
