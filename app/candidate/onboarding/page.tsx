'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  UserCheck,
  Building,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Loader2,
  Sparkles,
  ShieldCheck,
  Check,
  ExternalLink,
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
  completedAt?: string
  joinedAt?: string
  company?: {
    id: string
    agencyName: string
    city?: string
    logo?: string
  }
  job?: {
    id: string
    title: string
    department?: string
    location?: string
    employmentType?: string
  }
  offer?: {
    id: string
    baseSalary: number
    currency: string
    salaryPeriod: string
    joiningDate?: string
  }
}

export default function CandidateOnboardingPage() {
  const [onboardings, setOnboardings] = useState<OnboardingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedChecklistItemId, setSelectedChecklistItemId] = useState<string | null>(null)

  const loadOnboardings = async () => {
    try {
      setLoading(true)
      const data = await api.candidateOnboarding.list()
      setOnboardings(data || [])
    } catch (err: any) {
      console.error('Failed to load candidate onboarding:', err)
      toast.error(err.message || 'Failed to load onboarding')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOnboardings()
  }, [])

  const handleMarkItemComplete = async (onboardingId: string, item: ChecklistItem) => {
    try {
      const res = await api.candidateOnboarding.updateChecklist(onboardingId, [
        { id: item.id, completed: true, notes: 'Verified and confirmed by candidate' },
      ])
      if (res?.success && res.onboarding) {
        setOnboardings((prev) =>
          prev.map((o) => (o.id === onboardingId ? { ...o, ...res.onboarding } : o)),
        )
        toast.success(`Completed: ${item.title}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item')
    }
  }

  const handleFileSelectAndUpload = async (e: React.ChangeEvent<HTMLInputElement>, onboardingId: string) => {
    const file = e.target.files?.[0]
    if (!file || !selectedChecklistItemId) return

    try {
      setUploadingItemId(selectedChecklistItemId)
      const res = await api.candidateOnboarding.uploadDocument(
        onboardingId,
        selectedChecklistItemId,
        file,
      )

      if (res?.success && res.onboarding) {
        setOnboardings((prev) =>
          prev.map((o) => (o.id === onboardingId ? { ...o, ...res.onboarding } : o)),
        )
        toast.success(`Uploaded and verified: ${file.name}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document')
    } finally {
      setUploadingItemId(null)
      setSelectedChecklistItemId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const triggerUploadFor = (checklistItemId: string) => {
    setSelectedChecklistItemId(checklistItemId)
    fileInputRef.current?.click()
  }

  const handleDownloadDoc = async (onboardingId: string, docId: string) => {
    try {
      const res = await api.candidateOnboarding.getDocumentDownloadUrl(onboardingId, docId)
      if (res?.signedUrl) {
        window.open(res.signedUrl, '_blank')
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not download document')
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading your onboarding portal...</p>
      </div>
    )
  }

  if (onboardings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Card className="border border-dashed p-10 text-center bg-card">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground">No Active Onboarding Records</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
            Once you accept an official job offer from an employer, your customized onboarding checklist and joining date will appear right here.
          </p>
        </Card>
      </div>
    )
  }

  const activeOnboarding = onboardings[0]
  const candidateTasks = activeOnboarding.checklist.filter((i) => i.requiredBy === 'candidate')
  const employerTasks = activeOnboarding.checklist.filter((i) => i.requiredBy === 'employer')

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Hidden File Input for document uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.png,.jpeg,.jpg"
        onChange={(e) => handleFileSelectAndUpload(e, activeOnboarding.id)}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">My Onboarding & Joining Portal</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete your onboarding prerequisites and track joining day readiness with {activeOnboarding.company?.agencyName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeOnboarding.status === 'JOINED' && (
            <Badge className="bg-emerald-600 text-white text-xs px-3 py-1 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="h-4 w-4" /> Officially Joined
            </Badge>
          )}
          {activeOnboarding.status === 'COMPLETED' && (
            <Badge className="bg-purple-600 text-white text-xs px-3 py-1 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="h-4 w-4" /> Checklist Complete
            </Badge>
          )}
          {activeOnboarding.status === 'IN_PROGRESS' && (
            <Badge className="bg-blue-600 text-white text-xs px-3 py-1 flex items-center gap-1.5 shadow-sm">
              <Clock className="h-4 w-4" /> Onboarding In Progress
            </Badge>
          )}
          {activeOnboarding.status === 'NOT_STARTED' && (
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-xs px-3 py-1">
              Not Started
            </Badge>
          )}
        </div>
      </div>

      {/* Celebration Joined Card */}
      {activeOnboarding.status === 'JOINED' && (
        <Card className="border-2 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 rounded-full shrink-0">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                Welcome to the Team! You Have Officially Joined.
              </h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                Your joining has been confirmed by <strong>{activeOnboarding.company?.agencyName}</strong> on{' '}
                {activeOnboarding.joinedAt ? new Date(activeOnboarding.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Confirmed'}.
                Your professional profile and employment records have been activated!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-5 space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-primary" /> Employer
            </span>
            <p className="text-lg font-bold text-foreground">{activeOnboarding.company?.agencyName}</p>
            <p className="text-xs text-muted-foreground">{activeOnboarding.company?.city || 'India'}</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" /> Position
            </span>
            <p className="text-lg font-bold text-foreground">{activeOnboarding.job?.title}</p>
            <p className="text-xs text-muted-foreground">{activeOnboarding.job?.department || 'Full-time'}</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Official Joining Date
            </span>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {activeOnboarding.joiningDate
                ? new Date(activeOnboarding.joiningDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'To be confirmed'}
            </p>
            <p className="text-xs text-muted-foreground">Report on joining date</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Onboarding Checklist Completion
            </CardTitle>
            <span className="text-lg font-bold text-primary">{activeOnboarding.completionPercentage}%</span>
          </div>
          <CardDescription className="text-xs">
            Complete the candidate required tasks below to prepare for your day-one induction.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Progress value={activeOnboarding.completionPercentage} className="h-3 rounded-full" />
        </CardContent>
      </Card>

      {/* Candidate Required Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Candidate Action Items & Document Uploads
          </h2>
          <span className="text-xs text-muted-foreground">
            {candidateTasks.filter((t) => t.completed).length} of {candidateTasks.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {candidateTasks.map((item) => (
            <Card
              key={item.id}
              className={`border transition-all ${
                item.completed ? 'bg-muted/10 border-emerald-200 dark:border-emerald-950' : 'bg-card'
              }`}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.completed ? (
                      <div className="p-1 bg-emerald-100 dark:bg-emerald-950 rounded-full">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div className="p-1 bg-amber-100 dark:bg-amber-950 rounded-full">
                        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                    )}
                    <span className={`text-sm font-semibold ${item.completed ? 'text-foreground' : 'text-foreground'}`}>
                      {item.title}
                    </span>
                    {item.completed && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] border-emerald-200">
                        Submitted & Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">{item.description}</p>
                </div>

                {/* Actions: Upload or Mark Complete */}
                <div className="flex items-center gap-2 shrink-0 pl-6 sm:pl-0">
                  {item.category === 'document' ? (
                    item.documentId ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => handleDownloadDoc(activeOnboarding.id, item.documentId!)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        View Uploaded Doc
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5 border-primary text-primary hover:bg-primary/10"
                        disabled={uploadingItemId === item.id || activeOnboarding.status === 'CANCELLED'}
                        onClick={() => triggerUploadFor(item.id)}
                      >
                        {uploadingItemId === item.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            Upload Document
                          </>
                        )}
                      </Button>
                    )
                  ) : !item.completed ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5"
                      onClick={() => handleMarkItemComplete(activeOnboarding.id, item)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Confirm & Submit
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Done
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Employer Verification Tasks (Read-Only Progress) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Employer Verification & Provisioning Progress
          </h2>
          <span className="text-xs text-muted-foreground">
            {employerTasks.filter((t) => t.completed).length} of {employerTasks.length} Done
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {employerTasks.map((item) => (
            <Card key={item.id} className="border bg-muted/20">
              <CardContent className="p-4 flex items-start gap-3">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                  <span className="text-[10px] font-medium mt-1 inline-block text-muted-foreground">
                    Status: {item.completed ? 'Completed by Employer' : 'Pending Review'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
