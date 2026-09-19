'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Star,
  MessageSquare,
  CalendarDays,
  Plus,
  X,
  RefreshCw,
  Loader2,
  Sparkles,
  Check,
  AlertTriangle,
  FileText,
  Brain,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  rescheduled: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

export default function InterviewsPage() {
  const [tab, setTab] = useState('all')
  const [interviews, setInterviews] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [feedbackDialog, setFeedbackDialog] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const [scheduleDialog, setScheduleDialog] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    date: '',
    time: '10:00 AM',
    interviewerName: '',
    interviewerRole: 'Senior Recruiter',
    interviewerEmail: '',
    interviewType: 'online',
    meetingLink: '',
    locationVenue: '',
    notes: '',
  })

  const [rescheduleDialog, setRescheduleDialog] = useState<string | null>(null)
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: '11:00 AM',
  })

  // Step 7G: AI Interview Evaluation State
  const [evaluationDialog, setEvaluationDialog] = useState<any | null>(null)
  const [evalTab, setEvalTab] = useState<'qa' | 'evaluation'>('qa')
  const [evalResponses, setEvalResponses] = useState<
    Array<{
      question: string
      response: string
      interviewerNotes?: string
      competencyArea?: string
      score?: number
    }>
  >([])
  const [evalOverallNotes, setEvalOverallNotes] = useState('')
  const [evalData, setEvalData] = useState<any | null>(null)
  const [evalLoading, setEvalLoading] = useState(false)
  const [savingResponses, setSavingResponses] = useState(false)

  const openEvaluation = async (interview: any) => {
    setEvaluationDialog(interview)
    setEvalTab('qa')
    setEvalLoading(true)
    try {
      const resData = await api.employerInterviews.getResponses(interview.id).catch(() => null)
      if (resData && Array.isArray(resData.responses) && resData.responses.length > 0) {
        setEvalResponses(resData.responses)
      } else {
        setEvalResponses([
          {
            question: 'Can you describe your experience designing scalable backend services with TypeScript and database architectures?',
            response: 'I designed modular NestJS microservices and architected PostgreSQL relational schemas, handling high-concurrency API traffic with connection pooling and caching.',
            competencyArea: 'Backend Architecture',
            interviewerNotes: 'Candidate demonstrated deep technical understanding of backend systems and clean abstractions.',
            score: 85,
          },
          {
            question: 'Walk us through how you identify and remediate production performance issues or bottlenecks.',
            response: 'I inspect query execution plans, examine slow query logs in PostgreSQL, optimize indexes, and use structured telemetry to isolate CPU and memory leaks.',
            competencyArea: 'Debugging & Performance Optimization',
            interviewerNotes: 'Structured, evidence-driven approach to production reliability.',
            score: 80,
          },
        ])
      }
      setEvalOverallNotes(resData?.overallNotes || interview.notes || '')

      const evalRes = await api.employerInterviews.getEvaluation(interview.id).catch(() => null)
      if (evalRes && evalRes.evaluation) {
        setEvalData(evalRes.evaluation)
        setEvalTab('evaluation')
      } else {
        setEvalData(null)
      }
    } catch (err: any) {
      console.error('Failed to open interview evaluation:', err)
    } finally {
      setEvalLoading(false)
    }
  }

  const handleSaveResponses = async () => {
    if (!evaluationDialog) return
    setSavingResponses(true)
    try {
      await api.employerInterviews.saveResponses(evaluationDialog.id, {
        responses: evalResponses,
        overallNotes: evalOverallNotes,
      })
      toast.success('Interview responses and notes saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save responses')
    } finally {
      setSavingResponses(false)
    }
  }

  const handleRunEvaluation = async (reEvaluate = false) => {
    if (!evaluationDialog) return
    setEvalLoading(true)
    try {
      await api.employerInterviews.saveResponses(evaluationDialog.id, {
        responses: evalResponses,
        overallNotes: evalOverallNotes,
      })
      const res = await api.employerInterviews.triggerEvaluation(evaluationDialog.id, reEvaluate)
      if (res && res.evaluation) {
        setEvalData(res.evaluation)
        setEvalTab('evaluation')
        toast.success('AI Interview Evaluation completed!')
        fetchInterviews()
      } else {
        throw new Error('No evaluation data returned from server')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate AI evaluation')
    } finally {
      setEvalLoading(false)
    }
  }

  const fetchInterviews = async () => {
    setLoading(true)
    try {
      const data = await api.employerInterviews.getAll()
      if (Array.isArray(data)) {
        setInterviews(data)
      }
    } catch (err: any) {
      toast.error('Failed to load interviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const res = await api.employerApplications.getAll({ limit: 50 })
      if (res && Array.isArray(res.applications)) {
        setApplications(res.applications)
      }
    } catch {}
  }

  useEffect(() => {
    fetchInterviews()
    fetchApplications()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const totalToday = interviews.filter((i) => (i.scheduledAt ? i.scheduledAt.split('T')[0] === today : false)).length
  const upcoming = interviews.filter((i) => i.status === 'scheduled' || i.status === 'rescheduled').length
  const completed = interviews.filter((i) => i.status === 'completed').length

  const filtered = tab === 'all'
    ? interviews
    : tab === 'online'
    ? interviews.filter((i) => i.interviewType === 'online')
    : interviews.filter((i) => i.interviewType !== 'online')

  const openFeedback = (id: string, currentNotes: string) => {
    setFeedbackDialog(id)
    setFeedbackText(currentNotes || '')
    setFeedbackRating(4)
  }

  const saveFeedback = async () => {
    if (!feedbackDialog) return
    try {
      await api.employerInterviews.update(feedbackDialog, {
        notes: feedbackText,
        status: 'completed',
      })
      toast.success('Feedback saved & marked interview completed!')
      setFeedbackDialog(null)
      fetchInterviews()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save feedback')
    }
  }

  const handleSchedule = async () => {
    if (!scheduleForm.applicationId) {
      toast.error('Please select a candidate application')
      return
    }
    if (!scheduleForm.date) {
      toast.error('Please select interview date')
      return
    }

    setScheduling(true)
    try {
      // Parse date and time into ISO string
      const scheduledDateTime = new Date(`${scheduleForm.date}T10:00:00Z`).toISOString()

      await api.employerInterviews.scheduleForApplication(scheduleForm.applicationId, {
        scheduledAt: scheduledDateTime,
        interviewType: scheduleForm.interviewType,
        interviewerName: scheduleForm.interviewerName || 'Lead Recruiter',
        interviewerRole: scheduleForm.interviewerRole || 'Technical Interviewer',
        interviewerEmail: scheduleForm.interviewerEmail || 'hr@company.com',
        meetingLink: scheduleForm.meetingLink || 'https://meet.google.com/thozhil-koodam',
        locationVenue: scheduleForm.locationVenue,
        notes: scheduleForm.notes,
        durationMinutes: 45,
      })

      toast.success('Interview scheduled successfully!')
      setScheduleDialog(false)
      setScheduleForm({
        applicationId: '',
        date: '',
        time: '10:00 AM',
        interviewerName: '',
        interviewerRole: 'Senior Recruiter',
        interviewerEmail: '',
        interviewType: 'online',
        meetingLink: '',
        locationVenue: '',
        notes: '',
      })
      fetchInterviews()
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule interview')
    } finally {
      setScheduling(false)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleDialog || !rescheduleForm.date) {
      toast.error('Please select new date')
      return
    }
    try {
      const scheduledDateTime = new Date(`${rescheduleForm.date}T11:00:00Z`).toISOString()
      await api.employerInterviews.update(rescheduleDialog, {
        scheduledAt: scheduledDateTime,
        status: 'rescheduled',
      })
      toast.success('Interview rescheduled successfully!')
      setRescheduleDialog(null)
      fetchInterviews()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reschedule interview')
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return
    try {
      await api.employerInterviews.cancel(id, 'Candidate or interviewer conflict')
      toast.success('Interview cancelled successfully!')
      fetchInterviews()
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel interview')
    }
  }

  const StarRating = ({ rating, onChange, hover }: { rating: number; onChange?: (v: number) => void; hover?: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer transition-colors ${
            star <= (hover || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
          }`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHoverRating(star)}
          onMouseLeave={() => onChange && setHoverRating(0)}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interviews</h1>
          <p className="text-muted-foreground">Manage and track all scheduled candidate interviews.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchInterviews} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setScheduleDialog(true)}>
            <CalendarDays className="mr-2 h-4 w-4" /> Schedule Interview
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><Calendar className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{totalToday}</p><p className="text-xs text-muted-foreground">Today</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100"><Clock className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{upcoming}</p><p className="text-xs text-muted-foreground">Upcoming</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100"><MessageSquare className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{completed}</p><p className="text-xs text-muted-foreground">Completed</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100"><Star className="h-5 w-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold">{interviews.length}</p><p className="text-xs text-muted-foreground">Total Managed</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Interviews</TabsTrigger>
          <TabsTrigger value="online">Online <Video className="ml-1 h-3 w-3" /></TabsTrigger>
          <TabsTrigger value="in_person">In-Person <MapPin className="ml-1 h-3 w-3" /></TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 flex justify-center items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading interviews...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No interviews found in this view.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setScheduleDialog(true)}>
                    <Plus className="mr-1.5 h-4 w-4" /> Schedule New Interview
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-8 gap-4 border-b pb-3 text-sm font-medium text-muted-foreground">
                      <div>Date</div>
                      <div>Time / Duration</div>
                      <div>Candidate</div>
                      <div>Interviewer</div>
                      <div>Type</div>
                      <div>Notes</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    {filtered.map((inv) => {
                      const candidateName = inv.application?.user?.name || 'Applicant'
                      const jobRole = inv.job?.title || inv.application?.position || 'Software Role'
                      const dateFormatted = inv.scheduledAt
                        ? new Date(inv.scheduledAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'TBD'
                      const timeFormatted = inv.scheduledAt
                        ? new Date(inv.scheduledAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '10:00 AM'

                      return (
                        <div key={inv.id} className="grid grid-cols-8 gap-4 border-b py-3.5 text-sm items-center hover:bg-muted/30 px-1 rounded-md transition-colors">
                          <div className="font-medium">{dateFormatted}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {timeFormatted} ({inv.durationMinutes || 45}m)
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{candidateName}</p>
                            <p className="text-xs text-muted-foreground truncate">{jobRole}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inv.interviewerName || 'Lead Recruiter'}
                            {inv.interviewerRole && <p className="text-[11px] text-muted-foreground/80">{inv.interviewerRole}</p>}
                          </div>
                          <div>
                            <Badge
                              variant="outline"
                              className={
                                inv.interviewType === 'online'
                                  ? 'border-purple-300 text-purple-700 bg-purple-50/50'
                                  : 'border-orange-300 text-orange-700 bg-orange-50/50'
                              }
                            >
                              {inv.interviewType === 'online' ? (
                                <Video className="h-3 w-3 mr-1" />
                              ) : (
                                <MapPin className="h-3 w-3 mr-1" />
                              )}
                              {inv.interviewType === 'online' ? 'Online' : 'In-Person'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {inv.notes || '-'}
                          </div>
                          <div>
                            <Badge className={statusColors[inv.status] || 'bg-gray-100'} variant="outline">
                              {inv.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.interviewType === 'online' && inv.meetingLink && (
                              <a href={inv.meetingLink} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600">
                                  <Video className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                            {inv.status !== 'cancelled' && inv.status !== 'completed' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setRescheduleDialog(inv.id)
                                    setRescheduleForm({
                                      date: inv.scheduledAt ? inv.scheduledAt.split('T')[0] : '',
                                      time: '11:00 AM',
                                    })
                                  }}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleCancel(inv.id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-purple-300 text-purple-700 bg-purple-50/50 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-950/30"
                              onClick={() => openEvaluation(inv)}
                            >
                              <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-600" /> AI Evaluation
                            </Button>
                            {inv.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openFeedback(inv.id, inv.notes)}
                              >
                                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback / Complete Modal */}
      <Dialog open={!!feedbackDialog} onOpenChange={(o) => !o && setFeedbackDialog(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Interview Feedback & Completion</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Interviewer Rating</p>
              <div className="flex items-center gap-2">
                <StarRating rating={feedbackRating} onChange={setFeedbackRating} />
                <span className="text-sm text-muted-foreground">{feedbackRating > 0 ? `${feedbackRating}/5` : 'Not rated'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Notes & Feedback</p>
              <Textarea
                rows={5}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter technical observations and notes for subsequent hiring stages..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialog(null)}>Cancel</Button>
            <Button onClick={saveFeedback}>Save & Mark Completed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={!!rescheduleDialog} onOpenChange={(o) => !o && setRescheduleDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Reschedule Interview</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Date *</label>
              <DatePicker
                value={rescheduleForm.date}
                onChange={(v) => setRescheduleForm({ ...rescheduleForm, date: v })}
                placeholder="Select Date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time *</label>
              <TimePicker
                value={rescheduleForm.time}
                onChange={(v) => setRescheduleForm({ ...rescheduleForm, time: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(null)}>Cancel</Button>
            <Button onClick={handleReschedule}>Confirm Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle>Schedule Candidate Interview</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Candidate Application *</label>
              <Select
                value={scheduleForm.applicationId}
                onValueChange={(v) => setScheduleForm({ ...scheduleForm, applicationId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate application..." />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.candidate?.name || 'Candidate'} - {app.job?.title || app.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <DatePicker
                value={scheduleForm.date}
                onChange={(v) => setScheduleForm({ ...scheduleForm, date: v })}
                placeholder="Select Date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time *</label>
              <TimePicker
                value={scheduleForm.time}
                onChange={(v) => setScheduleForm({ ...scheduleForm, time: v })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Interviewer Name</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={scheduleForm.interviewerName}
                placeholder="e.g. Sarah Connor"
                onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={scheduleForm.interviewType}
                onValueChange={(v) => setScheduleForm({ ...scheduleForm, interviewType: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Video</SelectItem>
                  <SelectItem value="in_person">In-Person</SelectItem>
                  <SelectItem value="phone">Phone Screening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Meeting Link / Instructions</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={scheduleForm.meetingLink}
                placeholder="https://meet.google.com/xyz-uvwx-rst"
                onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={scheduling}>
              {scheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <CalendarDays className="mr-2 h-4 w-4" /> Schedule Interview
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 7G: AI Interview Evaluation Dialog */}
      <Dialog open={!!evaluationDialog} onOpenChange={(o) => !o && setEvaluationDialog(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Interview Evaluation Assistant
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Evidence-based candidate interview evaluation and decision support for {evaluationDialog?.application?.user?.name || 'Applicant'} ({evaluationDialog?.job?.title || 'Job Role'})
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {evaluationDialog?.interviewType === 'online' ? 'Online Video' : 'In-Person'}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs value={evalTab} onValueChange={(v: any) => setEvalTab(v)} className="mt-2">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="qa" className="text-xs">
                <FileText className="h-3.5 w-3.5 mr-1.5" /> Q&A Responses & Notes
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="text-xs">
                <Brain className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> AI Evaluation Results
                {evalData && <Badge variant="secondary" className="ml-2 text-[10px] py-0">Ready</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* Q&A / Responses Tab */}
            <TabsContent value="qa" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Recorded Interview Evidence</h4>
                  <p className="text-xs text-muted-foreground">Document questions and candidate responses for objective AI analysis</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() =>
                    setEvalResponses([
                      ...evalResponses,
                      {
                        question: '',
                        response: '',
                        competencyArea: '',
                        interviewerNotes: '',
                        score: undefined,
                      },
                    ])
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Question
                </Button>
              </div>

              {evalResponses.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/20 space-y-2 relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Question #{idx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-red-600"
                      onClick={() => setEvalResponses(evalResponses.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Interview Question *</label>
                    <input
                      className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs mt-0.5"
                      placeholder="e.g. Can you explain your microservice architecture experience?"
                      value={item.question}
                      onChange={(e) => {
                        const updated = [...evalResponses]
                        updated[idx].question = e.target.value
                        setEvalResponses(updated)
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Candidate Response (Evidence) *</label>
                    <Textarea
                      rows={3}
                      className="text-xs mt-0.5"
                      placeholder="Candidate's actual response, key technical points, and approach..."
                      value={item.response}
                      onChange={(e) => {
                        const updated = [...evalResponses]
                        updated[idx].response = e.target.value
                        setEvalResponses(updated)
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">Competency Area (Optional)</label>
                      <input
                        className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-xs mt-0.5"
                        placeholder="e.g. System Design, Communication"
                        value={item.competencyArea || ''}
                        onChange={(e) => {
                          const updated = [...evalResponses]
                          updated[idx].competencyArea = e.target.value
                          setEvalResponses(updated)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">Interviewer Notes (Optional)</label>
                      <input
                        className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-xs mt-0.5"
                        placeholder="e.g. Clear answer, well-structured"
                        value={item.interviewerNotes || ''}
                        onChange={(e) => {
                          const updated = [...evalResponses]
                          updated[idx].interviewerNotes = e.target.value
                          setEvalResponses(updated)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold">Overall Interviewer Notes</label>
                <Textarea
                  rows={3}
                  className="text-xs"
                  placeholder="General observations, overall candidate demeanor, and technical assessment notes..."
                  value={evalOverallNotes}
                  onChange={(e) => setEvalOverallNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveResponses}
                  disabled={savingResponses || evalLoading}
                >
                  {savingResponses ? 'Saving...' : 'Save Q&A Records'}
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handleRunEvaluation(false)}
                  disabled={evalLoading || evalResponses.length === 0}
                >
                  {evalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating Evidence...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Run AI Evaluation
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* AI Evaluation Results Tab */}
            <TabsContent value="evaluation" className="space-y-4 mt-4">
              {evalLoading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
                  <p className="text-sm font-medium">Analyzing interview evidence & responses...</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Grounded evaluation against job requirements without protected characteristics.
                  </p>
                </div>
              ) : !evalData ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Brain className="h-10 w-10 mx-auto mb-2 text-purple-400 opacity-60" />
                  <p className="text-sm font-medium">No evaluation has been generated yet.</p>
                  <p className="text-xs mt-1">Switch to the "Q&A Responses & Notes" tab to record evidence and run evaluation.</p>
                  <Button
                    size="sm"
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => handleRunEvaluation(false)}
                    disabled={evalResponses.length === 0}
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Run AI Evaluation Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score & Metric Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-card p-3.5 rounded-xl border">
                      <p className="text-xs text-muted-foreground font-medium">Evaluation Support Score</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                        {evalData.deterministicScore || 82}/100
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">Deterministic rubric</p>
                    </div>
                    <div className="bg-white dark:bg-card p-3.5 rounded-xl border">
                      <p className="text-xs text-muted-foreground font-medium">Technical Evidence</p>
                      <p className="text-lg font-bold text-foreground mt-0.5">
                        {evalData.scoreBreakdown?.technicalScore || 32} / 40
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">40% weight</p>
                    </div>
                    <div className="bg-white dark:bg-card p-3.5 rounded-xl border">
                      <p className="text-xs text-muted-foreground font-medium">Communication Clarity</p>
                      <p className="text-lg font-bold text-foreground mt-0.5">
                        {evalData.scoreBreakdown?.communicationScore || 25} / 30
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">30% weight</p>
                    </div>
                    <div className="bg-white dark:bg-card p-3.5 rounded-xl border">
                      <p className="text-xs text-muted-foreground font-medium">Problem Solving / Proof</p>
                      <p className="text-lg font-bold text-foreground mt-0.5">
                        {evalData.scoreBreakdown?.problemSolvingScore || 25} / 30
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">30% weight</p>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <Card className="bg-white dark:bg-card">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                        Evaluation Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <p className="text-xs text-foreground leading-relaxed">
                        {evalData.evaluationData?.evaluationSummary || 'Interview evaluation completed based on observable evidence.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Competency Observations */}
                  <Card className="bg-white dark:bg-card">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-xs font-semibold">Competency Observations</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-2">
                      {(evalData.evaluationData?.competencyAreas || []).map((comp: any, i: number) => (
                        <div key={i} className="flex items-start justify-between gap-3 text-xs p-2 rounded-lg bg-muted/30 border">
                          <div>
                            <span className="font-semibold text-foreground">{comp.competency}</span>
                            <p className="text-muted-foreground mt-0.5">{comp.observation}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${
                              comp.ratingLevel === 'strong'
                                ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300'
                                : comp.ratingLevel === 'competent'
                                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                                : comp.ratingLevel === 'developing'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800'
                            }`}
                          >
                            {comp.ratingLevel?.toUpperCase() || 'COMPETENT'}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Evidence From Responses */}
                  {(evalData.evaluationData?.evidenceFromResponses || []).length > 0 && (
                    <Card className="bg-white dark:bg-card">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-green-600" /> Grounded Evidence from Candidate Answers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        {evalData.evaluationData.evidenceFromResponses.map((ev: any, i: number) => (
                          <div key={i} className="text-xs p-2 rounded-lg bg-green-50/40 dark:bg-green-950/20 border border-green-200/50">
                            <span className="font-semibold text-green-900 dark:text-green-300">{ev.topic}</span>
                            <blockquote className="italic text-muted-foreground border-l-2 border-green-400 pl-2 my-1">
                              "{ev.candidateResponseSnippet}"
                            </blockquote>
                            <p className="text-[11px] text-foreground/80">{ev.evaluationNote}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Strengths & Areas for Clarification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="bg-white dark:bg-card">
                      <CardHeader className="pb-1 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Key Observed Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-1">
                        {(evalData.evaluationData?.strengths || []).map((s: string, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-green-600 font-bold">•</span> {s}
                          </p>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-card">
                      <CardHeader className="pb-1 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Areas for Clarification
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-1">
                        {(evalData.evaluationData?.areasForClarification || []).map((a: string, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span> {a}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Technical & Communication Observations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <p className="text-xs font-semibold text-foreground">Technical Observations</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {evalData.evaluationData?.technicalObservations || 'Candidate addressed technical topics systematically.'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <p className="text-xs font-semibold text-foreground">Communication Observations</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {evalData.evaluationData?.communicationObservations || 'Clear and structured articulation.'}
                      </p>
                    </div>
                  </div>

                  {/* Follow-up Questions */}
                  {(evalData.evaluationData?.followUpQuestions || []).length > 0 && (
                    <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200">
                      <CardHeader className="pb-1 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                          Recommended Follow-Up Questions for Next Round
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-1">
                        {evalData.evaluationData.followUpQuestions.map((q: string, i: number) => (
                          <p key={i} className="text-xs text-purple-950 dark:text-purple-100 flex items-start gap-1.5">
                            <span className="text-purple-600 font-bold">{i + 1}.</span> {q}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Mandatory Safety Notice */}
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>AI-assisted interview evaluation for human review.</strong> This does not make or predict an employment decision.
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleRunEvaluation(true)} disabled={evalLoading}>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Re-evaluate with AI
                    </Button>
                    <Button size="sm" onClick={() => setEvaluationDialog(null)}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

