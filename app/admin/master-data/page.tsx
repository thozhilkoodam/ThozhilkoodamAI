'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Briefcase, Building2, MapPin, Wrench } from 'lucide-react'

const sections = [
  { icon: Briefcase, title: 'Job Roles', desc: 'Manage job roles for candidate preferences', href: '/admin/master-data/job-roles' },
  { icon: Building2, title: 'Industries', desc: 'Manage industries for candidate preferences', href: '/admin/master-data/industries' },
  { icon: MapPin, title: 'Locations', desc: 'Manage locations for candidate preferences', href: '/admin/master-data/locations' },
  { icon: Wrench, title: 'Skills', desc: 'Manage skills by category for candidate profiles', href: '/admin/master-data/skills' },
]

export default function MasterDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Master Data</h1>
        <p className="text-muted-foreground">Manage reference data used across the platform.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(s => (
          <Link key={s.href} href={s.href}>
            <Card className="transition-all hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 cursor-pointer h-full">
              <CardHeader>
                <s.icon className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
