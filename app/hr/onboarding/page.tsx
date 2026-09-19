'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  UserCheck,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Loader2,
  XCircle,
  Building,
  User,
  ShieldCheck,
  Download,
} from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

interface ChecklistItem {
  id: string
  title: string
  description: string
  requiredBy: 'candidate' | 'employer'
  category: string
  completed: boolean
  completedAt?: string
  completedBy?: string
  documentId?: string
  documentName?: string
  notes?: string
}

interface OnboardingRecord {
  id: string
  applicationId: string
  offerId: string
  candidateId: string
  companyId: string
  jobId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'JOINED' | 'CANCELLED'
  joiningDate?: string
  checklist: ChecklistItem[]
  completionPercentage: number
  documents?: any[]
  internalNotes?: string
  completedAt?: string
  joinedAt?: string
  candidate?: {
    id: string
    name: string
    email: string
    phone?: string
    candidateProfile?: any
  }
  job?: {
    id: string
    title: string
    department?: string
    location?: string
  }
  offer?: {
    id: string
    baseSalary: number
    currency: string
    employmentType: string
    joiningDate?: string
  }
}

export default function EmployerOnboardingPage() {
  const [onboardings, setOnboardings] = useState<OnboardingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Detail Modal State
  const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingRecord | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [updatingChecklist, setUpdatingChecklist] = useState(false)

  // Joining Confirmation Dialog
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmingRecord, setConfirmingRecord] = useState<OnboardingRecord | null>(null)
  const [confirmDate, setConfirmDate] = useState('')
  const [confirmNotes, setConfirmNotes] = useState('')
  const [confirming, setConfirming] = useState(false)

  const loadOnboardings = async () => {
    try {
      setLoading(true)
      const data = await api.employerOnboarding.list({
        status: statusFilter,
        search: search || undefined,
      })
      setOnboardings(data || [])
    } catch (err: any) {
      console.error('Failed to load onboardings:', err)
      toast.error(err.message || 'Failed to load onboarding records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOnboardings()
  }, [statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadOnboardings()
  }

  const handleOpenDetail = (record: OnboardingRecord) => {
    setSelectedOnboarding(record)
    setModalOpen(true)
  }

  const handleToggleChecklistItem = async (item: ChecklistItem, nextCompleted: boolean) => {
    if (!selectedOnboarding) return

    try {
      setUpdatingChecklist(true)
      const res = await api.employerOnboarding.update(selectedOnboarding.id, {
        items: [{ id: item.id, completed: nextCompleted }],
      })

      if (res?.success && res.onboarding) {
        setSelectedOnboarding((prev) => (prev ? { ...prev, ...res.onboarding } : null))
        setOnboardings((prev) =>
          prev.map((o) => (o.id === selectedOnboarding.id ? { ...o, ...res.onboarding } : o)),
        )
        toast.success(`Checklist item updated`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update checklist item')
    } finally {
      setUpdatingChecklist(false)
    }
  }

  const handleOpenConfirmJoining = (record: OnboardingRecord) => {
    setConfirmingRecord(record)
    setConfirmDate(
      record.joiningDate
        ? new Date(record.joiningDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    )
    setConfirmNotes('')
    setConfirmModalOpen(true)
  }

  const handleExecuteConfirmJoining = async () => {
    if (!confirmingRecord) return
    try {
      setConfirming(true)
      const res = await api.employerOnboarding.confirmJoining(confirmingRecord.id, {
        actualJoiningDate: confirmDate ? new Date(confirmDate).toISOString() : undefined,
        notes: confirmNotes || undefined,
      })

      if (res?.success) {
        toast.success('Candidate joining confirmed and employment activated!')
        setConfirmModalOpen(false)
        if (selectedOnboarding && selectedOnboarding.id === confirmingRecord.id) {
          setSelectedOnboarding({ ...selectedOnboarding, status: 'JOINED', joinedAt: new Date().toISOString() })
        }
        await loadOnboardings()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm joining')
    } finally {
      setConfirming(false)
    }
  }

  const handleDownloadDoc = async (onboardingId: string, docId: string) => {
    try {
      const res = await api.employerOnboarding.getDocumentDownloadUrl(onboardingId, docId)
      if (res?.signedUrl) {
        window.open(res.signedUrl, '_blank')
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not generate document download URL')
    }
  }

  // Summary Metrics
  const total = onboardings.length
  const inProgressCount = onboardings.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'NOT_STARTED').length
  const readyToJoinCount = onboardings.filter((o) => o.status === 'COMPLETED').length
  const joinedCount = onboardings.filter((o) => o.status === 'JOINED').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'JOINED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">Joined</Badge>
      case 'COMPLETED':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300">Checklist Completed</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300">In Progress</Badge>
      case 'NOT_STARTED':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300">Not Started</Badge>
      case 'CANCELLED':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-primary" />
            Candidate Onboarding & Joining
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track accepted offer onboarding checklists, verify credentials, and confirm official joining.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-medium block">Total Onboarding</span>
            <span className="text-2xl font-bold text-foreground mt-1 block">{total}</span>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-medium block">In Progress</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">{inProgressCount}</span>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-medium block">Ready to Join</span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">{readyToJoinCount}</span>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-medium block">Officially Joined</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{joinedCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
          <Input
            placeholder="Search candidate or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Checklist Completed</SelectItem>
              <SelectItem value="JOINED">Joined</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Onboarding List */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading onboarding records...</p>
        </div>
      ) : onboardings.length === 0 ? (
        <div className="py-16 text-center border rounded-xl bg-card border-dashed p-8">
          <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg">No Onboarding Records Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
            When candidates accept released job offers, they will automatically appear here for onboarding and joining verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {onboardings.map((record) => (
            <Card key={record.id} className="border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {record.candidate?.name || 'Candidate'}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5 flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                      {record.job?.title || 'Position'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-sm pb-4">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Joining Date:{' '}
                      <strong className="text-foreground">
                        {record.joiningDate ? new Date(record.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{record.candidate?.email}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Checklist Progress</span>
                    <span className="font-bold text-foreground">{record.completionPercentage}%</span>
                  </div>
                  <Progress value={record.completionPercentage} className="h-2" />
                </div>

                {/* Status-specific Callout */}
                {record.status === 'JOINED' && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Officially joined on {record.joinedAt ? new Date(record.joinedAt).toLocaleDateString() : 'Confirmed'}</span>
                  </div>
                )}
              </CardContent>

              <div className="p-4 pt-0 border-t flex items-center gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleOpenDetail(record)}
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  View Checklist
                </Button>

                {record.status !== 'JOINED' && record.status !== 'CANCELLED' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    onClick={() => handleOpenConfirmJoining(record)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Confirm Joining
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Onboarding Detail & Checklist Modal */}
      {selectedOnboarding && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between pr-6">
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Onboarding: {selectedOnboarding.candidate?.name}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {selectedOnboarding.job?.title} &bull; Joining Date:{' '}
                    {selectedOnboarding.joiningDate
                      ? new Date(selectedOnboarding.joiningDate).toLocaleDateString('en-IN')
                      : 'Not set'}
                  </DialogDescription>
                </div>
                {getStatusBadge(selectedOnboarding.status)}
              </div>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Overall Progress */}
              <div className="p-4 bg-muted/40 rounded-xl border space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold">Checklist Completion</span>
                  <span className="font-bold text-primary">{selectedOnboarding.completionPercentage}%</span>
                </div>
                <Progress value={selectedOnboarding.completionPercentage} className="h-2.5" />
              </div>

              {/* Employer Checklist Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Employer Verification Tasks
                </h4>
                <div className="space-y-2">
                  {selectedOnboarding.checklist
                    .filter((item) => item.requiredBy === 'employer')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-card border rounded-lg flex items-start justify-between gap-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <Checkbox
                            id={item.id}
                            checked={item.completed}
                            disabled={updatingChecklist || selectedOnboarding.status === 'CANCELLED'}
                            onCheckedChange={(checked) => handleToggleChecklistItem(item, !!checked)}
                            className="mt-0.5"
                          />
                          <div>
                            <label
                              htmlFor={item.id}
                              className={`text-sm font-medium cursor-pointer ${
                                item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {item.title}
                            </label>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                        </div>
                        {item.completed && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Verified
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Candidate Checklist Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <User className="h-4 w-4 text-blue-600" />
                  Candidate Tasks & Uploaded Documents
                </h4>
                <div className="space-y-2">
                  {selectedOnboarding.checklist
                    .filter((item) => item.requiredBy === 'candidate')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-card border rounded-lg flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            {item.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="text-sm font-medium text-foreground">{item.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 pl-6">{item.description}</p>
                        </div>

                        {item.documentId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 gap-1"
                            onClick={() => handleDownloadDoc(selectedOnboarding.id, item.documentId!)}
                          >
                            <Download className="h-3 w-3" />
                            View Document
                          </Button>
                        ) : item.completed ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px]">
                            Submitted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px]">
                            Pending
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Close
              </Button>

              {selectedOnboarding.status !== 'JOINED' && selectedOnboarding.status !== 'CANCELLED' && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => {
                    setModalOpen(false)
                    handleOpenConfirmJoining(selectedOnboarding)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Joining
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Joining Confirmation Dialog */}
      {confirmingRecord && (
        <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Confirm Candidate Joining
              </DialogTitle>
              <DialogDescription>
                Confirm that {confirmingRecord.candidate?.name} has officially joined for the position of{' '}
                {confirmingRecord.job?.title}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Actual Joining Date</label>
                <Input
                  type="date"
                  value={confirmDate}
                  onChange={(e) => setConfirmDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Joining Notes (Optional)</label>
                <Input
                  placeholder="e.g. Employee ID assigned, induction completed."
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 rounded-lg text-xs text-amber-800 dark:text-amber-200">
                This action transitions the candidate status to <strong>JOINED</strong> and activates their verified employment profile.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={confirming}
                onClick={handleExecuteConfirmJoining}
              >
                {confirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  'Confirm & Activate Joining'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
