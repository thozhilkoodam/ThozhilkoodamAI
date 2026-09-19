'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Briefcase, Clock, Building2, SlidersHorizontal, Mic, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api-client'

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'Internship']
const experienceLevels = ['0-1 yrs', '1-3 yrs', '3-5 yrs', '5-8 yrs', '8+ yrs']
const postedRanges = [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 3 days', value: '3d' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 14 days', value: '14d' },
  { label: 'Last 30 days', value: '30d' },
]

export default function PublicJobPortal() {
  const [jobs, setJobs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [listening, setListening] = useState(false)

  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [experience, setExperience] = useState('')
  const [postedWithin, setPostedWithin] = useState('')
  const [page, setPage] = useState(1)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (location) params.location = location
      if (employmentType) params.employmentType = employmentType
      if (experience) params.experience = experience
      if (postedWithin) params.postedWithin = postedWithin
      params.page = String(page)
      params.limit = '20'

      const data = await api.jobs.getPublished(params)
      if (data) {
        setJobs(data.jobs || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 0)
      } else {
        setJobs([])
        setTotal(0)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [search, location, employmentType, experience, postedWithin, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.onresult = (event: any) => {
        setSearch(event.results[0][0].transcript)
        setListening(false)
      }
      recognition.start()
      setListening(true)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setLocation('')
    setEmploymentType('')
    setExperience('')
    setPostedWithin('')
    setPage(1)
  }

  const hasFilters = search || location || employmentType || experience || postedWithin

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Find Your Dream Job</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Browse thousands of opportunities from top companies.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, skills, companies..."
                  className="pl-10 pr-10"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
                <button
                  onClick={startListening}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${listening ? 'text-red-500' : 'text-muted-foreground'} hover:text-primary`}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showFilters && (
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
                  <Input placeholder="Any location" value={location} onChange={(e) => { setLocation(e.target.value); setPage(1) }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Employment Type</label>
                  <Select value={employmentType} onValueChange={(v) => { setEmploymentType(v); setPage(1) }}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {employmentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Experience</label>
                  <Select value={experience} onValueChange={(v) => { setExperience(v); setPage(1) }}>
                    <SelectTrigger><SelectValue placeholder="Any Experience" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Experience</SelectItem>
                      {experienceLevels.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Posted Within</label>
                  <Select value={postedWithin} onValueChange={(v) => { setPostedWithin(v); setPage(1) }}>
                    <SelectTrigger><SelectValue placeholder="Any Time" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      {postedRanges.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {hasFilters && (
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
                    <X className="h-3 w-3" /> Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Searching...' : `${total} job${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-5 w-48 rounded bg-muted" />
                  <div className="mt-2 h-4 w-32 rounded bg-muted" />
                  <div className="mt-3 flex gap-4">
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="h-3 w-16 rounded bg-muted" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="h-6 w-16 rounded bg-muted" />
                    <div className="h-6 w-20 rounded bg-muted" />
                    <div className="h-6 w-14 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchJobs} className="mt-3">Retry</Button>
              </CardContent>
            </Card>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">No jobs found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-3">Clear Filters</Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt="" className="h-8 w-8 rounded object-contain" />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold truncate">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.organizationName || job.company?.agencyName || 'Company'}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">{job.employmentType || 'Full-time'}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {(job.location || job.organizationLocation) && (
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location || job.organizationLocation}</span>
                        )}
                        {job.experience && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.experience}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.postedDate ? formatTimeAgo(new Date(job.postedDate)) : 'Recently'}</span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="font-medium text-foreground">
                            ₹{formatSalary(job.salaryMin)} - ₹{formatSalary(job.salaryMax)}
                          </span>
                        )}
                      </div>
                      {job.skills && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills || []).slice(0, 4).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" asChild>
                        <span>Apply <ExternalLink className="ml-1 h-3 w-3" /></span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              return (
                <Button key={pageNum} variant={pageNum === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(pageNum)}>
                  {pageNum}
                </Button>
              )
            })}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
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
