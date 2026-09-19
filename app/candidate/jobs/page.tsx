'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search, MapPin, Briefcase, Clock, Building2, SlidersHorizontal,
  Heart, Star, X, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship']
const workModes = ['Remote', 'Hybrid', 'On-site']
const experienceYears = Array.from({ length: 16 }, (_, i) => ({ label: `${i}+ Year${i > 1 ? 's' : ''}`, value: String(i) }))
const postedRanges = [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 3 days', value: '3d' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 14 days', value: '14d' },
  { label: 'Last 30 days', value: '30d' },
]

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

function formatExp(years?: number | null, months?: number | null): string {
  const y = years || 0
  const m = months || 0
  if (y === 0 && m === 0) return ''
  return `${y} Year${y !== 1 ? 's' : ''} ${m} Month${m !== 1 ? 's' : ''}`
}

function formatSalary(val: number | string | null | undefined): string {
  if (!val) return ''
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return String(num)
}

function formatSalaryFull(job: any): string {
  if (job.salaryType === 'confidential') return 'Confidential'
  if (job.salaryType === 'negotiable') return 'Negotiable'
  if (job.salaryMin || job.salaryMax) {
    const period = job.salaryPeriod ? ` / ${job.salaryPeriod.charAt(0).toUpperCase() + job.salaryPeriod.slice(1)}` : ''
    return `₹${formatSalary(job.salaryMin)} – ₹${formatSalary(job.salaryMax)}${period}`
  }
  return ''
}

export default function CandidatesJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [experience, setExperience] = useState('')
  const [postedWithin, setPostedWithin] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [company, setCompany] = useState('')
  const [salaryType, setSalaryType] = useState('')
  const [salaryMinFilter, setSalaryMinFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  const [savingJob, setSavingJob] = useState<string | null>(null)
  const [recommendedMatches, setRecommendedMatches] = useState<any[]>([])
  const [loadingRecommended, setLoadingRecommended] = useState(false)
  const [recommendedError, setRecommendedError] = useState('')

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (location) params.location = location
      if (employmentType) params.employmentType = employmentType
      if (experience) params.experienceYears = experience
      if (postedWithin) params.postedWithin = postedWithin
      if (workMode) params.workMode = workMode
      if (company) params.company = company
      if (salaryType) params.salaryType = salaryType
      if (salaryMinFilter) params.salaryMin = salaryMinFilter
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
  }, [search, location, employmentType, experience, postedWithin, workMode, company, salaryType, salaryMinFilter, page])

  const fetchRecommendedMatches = useCallback(async () => {
    setLoadingRecommended(true)
    setRecommendedError('')
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('candidate_token') : null
      if (!token) {
        setRecommendedError('Please log in to view personalized AI Job Recommendations.')
        return
      }
      const res = await fetch('http://localhost:3001/api/job-matching/recommended', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setRecommendedMatches(data.matches || [])
      } else {
        setRecommendedError(data.message || 'Complete AI resume extraction to unlock personalized job recommendations.')
      }
    } catch (err: any) {
      setRecommendedError(err.message || 'Failed to load AI job recommendations.')
    } finally {
      setLoadingRecommended(false)
    }
  }, [])

  const fetchSavedJobs = useCallback(async () => {
    try {
      const data = await api.portal.savedJobs.list()
      if (data) {
        setSavedJobIds(new Set(data.map((sj: any) => sj.jobId)))
      }
    } catch {}
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])
  useEffect(() => { fetchSavedJobs() }, [fetchSavedJobs])
  useEffect(() => {
    if (activeTab === 'recommended') {
      fetchRecommendedMatches()
    }
  }, [activeTab, fetchRecommendedMatches])

  const clearFilters = () => {
    setSearch('')
    setLocation('')
    setEmploymentType('')
    setExperience('')
    setPostedWithin('')
    setWorkMode('')
    setCompany('')
    setSalaryType('')
    setSalaryMinFilter('')
    setPage(1)
  }

  const hasFilters = search || location || employmentType || experience || postedWithin || workMode || company || salaryType || salaryMinFilter

  const toggleSave = async (job: any) => {
    if (savingJob) return
    setSavingJob(job.id)
    try {
      if (savedJobIds.has(job.id)) {
        const savedJobs = (await api.portal.savedJobs.list()) || []
        const existing = savedJobs.find((sj: any) => sj.jobId === job.id)
        if (existing) {
          await api.portal.savedJobs.remove(existing.id)
          setSavedJobIds(prev => { const n = new Set(prev); n.delete(job.id); return n })
          toast.success('Job removed from saved')
        }
      } else {
        await api.portal.savedJobs.save({
          jobId: job.id,
          company: job.organizationName || job.company?.agencyName || '',
          position: job.title,
          salary: job.salaryRange || (job.salaryMin || job.salaryMax ? `${formatSalary(job.salaryMin)} - ${formatSalary(job.salaryMax)}` : ''),
          location: job.location || '',
          jobType: job.employmentType || '',
        })
        setSavedJobIds(prev => { const n = new Set(prev); n.add(job.id); return n })
        toast.success('Job saved!')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to save job')
    } finally {
      setSavingJob(null)
    }
  }

  const renderJobCard = (job: any) => (
    <div key={job.id} className="flex items-start gap-4 rounded-lg border border-gray-100 dark:border-gray-800 p-5 hover:border-purple-200 hover:shadow-sm transition-all bg-white dark:bg-gray-900">
      <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 text-sm font-bold shrink-0">
        {job.companyLogo ? (
          <img src={job.companyLogo} alt="" className="h-8 w-8 rounded object-contain" />
        ) : (
          <Building2 className="h-6 w-6" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
            <p className="text-sm text-gray-500">{job.organizationName || job.company?.agencyName || 'Company'}</p>
          </div>
          <Badge variant="outline" className="text-xs border-purple-200 text-purple-600 shrink-0">{job.employmentType || 'Full-time'}</Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1.5">
          {(job.location || job.organizationLocation) && (
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || job.organizationLocation}</span>
          )}
          {(job.experienceYears != null || job.experienceMonths != null) && (
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {formatExp(job.experienceYears, job.experienceMonths)}</span>
          )}
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.postedDate ? formatTimeAgo(new Date(job.postedDate)) : 'Recently'}</span>
          {formatSalaryFull(job) && (
            <span className="font-medium text-gray-700 dark:text-gray-300">{formatSalaryFull(job)}</span>
          )}
        </div>
        {job.skills && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {(typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills || []).slice(0, 4).map((skill: string) => (
              <Badge key={skill} className="text-xs bg-purple-50 text-purple-600 dark:bg-purple-950 border-0">{skill}</Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" asChild>
          <Link href={`/jobs/${job.id}`}>Apply</Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toggleSave(job)}
          disabled={savingJob === job.id}
        >
          <Heart className={`h-4 w-4 ${savedJobIds.has(job.id) ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Search</h1>
          <p className="text-gray-500 dark:text-gray-400">Find your dream job</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input className="pl-10 h-12 text-lg" placeholder="Search jobs by title, company, or skills..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
      </div>

      {showFilters && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
                <Input placeholder="Any location" value={location} onChange={e => { setLocation(e.target.value); setPage(1) }} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Employment Type</label>
                <Select value={employmentType} onValueChange={v => { setEmploymentType(v); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {employmentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Work Mode</label>
                <Select value={workMode} onValueChange={v => { setWorkMode(v); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="All Modes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {workModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Minimum Experience</label>
                <Select value={experience} onValueChange={v => { setExperience(v); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="Any Experience" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Experience</SelectItem>
                    {experienceYears.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Salary Type</label>
                <Select value={salaryType} onValueChange={v => { setSalaryType(v); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Min Salary</label>
                <Input type="number" placeholder="e.g. 25000" value={salaryMinFilter} onChange={e => { setSalaryMinFilter(e.target.value); setPage(1) }} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Company</label>
                <Input placeholder="Company name" value={company} onChange={e => { setCompany(e.target.value); setPage(1) }} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Posted Within</label>
                <Select value={postedWithin} onValueChange={v => { setPostedWithin(v); setPage(1) }}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse" className="gap-2"><Search className="h-4 w-4" /> Browse Jobs</TabsTrigger>
          <TabsTrigger value="recommended" className="gap-2"><Star className="h-4 w-4 text-amber-500" /> AI Recommended</TabsTrigger>
          <TabsTrigger value="saved" className="gap-2"><Heart className="h-4 w-4 text-red-500" /> Saved Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchJobs} className="mt-3">Retry</Button>
            </CardContent></Card>
          ) : jobs.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center">
              <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No jobs found. Try a different search.</p>
              {hasFilters && <Button variant="outline" onClick={clearFilters} className="mt-3">Clear Filters</Button>}
            </CardContent></Card>
          ) : (
            <>
              {jobs.map(job => renderJobCard(job))}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
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
            </>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-6 space-y-4">
          {loadingRecommended ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : recommendedError ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center">
              <Star className="h-8 w-8 mx-auto text-amber-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">{recommendedError}</p>
              <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
                <Link href="/candidate/resume">Go to AI Resume Center</Link>
              </Button>
            </CardContent></Card>
          ) : recommendedMatches.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center">
              <Star className="h-8 w-8 mx-auto text-amber-300 mb-2" />
              <p className="text-gray-500">No active job matches found for your profile yet.</p>
            </CardContent></Card>
          ) : (
            recommendedMatches.map((m: any) => {
              const strengthColor =
                m.matchStrength === 'STRONG'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : m.matchStrength === 'GOOD'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : m.matchStrength === 'PARTIAL'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-gray-100 text-gray-800 border-gray-300'

              return (
                <div key={m.id} className="flex flex-col md:flex-row items-start justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:border-purple-200 hover:shadow-sm transition-all bg-white dark:bg-gray-900">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{m.jobTitle}</h4>
                      <Badge className={`text-xs font-bold ${strengthColor}`}>{m.matchStrength} MATCH</Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{m.matchScore}% Match Score</Badge>
                    </div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{m.organizationName}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {m.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.location}</span>}
                      {m.workMode && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {m.workMode}</span>}
                      {m.employmentType && <span>• {m.employmentType}</span>}
                    </div>
                    {m.matchData?.explanation && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-100 dark:border-gray-800">
                        💡 <span className="font-semibold">AI Fit Reasoning:</span> {m.matchData.explanation}
                      </p>
                    )}
                    {Array.isArray(m.matchData?.matchingSkills) && m.matchData.matchingSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-xs text-gray-400 font-medium">Matching Skills:</span>
                        {m.matchData.matchingSkills.map((sk: any, idx: number) => (
                          <Badge key={idx} className="text-xs bg-green-50 text-green-700 border-green-200">✓ {sk.skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700" asChild>
                      <Link href={`/jobs/${m.jobId}`}>View Match Details & Apply</Link>
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6 space-y-4">
          {savedJobIds.size === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center">
              <Heart className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No saved jobs yet. Browse and save jobs you like.</p>
            </CardContent></Card>
          ) : (
            jobs.filter(j => savedJobIds.has(j.id)).map(job => renderJobCard(job))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
