'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  Users,
  Briefcase,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  ChevronRight,
  Building2,
  Star,
  CheckCircle,
} from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Smart Candidate Search',
    description: 'AI-powered search with voice assistant to find the best talent faster.',
  },
  {
    icon: Briefcase,
    title: 'Job Posting Wizard',
    description: 'Step-by-step job creation with AI-generated descriptions.',
  },
  {
    icon: Users,
    title: 'Hiring Pipeline',
    description: 'Visual Kanban board to manage your entire hiring workflow.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Data-driven insights on your recruitment metrics.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Role-based access control and secure data management.',
  },
  {
    icon: Zap,
    title: 'Calendar Sync',
    description: 'Google Calendar integration for interview scheduling.',
  },
]

const stats = [
  { value: '10K+', label: 'Active Jobs' },
  { value: '50K+', label: 'Candidates' },
  { value: '1K+', label: 'Companies' },
  { value: '95%', label: 'Satisfaction' },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm">
                <Star className="mr-1.5 h-4 w-4 text-yellow-500" />
                Trusted by 1000+ companies across India
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Transform Your{' '}
                <span className="text-primary">Recruitment</span>{' '}
                Process
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Enterprise-grade SaaS platform for modern recruitment.
                Post jobs, find candidates, and manage your hiring pipeline
                with AI-powered tools.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/recruiter">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/job-portal">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Everything You Need to Hire</h2>
              <p className="mt-4 text-muted-foreground">
                Comprehensive tools to streamline your recruitment process.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Business Categories */}
        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Built for Every Business</h2>
              <p className="mt-4 text-muted-foreground">
                Solutions tailored for your organization type.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Recruitment Agencies', desc: 'Complete ATS for agencies', icon: Building2 },
                { title: 'HR Recruiters', desc: 'Streamline client management', icon: Users },
                { title: 'MSMEs', desc: 'Affordable hiring solutions', icon: Briefcase },
                { title: 'Startups', desc: 'Scale your team fast', icon: Zap },
                { title: 'Enterprises', desc: 'Enterprise-grade features', icon: Shield },
                { title: 'Staffing Companies', desc: 'End-to-end staffing platform', icon: Users },
              ].map((item) => (
                <Link key={item.title} href="/business-operations">
                  <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="gradient-blue py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white">Ready to Transform Your Hiring?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100">
              Join thousands of companies using Thozhil Koodam to find and hire the best talent.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/recruiter">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-blue-50">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
