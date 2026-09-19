'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Briefcase, Building2, MapPin, Calendar, Clock, ChevronRight, Eye, X,
  CheckCircle2, Loader2, Circle, FileText, User, CalendarDays, AlertCircle,
  Gift, Check, IndianRupee, UserCheck,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import Link from 'next/link'

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Applied':
    case 'applied': return 'bg-blue-100 text-blue-700'
    case 'Under Review':
    case 'screening': return 'bg-amber-100 text-amber-700'
    case 'Interview':
    case 'interview': return 'bg-purple-100 text-purple-700'
    case 'Offer':
    case 'offer': return 'bg-green-100 text-green-700'
    case 'Rejected':
    case 'rejected': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const timelineData = [
  { stage: 'Application Submitted', date: 'Just now', done: true },
  { stage: 'Resume Shortlisted', date: 'Pending', done: false, current: true },
  { stage: 'Phone Screening', date: 'TBD', done: false },
  { stage: 'Technical Round', date: 'TBD', done: false },
  { stage: 'HR Round', date: 'TBD', done: false },
  { stage: 'Offer', date: 'TBD', done: false },
]

export default function ApplicationsPage() {
  const [selectedApp, setSelectedApp] = useState<string | number | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [selectedOfferApp, setSelectedOfferApp] = useState<any>(null)
  const [currentOffer, setCurrentOffer] = useState<any>(null)
  const [offerLoading, setOfferLoading] = useState(false)
  const [responding, setResponding] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [showDeclineInput, setShowDeclineInput] = useState(false)

  const openOfferDialog = async (app: any) => {
    setSelectedOfferApp(app)
    setOfferModalOpen(true)
    setOfferLoading(true)
    setShowDeclineInput(false)
    setDeclineReason('')
    try {
      const res = await api.candidateOffers.getOffer(app.id)
      if (res && res.offer) {
        setCurrentOffer(res.offer)
      } else {
        setCurrentOffer(null)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load offer details')
      setCurrentOffer(null)
    } finally {
      setOfferLoading(false)
    }
  }

  const handleRespondOffer = async (action: 'accept' | 'decline') => {
    if (!selectedOfferApp) return
    setResponding(true)
    try {
      const res = await api.candidateOffers.respond(selectedOfferApp.id, {
        action,
        reason: action === 'decline' ? declineReason : undefined,
      })
      if (res && res.offer) {
        setCurrentOffer(res.offer)
        const updatedStatus = action === 'accept' ? 'joined' : 'declined'
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedOfferApp.id ? { ...a, status: updatedStatus } : a))
        )
        if (action === 'accept') {
          toast.success('🎉 Congratulations! You have accepted the job offer!')
        } else {
          toast.success('Offer declined.')
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to respond to offer')
    } finally {
      setResponding(false)
    }
  }

  useEffect(() => {
    Promise.all([
      api.portal.applications.list().catch(() => []),
      api.portal.interviews.list().catch(() => [])
    ]).then(([apps, ivs]) => {
      if (Array.isArray(apps)) setApplications(apps)
      if (Array.isArray(ivs)) setInterviews(ivs)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your job applications</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">{applications.length} Total</Badge>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="gap-2"><Briefcase className="h-4 w-4" /> Application List</TabsTrigger>
          <TabsTrigger value="tracker" className="gap-2"><Clock className="h-4 w-4" /> Tracker</TabsTrigger>
          <TabsTrigger value="interviews" className="gap-2"><CalendarDays className="h-4 w-4" /> Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading applications...</div>
              ) : applications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No job applications submitted yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium text-gray-500">Application ID</th>
                      <th className="text-left p-4 font-medium text-gray-500">Company</th>
                      <th className="text-left p-4 font-medium text-gray-500">Position</th>
                      <th className="text-left p-4 font-medium text-gray-500">Applied Date</th>
                      <th className="text-left p-4 font-medium text-gray-500">Agency</th>
                      <th className="text-left p-4 font-medium text-gray-500">Consultant</th>
                      <th className="text-left p-4 font-medium text-gray-500">Stage</th>
                      <th className="text-left p-4 font-medium text-gray-500">Status</th>
                      <th className="text-left p-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app: any) => (
                      <tr key={app.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="p-4 font-mono text-xs text-gray-400">#APP-{String(app.id).slice(-4).toUpperCase()}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 text-xs font-bold">
                              {app.logo || app.company?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{app.company}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-700 dark:text-gray-300">{app.position}</td>
                        <td className="p-4 text-gray-500">{app.appliedDate || (app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A')}</td>
                        <td className="p-4 text-gray-500">{app.agency || 'Direct'}</td>
                        <td className="p-4 text-gray-500">{app.consultant || 'N/A'}</td>
                        <td className="p-4"><Badge variant="outline" className="text-xs">{app.stage || 'Submitted'}</Badge></td>
                        <td className="p-4"><Badge className={`text-xs ${getStatusColor(app.status)}`}>{app.status}</Badge></td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            {app.status === 'offer' || app.status === 'joined' ? (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 gap-1 shadow-sm"
                                onClick={() => openOfferDialog(app)}
                              >
                                <Gift className="h-3.5 w-3.5" />
                                {app.status === 'joined' ? 'View Offer' : 'Review Offer'}
                              </Button>
                            ) : null}
                            <Button variant="ghost" size="sm" onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracker" className="mt-6 space-y-6">
          {applications.slice(0, 2).map(app => (
            <Card key={app.id} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 text-xs font-bold">{app.logo}</div>
                  <div>
                    <CardTitle className="text-base">{app.position}</CardTitle>
                    <p className="text-sm text-gray-500">{app.company}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${getStatusColor(app.status)}`}>{app.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Progress value={app.id === 1 ? 60 : 33} className="h-2 flex-1" />
                  <span className="text-sm font-medium text-purple-600">{app.id === 1 ? '60' : '33'}%</span>
                </div>
                <div className="space-y-3">
                  {timelineData.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {step.done ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : step.current ? (
                          <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        {i < timelineData.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${step.done ? 'text-gray-900 dark:text-white' : step.current ? 'text-purple-600' : 'text-gray-400'}`}>{step.stage}</p>
                        <p className="text-xs text-gray-400">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="interviews" className="mt-6 space-y-4">
          {interviews.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center"><Calendar className="h-8 w-8 mx-auto text-gray-300 mb-2" /><p className="text-gray-500">No interviews scheduled.</p></CardContent></Card>
          ) : interviews.map((iv: any) => (
            <Card key={iv.id} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 text-lg font-bold">{iv.company?.[0] || 'I'}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{iv.position}</p>
                    <p className="text-sm text-gray-500">{iv.company}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {iv.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {iv.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={iv.type === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>{iv.type}</Badge>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Candidate Job Offer Review Dialog */}
      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Gift className="h-5 w-5 text-emerald-600" />
              Official Offer of Employment
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {selectedOfferApp?.position} at {selectedOfferApp?.company}
            </p>
          </DialogHeader>

          {offerLoading ? (
            <div className="py-12 text-center text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-sm">Loading official offer terms...</p>
            </div>
          ) : !currentOffer ? (
            <div className="py-8 text-center text-gray-500">
              <p>No offer details currently available.</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {currentOffer.status === 'ACCEPTED' && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>You have accepted this job offer. Complete your onboarding checklist!</span>
                  </div>
                  <Link href="/candidate/onboarding">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shrink-0">
                      <UserCheck className="h-3.5 w-3.5" />
                      Open Onboarding Portal
                    </Button>
                  </Link>
                </div>
              )}

              {currentOffer.status === 'DECLINED' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 rounded-lg flex items-center gap-2 text-rose-800 dark:text-rose-200 text-sm">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>You declined this offer. Reason: {currentOffer.declineReason || 'Not specified'}.</span>
                </div>
              )}

              {/* Offer Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-muted/40 rounded-lg border text-center">
                  <span className="text-[11px] text-muted-foreground block">Fixed Compensation</span>
                  <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    {currentOffer.currency} {currentOffer.baseSalary?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 block">/ {currentOffer.salaryPeriod}</span>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border text-center">
                  <span className="text-[11px] text-muted-foreground block">Variable Bonus</span>
                  <span className="font-bold text-sm">
                    {currentOffer.variableBonus ? `${currentOffer.currency} ${currentOffer.variableBonus?.toLocaleString()}` : 'Discretionary'}
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border text-center">
                  <span className="text-[11px] text-muted-foreground block">Joining Date</span>
                  <span className="font-bold text-sm">
                    {currentOffer.joiningDate ? new Date(currentOffer.joiningDate).toLocaleDateString() : 'Mutual'}
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border text-center">
                  <span className="text-[11px] text-muted-foreground block">Work Location</span>
                  <span className="font-bold text-sm truncate block">
                    {currentOffer.workLocation || 'Chennai, India'}
                  </span>
                </div>
              </div>

              {/* Benefits list */}
              {currentOffer.parsedBenefits && currentOffer.parsedBenefits.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Included Benefits & Perks:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentOffer.parsedBenefits.map((b: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs bg-white dark:bg-background border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                        <Check className="h-3 w-3 mr-1 text-emerald-600" /> {b}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatted Offer Letter Body */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Offer Letter:</span>
                <div className="p-4 bg-muted/20 border rounded-lg max-h-[300px] overflow-y-auto whitespace-pre-line text-xs leading-relaxed font-sans font-normal">
                  {currentOffer.offerLetterContent}
                </div>
              </div>

              {/* Decline Reason Input (if triggered) */}
              {showDeclineInput && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg space-y-2">
                  <label className="text-xs font-medium text-rose-900 block">
                    Reason for declining (Optional):
                  </label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                    placeholder="e.g. Accepted another position, compensation mismatch, relocation..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowDeclineInput(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                      onClick={() => handleRespondOffer('decline')}
                      disabled={responding}
                    >
                      {responding ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                      Confirm Decline
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setOfferModalOpen(false)}>
              Close
            </Button>
            {currentOffer && currentOffer.status === 'SENT' && !showDeclineInput && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="text-rose-600 border-rose-300 hover:bg-rose-50"
                  onClick={() => setShowDeclineInput(true)}
                  disabled={responding}
                >
                  Decline Offer
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleRespondOffer('accept')}
                  disabled={responding}
                >
                  {responding ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Accepting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1.5 h-4 w-4" /> Accept Job Offer
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
