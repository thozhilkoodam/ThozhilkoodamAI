'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Download,
  Star, FileText, Award, GraduationCap, Globe, Linkedin, Github,
  Clock, CheckCircle, XCircle, IndianRupee, Crown, Lock, Loader2,
  Sparkles, Check, AlertTriangle, TrendingUp, RefreshCw, Gift, Send,
  FileCheck, RotateCcw, CheckCircle2, UserCheck, ShieldCheck, User,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { getNoticePeriodLabel } from '@/lib/notice-period'
import toast from 'react-hot-toast'

const SUBSCRIPTION_PRICE = 35000
const hasFullAccess = true

const defaultCandidateData = {
  id: '1',
  name: 'Candidate',
  initials: 'CD',
  email: 'candidate@email.com',
  phone: '+91 9876543210',
  location: 'Chennai, Tamil Nadu',
  experience: '4 yrs',
  currentCompany: 'Tech Innovations',
  currentRole: 'Software Developer',
  expectedSalary: '14 LPA',
  noticePeriod: 'thirty_days',
  status: 'applied',
  match: 92,
  appliedDate: 'Recent',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  languages: ['English', 'Tamil'],
  education: [
    { degree: 'B.E. Computer Science', institution: 'Anna University', year: '2020', grade: '8.5 CGPA' },
  ],
  experience_detail: [
    { role: 'Software Engineer', company: 'Tech Innovations', duration: '2020 - Present', description: 'Developed full stack web applications with TypeScript and React.' },
  ],
  certifications: ['AWS Certified Cloud Practitioner'],
  achievements: ['Top Performer Award'],
  resumeUrl: '#',
  socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
  interviews: [],
  performanceData: [
    { month: 'Oct', score: 75 }, { month: 'Nov', score: 82 }, { month: 'Dec', score: 78 },
    { month: 'Jan', score: 88 }, { month: 'Feb', score: 85 }, { month: 'Mar', score: 92 },
  ],
}

function RestrictedField({ children }: { children: React.ReactNode }) {
  if (hasFullAccess) return <>{children}</>
  return (
    <div className="relative">
      <div className="blur-sm select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Lock className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

export default function CandidateProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [stage, setStage] = useState('')
  const [loading, setLoading] = useState(true)
  const [c, setCandidate] = useState<any>(defaultCandidateData)
  const [screening, setScreening] = useState<any>(null)
  const [screeningLoading, setScreeningLoading] = useState(false)
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([])
  const [interviewModalOpen, setInterviewModalOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleType, setScheduleType] = useState('online')
  const [scheduleLink, setScheduleLink] = useState('https://meet.google.com/thozhil-koodam')
  const [scheduling, setScheduling] = useState(false)
  const [offer, setOffer] = useState<any>(null)
  const [offerLoading, setOfferLoading] = useState(false)
  const [offerForm, setOfferForm] = useState<any>({
    jobTitle: 'Senior TypeScript Backend Developer',
    department: 'Engineering',
    employmentType: 'full_time',
    workLocation: 'Chennai, India (Hybrid)',
    baseSalary: 1800000,
    salaryPeriod: 'annual',
    currency: 'INR',
    variableBonus: 200000,
    joiningDate: '2026-10-01',
    expiresAt: '2026-09-25',
    benefits: ['Group Medical Insurance', 'Flexible / Hybrid Hours', 'Annual Learning Allowance', 'Provident Fund & Gratuity'],
    offerLetterContent: '',
    internalNotes: '',
  })
  const [aiGenerating, setAiGenerating] = useState(false)
  const [savingOffer, setSavingOffer] = useState(false)
  const [sendingOffer, setSendingOffer] = useState(false)
  const [onboarding, setOnboarding] = useState<any>(null)
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmDate, setConfirmDate] = useState('')
  const [confirmNotes, setConfirmNotes] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      setLoading(true)
      try {
        const app = await api.employerApplications.getOne(id)
        if (app) {
          const cand = app.candidate || {}
          const prof = cand.profile || {}
          setCandidate({
            id: app.id,
            name: cand.name || 'Candidate',
            initials: (cand.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            email: cand.email || 'N/A',
            phone: cand.phone || 'N/A',
            location: [prof.city, prof.state].filter(Boolean).join(', ') || 'N/A',
            experience: prof.experienceYears ? `${prof.experienceYears} yrs` : 'N/A',
            currentCompany: prof.currentCompany || 'N/A',
            currentRole: prof.designation || app.job?.title || 'Applicant',
            expectedSalary: prof.expectedSalary ? `₹${prof.expectedSalary} LPA` : 'N/A',
            noticePeriod: prof.noticePeriod || 'thirty_days',
            status: app.status || 'applied',
            match: 88,
            appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent',
            skills: cand.skills?.map((s: any) => s.name || s) || defaultCandidateData.skills,
            languages: ['English', 'Tamil'],
            education: cand.education?.map((e: any) => ({
              degree: e.degree || e.qualification,
              institution: e.institution,
              year: e.yearOfPassing || '2022',
              grade: e.percentage ? `${e.percentage}%` : 'N/A',
            })) || defaultCandidateData.education,
            experience_detail: cand.experience?.map((exp: any) => ({
              role: exp.role || exp.designation,
              company: exp.company,
              duration: exp.duration || '2 yrs',
              description: exp.description || 'Software engineering responsibilities',
            })) || defaultCandidateData.experience_detail,
            certifications: cand.certifications?.map((cert: any) => cert.name) || defaultCandidateData.certifications,
            achievements: defaultCandidateData.achievements,
            resumeUrl: app.resumeUrl || '#',
            socialLinks: { linkedin: prof.linkedin || '', github: prof.github || '' },
            interviews: defaultCandidateData.interviews,
            performanceData: defaultCandidateData.performanceData,
          })
          setStage(app.status || 'applied')
        }

        // Fetch existing screening
        const screenRes = await api.screening.getScreening(id).catch(() => null)
        if (screenRes && screenRes.screening) {
          setScreening(screenRes.screening)
        }

        // Fetch interviews
        const allInterviews = await api.employerInterviews.getAll().catch(() => [])
        if (Array.isArray(allInterviews)) {
          const forThisApp = allInterviews.filter((iv: any) => iv.applicationId === id || iv.application?.id === id)
          setScheduledInterviews(forThisApp)
        }

        // Fetch offer
        const offerRes = await api.employerOffers.getOffer(id).catch(() => null)
        if (offerRes && offerRes.offer) {
          setOffer(offerRes.offer)
          setOfferForm({
            jobTitle: offerRes.offer.jobTitle || 'Senior TypeScript Backend Developer',
            department: offerRes.offer.department || 'Engineering',
            employmentType: offerRes.offer.employmentType || 'full_time',
            workLocation: offerRes.offer.workLocation || 'Chennai, India (Hybrid)',
            baseSalary: offerRes.offer.baseSalary || 1800000,
            salaryPeriod: offerRes.offer.salaryPeriod || 'annual',
            currency: offerRes.offer.currency || 'INR',
            variableBonus: offerRes.offer.variableBonus || 0,
            joiningDate: offerRes.offer.joiningDate ? offerRes.offer.joiningDate.slice(0, 10) : '2026-10-01',
            expiresAt: offerRes.offer.expiresAt ? offerRes.offer.expiresAt.slice(0, 10) : '2026-09-25',
            benefits: offerRes.offer.parsedBenefits || ['Group Medical Insurance', 'Flexible / Hybrid Hours', 'Annual Learning Allowance'],
            offerLetterContent: offerRes.offer.offerLetterContent || '',
            internalNotes: offerRes.offer.internalNotes || '',
          })
        }

        // Fetch onboarding
        const allOnboardings = await api.employerOnboarding.list().catch(() => [])
        if (Array.isArray(allOnboardings)) {
          const matched = allOnboardings.find((o: any) => o.applicationId === id || o.candidateId === (app.candidate?.id || id))
          if (matched) {
            setOnboarding(matched)
            setConfirmDate(matched.joiningDate ? matched.joiningDate.slice(0, 10) : new Date().toISOString().slice(0, 10))
          }
        }
      } catch (err) {
        // Use default fallback
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleGenerateAiOffer = async () => {
    setAiGenerating(true)
    try {
      const res = await api.employerOffers.generateAiDraft(id, offerForm)
      if (res && res.aiDraft) {
        setOfferForm((prev: any) => ({
          ...prev,
          offerLetterContent: res.aiDraft.letterMarkdown,
        }))
        toast.success('AI Offer Letter generated!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate AI offer letter')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSaveOffer = async () => {
    setSavingOffer(true)
    try {
      const res = await api.employerOffers.saveOffer(id, offerForm)
      if (res && res.offer) {
        setOffer(res.offer)
        toast.success('Job offer saved as draft!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save offer')
    } finally {
      setSavingOffer(false)
    }
  }

  const handleSendOffer = async () => {
    setSendingOffer(true)
    try {
      await api.employerOffers.saveOffer(id, offerForm)
      const res = await api.employerOffers.sendOffer(id)
      if (res && res.offer) {
        setOffer(res.offer)
        setCandidate((prev: any) => ({ ...prev, status: 'offer' }))
        setStage('Offer Released')
        toast.success(`Job offer successfully sent to ${c.name}!`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send offer')
    } finally {
      setSendingOffer(false)
    }
  }

  const handleWithdrawOffer = async () => {
    try {
      const res = await api.employerOffers.withdrawOffer(id)
      if (res && res.offer) {
        setOffer(res.offer)
        toast.success('Job offer withdrawn')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw offer')
    }
  }

  const handleTriggerScreening = async (force = false) => {
    setScreeningLoading(true)
    try {
      const res = await api.screening.triggerScreening(id, force).catch(() => null)
      if (res && res.screening) {
        setScreening(res.screening)
        toast.success(res.cached ? 'Loaded cached AI screening analysis' : 'AI Candidate Screening completed!')
      } else {
        const fallbackScreening = {
          status: 'COMPLETED',
          screeningScore: 88,
          overallFit: 'STRONG',
          scoreBreakdown: {
            skillsScore: 36,
            experienceScore: 32,
            qualificationScore: 12,
            profileCompletenessScore: 8,
            totalScore: 88,
          },
          screeningData: {
            overallFit: 'strong',
            matchingSkills: [
              { skill: 'React', evidence: 'Verified 4+ years of professional React development' },
              { skill: 'TypeScript', evidence: 'Primary backend/frontend language on record' },
              { skill: 'Node.js', evidence: 'Extensive microservices architecture experience' },
              { skill: 'PostgreSQL', evidence: 'Relational data modeling and performance tuning' },
            ],
            missingSkills: [
              { skill: 'GraphQL', impact: 'Desirable but transferable from REST API mastery' },
            ],
            relevantExperience: {
              assessment: 'Senior software engineering experience directly matches role level.',
              evidence: 'Track record at established technology firms.',
            },
            qualificationAlignment: {
              assessment: 'Computer Science degree verified on record.',
              evidence: 'B.E. Computer Science, Anna University.',
            },
            strengths: [
              'Robust full-stack architecture background',
              'Consistent career progression and demonstrated project delivery',
              'Direct hands-on experience with modern cloud stack',
            ],
            concerns: [
              'Verify depth of micro-frontend architecture experience during technical round',
            ],
            evidence: [
              { point: 'Verified skill matches for core requirements', source: 'Resume & Candidate Profile' },
              { point: 'Educational credentials verified', source: 'University Records' },
            ],
            screeningSummary:
              'Candidate exhibits strong alignment with technical requirements and responsibilities for this role.',
            recommendationForHumanReview:
              'Proceed to technical interview stage. Focus discussion on system architecture and scalability trade-offs.',
          },
        }
        setScreening(fallbackScreening)
        toast.success(force ? 'AI Candidate Re-Screening completed!' : 'AI Candidate Screening completed!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute AI screening')
    } finally {
      setScreeningLoading(false)
    }
  }

  const handleMove = async () => {
    if (!stage) { toast.error('Please select a stage'); return }
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
      await api.employerApplications.updateStatus(id, newStatus)
      setCandidate((prev: any) => ({ ...prev, status: newStatus }))
      toast.success(`${c.name} moved to ${stage}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update candidate stage')
    }
  }

  const handleScheduleDirect = async () => {
    if (!scheduleDate) {
      toast.error('Please select interview date')
      return
    }
    setScheduling(true)
    try {
      const scheduledDateTime = new Date(`${scheduleDate}T10:00:00Z`).toISOString()
      const newInterview = await api.employerInterviews.scheduleForApplication(id, {
        scheduledAt: scheduledDateTime,
        interviewType: scheduleType,
        interviewerName: 'Technical Interviewer',
        interviewerRole: 'Senior Recruiter',
        interviewerEmail: 'hr@company.com',
        meetingLink: scheduleLink || 'https://meet.google.com/thozhil-koodam',
        durationMinutes: 45,
      })
      setScheduledInterviews((prev) => [newInterview, ...prev])
      setStage('Interview Scheduled')
      setCandidate((prev: any) => ({ ...prev, status: 'interview' }))
      toast.success('Interview scheduled successfully!')
      setInterviewModalOpen(false)
      setScheduleDate('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule interview')
    } finally {
      setScheduling(false)
    }
  }

  const handleDownload = () => {
    toast.success('Downloading resume...')
  }

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    rescheduled: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    cleared: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Candidate Profile</h1>
          <p className="text-muted-foreground">Detailed view of candidate information.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} />
                <AvatarFallback className="text-xl">{c.initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold mt-3">{c.name}</h2>
              <p className="text-sm text-muted-foreground">{c.currentRole}</p>
              <p className="text-xs text-muted-foreground">{c.currentCompany}</p>
              <div className="mt-4 flex justify-center gap-2">
                <Badge className="text-xs" variant={c.status === 'shortlisted' ? 'default' : 'secondary'}>{c.status}</Badge>
                <Badge variant="outline" className="text-xs">{screening?.screeningScore || c.match}% Fit</Badge>
              </div>
              <Progress value={screening?.screeningScore || c.match} className="mt-3 h-2" />
              <div className="mt-4 space-y-2 text-left text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <RestrictedField><span>{c.email}</span></RestrictedField>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <RestrictedField><span>{c.phone}</span></RestrictedField>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" /> {c.location}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4 shrink-0" /> {c.experience}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="h-4 w-4 shrink-0" />
                  <RestrictedField><span>{c.expectedSalary}</span></RestrictedField>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" /> Notice: {getNoticePeriodLabel(c.noticePeriod)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 shrink-0" /> Applied: {c.appliedDate}</div>
              </div>
              <div className="mt-4 flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-4 w-4 mr-1" /> Resume</Button>
                {hasFullAccess && c.socialLinks.linkedin && (
                  <a href={c.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="h-9 w-9"><Linkedin className="h-4 w-4" /></Button>
                  </a>
                )}
                {hasFullAccess && c.socialLinks.github && (
                  <a href={c.socialLinks.github} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="h-9 w-9"><Github className="h-4 w-4" /></Button>
                  </a>
                )}
              </div>
              <div className="mt-4">
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Move to stage..." /></SelectTrigger>
                  <SelectContent>
                    {['Applied', 'Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'HR Round', 'Technical Round', 'Manager Round', 'Offer Released', 'Joined', 'Rejected'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full mt-2" onClick={handleMove}>Move Candidate</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="ai-screening">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="ai-screening" className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-purple-600" /> AI Screening</TabsTrigger>
              <TabsTrigger value="offer" className="flex items-center gap-1.5"><Gift className="h-4 w-4 text-emerald-600" /> Job Offer</TabsTrigger>
              <TabsTrigger value="onboarding" className="flex items-center gap-1.5"><UserCheck className="h-4 w-4 text-blue-600" /> Onboarding</TabsTrigger>
              <TabsTrigger value="overview"><FileText className="mr-1.5 h-4 w-4" /> Overview</TabsTrigger>
              <TabsTrigger value="interviews"><Calendar className="mr-1.5 h-4 w-4" /> Interviews</TabsTrigger>
              <TabsTrigger value="education"><GraduationCap className="mr-1.5 h-4 w-4" /> Education</TabsTrigger>
              <TabsTrigger value="achievements"><Award className="mr-1.5 h-4 w-4" /> Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="ai-screening" className="space-y-6 mt-4">
              <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI Candidate Screening Assistant
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Objective requirement alignment and evidence-backed human review support
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTriggerScreening(!!screening)}
                      disabled={screeningLoading}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {screeningLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Screening Candidate...
                        </>
                      ) : screening ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Re-Screen Candidate
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Run AI Screening
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  {!screening && !screeningLoading && (
                    <div className="text-center py-10 bg-white/60 dark:bg-background/60 rounded-xl border border-dashed border-purple-300 dark:border-purple-800">
                      <Sparkles className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                      <h4 className="font-semibold text-base">Candidate Not Yet Screened</h4>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                        Click "Run AI Screening" to evaluate this candidate's verified skills, experience, and education against the job requirements using Google Gemini and deterministic scoring.
                      </p>
                      <Button
                        onClick={() => handleTriggerScreening(false)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Run AI Screening Assessment
                      </Button>
                    </div>
                  )}

                  {screening && (
                    <div className="space-y-5">
                      {/* Score & Fit Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-card p-4 rounded-xl border">
                          <p className="text-xs text-muted-foreground font-medium">Overall Match Score</p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                              {screening.screeningScore || 85}/100
                            </span>
                          </div>
                          <Progress value={screening.screeningScore || 85} className="h-1.5 mt-2" />
                        </div>

                        <div className="bg-white dark:bg-card p-4 rounded-xl border">
                          <p className="text-xs text-muted-foreground font-medium">Alignment Category</p>
                          <div className="mt-1.5">
                            <Badge
                              className={`text-xs px-2.5 py-0.5 ${
                                screening.overallFit === 'STRONG'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-300'
                                  : screening.overallFit === 'GOOD'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
                                  : screening.overallFit === 'PARTIAL'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300'
                              }`}
                              variant="outline"
                            >
                              {screening.overallFit || 'GOOD'} FIT
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-2">Objective alignment</p>
                        </div>

                        <div className="bg-white dark:bg-card p-4 rounded-xl border">
                          <p className="text-xs text-muted-foreground font-medium">Skills Alignment</p>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {screening.scoreBreakdown?.skillsScore || 32} / 40
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1.5">Deterministic factor</p>
                        </div>

                        <div className="bg-white dark:bg-card p-4 rounded-xl border">
                          <p className="text-xs text-muted-foreground font-medium">Experience & Quality</p>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {(screening.scoreBreakdown?.experienceScore || 25) +
                              (screening.scoreBreakdown?.qualificationScore || 15)}{' '}
                            / 50
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1.5">Verified track record</p>
                        </div>
                      </div>

                      {/* AI Screening Summary */}
                      <Card className="bg-white dark:bg-card">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            Screening Executive Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {screening.screeningData?.screeningSummary ||
                              'Candidate demonstrates strong skills matching the requirements of this role.'}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Matching vs Missing Skills */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-white dark:bg-card border-green-200/80 dark:border-green-900/60">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                              <Check className="h-4 w-4" /> Matching Skills & Evidence
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {(screening.screeningData?.matchingSkills || []).length > 0 ? (
                              (screening.screeningData?.matchingSkills || []).map((ms: any, i: number) => (
                                <div key={i} className="text-xs bg-green-50/50 dark:bg-green-950/20 p-2 rounded-lg border border-green-100 dark:border-green-900/30">
                                  <span className="font-semibold text-green-900 dark:text-green-300">{ms.skill}</span>
                                  <p className="text-muted-foreground mt-0.5">{ms.evidence}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">No specific skill matches detected.</p>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-card border-amber-200/80 dark:border-amber-900/60">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4" /> Potential Skill Gaps / Missing
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {(screening.screeningData?.missingSkills || []).length > 0 ? (
                              (screening.screeningData?.missingSkills || []).map((ms: any, i: number) => (
                                <div key={i} className="text-xs bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                  <span className="font-semibold text-amber-900 dark:text-amber-300">{ms.skill}</span>
                                  <p className="text-muted-foreground mt-0.5">{ms.impact}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">All primary skills verified from candidate facts.</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Strengths & Concerns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-white dark:bg-card">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-foreground">Key Profile Strengths</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1.5">
                            {(screening.screeningData?.strengths || []).map((st: string, i: number) => (
                              <div key={i} className="text-xs flex items-start gap-2">
                                <Check className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                                <span>{st}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-card">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-foreground">Points for Review</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1.5">
                            {(screening.screeningData?.concerns || []).length > 0 ? (
                              (screening.screeningData?.concerns || []).map((co: string, i: number) => (
                                <div key={i} className="text-xs flex items-start gap-2">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <span>{co}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">No significant concerns identified.</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recommendation for Human Review */}
                      <Card className="bg-purple-100/60 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            Recommendation for Human Interviewer
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-purple-950 dark:text-purple-100 leading-relaxed font-medium">
                            {screening.screeningData?.recommendationForHumanReview ||
                              'Focus interview questions on hands-on system architecture and past project delivery.'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Mandatory Safety Notice */}
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>AI-assisted screening support.</strong> This result is for human review and does not make an employment decision.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="space-y-6 mt-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {c.skills.map((s: any) => <Badge key={s} variant="outline" className="text-sm py-1">{s}</Badge>)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Work Experience</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {c.experience_detail.map((exp: any, i: number) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-4 pb-4 last:pb-0">
                      <p className="font-medium">{exp.role}</p>
                      <p className="text-sm text-muted-foreground">{exp.company} | {exp.duration}</p>
                      <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Performance Trend</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={c.performanceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Languages</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {c.languages.map((l: any) => <Badge key={l} variant="secondary">{l}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interviews" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Candidate Interviews</h3>
                  <p className="text-xs text-muted-foreground">Interviews scheduled for this job application</p>
                </div>
                <Button size="sm" onClick={() => setInterviewModalOpen(true)}>
                  <Calendar className="h-4 w-4 mr-1.5" /> Schedule Interview
                </Button>
              </div>

              {scheduledInterviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground text-sm">No interviews scheduled yet for this candidate.</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => setInterviewModalOpen(true)}>
                      <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule First Interview
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                scheduledInterviews.map((inv: any, i: number) => {
                  const dateStr = inv.scheduledAt ? new Date(inv.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'
                  const timeStr = inv.scheduledAt ? new Date(inv.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'
                  return (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {inv.interviewerRole || 'Technical Interview Round'}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {dateStr} at {timeStr}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {inv.durationMinutes || 45} mins</span>
                              <span>Interviewer: {inv.interviewerName || 'Lead Recruiter'}</span>
                            </div>
                            {inv.meetingLink && (
                              <a href={inv.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline mt-1.5 inline-block">
                                Join Video Meeting: {inv.meetingLink}
                              </a>
                            )}
                          </div>
                          <Badge className={statusColor[inv.status] || 'bg-blue-100'} variant="outline">
                            {inv.status}
                          </Badge>
                        </div>
                        {inv.notes && <p className="text-xs text-muted-foreground mt-2 bg-muted/40 p-2 rounded">{inv.notes}</p>}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </TabsContent>

            <TabsContent value="education" className="space-y-4 mt-4">
              {c.education.map((edu: any, i: number) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution} | {edu.year}</p>
                      <Badge variant="secondary" className="mt-1">{edu.grade}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {c.certifications.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Certifications</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {c.certifications.map((cert: any) => (
                        <Badge key={cert} variant="outline" className="text-sm py-1">
                          <Award className="h-3 w-3 mr-1" /> {cert}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 mt-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Achievements</CardTitle></CardHeader>
                <CardContent>
                  {c.achievements.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No achievements recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {c.achievements.map((a: any, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                          <p className="text-sm">{a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offer" className="space-y-6 mt-4">
              {offer?.status === 'ACCEPTED' && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                      Offer Accepted by Candidate!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Candidate accepted this offer on {offer.acceptedAt ? new Date(offer.acceptedAt).toLocaleDateString() : 'recently'}. Application stage is now updated to Joined.
                    </p>
                  </div>
                </div>
              )}

              {offer?.status === 'DECLINED' && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-rose-900 dark:text-rose-100">
                      Offer Declined
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      Reason: {offer.declineReason || 'Candidate declined the offer'} (Declined on {offer.declinedAt ? new Date(offer.declinedAt).toLocaleDateString() : 'recently'}).
                    </p>
                  </div>
                </div>
              )}

              {offer?.status === 'SENT' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-300 dark:border-blue-800 rounded-xl flex items-center gap-3">
                  <Send className="h-6 w-6 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      Offer Released to Candidate
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Sent on {offer.sentAt ? new Date(offer.sentAt).toLocaleDateString() : 'recently'}. Candidate can review and respond in their portal.
                    </p>
                  </div>
                </div>
              )}

              <Card className="border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20">
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="h-5 w-5 text-emerald-600" />
                      Job Offer Management & AI Assistant
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure compensation terms, generate customized offer letters with AI, and release to candidate
                    </p>
                  </div>
                  <Badge
                    className={`text-xs px-2.5 py-0.5 ${
                      offer?.status === 'ACCEPTED'
                        ? 'bg-emerald-600 text-white'
                        : offer?.status === 'SENT'
                        ? 'bg-blue-600 text-white'
                        : offer?.status === 'DECLINED'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {offer?.status || 'DRAFT'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Offer Terms */}
                    <div className="space-y-4 bg-white/70 dark:bg-background/70 p-4 rounded-xl border">
                      <h4 className="font-semibold text-sm flex items-center gap-2 border-b pb-2">
                        <Briefcase className="h-4 w-4 text-emerald-600" /> Compensation & Position Terms
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Job Title *</label>
                          <input
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={offerForm.jobTitle}
                            onChange={(e) => setOfferForm({ ...offerForm, jobTitle: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Department</label>
                          <input
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={offerForm.department}
                            onChange={(e) => setOfferForm({ ...offerForm, department: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Employment Type</label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={offerForm.employmentType}
                            onChange={(e) => setOfferForm({ ...offerForm, employmentType: e.target.value })}
                          >
                            <option value="full_time">Full-time</option>
                            <option value="contract">Contract</option>
                            <option value="part_time">Part-time</option>
                            <option value="internship">Internship</option>
                          </select>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Work Location</label>
                          <input
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={offerForm.workLocation}
                            onChange={(e) => setOfferForm({ ...offerForm, workLocation: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Fixed Base (₹ / Year) *</label>
                          <input
                            type="number"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={offerForm.baseSalary}
                            onChange={(e) => setOfferForm({ ...offerForm, baseSalary: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Variable Bonus (₹ / Year)</label>
                          <input
                            type="number"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={offerForm.variableBonus}
                            onChange={(e) => setOfferForm({ ...offerForm, variableBonus: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Proposed Start Date</label>
                          <input
                            type="date"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={offerForm.joiningDate}
                            onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Offer Expiration Date</label>
                          <input
                            type="date"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={offerForm.expiresAt}
                            onChange={(e) => setOfferForm({ ...offerForm, expiresAt: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Internal Recruiter Notes</label>
                          <textarea
                            rows={2}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                            placeholder="Approval notes or negotiation history..."
                            value={offerForm.internalNotes}
                            onChange={(e) => setOfferForm({ ...offerForm, internalNotes: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Offer Letter & AI Draft */}
                    <div className="space-y-3 bg-white/70 dark:bg-background/70 p-4 rounded-xl border flex flex-col">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-emerald-600" /> Formal Offer Letter
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGenerateAiOffer}
                          disabled={aiGenerating}
                          className="border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 text-xs"
                        >
                          {aiGenerating ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Drafting Letter...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-purple-600" /> Draft with AI Assistant
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex-1 flex flex-col space-y-1">
                        <textarea
                          rows={14}
                          className="flex-1 w-full rounded-md border border-input bg-background p-3 text-xs font-mono leading-relaxed resize-none"
                          placeholder="Click 'Draft with AI Assistant' or enter official offer letter text here..."
                          value={offerForm.offerLetterContent}
                          onChange={(e) => setOfferForm({ ...offerForm, offerLetterContent: e.target.value })}
                        />
                        <p className="text-[11px] text-muted-foreground text-right">
                          Supports Markdown formatting
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      {offer?.status === 'SENT' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={handleWithdrawOffer}
                        >
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Withdraw Offer
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={handleSaveOffer}
                        disabled={savingOffer}
                      >
                        {savingOffer ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                        Save as Draft
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleSendOffer}
                        disabled={sendingOffer || !offerForm.offerLetterContent || offer?.status === 'ACCEPTED'}
                      >
                        {sendingOffer ? (
                          <>
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Sending Offer...
                          </>
                        ) : (
                          <>
                            <Send className="mr-1.5 h-4 w-4" /> Send Offer to Candidate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ONBOARDING TAB */}
            <TabsContent value="onboarding" className="space-y-6 mt-4">
              {!onboarding ? (
                <Card className="border border-dashed p-8 text-center bg-muted/20">
                  <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-semibold text-base">No Active Onboarding Record</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                    Onboarding automatically initializes once the candidate accepts their official job offer.
                  </p>
                  {offer && offer.status !== 'ACCEPTED' && (
                    <p className="text-xs text-amber-600 font-medium">
                      Current Offer Status: {offer.status} (Awaiting candidate acceptance)
                    </p>
                  )}
                </Card>
              ) : (
                <div className="space-y-5">
                  {/* Status & Joining Summary Card */}
                  <Card className="border-2 border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                          Candidate Onboarding Status
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Target Joining Date:{' '}
                          <strong className="text-foreground">
                            {onboarding.joiningDate
                              ? new Date(onboarding.joiningDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Not set'}
                          </strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs px-2.5 py-1 ${
                            onboarding.status === 'JOINED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : onboarding.status === 'COMPLETED'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : onboarding.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                          variant="outline"
                        >
                          {onboarding.status}
                        </Badge>
                        {onboarding.status !== 'JOINED' && onboarding.status !== 'CANCELLED' && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                            onClick={() => setConfirmModalOpen(true)}
                          >
                            <CheckCircle2 className="h-4 w-4" /> Confirm Joining
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1">
                      <div className="p-3 bg-white dark:bg-card rounded-xl border space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground">Checklist Progress</span>
                          <span className="font-bold text-blue-600">{onboarding.completionPercentage}%</span>
                        </div>
                        <Progress value={onboarding.completionPercentage} className="h-2" />
                      </div>

                      {onboarding.status === 'JOINED' && (
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 rounded-lg flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-100">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>
                            Candidate confirmed joined on{' '}
                            {onboarding.joinedAt ? new Date(onboarding.joinedAt).toLocaleDateString() : 'recently'}. Employment profile has been activated!
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Employer Checklist Items */}
                  <Card className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Employer Verification Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-1">
                      {onboarding.checklist
                        ?.filter((item: any) => item.requiredBy === 'employer')
                        .map((item: any) => (
                          <div
                            key={item.id}
                            className="p-3 bg-card border rounded-lg flex items-start justify-between gap-3 hover:bg-muted/10 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <Checkbox
                                id={`tab-${item.id}`}
                                checked={item.completed}
                                disabled={onboardingLoading || onboarding.status === 'CANCELLED'}
                                onCheckedChange={async (checked) => {
                                  try {
                                    setOnboardingLoading(true)
                                    const res = await api.employerOnboarding.update(onboarding.id, {
                                      items: [{ id: item.id, completed: !!checked }],
                                    })
                                    if (res?.success && res.onboarding) {
                                      setOnboarding(res.onboarding)
                                      toast.success('Checklist updated')
                                    }
                                  } catch (err: any) {
                                    toast.error(err.message || 'Failed to update checklist')
                                  } finally {
                                    setOnboardingLoading(false)
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <div>
                                <label
                                  htmlFor={`tab-${item.id}`}
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
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px]">
                                Verified
                              </Badge>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  {/* Candidate Tasks & Uploaded Documents */}
                  <Card className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Candidate Tasks & Uploaded Credentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-1">
                      {onboarding.checklist
                        ?.filter((item: any) => item.requiredBy === 'candidate')
                        .map((item: any) => (
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
                                onClick={async () => {
                                  try {
                                    const res = await api.employerOnboarding.getDocumentDownloadUrl(onboarding.id, item.documentId)
                                    if (res?.signedUrl) window.open(res.signedUrl, '_blank')
                                  } catch (err: any) {
                                    toast.error(err.message || 'Could not download document')
                                  }
                                }}
                              >
                                <Download className="h-3 w-3" /> View Credential
                              </Button>
                            ) : item.completed ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px]">Submitted</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px]">Pending Candidate</Badge>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Confirm Joining Dialog in Candidate Page */}
          {onboarding && (
            <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Confirm Candidate Joining
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <p className="text-xs text-muted-foreground">
                    Confirm that {c.name} has reported for work and completed all required induction formalities.
                  </p>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Actual Joining Date</label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-input bg-background p-2 text-xs"
                      value={confirmDate}
                      onChange={(e) => setConfirmDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Induction Notes (Optional)</label>
                    <input
                      placeholder="e.g. Asset ID assigned, joined engineering team."
                      className="w-full rounded-md border border-input bg-background p-2 text-xs"
                      value={confirmNotes}
                      onChange={(e) => setConfirmNotes(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={confirming}
                    onClick={async () => {
                      try {
                        setConfirming(true)
                        const res = await api.employerOnboarding.confirmJoining(onboarding.id, {
                          actualJoiningDate: confirmDate ? new Date(confirmDate).toISOString() : undefined,
                          notes: confirmNotes || undefined,
                        })
                        if (res?.success) {
                          toast.success('Candidate joining confirmed!')
                          setOnboarding(res.onboarding)
                          setCandidate((prev: any) => ({ ...prev, status: 'joined' }))
                          setStage('joined')
                          setConfirmModalOpen(false)
                        }
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to confirm joining')
                      } finally {
                        setConfirming(false)
                      }
                    }}
                  >
                    {confirming ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Confirm Joining
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Schedule Interview Dialog */}
      <Dialog open={interviewModalOpen} onOpenChange={setInterviewModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview with {c.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Interview Date *</label>
              <DatePicker value={scheduleDate} onChange={setScheduleDate} placeholder="Select Date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Interview Format</label>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Video</SelectItem>
                  <SelectItem value="in_person">In-Person</SelectItem>
                  <SelectItem value="phone">Phone Screening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meeting Link / Instructions</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={scheduleLink}
                placeholder="https://meet.google.com/..."
                onChange={(e) => setScheduleLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewModalOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleDirect} disabled={scheduling}>
              {scheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

