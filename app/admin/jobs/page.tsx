'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Briefcase, CheckCircle, XCircle, Building2, MapPin, Clock, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function AdminPendingJobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.jobs.getAll('pending_review')
      setJobs(data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load pending jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const approveJob = async (id: string) => {
    try {
      const res = await api.jobs.approve(id)
      if (!res) { toast.error('Failed to approve job'); return }
      toast.success('Job approved and published!')
      setJobs((prev) => prev.filter((j) => j.id !== id))
    } catch (e: any) {
      toast.error(e.message || 'Approval failed')
    }
  }

  const rejectJob = async (id: string) => {
    try {
      const res = await api.jobs.reject(id)
      if (!res) { toast.error('Failed to reject job'); return }
      toast.success('Job rejected.')
      setJobs((prev) => prev.filter((j) => j.id !== id))
    } catch (e: any) {
      toast.error(e.message || 'Rejection failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchJobs}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pending Job Approvals</h1>
        <p className="text-muted-foreground">Review and approve job postings from agencies.</p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500" />
            No pending job approvals. All caught up!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="border-blue-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {job.organizationName?.charAt(0) || job.company?.agencyName?.charAt(0) || 'J'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Pending Review
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{job.organizationName || job.company?.agencyName || 'Unknown Company'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.employmentType}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'N/A'}</span>
                      <span>{job.experience}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveJob(job.id)}>
                        <CheckCircle className="mr-1.5 h-4 w-4" /> Approve & Publish
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectJob(job.id)}>
                        <XCircle className="mr-1.5 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
