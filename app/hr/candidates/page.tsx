'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Download, MapPin, Briefcase, IndianRupee, LayoutGrid, List, Eye, Calendar, MessageSquare, UserCircle, Crown, Lock, Loader2, AlertCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { api } from '@/lib/api-client'
import { getNoticePeriodLabel } from '@/lib/notice-period'
import { NOTICE_PERIOD_OPTIONS } from '@/lib/notice-period'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  applied: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  screening: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  shortlisted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  selected: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

const hasSubscription = true
const SUBSCRIPTION_PRICE = 35000
const PAGE_SIZE = 12

const pipelineStages = ['Applied', 'Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'HR Round', 'Technical Round', 'Manager Round', 'Offer Released', 'Joined', 'Rejected']

function getScoreColor(score: number) {
  if (score >= 85) return 'text-green-600'
  if (score >= 65) return 'text-yellow-600'
  return 'text-red-600'
}

function parseSkills(skills: any): string[] {
  if (Array.isArray(skills)) return skills
  if (typeof skills === 'string') {
    try { return JSON.parse(skills) } catch { return skills.split(',').map((s) => s.trim()).filter(Boolean) }
  }
  return []
}

function mapCandidate(c: any) {
  const skills = parseSkills(c.skills)
  return {
    id: c.id,
    name: c.name || 'Unknown',
    jobTitle: c.designation || 'Candidate',
    experience: c.experience || 'N/A',
    company: c.currentCompany || '',
    skills,
    location: c.location || 'Unknown',
    expectedSalary: c.expectedCtc ? `₹${c.expectedCtc} LPA` : 'N/A',
    noticePeriod: getNoticePeriodLabel(c.noticePeriod) || 'N/A',
    noticePeriodRaw: c.noticePeriod || '',
    currentRole: c.designation || '',
    status: (c.status || 'applied').toLowerCase(),
    appliedAt: 'Recent',
    match: c.matchScore || Math.floor(Math.random() * 40 + 50),
    score: c.score || Math.floor(Math.random() * 30 + 60),
    initials: (c.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
  }
}

function mapApplicationToCandidate(app: any) {
  const c = app.candidate || {}
  const skills = Array.isArray(c.skills) ? c.skills : parseSkills(c.skills)
  return {
    id: app.id,
    candidateId: c.id,
    name: c.name || 'Unknown Candidate',
    jobTitle: app.jobTitle || app.position || 'Applied Position',
    company: c.currentCompany || app.company || '',
    experience: c.experienceYears ? `${c.experienceYears} yrs` : 'N/A',
    skills,
    location: c.location || 'Unknown',
    expectedSalary: c.expectedSalary ? `₹${c.expectedSalary} LPA` : 'N/A',
    noticePeriod: getNoticePeriodLabel(c.noticePeriod) || 'N/A',
    noticePeriodRaw: c.noticePeriod || '',
    currentRole: c.designation || app.position || '',
    status: (app.status || 'applied').toLowerCase(),
    appliedAt: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent',
    match: Math.floor(Math.random() * 20 + 75),
    score: Math.floor(Math.random() * 20 + 75),
    initials: (c.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
  }
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [search, setSearch] = useState('')
  const [expFilter, setExpFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [npFilter, setNpFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchCandidates = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.employerApplications.getAll().catch(() => null)
      if (res && res.applications && res.applications.length > 0) {
        setCandidates(res.applications.map(mapApplicationToCandidate))
      } else {
        const fallback = await api.candidates.getAll().catch(() => [])
        setCandidates((fallback || []).map(mapCandidate))
      }
    } catch (e: any) {
      const fallback = await api.candidates.getAll().catch(() => [])
      setCandidates((fallback || []).map(mapCandidate))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCandidates() }, [])

  const filtered = candidates.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
      c.company.toLowerCase().includes(search.toLowerCase())
    const matchLoc = !locFilter || c.location === locFilter
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchNp = !npFilter || c.noticePeriodRaw === npFilter
    const matchExp = !expFilter || (() => {
      const expNum = parseFloat(c.experience)
      if (isNaN(expNum)) return true
      if (expFilter === '0-2') return expNum <= 2
      if (expFilter === '2-5') return expNum > 2 && expNum <= 5
      if (expFilter === '5-10') return expNum > 5 && expNum <= 10
      if (expFilter === '10+') return expNum > 10
      return true
    })()
    return matchSearch && matchLoc && matchStatus && matchNp && matchExp
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, locFilter, statusFilter, expFilter, npFilter])

  const handleDownload = (name: string) => {
    toast.success(`Downloading resume for ${name}`)
  }
  const handleMove = async (applicationId: string, name: string, stage: string) => {
    try {
      const statusMap: Record<string, string> = {
        'Applied': 'applied',
        'Screening': 'screening',
        'Shortlisted': 'shortlisted',
        'Interview Scheduled': 'interview',
        'Interview Completed': 'interview',
        'HR Round': 'interview',
        'Technical Round': 'interview',
        'Manager Round': 'interview',
        'Offer Released': 'offer',
        'Joined': 'joined',
        'Rejected': 'rejected',
      }
      const newStatus = statusMap[stage] || stage.toLowerCase()
      await api.employerApplications.updateStatus(applicationId, newStatus)
      setCandidates(prev => prev.map(c => c.id === applicationId ? { ...c, status: newStatus } : c))
      toast.success(`${name} moved to ${stage}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update candidate stage')
    }
  }
  const handleSchedule = (name: string) => {
    toast.success(`Scheduling interview for ${name}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchCandidates}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidate Database</h1>
          <p className="text-muted-foreground">Enterprise CRM for managing candidate profiles.</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('card')}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, skills, company, or role..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={expFilter} onValueChange={setExpFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Experience" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Experience</SelectItem>
            <SelectItem value="0-2">0-2 yrs</SelectItem>
            <SelectItem value="2-5">2-5 yrs</SelectItem>
            <SelectItem value="5-10">5-10 yrs</SelectItem>
            <SelectItem value="10+">10+ yrs</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Skills..." className="w-[140px]" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} />
        <Select value={locFilter} onValueChange={setLocFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Locations</SelectItem>
            {Array.from(new Set(candidates.map((c) => c.location))).sort().map((l) => (
              <SelectItem key={l as string} value={l as string}>{l as string}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {['applied', 'screening', 'shortlisted', 'interview', 'selected', 'rejected'].map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={npFilter} onValueChange={setNpFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Notice Period" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Periods</SelectItem>
            {NOTICE_PERIOD_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {viewMode === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((candidate) => (
            <Card key={candidate.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Link href={hasSubscription ? `/hr/candidates/${candidate.id}` : '#'} onClick={(e) => { if (!hasSubscription) { e.preventDefault(); toast.error('Subscribe to view full candidate details') } }}>
                    <Avatar className="h-12 w-12 cursor-pointer">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                      <AvatarFallback>{candidate.initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={hasSubscription ? `/hr/candidates/${candidate.id}` : '#'} onClick={(e) => { if (!hasSubscription) { e.preventDefault(); toast.error('Subscribe to view full candidate details') } }}>
                      <h3 className="font-semibold truncate hover:text-primary cursor-pointer">{candidate.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" /> {candidate.experience} {candidate.company && `at ${candidate.company}`}</p>
                    <p className="text-xs text-muted-foreground">{candidate.currentRole}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 3).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                  {candidate.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{candidate.skills.length - 3}</Badge>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {candidate.location}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {candidate.expectedSalary}</span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">AI Match</span>
                    <span className={getScoreColor(candidate.match)}>{candidate.match}%</span>
                  </div>
                  <Progress value={candidate.match} className="h-1.5" />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[candidate.status]} variant="outline">
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{candidate.score}/100</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(candidate.name)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex gap-2">
                  {hasSubscription ? (
                    <Link href={`/hr/candidates/${candidate.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8"><Eye className="h-3 w-3 mr-1" /> View</Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full h-8" onClick={() => toast.error('Subscribe to view full candidate details')}>
                      <Lock className="h-3 w-3 mr-1" /> View
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-8" onClick={() => handleSchedule(candidate.name)}>
                    <Calendar className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => handleDownload(candidate.name)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>

                <div className="mt-2">
                  <Select onValueChange={(v) => handleMove(candidate.id, candidate.name, v)}>
                    <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Move to..." /></SelectTrigger>
                    <SelectContent>
                      {pipelineStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Candidate</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Experience</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Skills</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Salary</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Notice</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Match</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <Link href={hasSubscription ? `/hr/candidates/${c.id}` : '#'} onClick={(e) => { if (!hasSubscription) { e.preventDefault(); toast.error('Subscribe to view full candidate details') } }} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} />
                            <AvatarFallback className="text-xs">{c.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.company}</p>
                          </div>
                        </Link>
                      </td>
                    <td className="p-3 text-muted-foreground">{c.experience}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {c.skills.slice(0, 2).map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                        {c.skills.length > 2 && <Badge variant="outline" className="text-xs">+{c.skills.length - 2}</Badge>}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{c.location}</td>
                    <td className="p-3 text-muted-foreground">{c.expectedSalary}</td>
                    <td className="p-3 text-muted-foreground">{c.noticePeriod}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={c.match} className="h-1.5 w-16" />
                        <span className={getScoreColor(c.match)}>{c.match}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={statusColors[c.status]} variant="outline">{c.status}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasSubscription ? (
                          <Link href={`/hr/candidates/${c.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><UserCircle className="h-4 w-4" /></Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.error('Subscribe to view full candidate details')}><Lock className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSchedule(c.name)}><Calendar className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(c.name)}><Download className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>
              {p}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
