'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Globe, Clock, Eye, Edit2, Trash2, Calendar, Crown, Lock, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

const FREE_JOB_LIMIT = 2
const SUBSCRIPTION_PRICE = 35000

const typeColors: Record<string, string> = {
  'full-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  'part-time': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  contract: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  internship: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
}

export default function JobPostPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editJob, setEditJob] = useState<any>(null)
  const [viewJob, setViewJob] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', department: '', location: '', type: 'full-time',
    experience: '', experienceYears: '', experienceMonths: '',
    salaryType: 'fixed', salaryMin: '', salaryMax: '', salaryPeriod: 'monthly',
    vacancies: 1, description: '', skills: '',
    status: 'draft',
  })

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.jobs.getAll()
      setJobs(data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const activeJobs = jobs.filter((j: any) => j.status === 'active' || j.status === 'published')
  const atLimit = activeJobs.length >= FREE_JOB_LIMIT

  const filtered = jobs.filter((j: any) => {
    const matchSearch = (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || j.status === tab
    return matchSearch && matchTab
  })

  const openCreate = () => {
    if (atLimit) {
      toast.error(`You've reached the free limit of ${FREE_JOB_LIMIT} active jobs. Subscribe to post more.`)
      return
    }
    setEditJob(null)
    setForm({ title: '', department: '', location: '', type: 'full-time', experience: '', experienceYears: '', experienceMonths: '', salaryType: 'fixed', salaryMin: '', salaryMax: '', salaryPeriod: 'monthly', vacancies: 1, description: '', skills: '', status: 'draft' })
    setDialogOpen(true)
  }

  const openEdit = (job: any) => {
    setEditJob(job)
    setForm({
      title: job.title, department: job.department, location: job.location,
      type: job.type, experience: job.experience,
      experienceYears: job.experienceYears != null ? String(job.experienceYears) : '',
      experienceMonths: job.experienceMonths != null ? String(job.experienceMonths) : '',
      salaryType: job.salaryType || 'fixed', salaryMin: job.salaryMin != null ? String(job.salaryMin) : '', salaryMax: job.salaryMax != null ? String(job.salaryMax) : '', salaryPeriod: job.salaryPeriod || 'monthly',
      vacancies: job.vacancies || 1, description: job.description, skills: Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || ''),
      status: job.status,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.department) {
      toast.error('Please fill required fields')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        vacancies: parseInt(form.vacancies as any) || 1,
      }

      if (editJob) {
        const res = await api.jobs.update(editJob.id, payload)
        if (!res) { toast.error('Failed to update job'); return }
        toast.success('Job posting updated')
      } else {
        const res = await api.jobs.create(payload)
        if (!res) { toast.error('Failed to create job'); return }
        toast.success('Job posting created')
      }

      setDialogOpen(false)
      fetchJobs()
    } catch (e: any) {
      toast.error(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await api.jobs.close(id)
      if (!res) { toast.error('Failed to close job'); return }
      toast.success('Job posting closed')
      fetchJobs()
    } catch (e: any) {
      toast.error(e.message || 'Close failed')
    }
  }

  const handlePublish = async (id: string) => {
    const job = jobs.find((j: any) => j.id === id)
    if (!job) return
    if (job.status !== 'active' && job.status !== 'published') {
      const willBeActive = activeJobs.length + 1
      if (willBeActive > FREE_JOB_LIMIT) {
        toast.error(`You've reached the free limit of ${FREE_JOB_LIMIT} active jobs. Subscribe to publish more.`)
        return
      }
    }
    try {
      const res = await api.jobs.publish(id)
      if (!res) { toast.error('Failed to publish'); return }
      toast.success('Job published successfully')
      fetchJobs()
    } catch (e: any) {
      toast.error(e.message || 'Publish failed')
    }
  }

  const statusLabel = (s: string) => {
    if (s === 'active') return 'Active'
    if (s === 'published') return 'Published'
    return s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Posting</h1>
          <p className="text-muted-foreground">Create and manage job postings across portals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{activeJobs.length}</span>/{FREE_JOB_LIMIT} free posts used
          </div>
          <Button onClick={openCreate} disabled={atLimit}>
            {atLimit ? <Lock className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            New Job Post
          </Button>
        </div>
      </div>

      {atLimit && (
        <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-amber-500" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">Free limit reached</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  You&apos;ve used all {FREE_JOB_LIMIT} free job posts. Subscribe at ₹{SUBSCRIPTION_PRICE.toLocaleString('en-IN')} for unlimited job postings and full candidate access.
                </p>
              </div>
            </div>
            <Link href="/hr/billing">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                <Crown className="mr-2 h-4 w-4" /> Subscribe Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by title, department, or location..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({jobs.filter((j: any) => j.status === 'active' || j.status === 'published').length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({jobs.filter((j: any) => j.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({jobs.filter((j: any) => j.status === 'closed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Postings ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Globe className="mx-auto h-12 w-12 mb-3 opacity-30" />
                  <p>No job postings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-8 gap-4 border-b pb-3 text-sm font-medium text-muted-foreground">
                      <div>Title</div>
                      <div>Department</div>
                      <div>Location</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div>Applicants</div>
                      <div>Posted</div>
                      <div className="text-right">Actions</div>
                    </div>
                    {filtered.map((job: any) => (
                      <div key={job.id} className="grid grid-cols-8 gap-4 border-b py-3 text-sm items-center hover:bg-muted/50 transition-colors">
                        <div className="font-medium cursor-pointer" onClick={() => setViewJob(job)}>{job.title}</div>
                        <div className="text-muted-foreground">{job.department}</div>
                        <div className="text-muted-foreground">{job.location}</div>
                        <div><Badge className={typeColors[job.type] || ''} variant="outline">{job.type}</Badge></div>
                        <div><Badge className={statusColors[job.status] || ''} variant="outline">{statusLabel(job.status)}</Badge></div>
                        <div>{job._count?.applications || job.applicants || 0}</div>
                        <div className="text-muted-foreground">{job.postedDate ? new Date(job.postedDate).toLocaleDateString() : '-'}</div>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewJob(job)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(job)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(job.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editJob ? 'Edit Job Post' : 'Create Job Post'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Job Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior React Developer" />
            </div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore" />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Minimum Experience Required</Label>
              <div className="flex gap-2">
                <Select value={form.experienceYears} onValueChange={(v) => setForm({ ...form, experienceYears: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Years" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 16 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>{i} Year{i !== 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.experienceMonths} onValueChange={(v) => setForm({ ...form, experienceMonths: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Months" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>{i} Month{i !== 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vacancies</Label>
              <Input type="number" min={1} value={form.vacancies} onChange={(e) => setForm({ ...form, vacancies: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Salary Type</Label>
              <Select value={form.salaryType} onValueChange={(v) => setForm({ ...form, salaryType: v })}>
                <SelectTrigger><SelectValue placeholder="Select salary type" /></SelectTrigger>
                <SelectContent>
                  {['fixed', 'negotiable', 'confidential'].map((t) => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.salaryType === 'fixed' && (
              <>
                <div className="space-y-2">
                  <Label>Minimum Salary</Label>
                  <Input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="e.g., 25000" />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Salary</Label>
                  <Input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} placeholder="e.g., 35000" />
                </div>
                <div className="space-y-2">
                  <Label>Salary Period</Label>
                  <Select value={form.salaryPeriod} onValueChange={(v) => setForm({ ...form, salaryPeriod: v })}>
                    <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                    <SelectContent>
                      {['monthly', 'yearly', 'hourly'].map((p) => (
                        <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label>Skills (comma separated)</Label>
              <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. React, TypeScript, Node.js" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Job Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role and responsibilities..." />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (editJob ? 'Update' : 'Create') + ' Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewJob} onOpenChange={(o) => !o && setViewJob(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{viewJob?.title}</DialogTitle>
          </DialogHeader>
          {viewJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Department</p><p className="font-medium">{viewJob.department}</p></div>
                <div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium">{viewJob.location}</p></div>
                <div><p className="text-xs text-muted-foreground">Type</p>
                  <Badge className={typeColors[viewJob.type] || ''} variant="outline">{viewJob.type}</Badge>
                </div>
                <div><p className="text-xs text-muted-foreground">Experience</p><p className="font-medium">{viewJob.experienceYears != null ? `${viewJob.experienceYears} Yr ${viewJob.experienceMonths || 0} Mo` : (viewJob.experience || '-')}</p></div>
                <div><p className="text-xs text-muted-foreground">Vacancies</p><p className="font-medium">{viewJob.vacancies}</p></div>
                <div><p className="text-xs text-muted-foreground">Salary</p><p className="font-medium">{viewJob.salaryType === 'confidential' ? 'Confidential' : viewJob.salaryType === 'fixed' ? `₹${Number(viewJob.salaryMin || 0).toLocaleString('en-IN')} - ₹${Number(viewJob.salaryMax || 0).toLocaleString('en-IN')} / ${viewJob.salaryPeriod || 'monthly'}` : 'Negotiable'}</p></div>
                <div><p className="text-xs text-muted-foreground">Applicants</p><p className="font-medium">{viewJob._count?.applications || viewJob.applicants || 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={statusColors[viewJob.status] || ''} variant="outline">{statusLabel(viewJob.status)}</Badge>
                </div>
              </div>
              <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm">{viewJob.description}</p></div>
              <div><p className="text-xs text-muted-foreground mb-1">Skills</p>
                <div className="flex flex-wrap gap-1">{(Array.isArray(viewJob.skills) ? viewJob.skills : []).map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
              </div>
              {(viewJob.status === 'draft') && (
                <Button className="w-full" onClick={() => { handlePublish(viewJob.id); setViewJob(null) }}>
                  <Globe className="mr-2 h-4 w-4" /> Publish Job
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
