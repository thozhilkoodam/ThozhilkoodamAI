'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Loader2, Circle, Briefcase, Building2 } from 'lucide-react'
import { api } from '@/lib/api-client'

const stageOrder = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'accepted']

const defaultTimeline = [
  { stage: 'Application Submitted', key: 'applied' },
  { stage: 'Resume Shortlisted', key: 'screening' },
  { stage: 'Phone / Video Screening', key: 'shortlisted' },
  { stage: 'Interview Rounds', key: 'interview' },
  { stage: 'Offer', key: 'offer' },
  { stage: 'Accepted', key: 'accepted' },
]

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.portal.applications.list()
      .then(data => { if (data) setApplications(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getProgress = (status: string) => {
    const idx = stageOrder.indexOf(status)
    return idx >= 0 ? ((idx + 1) / stageOrder.length) * 100 : 0
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Card key={i} className="animate-pulse border-0 shadow-sm"><CardContent className="p-6"><div className="h-5 w-48 rounded bg-muted" /><div className="mt-4 h-2 w-full rounded bg-muted" /></CardContent></Card>)}</div>
  }

  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Tracker</h1>
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center"><Briefcase className="mx-auto h-8 w-8 text-gray-300 mb-2" /><p className="text-gray-500">No applications to track.</p></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400">Track the progress of your job applications</p>
      </div>

      {applications.map((app: any) => {
        const currentIdx = stageOrder.indexOf(app.status)
        return (
          <Card key={app.id} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 text-xs font-bold">
                  {app.company?.charAt(0) || 'J'}
                </div>
                <div>
                  <CardTitle className="text-base">{app.position}</CardTitle>
                  <p className="text-sm text-gray-500">{app.company}</p>
                </div>
              </div>
              <Badge className="text-xs bg-purple-100 text-purple-700">{app.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Progress value={getProgress(app.status)} className="h-2 flex-1" />
                <span className="text-sm font-medium text-purple-600">{Math.round(getProgress(app.status))}%</span>
              </div>
              <div className="space-y-3">
                {defaultTimeline.map((step, i) => {
                  const done = i <= currentIdx
                  const current = i === currentIdx
                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {done && !current ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : current ? (
                          <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        {i < defaultTimeline.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${done && !current ? 'text-gray-900 dark:text-white' : current ? 'text-purple-600' : 'text-gray-400'}`}>{step.stage}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
