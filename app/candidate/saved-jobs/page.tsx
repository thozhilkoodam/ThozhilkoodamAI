'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, Briefcase, Clock, Building2, Trash2, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = async () => {
    setLoading(true)
    try {
      const data = await api.portal.savedJobs.list()
      if (data) setJobs(data)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSaved() }, [])

  const handleRemove = async (id: string) => {
    try {
      await api.portal.savedJobs.remove(id)
      setJobs(prev => prev.filter(j => j.id !== id))
      toast.success('Removed from saved jobs')
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Jobs</h1>
        <p className="text-gray-500 dark:text-gray-400">Jobs you&apos;ve saved for later</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm"><CardContent className="p-5"><div className="h-5 w-48 rounded bg-muted" /><div className="mt-2 h-4 w-32 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Heart className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-gray-500">No saved jobs yet.</p>
            <Link href="/jobs"><Button className="mt-3 bg-purple-600 hover:bg-purple-700">Browse Jobs</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                    {job.company?.charAt(0) || 'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{job.position}</h4>
                        <p className="text-sm text-gray-500">{job.company}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{job.jobType || 'Full-time'}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                      {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>}
                      {job.salary && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.salary}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleRemove(job.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
