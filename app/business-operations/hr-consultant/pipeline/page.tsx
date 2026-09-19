'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search, List, Eye, Download, CalendarCheck, Calendar,
  ArrowRight, Mail, Phone, MapPin, Clock,
  Star, FileText, Briefcase, GraduationCap, TrendingUp, UserCheck,
  Trash2, Upload, MessageSquare, MoreHorizontal, Filter, X,
  ChevronDown, CheckCircle, AlertCircle, Plus, Users,
  Link2, Video, MessageCircle, BookOpen, Activity,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

const pipelineStages = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'resume_screening', label: 'Resume Screening', color: 'bg-violet-500', textColor: 'text-violet-600', bgColor: 'bg-violet-100' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-500', textColor: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { id: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-cyan-500', textColor: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { id: 'interview_completed', label: 'Interview Completed', color: 'bg-teal-500', textColor: 'text-teal-600', bgColor: 'bg-teal-100' },
  { id: 'hr_round', label: 'HR Round', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'technical_round', label: 'Technical Round', color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'manager_round', label: 'Manager Round', color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'offer_released', label: 'Offer Released', color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'offer_accepted', label: 'Offer Accepted', color: 'bg-rose-500', textColor: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'joined', label: 'Joined', color: 'bg-emerald-600', textColor: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-100' },
]

const stageColorMap: Record<string, string> = Object.fromEntries(
  pipelineStages.map(s => [s.id, s.bgColor])
)

const stageTextColorMap: Record<string, string> = Object.fromEntries(
  pipelineStages.map(s => [s.id, s.textColor])
)

interface PipelineCandidate {
  id: string
  name: string
  photo: string
  designation: string
  experience: string
  currentCompany: string
  expectedSalary: string
  noticePeriod: string
  location: string
  stage: string
  recruiter: string
  lastUpdated: string
  nextAction: string
  skills: string
  education: string
  email: string
  phone: string
  resumeUrl: string
  currentCtc: string
}

const recruiters = ['Anita Kumar', 'Rahul Verma', 'Priya Sharma', 'Suresh Patel', 'Deepa Iyer']
const locations = ['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi', 'Remote']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Arjun', 'Neha', 'Kavya', 'Rohit', 'Divya', 'Karthik', 'Meera', 'Siddharth', 'Pooja', 'Manish', 'Isha', 'Akash', 'Nandini', 'Varun']
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Reddy', 'Singh', 'Gupta', 'Nair', 'Joshi', 'Menon', 'Verma', 'Iyer', 'Rao', 'Das', 'Choudhury', 'Malhotra', 'Sethi', 'Bose', 'Desai', 'Saxena', 'Agarwal']

const mockCandidates: PipelineCandidate[] = pipelineStages.flatMap((stage) => {
  const count = stage.id === 'applied' ? 6 : stage.id === 'interview_scheduled' ? 4 : stage.id === 'resume_screening' || stage.id === 'shortlisted' ? 3 : 2
  return Array.from({ length: count }, (_, i) => {
    const fName = firstNames[randomInt(0, firstNames.length - 1)]
    const lName = lastNames[randomInt(0, lastNames.length - 1)]
    const exp = `${randomInt(1, 10)} yrs`
    const ctcBase = randomInt(5, 25)
    return {
      id: `${stage.id}_${i + 1}`,
      name: `${fName} ${lName}`,
      photo: '',
      designation: ['Senior React Developer', 'UX Designer', 'Full Stack Developer', 'Data Analyst', 'DevOps Engineer', 'Product Manager', 'Java Developer', 'Frontend Developer', 'Backend Developer', 'Software Engineer', 'Tech Lead', 'QA Engineer'][randomInt(0, 11)],
      experience: exp,
      currentCompany: ['TechCorp', 'DataMinds', 'WebStudio', 'CloudOps', 'ProductLabs', 'FinServ', 'DesignHub', 'InnovateAI', 'BuildRight', 'NexGen'][randomInt(0, 9)],
      expectedSalary: `₹${ctcBase + randomInt(2, 10)} LPA`,
      noticePeriod: [`${randomInt(0, 3)} days`, `${randomInt(7, 14)} days`, '30 days', '45 days', '60 days', '90 days'][randomInt(0, 5)],
      location: locations[randomInt(0, locations.length - 1)],
      stage: stage.id,
      recruiter: recruiters[randomInt(0, recruiters.length - 1)],
      lastUpdated: [`${randomInt(0, 6)} days ago`, `${randomInt(1, 3)} weeks ago`, 'Today'][randomInt(0, 2)],
      nextAction: ['Schedule Interview', 'Review Resume', 'Send Offer', 'Follow Up', 'Technical Assessment', 'HR Round'][randomInt(0, 5)],
      skills: ['React, TypeScript, Node.js', 'Python, Django, PostgreSQL', 'AWS, Docker, Kubernetes', 'Figma, Adobe XD, Sketch', 'Java, Spring Boot, Kafka', 'SQL, Python, Tableau', 'JavaScript, Vue.js, CSS', 'Product Strategy, Agile, JIRA', 'C++, Rust, Systems Design', 'Go, Microservices, gRPC'][randomInt(0, 9)],
      education: ['B.Tech CSE', 'MCA', 'B.Sc Statistics', 'MBA', 'BCA', 'B.Des', 'M.Tech', 'BE'][randomInt(0, 7)],
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@email.com`,
      phone: `+91 98765${randomInt(10000, 99999)}`,
      resumeUrl: '#',
      currentCtc: `₹${ctcBase} LPA`,
    }
  })
})

export default function HrConsultantPipelinePage() {
  const [candidates, setCandidates] = useState(mockCandidates)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [stageFilter, setStageFilter] = useState('all')
  const [expFilter, setExpFilter] = useState('all')
  const [locFilter, setLocFilter] = useState('all')
  const [recruiterFilter, setRecruiterFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineCandidate | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bulkDialog, setBulkDialog] = useState<{ type: string; open: boolean }>({ type: '', open: false })
  const [bulkStage, setBulkStage] = useState('')

  const filtered = useMemo(() => {
    return candidates.filter(c => {
      if (search) {
        const q = search.toLowerCase()
        const match = c.name.toLowerCase().includes(q) ||
          c.skills.toLowerCase().includes(q) ||
          c.currentCompany.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.designation.toLowerCase().includes(q)
        if (!match) return false
      }
      if (stageFilter !== 'all' && c.stage !== stageFilter) return false
      if (expFilter !== 'all') {
        const years = parseInt(c.experience)
        if (expFilter === '0-2' && (years < 0 || years > 2)) return false
        if (expFilter === '2-4' && (years < 2 || years > 4)) return false
        if (expFilter === '4-6' && (years < 4 || years > 6)) return false
        if (expFilter === '6+' && years < 6) return false
      }
      if (locFilter !== 'all' && c.location !== locFilter) return false
      if (recruiterFilter !== 'all' && c.recruiter !== recruiterFilter) return false
      return true
    })
  }, [candidates, search, stageFilter, expFilter, locFilter, recruiterFilter])

  const summary = useMemo(() => {
    const total = candidates.length
    const byStage: Record<string, number> = {}
    pipelineStages.forEach(s => { byStage[s.id] = 0 })
    candidates.forEach(c => { byStage[c.stage] = (byStage[c.stage] || 0) + 1 })
    return { total, byStage }
  }, [candidates])

  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id))
  const someSelected = selectedIds.size > 0 && !allSelected

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (allSelected) { setSelectedIds(new Set()); return }
    setSelectedIds(new Set(filtered.map(c => c.id)))
  }

  const updateStage = (candidateId: string, newStage: string) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage, lastUpdated: 'Today' } : c))
    toast.success('Candidate stage updated successfully.')
  }

  const handleBulkAction = () => {
    if (bulkDialog.type === 'stage' && bulkStage) {
      setCandidates(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, stage: bulkStage, lastUpdated: 'Today' } : c))
      toast.success(`${selectedIds.size} candidates moved to ${pipelineStages.find(s => s.id === bulkStage)?.label}`)
    } else if (bulkDialog.type === 'email') {
      toast.success(`Email sent to ${selectedIds.size} candidates`)
    } else if (bulkDialog.type === 'assign') {
      toast.success(`Recruiter assigned to ${selectedIds.size} candidates`)
    } else if (bulkDialog.type === 'interview') {
      toast.success(`Interview scheduled for ${selectedIds.size} candidates`)
    } else if (bulkDialog.type === 'delete') {
      setCandidates(prev => prev.filter(c => !selectedIds.has(c.id)))
      toast.success(`${selectedIds.size} candidates removed`)
    }
    setSelectedIds(new Set())
    setBulkDialog({ type: '', open: false })
  }

  const openDrawer = (candidate: PipelineCandidate) => {
    setSelectedCandidate(candidate)
    setDrawerOpen(true)
  }

  const stageActions = (candidate: PipelineCandidate) => (
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onClick={() => { updateStage(candidate.id, candidate.stage); toast.success('Stage refreshed') }}>
        <CheckCircle className="h-4 w-4 mr-2" /> Confirm Stage
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {pipelineStages.filter(s => s.id !== candidate.stage).map(s => (
        <DropdownMenuItem key={s.id} onClick={() => updateStage(candidate.id, s.id)}>
          <ArrowRight className="h-4 w-4 mr-2" /> Move to {s.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidate Pipeline</h1>
          <p className="text-muted-foreground">Professional CRM - Manage candidates across recruitment stages</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{summary.total}</span> candidates in pipeline
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {pipelineStages.map(s => (
          <Card key={s.id} className="shrink-0 min-w-[120px] border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-2 w-2 rounded-full ${s.color}`} />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-lg font-bold">{summary.byStage[s.id] || 0}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="shrink-0 min-w-[120px] border-border/50 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total</span>
            </div>
            <p className="text-lg font-bold text-primary">{summary.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, skills, company, email, phone..."
              className="pl-9 pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" /> Filters
            {(stageFilter !== 'all' || expFilter !== 'all' || locFilter !== 'all' || recruiterFilter !== 'all') && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {(stageFilter !== 'all' ? 1 : 0) + (expFilter !== 'all' ? 1 : 0) + (locFilter !== 'all' ? 1 : 0) + (recruiterFilter !== 'all' ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Stage</Label>
                  <select className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm" value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
                    <option value="all">All Stages</option>
                    {pipelineStages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Experience</Label>
                  <select className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm" value={expFilter} onChange={e => setExpFilter(e.target.value)}>
                    <option value="all">All Experience</option>
                    <option value="0-2">0-2 yrs</option>
                    <option value="2-4">2-4 yrs</option>
                    <option value="4-6">4-6 yrs</option>
                    <option value="6+">6+ yrs</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Location</Label>
                  <select className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm" value={locFilter} onChange={e => setLocFilter(e.target.value)}>
                    <option value="all">All Locations</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Recruiter</Label>
                  <select className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm" value={recruiterFilter} onChange={e => setRecruiterFilter(e.target.value)}>
                    <option value="all">All Recruiters</option>
                    {recruiters.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <Badge variant="secondary" className="text-xs">{selectedIds.size} selected</Badge>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setBulkDialog({ type: 'stage', open: true })}>
            <ArrowRight className="h-3 w-3" /> Move Stage
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setBulkDialog({ type: 'email', open: true })}>
            <Mail className="h-3 w-3" /> Send Email
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setBulkDialog({ type: 'assign', open: true })}>
            <UserCheck className="h-3 w-3" /> Assign Recruiter
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setBulkDialog({ type: 'interview', open: true })}>
            <Calendar className="h-3 w-3" /> Schedule Interview
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => toast.success('Exported to Excel')}>
            <Download className="h-3 w-3" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => toast.success('Exported to CSV')}>
            <FileText className="h-3 w-3" /> Export CSV
          </Button>
          <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5 ml-auto" onClick={() => setBulkDialog({ type: 'delete', open: true })}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filtered.length}</span> candidates
        {selectedIds.size > 0 && (
          <span className="text-xs">({selectedIds.size} selected)</span>
        )}
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 w-10">
                    <input type="checkbox" className="rounded border-border h-4 w-4" checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected }} onChange={toggleSelectAll} />
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Candidate</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Experience</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Current Company</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Expected Salary</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Notice Period</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Location</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Current Stage</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Recruiter</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Last Updated</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Next Action</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((candidate) => {
                  const stageInfo = pipelineStages.find(s => s.id === candidate.stage)
                  return (
                    <tr key={candidate.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <input type="checkbox" className="rounded border-border h-4 w-4" checked={selectedIds.has(candidate.id)} onChange={() => toggleSelect(candidate.id)} />
                      </td>
                      <td className="p-3">
                        <button onClick={() => openDrawer(candidate)} className="flex items-center gap-3 hover:text-primary transition-colors text-left">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={candidate.photo} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {candidate.name.split(' ').map(s => s[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.designation}</p>
                          </div>
                        </button>
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">{candidate.experience}</td>
                      <td className="p-3 text-sm whitespace-nowrap">{candidate.currentCompany}</td>
                      <td className="p-3 text-sm whitespace-nowrap">{candidate.expectedSalary}</td>
                      <td className="p-3 text-sm whitespace-nowrap">{candidate.noticePeriod}</td>
                      <td className="p-3 text-sm whitespace-nowrap">{candidate.location}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`${stageInfo?.bgColor} ${stageInfo?.textColor} border-0 text-[10px] font-medium px-2 py-0.5`}>
                            {stageInfo?.label || candidate.stage}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              {pipelineStages.filter(s => s.id !== candidate.stage).map(s => (
                                <DropdownMenuItem key={s.id} onClick={() => updateStage(candidate.id, s.id)}>
                                  <div className={`h-2 w-2 rounded-full ${s.color} mr-2`} />
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">{candidate.recruiter}</td>
                      <td className="p-3 text-sm whitespace-nowrap text-muted-foreground">{candidate.lastUpdated}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] font-normal border-primary/20 text-primary">
                          {candidate.nextAction}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDrawer(candidate)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success('Resume downloaded')}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => openDrawer(candidate)}>
                                <Eye className="h-4 w-4 mr-2" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success('Opening resume...')}>
                                <FileText className="h-4 w-4 mr-2" /> View Resume
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success('Interview scheduled')}>
                                <CalendarCheck className="h-4 w-4 mr-2" /> Schedule Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success('Email sent')}>
                                <Mail className="h-4 w-4 mr-2" /> Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success('WhatsApp message sent')}>
                                <MessageCircle className="h-4 w-4 mr-2" /> Send WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toast.success('Notes added')}>
                                <MessageSquare className="h-4 w-4 mr-2" /> Add Notes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success('Resume downloaded')}>
                                <Download className="h-4 w-4 mr-2" /> Download Resume
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500" onClick={() => toast.success('Candidate archived')}>
                                <Archive className="h-4 w-4 mr-2" /> Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No candidates found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Dialogs */}
      <Dialog open={bulkDialog.open} onOpenChange={(open) => !open && setBulkDialog({ type: '', open: false })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {bulkDialog.type === 'stage' && 'Move Candidates'}
              {bulkDialog.type === 'email' && 'Send Email'}
              {bulkDialog.type === 'assign' && 'Assign Recruiter'}
              {bulkDialog.type === 'interview' && 'Schedule Interview'}
              {bulkDialog.type === 'delete' && 'Delete Candidates'}
            </DialogTitle>
            <DialogDescription>
              {selectedIds.size} candidate(s) selected
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {bulkDialog.type === 'stage' && (
              <div className="space-y-2">
                <Label>Move to stage</Label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={bulkStage} onChange={e => setBulkStage(e.target.value)}>
                  <option value="">Select stage...</option>
                  {pipelineStages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            )}
            {bulkDialog.type === 'email' && (
              <div className="space-y-2">
                <Label>Email Template</Label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option>Interview Invitation</option>
                  <option>Offer Letter</option>
                  <option>Follow Up</option>
                  <option>Rejection</option>
                </select>
              </div>
            )}
            {bulkDialog.type === 'assign' && (
              <div className="space-y-2">
                <Label>Assign to recruiter</Label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Select recruiter...</option>
                  {recruiters.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
            {bulkDialog.type === 'interview' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Interview Type</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Technical Round</option>
                    <option>HR Round</option>
                    <option>Manager Round</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <DatePicker placeholder="DD/MM/YYYY" label="Date" />
                </div>
              </div>
            )}
            {bulkDialog.type === 'delete' && (
              <p className="text-sm text-muted-foreground">Are you sure you want to delete {selectedIds.size} candidate(s)? This action cannot be undone.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialog({ type: '', open: false })}>Cancel</Button>
            <Button onClick={handleBulkAction} variant={bulkDialog.type === 'delete' ? 'destructive' : 'default'}>
              {bulkDialog.type === 'stage' && 'Move'}
              {bulkDialog.type === 'email' && 'Send'}
              {bulkDialog.type === 'assign' && 'Assign'}
              {bulkDialog.type === 'interview' && 'Schedule'}
              {bulkDialog.type === 'delete' && 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0">
          {selectedCandidate && (
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedCandidate.photo} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {selectedCandidate.name.split(' ').map(s => s[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{selectedCandidate.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedCandidate.designation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${stageColorMap[selectedCandidate.stage]} ${stageTextColorMap[selectedCandidate.stage]} border-0 text-[10px] font-medium`}>
                        {pipelineStages.find(s => s.id === selectedCandidate.stage)?.label}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success('Profile opened')}>
                    <Eye className="h-4 w-4" /> Full Profile
                  </Button>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {selectedCandidate.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {selectedCandidate.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {selectedCandidate.location}
                  </div>
                </div>

                <Separator />

                {/* Tabs */}
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="w-full grid grid-cols-5">
                    <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                    <TabsTrigger value="resume" className="text-xs">Resume</TabsTrigger>
                    <TabsTrigger value="interviews" className="text-xs">Interviews</TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                    <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Experience</Label>
                        <p className="text-sm font-medium">{selectedCandidate.experience}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Current Company</Label>
                        <p className="text-sm font-medium">{selectedCandidate.currentCompany}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Current CTC</Label>
                        <p className="text-sm font-medium">{selectedCandidate.currentCtc}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Expected CTC</Label>
                        <p className="text-sm font-medium">{selectedCandidate.expectedSalary}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Notice Period</Label>
                        <p className="text-sm font-medium">{selectedCandidate.noticePeriod}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Education</Label>
                        <p className="text-sm font-medium">{selectedCandidate.education}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Skills</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedCandidate.skills.split(', ').map(s => (
                          <Badge key={s} variant="secondary" className="text-[10px] font-normal">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="resume" className="mt-4 space-y-4">
                    <div className="flex items-center justify-center h-40 border-2 border-dashed border-border rounded-lg">
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Resume preview not available</p>
                        <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => toast.success('Resume downloaded')}>
                          <Download className="h-4 w-4" /> Download Resume
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="interviews" className="mt-4 space-y-3">
                    {[
                      { round: 'Technical Round', date: '2024-03-20', interviewer: 'Anita Kumar', status: 'completed', feedback: 'Strong technical skills' },
                      { round: 'HR Round', date: '2024-03-25', interviewer: 'Rahul Verma', status: 'scheduled', feedback: '-' },
                    ].map((iv, i) => (
                      <Card key={i} className="border-border/50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{iv.round}</p>
                              <p className="text-xs text-muted-foreground">{iv.date} with {iv.interviewer}</p>
                            </div>
                            <Badge variant={iv.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px]">
                              {iv.status}
                            </Badge>
                          </div>
                          {iv.feedback !== '-' && (
                            <p className="text-xs text-muted-foreground mt-2">{iv.feedback}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => toast.success('Interview scheduled')}>
                      <CalendarCheck className="h-4 w-4" /> Schedule Interview
                    </Button>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-4 space-y-3">
                    {[
                      { author: 'Anita Kumar', text: 'Candidate has strong React experience. Good communication skills.', date: '2 days ago' },
                      { author: 'Rahul Verma', text: 'Schedule technical round for next week.', date: '1 day ago' },
                    ].map((note, i) => (
                      <Card key={i} className="border-border/50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium">{note.author}</p>
                            <span className="text-[10px] text-muted-foreground">{note.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{note.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="flex gap-2">
                      <Input placeholder="Add a note..." className="text-sm" />
                      <Button size="sm" onClick={() => toast.success('Note added')}>Add</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-4">
                    <div className="relative space-y-0">
                      {pipelineStages.map((s, i) => {
                        const passed = pipelineStages.findIndex(ps => ps.id === selectedCandidate.stage) >= i
                        return (
                          <div key={s.id} className="flex items-start gap-3 pb-6 relative last:pb-0">
                            <div className="flex flex-col items-center">
                              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passed ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background'}`}>
                                {passed && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                              {i < pipelineStages.length - 1 && (
                                <div className={`w-0.5 h-full absolute top-4 left-[7px] ${passed ? 'bg-primary' : 'bg-muted'}`} />
                              )}
                            </div>
                            <div className="flex-1 -mt-0.5">
                              <p className={`text-sm font-medium ${passed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {s.label}
                              </p>
                              {passed && s.id === selectedCandidate.stage && (
                                <p className="text-xs text-primary">Current stage</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.success('Email sent')}>
                    <Mail className="h-4 w-4" /> Email
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.success('WhatsApp message sent')}>
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.success('Interview scheduled')}>
                    <CalendarCheck className="h-4 w-4" /> Schedule
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.success('Notes added')}>
                    <MessageSquare className="h-4 w-4" /> Notes
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => toast.success('Stage updated')}>
                    <ArrowRight className="h-4 w-4" /> Move Stage
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Archive(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}
