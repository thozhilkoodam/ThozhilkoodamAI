'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import {
  CalendarCheck, Clock, Video, MapPin, Star, MessageSquare,
  CheckCircle, XCircle, Plus, Calendar, Bell, Search, Filter,
  ExternalLink, Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Interview = {
  id: string
  candidateName: string
  company: string
  position: string
  type: 'Online' | 'Walk-in'
  date: string
  time: string
  venue: string
  meetingLink: string
  interviewer: string
  feedback: string
  rating: number
  result: 'pending' | 'selected' | 'rejected'
}

const mockInterviews: Interview[] = [
  { id: 'i1', candidateName: 'Rahul Sharma', company: 'TechCorp', position: 'Senior React Developer', type: 'Online', date: '2026-02-12', time: '10:00 AM', venue: '', meetingLink: 'https://meet.google.com/abc-defg-hij', interviewer: 'Arun Kumar', feedback: 'Excellent technical skills', rating: 5, result: 'selected' },
  { id: 'i2', candidateName: 'Priya Patel', company: 'DesignStudio', position: 'UX Designer', type: 'Walk-in', date: '2026-02-12', time: '2:00 PM', venue: 'DesignStudio Office, 3rd Floor, Bangalore', meetingLink: '', interviewer: 'Priya Sharma', feedback: 'Good portfolio', rating: 4, result: 'pending' },
  { id: 'i3', candidateName: 'Amit Kumar', company: 'StartupXYZ', position: 'Full Stack Developer', type: 'Online', date: '2026-02-13', time: '11:00 AM', venue: '', meetingLink: 'https://meet.google.com/xyz-abcd-efg', interviewer: 'Vikram Singh', feedback: '', rating: 0, result: 'pending' },
  { id: 'i4', candidateName: 'Sneha Reddy', company: 'DataCorp', position: 'Data Analyst', type: 'Online', date: '2026-02-13', time: '3:00 PM', venue: '', meetingLink: 'https://zoom.us/j/123456789', interviewer: 'Rajesh Kumar', feedback: 'Needs improvement in SQL', rating: 3, result: 'rejected' },
  { id: 'i5', candidateName: 'Vikram Singh', company: 'CloudTech', position: 'DevOps Engineer', type: 'Walk-in', date: '2026-02-15', time: '9:30 AM', venue: 'CloudTech Office, Whitefield, Bangalore', meetingLink: '', interviewer: 'Suresh Reddy', feedback: '', rating: 0, result: 'pending' },
  { id: 'i6', candidateName: 'Ananya Gupta', company: 'ProductLabs', position: 'Product Manager', type: 'Online', date: '2026-02-14', time: '4:00 PM', venue: '', meetingLink: 'https://meet.google.com/lmn-opqr-stu', interviewer: 'Anita Sharma', feedback: 'Strong product sense', rating: 4, result: 'selected' },
  { id: 'i7', candidateName: 'Arjun Nair', company: 'FinServ', position: 'Java Developer', type: 'Online', date: '2026-02-11', time: '10:30 AM', venue: '', meetingLink: 'https://meet.google.com/vwx-yzab-cde', interviewer: 'Mohan Raj', feedback: 'Good Java skills, but weak in system design', rating: 3, result: 'selected' },
  { id: 'i8', candidateName: 'Neha Sharma', company: 'WebStudio', position: 'Frontend Developer', type: 'Walk-in', date: '2026-02-16', time: '11:30 AM', venue: 'WebStudio Office, HSR Layout, Bangalore', meetingLink: '', interviewer: 'Ravi Kumar', feedback: '', rating: 0, result: 'pending' },
]

const todayInterviews = mockInterviews.filter(i => i.date === '2026-02-12')
const upcomingInterviews = mockInterviews.filter(i => new Date(i.date) > new Date('2026-02-12'))
const completedInterviews = mockInterviews.filter(i => i.result !== 'pending')
const topRated = mockInterviews.filter(i => i.rating >= 4)

export default function HrConsultantInterviewsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null)
  const [feedbackData, setFeedbackData] = useState<{ feedback: string; rating: number; result: string }>({ feedback: '', rating: 0, result: 'pending' })
  const [form, setForm] = useState({
    candidateName: '', company: '', position: '', interviewType: 'Online' as 'Online' | 'Walk-in',
    date: '', time: '', venue: '', meetingLink: '', interviewer: '', notes: '',
  })

  const filtered = mockInterviews.filter(i => {
    if (typeFilter !== 'all' && i.type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return i.candidateName.toLowerCase().includes(q) || i.company.toLowerCase().includes(q) || i.position.toLowerCase().includes(q)
    }
    return true
  })

  const handleSchedule = () => {
    if (!form.candidateName || !form.date || !form.time) {
      toast.error('Please fill required fields')
      return
    }
    toast.success('Interview scheduled successfully!')
    setScheduleOpen(false)
    setForm({ candidateName: '', company: '', position: '', interviewType: 'Online', date: '', time: '', venue: '', meetingLink: '', interviewer: '', notes: '' })
  }

  const handleFeedbackSubmit = () => {
    toast.success('Feedback submitted successfully!')
    setFeedbackOpen(null)
    setFeedbackData({ feedback: '', rating: 0, result: 'pending' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <p className="text-muted-foreground">Schedule, track, and manage all interviews</p>
        </div>
        <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Schedule Interview</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
              <DialogDescription>Fill in the details to schedule an interview</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Candidate Name *</Label>
                <Input value={form.candidateName} onChange={(e) => setForm({ ...form, candidateName: e.target.value })} placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
              </div>
              <div className="space-y-1.5">
                <Label>Position</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Job position" />
              </div>
              <div className="space-y-1.5">
                <Label>Interview Type</Label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={form.interviewType} onChange={(e) => setForm({ ...form, interviewType: e.target.value as 'Online' | 'Walk-in' })}>
                  <option value="Online">Online</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Interviewer</Label>
                <Input value={form.interviewer} onChange={(e) => setForm({ ...form, interviewer: e.target.value })} placeholder="Interviewer name" />
              </div>
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <DatePicker value={form.date} onChange={(v) => setForm({ ...form, date: v })} placeholder="DD/MM/YYYY" />
              </div>
              <div className="space-y-1.5">
                <Label>Time *</Label>
                <TimePicker value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{form.interviewType === 'Online' ? 'Meeting Link' : 'Venue'}</Label>
                <Input
                  value={form.interviewType === 'Online' ? form.meetingLink : form.venue}
                  onChange={(e) => form.interviewType === 'Online'
                    ? setForm({ ...form, meetingLink: e.target.value })
                    : setForm({ ...form, venue: e.target.value })
                  }
                  placeholder={form.interviewType === 'Online' ? 'https://meet.google.com/...' : 'Venue address'}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={2} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSchedule}><Calendar className="h-4 w-4 mr-2" /> Schedule Interview</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <CalendarCheck className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">{todayInterviews.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Today's Interviews</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold text-amber-500">{upcomingInterviews.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-500">{completedInterviews.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500">{topRated.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Top Rated</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search interviews..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant={typeFilter === 'all' ? 'secondary' : 'outline'} size="sm" onClick={() => setTypeFilter('all')}>All</Button>
          <Button variant={typeFilter === 'Online' ? 'secondary' : 'outline'} size="sm" onClick={() => setTypeFilter('Online')}>Online</Button>
          <Button variant={typeFilter === 'Walk-in' ? 'secondary' : 'outline'} size="sm" onClick={() => setTypeFilter('Walk-in')}>Walk-in</Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Candidate</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Company</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Position</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Venue / Link</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Interviewer</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Rating</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Result</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((interview) => (
                  <tr key={interview.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {interview.candidateName.split(' ').map((s: string) => s[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{interview.candidateName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{interview.company}</td>
                    <td className="p-3 text-sm">{interview.position}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] ${interview.type === 'Online' ? 'text-blue-500 border-blue-500/20' : 'text-emerald-500 border-emerald-500/20'}`}>
                        {interview.type === 'Online' ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                        {interview.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{new Date(interview.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="p-3 text-sm">{interview.time}</td>
                    <td className="p-3">
                      {interview.meetingLink ? (
                        <a href={interview.meetingLink} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Join
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground truncate max-w-[120px] block">{interview.venue}</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">{interview.interviewer}</td>
                    <td className="p-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-3 w-3 ${star <= interview.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className={`text-[10px] ${
                        interview.result === 'selected' ? 'bg-green-500/10 text-green-500' :
                        interview.result === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>{interview.result}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Dialog open={feedbackOpen === interview.id} onOpenChange={(open) => setFeedbackOpen(open ? interview.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MessageSquare className="h-3.5 w-3.5" /></Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Interview Feedback</DialogTitle>
                              <DialogDescription>{interview.candidateName} - {interview.position}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <Label>Rating</Label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setFeedbackData({ ...feedbackData, rating: star })}>
                                      <Star className={`h-6 w-6 cursor-pointer transition-colors ${star <= feedbackData.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground hover:text-amber-400'}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label>Feedback</Label>
                                <Textarea value={feedbackData.feedback} onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })} placeholder="Detailed feedback..." rows={3} />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Result</Label>
                                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={feedbackData.result} onChange={(e) => setFeedbackData({ ...feedbackData, result: e.target.value })}>
                                  <option value="pending">Pending</option>
                                  <option value="selected">Selected</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                              <Button className="w-full" onClick={handleFeedbackSubmit}>Submit Feedback</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary"><Bell className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" />
            Interview reminders are enabled
          </div>
          <Button variant="outline" size="sm">Sync Calendar</Button>
        </CardContent>
      </Card>
    </div>
  )
}
