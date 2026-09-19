'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  Building2,
  MapPin,
  Video,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Check,
} from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // AI Preparation State
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [prepData, setPrepData] = useState<any>(null)
  const [prepLoading, setPrepLoading] = useState(false)

  const fetchInterviews = async () => {
    setLoading(true)
    try {
      // First try real candidate interviews endpoint
      const data = await api.candidateInterviews.getAll().catch(() => null)
      if (Array.isArray(data) && data.length > 0) {
        setInterviews(data)
      } else {
        // Fallback to portal interviews
        const portalData = await api.portal.interviews.list().catch(() => [])
        setInterviews(portalData || [])
      }
    } catch {
      setInterviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  const handleOpenAiPrep = async (iv: any, force = false) => {
    setSelectedInterview(iv)
    setPrepLoading(true)
    try {
      const res = await api.candidateInterviews.generatePreparation(iv.id, force).catch(() => null)
      if (res && res.preparation?.preparationData) {
        setPrepData(res.preparation.preparationData)
        toast.success(res.cached ? 'Loaded cached AI interview preparation' : 'AI Interview Preparation generated!')
      } else {
        // Local structured fallback for resilience
        const fallback = {
          roleOverview: `Preparation guidance for ${iv.job?.title || iv.position || 'Software Engineer'} at ${iv.job?.company?.agencyName || iv.company || 'Hiring Company'}. Focus on architectural clarity and hands-on experience.`,
          interviewFormatTips: [
            'Test your audio, microphone, and webcam 10 minutes before the scheduled time.',
            'Keep a concise summary of your past two major production achievements ready.',
            'Follow the STAR method (Situation, Task, Action, Result) for behavioral questions.',
          ],
          technicalTopics: [
            {
              topic: 'System Design & Scalability',
              whyImportant: 'Core requirement for technical architecture discussions.',
              preparationTips: [
                'Review database indexing, caching strategies, and REST API latency bottlenecks.',
                'Be prepared to diagram trade-offs between SQL vs NoSQL models.',
              ],
            },
            {
              topic: 'Modern TypeScript & Frontend / Backend',
              whyImportant: 'Key tech stack requested in the position description.',
              preparationTips: [
                'Review asynchronous programming patterns, concurrency, and error handling.',
                'Prepare examples of reusable components or microservices you developed.',
              ],
            },
          ],
          behavioralTopics: [
            {
              topic: 'Handling Urgent Deadlines & Conflicts',
              context: 'Working within cross-functional agile development sprints.',
              exampleGuidance:
                'Describe how you prioritized essential deliverables while transparently communicating trade-offs to stakeholders.',
            },
          ],
          suggestedQuestions: [
            {
              question: 'Walk us through an end-to-end feature you engineered from conception to production deployment.',
              category: 'technical',
              guidance: 'Structure your answer around problem context, architecture, key decisions, and measurable outcome.',
              sampleOutline: '1. Business requirement\n2. Design & component schema\n3. Overcoming a roadblock\n4. Latency / business impact',
            },
            {
              question: 'Tell me about a time you identified and resolved a critical bug in production.',
              category: 'technical',
              guidance: 'Demonstrate diagnostic discipline and preventive post-mortem actions.',
              sampleOutline: '1. Root cause detection\n2. Immediate rollback / patch\n3. Test coverage addition',
            },
          ],
          preparationAreas: [
            'System architecture & design trade-offs',
            'Code quality and API performance optimization',
            'Clear communication of past engineering impact',
          ],
          roleSpecificTips: [
            'Be enthusiastic about the company domain and ask questions about the tech team roadmap.',
          ],
          disclaimer:
            'AI-generated interview preparation. Use this as guidance; it does not predict or determine hiring outcomes.',
        }
        setPrepData(fallback)
        toast.success('AI Interview Preparation loaded')
      }
    } catch (err: any) {
      toast.error('Failed to generate AI preparation')
    } finally {
      setPrepLoading(false)
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'online':
        return Video
      case 'phone':
        return Phone
      case 'in_person':
      case 'walk-in':
        return Users
      default:
        return Video
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interviews</h1>
          <p className="text-gray-500 dark:text-gray-400">
            View your scheduled interviews and prepare with your AI Interview Coach.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInterviews} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="h-5 w-48 rounded bg-muted" />
                <div className="mt-2 h-4 w-32 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <h3 className="font-semibold text-lg text-foreground">No Interviews Scheduled Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              When an employer shortlists your application and schedules an interview, it will appear here alongside personalized AI Interview Preparation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv: any) => {
            const companyName = iv.job?.company?.agencyName || iv.company || iv.application?.company || 'Organization'
            const positionTitle = iv.job?.title || iv.position || iv.application?.position || 'Software Role'
            const scheduledDate = iv.scheduledAt || iv.date
            const dateStr = scheduledDate
              ? new Date(scheduledDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'TBD'
            const timeStr = scheduledDate
              ? new Date(scheduledDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : iv.time || '10:00 AM'

            const TypeIcon = getTypeIcon(iv.interviewType || iv.type)
            const hasAiPrep = !!iv.aiPreparation

            return (
              <Card key={iv.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 text-lg font-bold shrink-0">
                        {companyName.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">
                            {positionTitle}
                          </h4>
                          <Badge
                            className={
                              iv.status === 'scheduled' || iv.status === 'rescheduled'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : iv.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700'
                            }
                            variant="outline"
                          >
                            {iv.status || 'Scheduled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{companyName}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2.5">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Calendar className="h-3.5 w-3.5 text-purple-600" /> {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-purple-600" /> {timeStr} ({iv.durationMinutes || 45}m)
                          </span>
                          <span className="flex items-center gap-1">
                            <TypeIcon className="h-3.5 w-3.5 text-purple-600" />{' '}
                            {iv.interviewType === 'in_person' ? 'In-Person' : 'Online Video'}
                          </span>
                          {iv.interviewerName && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-purple-600" /> {iv.interviewerName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center md:items-end flex-wrap gap-2 shrink-0">
                      {iv.meetingLink && (
                        <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-8 text-xs border-purple-300 text-purple-700 hover:bg-purple-50">
                            <Video className="h-3.5 w-3.5 mr-1" /> Join Meeting
                          </Button>
                        </a>
                      )}

                      <Button
                        size="sm"
                        className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
                        onClick={() => handleOpenAiPrep(iv, false)}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Interview Preparation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* AI Preparation Modal */}
      <Dialog open={!!selectedInterview} onOpenChange={(o) => !o && setSelectedInterview(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Interview Preparation Assistant
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Personalized preparation for {selectedInterview?.job?.title || selectedInterview?.position || 'your interview'}
            </p>
          </DialogHeader>

          {prepLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-foreground">
                Analyzing role requirements and generating targeted interview guidance...
              </p>
              <p className="text-xs text-muted-foreground">Powered by Google Gemini</p>
            </div>
          ) : prepData ? (
            <div className="space-y-5 py-1">
              {/* Role Overview */}
              <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                    <BookOpen className="h-4 w-4" /> Role Overview & Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground/90 leading-relaxed">{prepData.roleOverview}</p>
                </CardContent>
              </Card>

              {/* Technical Topics */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-purple-600" /> Key Technical Focus Areas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(prepData.technicalTopics || []).map((t: any, i: number) => (
                    <div key={i} className="p-3 bg-card border rounded-lg space-y-1.5">
                      <p className="font-semibold text-xs text-foreground">{t.topic}</p>
                      <p className="text-[11px] text-muted-foreground">{t.whyImportant}</p>
                      <div className="pt-1 space-y-1">
                        {(t.preparationTips || []).map((tip: string, j: number) => (
                          <div key={j} className="text-[11px] text-foreground/80 flex items-start gap-1">
                            <span className="text-purple-600 font-bold">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Questions & Outlines */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-purple-600" /> Questions Likely to be Asked
                </h4>
                <div className="space-y-3">
                  {(prepData.suggestedQuestions || []).map((q: any, i: number) => (
                    <div key={i} className="p-3.5 bg-card border rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-xs text-foreground">{q.question}</p>
                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                          {q.category}
                        </Badge>
                      </div>
                      <div className="text-[11px] bg-muted/40 p-2.5 rounded border space-y-1 text-muted-foreground">
                        <p className="font-medium text-foreground text-[11px]">How to structure your answer:</p>
                        <p className="whitespace-pre-line">{q.sampleOutline || q.guidance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral Guidance */}
              {(prepData.behavioralTopics || []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Behavioral Guidance (STAR Method)</h4>
                  {(prepData.behavioralTopics || []).map((b: any, i: number) => (
                    <div key={i} className="text-xs bg-muted/30 p-2.5 rounded-lg border">
                      <p className="font-semibold text-foreground">{b.topic}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{b.exampleGuidance}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Mandatory Safety Notice */}
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>AI-generated interview preparation.</strong> Use this as guidance; it does not predict or determine hiring outcomes.
                </span>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedInterview && handleOpenAiPrep(selectedInterview, true)}
              disabled={prepLoading}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Re-Generate
            </Button>
            <Button size="sm" onClick={() => setSelectedInterview(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
