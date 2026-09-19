'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search, Filter, Loader2, AlertCircle, CheckCircle, XCircle, Clock, Eye,
  Edit2, Archive, Trash2, Download, Briefcase, MapPin, IndianRupee, Calendar,
  User, Building2, FileText, Star, ChevronLeft, ChevronRight, ChevronDown,
  ChevronUp, MessageSquare, Hash, AlertTriangle, Crown, Shield, PanelRightOpen, X,
} from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'

const STATUS_STYLES: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  changes_requested: 'bg-orange-100 text-orange-800 border-orange-200',
  submitted: 'bg-purple-100 text-purple-800 border-purple-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  published: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  expired: 'bg-slate-100 text-slate-800 border-slate-200',
  archived: 'bg-gray-100 text-gray-800 border-gray-200',
}

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-700',
}

export default function PendingJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [orgFilter, setOrgFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const [drawerJob, setDrawerJob] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const [changesDialog, setChangesDialog] = useState(false)
  const [changesText, setChangesText] = useState('')
  const [changesTarget, setChangesTarget] = useState<string | null>(null)

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; action: () => void }>({ open: false, title: '', message: '', action: () => {} })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [stats, setStats] = useState<any>({ pending: 0, published: 0, rejected: 0, todayJobs: 0, waitingOver24: 0 })

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.jobs.getByStatus(statusFilter, { search, page: String(page), limit: '15' })
      if (data) {
        setJobs(data.jobs || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await api.jobs.getAdminStats()
      if (data) setStats(data)
    } catch {}
  }

  useEffect(() => { fetchStats() }, [])

  useEffect(() => { fetchJobs() }, [statusFilter, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchJobs()
      else setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => { setSelectedIds(new Set()); setSelectAll(false) }, [jobs])

  const organizations = useMemo(() => Array.from(new Set(jobs.map((j) => j.organizationType).filter(Boolean))), [jobs])

  const openDrawer = (job: any) => {
    setDrawerJob(job)
    setDrawerOpen(true)
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await api.jobs.approve(id)
      if (!res) { toast.error('Failed to approve'); return }
      toast.success('Job approved and published!')
      fetchJobs(); fetchStats()
    } catch (e: any) { toast.error(e.message || 'Approval failed') }
    finally { setActionLoading(null) }
  }

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) { toast.error('Please provide a reason'); return }
    setActionLoading('reject')
    try {
      const res = await api.jobs.reject(rejectTarget, rejectReason)
      if (!res) { toast.error('Failed to reject'); return }
      toast.success('Job rejected')
      setRejectDialog(false); setRejectReason(''); setRejectTarget(null)
      fetchJobs(); fetchStats()
    } catch (e: any) { toast.error(e.message || 'Rejection failed') }
    finally { setActionLoading(null) }
  }

  const handleRequestChanges = async () => {
    if (!changesTarget || !changesText.trim()) { toast.error('Please describe the changes needed'); return }
    setActionLoading('changes')
    try {
      const res = await api.jobs.requestChanges(changesTarget, changesText)
      if (!res) { toast.error('Failed to request changes'); return }
      toast.success('Changes requested')
      setChangesDialog(false); setChangesText(''); setChangesTarget(null)
      fetchJobs()
    } catch (e: any) { toast.error(e.message || 'Failed') }
    finally { setActionLoading(null) }
  }

  const handleArchive = async (id: string) => {
    setActionLoading(id)
    try {
      await api.jobs.archive(id)
      toast.success('Job archived')
      fetchJobs()
    } catch (e: any) { toast.error(e.message || 'Archive failed') }
    finally { setActionLoading(null) }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      await api.jobs.delete(id)
      toast.success('Job deleted')
      fetchJobs(); fetchStats()
    } catch (e: any) { toast.error(e.message || 'Delete failed') }
    finally { setActionLoading(null) }
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'archive' | 'delete') => {
    if (selectedIds.size === 0) { toast.error('Select jobs first'); return }
    const ids = Array.from(selectedIds)
    setActionLoading('bulk')
    try {
      if (action === 'approve') {
        await api.jobs.bulkApprove(ids)
        toast.success(`${ids.length} jobs approved`)
      } else if (action === 'reject') {
        await api.jobs.bulkReject(ids, 'Bulk rejection')
        toast.success(`${ids.length} jobs rejected`)
      } else if (action === 'archive') {
        await api.jobs.bulkArchive(ids)
        toast.success(`${ids.length} jobs archived`)
      } else if (action === 'delete') {
        await api.jobs.bulkDelete(ids)
        toast.success(`${ids.length} jobs deleted`)
      }
      setSelectedIds(new Set())
      fetchJobs(); fetchStats()
    } catch (e: any) { toast.error(e.message || 'Bulk action failed') }
    finally { setActionLoading(null) }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectAll) { setSelectedIds(new Set()); setSelectAll(false) }
    else { setSelectedIds(new Set(jobs.map((j) => j.id))); setSelectAll(true) }
  }

  const formatDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
  const statusLabel = (s: string) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown'

  const kpiCards = [
    { label: 'Pending Jobs', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
    { label: 'Published Jobs', value: stats.published, color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
    { label: 'Rejected Jobs', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
    { label: "Today's Jobs", value: stats.todayJobs, color: 'text-blue-600', bg: 'bg-blue-100', icon: Calendar },
    { label: 'Waiting >24hrs', value: stats.waitingOver24, color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pending Job Posting</h1>
          <p className="text-sm text-muted-foreground">Review and approve job postings before they go live on the public Job Portal.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by title, company, recruiter, location, skills..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">All Pending</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="changes_requested">Changes Requested</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Organization" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {organizations.map((o) => (
              <SelectItem key={o as string} value={o as string}>{o as string}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Job Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="full-time">Full Time</SelectItem>
            <SelectItem value="part-time">Part Time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Separator orientation="vertical" className="h-5" />
          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => setConfirmDialog({ open: true, title: 'Approve Selected', message: `Approve and publish ${selectedIds.size} selected jobs?`, action: () => handleBulkAction('approve') })}>
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setConfirmDialog({ open: true, title: 'Reject Selected', message: `Reject ${selectedIds.size} selected jobs?`, action: () => handleBulkAction('reject') })}>
            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
          </Button>
          <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ open: true, title: 'Archive Selected', message: `Archive ${selectedIds.size} selected jobs?`, action: () => handleBulkAction('archive') })}>
            <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive
          </Button>
          <Button size="sm" variant="outline" className="text-destructive" onClick={() => setConfirmDialog({ open: true, title: 'Delete Selected', message: `Permanently delete ${selectedIds.size} selected jobs? This cannot be undone.`, action: () => handleBulkAction('delete') })}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => { setSelectedIds(new Set()); setSelectAll(false) }}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={fetchJobs}>Retry</Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-20 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <p className="text-lg font-medium">No pending jobs</p>
              <p className="text-sm text-muted-foreground">All caught up! New job submissions will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">
                      <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Org Type</TableHead>
                    <TableHead>Recruiter</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Vacancies</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => openDrawer(job)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.has(job.id)} onCheckedChange={() => toggleSelect(job.id)} />
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{job.id?.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.organizationName || job.company?.agencyName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{job.organizationType || '-'}</Badge>
                      </TableCell>
                      <TableCell>{job.postedBy || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{job.location || '-'}</TableCell>
                      <TableCell>{job.experience || '-'}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{job.employmentType || '-'}</Badge></TableCell>
                      <TableCell>{job.vacancyCount || '-'}</TableCell>
                      <TableCell>{job.salaryRange || (job.salaryMin ? `₹${job.salaryMin} - ₹${job.salaryMax}` : '-')}</TableCell>
                      <TableCell className="text-xs">{job.applicationDeadline ? formatDate(job.applicationDeadline) : '-'}</TableCell>
                      <TableCell className="text-xs">{formatDate(job.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_STYLES[job.status] || ''}`} variant="outline">{statusLabel(job.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${PRIORITY_STYLES[job.priority] || ''} text-xs`} variant="outline">{job.priority || 'medium'}</Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="View Details" onClick={() => openDrawer(job)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="Approve" onClick={() => handleApprove(job.id)} disabled={actionLoading === job.id}>
                            {actionLoading === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Reject" onClick={() => { setRejectTarget(job.id); setRejectDialog(true) }}>
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-600" title="Request Changes" onClick={() => { setChangesTarget(job.id); setChangesDialog(true) }}>
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" title="Archive" onClick={() => handleArchive(job.id)}>
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {jobs.length} of {total} jobs</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number
              if (totalPages <= 7) p = i + 1
              else if (page <= 4) p = i + 1
              else if (page >= totalPages - 3) p = totalPages - 6 + i
              else p = page - 3 + i
              return (
                <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" className="w-8" onClick={() => setPage(p)}>
                  {p}
                </Button>
              )
            })}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ===== JOB DETAILS DRAWER ===== */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {drawerJob?.title}
              {drawerJob?.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
            </DialogTitle>
          </DialogHeader>
          {drawerJob && (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="space-y-6 pr-4">
                {/* Status & Priority */}
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_STYLES[drawerJob.status] || ''} variant="outline">{statusLabel(drawerJob.status)}</Badge>
                  <Badge className={`${PRIORITY_STYLES[drawerJob.priority] || ''} text-xs`} variant="outline">
                    {drawerJob.priority || 'medium'} priority
                  </Badge>
                  {drawerJob.featured && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Star className="h-3 w-3 mr-1" /> Featured</Badge>}
                </div>

                <Separator />

                {/* Basic Info */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Job ID</span><p className="font-medium font-mono text-xs">{drawerJob.id}</p></div>
                    <div><span className="text-muted-foreground">Department</span><p className="font-medium">{drawerJob.department || '-'}</p></div>
                    <div><span className="text-muted-foreground">Location</span><p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {drawerJob.location || '-'}</p></div>
                    <div><span className="text-muted-foreground">Employment Type</span><p className="font-medium">{drawerJob.employmentType || '-'}</p></div>
                    <div><span className="text-muted-foreground">Experience</span><p className="font-medium">{drawerJob.experience || '-'}</p></div>
                    <div><span className="text-muted-foreground">Vacancies</span><p className="font-medium">{drawerJob.vacancyCount || '-'}</p></div>
                    <div><span className="text-muted-foreground">Salary</span><p className="font-medium flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {drawerJob.salaryRange || (drawerJob.salaryMin ? `₹${drawerJob.salaryMin} - ₹${drawerJob.salaryMax}` : '-')}</p></div>
                    <div><span className="text-muted-foreground">Work Mode</span><p className="font-medium">{drawerJob.workMode || '-'}</p></div>
                    <div><span className="text-muted-foreground">Notice Period</span><p className="font-medium">{drawerJob.noticePeriod || '-'}</p></div>
                    <div><span className="text-muted-foreground">Industry</span><p className="font-medium">{drawerJob.industry || '-'}</p></div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {drawerJob.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Job Description</h4>
                    <p className="text-sm whitespace-pre-wrap">{drawerJob.description}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {drawerJob.responsibilities && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Responsibilities</h4>
                    <p className="text-sm whitespace-pre-wrap">{drawerJob.responsibilities}</p>
                  </div>
                )}

                {/* Skills */}
                {drawerJob.skills && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(drawerJob.skills) ? drawerJob.skills : (() => { try { return JSON.parse(drawerJob.skills) } catch { return [] } })()).map((s: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs bg-primary/5">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {drawerJob.benefits && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Benefits</h4>
                    <p className="text-sm whitespace-pre-wrap">{drawerJob.benefits}</p>
                  </div>
                )}

                <Separator />

                {/* Company & Recruiter */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Company Info</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {drawerJob.organizationName || drawerJob.company?.agencyName || '-'}</p>
                      <p><span className="text-muted-foreground">Type:</span> {drawerJob.organizationType || '-'}</p>
                      {drawerJob.company?.email && <p><span className="text-muted-foreground">Email:</span> {drawerJob.company.email}</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Recruiter Info</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Posted By:</span> {drawerJob.postedBy || '-'}</p>
                      <p><span className="text-muted-foreground">Posted Date:</span> {formatDate(drawerJob.postedDate)}</p>
                      <p><span className="text-muted-foreground">Deadline:</span> {formatDate(drawerJob.applicationDeadline)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Approval Timeline */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Approval Timeline</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Created', date: drawerJob.createdAt, icon: FileText, color: 'bg-gray-500' },
                      { label: 'Submitted', date: drawerJob.submittedAt, icon: Clock, color: 'bg-purple-500' },
                      { label: 'Approved', date: drawerJob.approvedAt, icon: CheckCircle, color: 'bg-green-500' },
                      { label: 'Published', date: drawerJob.publishedAt, icon: Crown, color: 'bg-blue-500' },
                    ].filter((t) => t.date).map((t, i, arr) => (
                      <div key={t.label} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${t.color} text-white`}>
                            <t.icon className="h-3 w-3" />
                          </div>
                          {i < arr.length - 1 && <div className="w-px flex-1 bg-border min-h-[20px]" />}
                        </div>
                        <div className="pb-3">
                          <p className="text-sm font-medium">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                        </div>
                      </div>
                    ))}
                    {drawerJob.rejectedReason && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                          <XCircle className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-600">Rejected</p>
                          <p className="text-xs text-muted-foreground">{formatDate(drawerJob.approvedAt)}</p>
                          <p className="text-sm mt-1 p-2 bg-red-50 border border-red-200 rounded">{drawerJob.rejectedReason}</p>
                        </div>
                      </div>
                    )}
                    {drawerJob.requestedChanges && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                          <MessageSquare className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-600">Changes Requested</p>
                          <p className="text-xs text-muted-foreground">{formatDate(drawerJob.approvedAt)}</p>
                          <p className="text-sm mt-1 p-2 bg-orange-50 border border-orange-200 rounded">{drawerJob.requestedChanges}</p>
                        </div>
                      </div>
                    )}
                    {!drawerJob.approvedAt && !drawerJob.rejectedReason && !drawerJob.requestedChanges && (
                      <p className="text-sm text-muted-foreground italic">Awaiting review...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions in drawer */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { handleApprove(drawerJob.id); setDrawerOpen(false) }}>
                  <CheckCircle className="mr-1.5 h-4 w-4" /> Approve & Publish
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { setRejectTarget(drawerJob.id); setRejectDialog(true) }}>
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject
                </Button>
                <Button size="sm" variant="outline" className="text-orange-600" onClick={() => { setChangesTarget(drawerJob.id); setChangesDialog(true) }}>
                  <MessageSquare className="mr-1.5 h-4 w-4" /> Request Changes
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleArchive(drawerJob.id)}>
                  <Archive className="mr-1.5 h-4 w-4" /> Archive
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Reject Job Posting</DialogTitle>
            <DialogDescription>Provide a reason for rejection. The recruiter will be notified.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || actionLoading === 'reject'}>
              {actionLoading === 'reject' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting...</> : 'Reject Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={changesDialog} onOpenChange={setChangesDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>Describe what changes the recruiter needs to make before approval.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the changes needed..."
            value={changesText}
            onChange={(e) => setChangesText(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangesDialog(false)}>Cancel</Button>
            <Button variant="default" onClick={handleRequestChanges} disabled={!changesText.trim() || actionLoading === 'changes'}>
              {actionLoading === 'changes' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(o) => setConfirmDialog({ ...confirmDialog, open: o })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
            <Button variant={confirmDialog.title.includes('Delete') ? 'destructive' : 'default'} onClick={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }) }}>
              {actionLoading === 'bulk' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
