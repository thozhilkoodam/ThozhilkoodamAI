'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  Gift,
  UserCheck,
  Target,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Bell,
  CheckCircle,
  MessageSquare,
  XCircle,
  Activity,
  ChevronRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useRouter } from 'next/navigation'

const stats = [
  { label: 'Assigned Requirements', value: '18', change: '+3', up: true, icon: Briefcase, bg: 'bg-purple-100', color: 'text-purple-600' },
  { label: 'Active Candidates', value: '245', change: '+28', up: true, icon: Users, bg: 'bg-blue-100', color: 'text-blue-600' },
  { label: "Today's Interviews", value: '6', change: '+2', up: true, icon: Calendar, bg: 'bg-green-100', color: 'text-green-600' },
  { label: 'Upcoming Interviews', value: '14', change: '-3', up: false, icon: Clock, bg: 'bg-orange-100', color: 'text-orange-600' },
  { label: 'Pending Feedback', value: '5', change: '+1', up: true, icon: MessageSquare, bg: 'bg-rose-100', color: 'text-rose-600' },
  { label: 'Offers Released', value: '8', change: '+1', up: true, icon: Gift, bg: 'bg-pink-100', color: 'text-pink-600' },
  { label: 'Joined Candidates', value: '5', change: '+2', up: true, icon: UserCheck, bg: 'bg-teal-100', color: 'text-teal-600' },
  { label: 'Rejected Candidates', value: '12', change: '+2', up: false, icon: XCircle, bg: 'bg-red-100', color: 'text-red-600' },
  { label: 'Performance Score', value: '92%', change: '+4%', up: true, icon: TrendingUp, bg: 'bg-emerald-100', color: 'text-emerald-600' },
]

const monthlyHiringData = [
  { month: 'Jan', hired: 8, target: 10, offers: 6 },
  { month: 'Feb', hired: 12, target: 10, offers: 10 },
  { month: 'Mar', hired: 15, target: 12, offers: 13 },
  { month: 'Apr', hired: 10, target: 12, offers: 9 },
  { month: 'May', hired: 18, target: 15, offers: 16 },
  { month: 'Jun', hired: 14, target: 15, offers: 13 },
]

const pipelineConversionData = [
  { stage: 'Applied', count: 234 },
  { stage: 'Screening', count: 156 },
  { stage: 'Shortlisted', count: 89 },
  { stage: 'Interview', count: 45 },
  { stage: 'Selected', count: 23 },
  { stage: 'Offer', count: 12 },
  { stage: 'Joined', count: 8 },
]

const interviewConversionData = [
  { name: 'Passed', value: 65, color: '#22c55e' },
  { name: 'Failed', value: 25, color: '#ef4444' },
  { name: 'No Show', value: 10, color: '#eab308' },
]

const offerAcceptanceData = [
  { name: 'Accepted', value: 78, color: '#22c55e' },
  { name: 'Declined', value: 15, color: '#ef4444' },
  { name: 'Negotiating', value: 7, color: '#eab308' },
]

const upcomingInterviews = [
  { id: 1, candidate: 'Rahul Sharma', role: 'Senior React Developer', time: '10:00 AM', type: 'Online', avatar: 'RS' },
  { id: 2, candidate: 'Priya Patel', role: 'Product Manager', time: '2:00 PM', type: 'Online', avatar: 'PP' },
  { id: 3, candidate: 'Arun Kumar', role: 'DevOps Engineer', time: '4:00 PM', type: 'Walk-in', avatar: 'AK' },
]

const notifications = [
  { id: 1, title: 'New application', message: 'Sneha Reddy applied for UX Designer', time: '5 min ago', read: false },
  { id: 2, title: 'Offer accepted', message: 'Vikram Singh accepted the offer', time: '1 hour ago', read: false },
  { id: 3, title: 'Interview feedback', message: 'Feedback submitted for Ananya Gupta', time: '3 hours ago', read: true },
]

const tasks = [
  { id: 1, task: 'Review resumes for Senior Developer role', status: 'pending', priority: 'high' },
  { id: 2, task: 'Schedule interviews for 3 shortlisted candidates', status: 'pending', priority: 'medium' },
  { id: 3, task: 'Send offer letter to Priya Patel', status: 'completed', priority: 'high' },
  { id: 4, task: 'Follow up with hiring managers', status: 'pending', priority: 'low' },
]

const calendarEvents = [
  { day: 10, title: 'Interview: Rahul Sharma', type: 'interview' },
  { day: 12, title: 'Interview: Priya Patel', type: 'interview' },
  { day: 15, title: 'Team Meeting', type: 'meeting' },
  { day: 18, title: 'Offer Review', type: 'review' },
]

const recentActivities = [
  { action: 'Rahul Sharma moved to Interview Scheduled', time: '10 min ago', type: 'pipeline' },
  { action: 'Resume reviewed for Priya Patel', time: '25 min ago', type: 'review' },
  { action: 'Offer letter sent to Arun Kumar', time: '1 hour ago', type: 'offer' },
  { action: 'New requirement added: DevOps Engineer', time: '2 hours ago', type: 'requirement' },
  { action: 'Interview feedback submitted for Sneha', time: '3 hours ago', type: 'feedback' },
  { action: 'Candidate Ananya Gupta shortlisted', time: '5 hours ago', type: 'pipeline' },
]

const activityIcons: Record<string, any> = {
  pipeline: Users,
  review: MessageSquare,
  offer: Gift,
  requirement: Briefcase,
  feedback: CheckCircle,
}

export default function HrDashboardPage() {
  const router = useRouter()
  const [today] = useState(() => new Date())
  const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here is your recruitment overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker className="w-40" placeholder="DD/MM/YYYY" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle className="text-lg">Monthly Hiring vs Target</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyHiringData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hired" name="Hired" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                  <Line type="monotone" dataKey="offers" name="Offers" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Interview Conversion</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={interviewConversionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {interviewConversionData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Offer Acceptance</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={offerAcceptanceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {offerAcceptanceData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Pipeline Analytics</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineConversionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="stage" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
                <Badge variant="secondary">{upcomingInterviews.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${interview.candidate}`} />
                    <AvatarFallback className="text-xs">{interview.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{interview.candidate}</p>
                    <p className="text-xs text-muted-foreground truncate">{interview.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{interview.time}</p>
                    <Badge variant={interview.type === 'Online' ? 'outline' : 'secondary'} className="text-xs">{interview.type}</Badge>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => router.push('/hr/interviews')}>
                View All Interviews <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Calendar</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-3">{currentMonth}</p>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d} className="text-[10px] font-medium text-muted-foreground">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-7" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const hasEvent = calendarEvents.some((e) => e.day === day)
                const isToday = day === today.getDate()
                return (
                  <div
                    key={day}
                    className={`h-7 flex items-center justify-center text-xs rounded-full cursor-pointer transition-colors
                      ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                      ${hasEvent && !isToday ? 'bg-primary/10 text-primary font-medium' : ''}
                      ${!isToday && !hasEvent ? 'hover:bg-muted' : ''}
                    `}
                    title={calendarEvents.find((e) => e.day === day)?.title}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 space-y-1">
              {calendarEvents.slice(0, 3).map((event, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className={`h-1.5 w-1.5 rounded-full ${event.type === 'interview' ? 'bg-primary' : event.type === 'meeting' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className="truncate">{event.day} - {event.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-[200px]">
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 rounded-lg border p-3 mb-2 ${!n.read ? 'bg-primary/5' : ''}`}>
                  <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-primary' : 'bg-muted'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => router.push('/hr/notifications')}>
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-[200px]">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-lg border p-3 mb-2">
                  <CheckCircle className={`mt-0.5 h-4 w-4 shrink-0 ${task.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.task}</p>
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="mt-1 text-xs">{task.priority}</Badge>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {recentActivities.map((activity, i) => {
                const Icon = activityIcons[activity.type] || Activity
                return (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs">{activity.action}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
