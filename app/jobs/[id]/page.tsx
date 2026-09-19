'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MapPin, Briefcase, Clock, Building2, DollarSign, Calendar, ChevronLeft, Share2, Heart, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [matchData, setMatchData] = useState<any>(null)
  const [loadingMatch, setLoadingMatch] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    api.jobs.getOne(id as string)
      .then(data => {
        if (data) setJob(data)
        else setError('Job not found')
      })
      .catch((e) => setError(e.message || 'Failed to load job'))
      .finally(() => setLoading(false))

    const token = typeof window !== 'undefined' ? (localStorage.getItem('candidate_token') || localStorage.getItem('access_token')) : null
    if (token && id) {
      setLoadingMatch(true)
      fetch(`http://localhost:3001/api/job-matching/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success) setMatchData(data.match)
        })
        .catch(() => {})
        .finally(() => setLoadingMatch(false))
    }
  }, [id])

  const handleApply = async () => {
    if (!job) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('candidate_token') || localStorage.getItem('access_token') : null
    if (!token) {
      toast('Please sign in as a candidate to apply.', { icon: '🔒' })
      router.push('/candidate/login')
      return
    }

    setApplying(true)
    try {
      const result = await api.portal.applications.create({
        jobId: job.id,
        company: job.organizationName || job.company?.agencyName || 'Company',
        position: job.title,
        agency: job.organizationType,
      })
      if (result) {
        toast.success('Application submitted successfully!')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-red-500">{error || 'Job not found'}</p>
        <Button variant="outline" onClick={() => router.push('/jobs')} className="mt-3">Back to Jobs</Button>
      </div>
    )
  }

  const skills = typeof job.skills === 'string' ? JSON.parse(job.skills) : (job.skills || [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" onClick={() => router.push('/jobs')} className="mb-4 gap-1">
        <ChevronLeft className="h-4 w-4" /> Back to Jobs
      </Button>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt="" className="h-10 w-10 rounded object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <p className="mt-1 text-lg text-muted-foreground">{job.organizationName || job.company?.agencyName || 'Company'}</p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">{job.employmentType || 'Full-time'}</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>}
                {job.experience && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.experience}</span>}
                {job.postedDate && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Posted {formatTimeAgo(new Date(job.postedDate))}</span>}
                {(job.salaryMin || job.salaryMax) && (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <DollarSign className="h-4 w-4" /> ₹{formatSalary(job.salaryMin)} - ₹{formatSalary(job.salaryMax)}
                  </span>
                )}
              </div>

              {job.industry && (
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">{job.industry}</Badge>
                </div>
              )}

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {matchData && (
            <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50/50 dark:bg-purple-950/30 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  ✨ AI Candidate Job Match Analysis
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white font-bold">{matchData.matchStrength} MATCH</Badge>
                  <Badge variant="outline" className="border-purple-300 text-purple-800 dark:text-purple-300 font-bold">{matchData.matchScore}% Match Score</Badge>
                </div>
              </div>

              {matchData.matchData?.explanation && (
                <p className="text-xs text-purple-900 dark:text-purple-300 leading-relaxed">
                  {matchData.matchData.explanation}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="p-2 rounded bg-white dark:bg-purple-900/50 border border-purple-100">
                  <span className="font-semibold block text-gray-500">Experience Alignment</span>
                  <span className="font-bold capitalize text-purple-700 dark:text-purple-300">{matchData.matchData?.experienceAlignment?.status || 'Good'}</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-purple-900/50 border border-purple-100">
                  <span className="font-semibold block text-gray-500">Location Alignment</span>
                  <span className="font-bold capitalize text-purple-700 dark:text-purple-300">{matchData.matchData?.locationAlignment?.status || 'Good'}</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-purple-900/50 border border-purple-100">
                  <span className="font-semibold block text-gray-500">Preference Alignment</span>
                  <span className="font-bold capitalize text-purple-700 dark:text-purple-300">{matchData.matchData?.preferenceAlignment?.status || 'Good'}</span>
                </div>
              </div>

              {Array.isArray(matchData.matchData?.matchingSkills) && matchData.matchData.matchingSkills.length > 0 && (
                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-semibold text-green-800 dark:text-green-300">Matching Skills:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.matchData.matchingSkills.map((sk: any, idx: number) => (
                      <Badge key={idx} className="text-xs bg-green-100 text-green-800 border-green-300">✓ {sk.skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(matchData.matchData?.missingSkills) && matchData.matchData.missingSkills.length > 0 && (
                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Skills to Develop:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.matchData.missingSkills.map((sk: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs border-amber-300 text-amber-800 dark:text-amber-300">! {sk.skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator className="my-6" />

          <div>
            <h2 className="text-lg font-semibold">Job Description</h2>
            <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {job.description || 'No description provided.'}
            </div>
          </div>

          {job.requirements && (
            <>
              <Separator className="my-6" />
              <div>
                <h2 className="text-lg font-semibold">Requirements</h2>
                <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            </>
          )}

          {job.responsibilities && (
            <>
              <Separator className="my-6" />
              <div>
                <h2 className="text-lg font-semibold">Responsibilities</h2>
                <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.responsibilities}
                </div>
              </div>
            </>
          )}

          {job.applicationDeadline && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Application deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}

          <Separator className="my-6" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={handleApply} disabled={applying}>
              {applying ? 'Applying...' : 'Apply Now'} <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

function formatSalary(val: number | string | null | undefined): string {
  if (!val) return ''
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return String(num)
}
