'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Building2, MapPin, Calendar, Clock, Eye } from 'lucide-react'
import { api } from '@/lib/api-client'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-amber-100 text-amber-700',
  interview: 'bg-purple-100 text-purple-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  accepted: 'bg-emerald-100 text-emerald-700',
}

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.portal.applications.list()
      .then(data => { if (data) setApplications(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applied Jobs</h1>
          <p className="text-gray-500 dark:text-gray-400">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm"><CardContent className="p-5"><div className="h-5 w-48 rounded bg-muted" /><div className="mt-2 h-4 w-32 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center"><Briefcase className="mx-auto h-8 w-8 text-gray-300 mb-2" /><p className="text-gray-500">No applications yet.</p><Link href="/jobs"><Button className="mt-3 bg-purple-600 hover:bg-purple-700">Browse Jobs</Button></Link></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                    {app.company?.charAt(0) || 'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{app.position}</h4>
                        <p className="text-sm text-gray-500">{app.company}</p>
                      </div>
                      <Badge className={`text-xs ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>{app.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                      {app.appliedAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>}
                      {app.stage && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {app.stage}</span>}
                    </div>
                  </div>
                  <Link href="/candidate/application-tracker">
                    <Button size="sm" variant="outline" className="gap-1"><Eye className="h-4 w-4" /> Track</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
