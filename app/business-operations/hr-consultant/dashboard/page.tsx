'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Briefcase, Users, CalendarCheck, Clock, TrendingUp, UserPlus,
  CheckCircle, XCircle, Target, BarChart3, Building, Calendar,
  Bell, CheckCircle2, ArrowUpRight, MessageSquare, FileText,
  UserCheck, Download, Star,
} from 'lucide-react'
import { Area, AreaChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const statsCards = [
  { label: 'Assigned Jobs', value: '24', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', change: '+3 this week' },
  { label: 'Open Positions', value: '18', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', change: '12 urgent' },
  { label: 'Active Candidates', value: '156', icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10', change: '+28 new' },
  { label: "Today's Interviews", value: '8', icon: CalendarCheck, color: 'text-orange-500', bg: 'bg-orange-500/10', change: '4 completed' },
  { label: 'Pending Interviews', value: '12', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', change: '3 today' },
  { label: 'Offers Released', value: '9', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', change: '2 accepted' },
  { label: 'Joined Candidates', value: '45', icon: UserPlus, color: 'text-sky-500', bg: 'bg-sky-500/10', change: '+15% MoM' },
  { label: 'Rejected Candidates', value: '23', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', change: '12% rate' },
  { label: 'Performance Score', value: '92%', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', change: 'A+ rating' },
  { label: 'Monthly Placements', value: '12', icon: CheckCircle, color: 'text-cyan-500', bg: 'bg-cyan-500/10', change: '85% target' },
]

const monthlyHiring = [
  { month: 'Jan', hired: 8, offers: 12, target: 10 },
  { month: 'Feb', hired: 12, offers: 15, target: 10 },
  { month: 'Mar', hired: 15, offers: 18, target: 12 },
  { month: 'Apr', hired: 10, offers: 14, target: 12 },
  { month: 'May', hired: 18, offers: 22, target: 14 },
  { month: 'Jun', hired: 14, offers: 16, target: 14 },
  { month: 'Jul', hired: 20, offers: 25, target: 16 },
  { month: 'Aug', hired: 16, offers: 20, target: 16 },
  { month: 'Sep', hired: 22, offers: 28, target: 18 },
  { month: 'Oct', hired: 18, offers: 24, target: 18 },
  { month: 'Nov', hired: 14, offers: 18, target: 16 },
  { month: 'Dec', hired: 10, offers: 14, target: 12 },
]

const interviewConversion = [
  { name: 'Scheduled', value: 45, color: '#6366f1' },
  { name: 'Completed', value: 32, color: '#22c55e' },
  { name: 'Selected', value: 18, color: '#f59e0b' },
  { name: 'Rejected', value: 14, color: '#ef4444' },
]

const candidateSource = [
  { name: 'LinkedIn', value: 35, color: '#0a66c2' },
  { name: 'Naukri', value: 25, color: '#e65d2e' },
  { name: 'Referral', value: 20, color: '#22c55e' },
  { name: 'Company Site', value: 12, color: '#8b5cf6' },
  { name: 'Other', value: 8, color: '#64748b' },
]

const recruiterPerformance = [
  { name: 'You', candidates: 45, interviews: 32, offers: 18 },
  { name: 'Avg Team', candidates: 38, interviews: 26, offers: 14 },
  { name: 'Top Performer', candidates: 62, interviews: 48, offers: 28 },
]

const upcomingInterviews = [
  { id: 1, candidate: 'Rahul Sharma', position: 'Senior React Developer', company: 'TechCorp', time: '10:00 AM', date: 'Today', type: 'Online' },
  { id: 2, candidate: 'Priya Patel', position: 'UX Designer', company: 'DesignStudio', time: '2:00 PM', date: 'Today', type: 'Walk-in' },
  { id: 3, candidate: 'Amit Kumar', position: 'Full Stack Developer', company: 'StartupXYZ', time: '11:00 AM', date: 'Tomorrow', type: 'Online' },
  { id: 4, candidate: 'Sneha Reddy', position: 'Data Analyst', company: 'DataCorp', time: '3:00 PM', date: 'Tomorrow', type: 'Online' },
  { id: 5, candidate: 'Vikram Singh', position: 'DevOps Engineer', company: 'CloudTech', time: '9:30 AM', date: 'Feb 15', type: 'Walk-in' },
]

const notifications = [
  { id: 1, title: 'Resume Shortlisted', message: 'Priya Patel shortlisted for UX Designer at DesignStudio', time: '10 min ago', type: 'success' },
  { id: 2, title: 'Interview Feedback', message: 'Excellent feedback for Rahul Sharma from TechCorp', time: '1 hour ago', type: 'info' },
  { id: 3, title: 'Offer Accepted', message: 'Amit Kumar accepted the offer from StartupXYZ', time: '3 hours ago', type: 'success' },
  { id: 4, title: 'New Requirement', message: 'New opening: DevOps Engineer at CloudTech', time: '5 hours ago', type: 'warning' },
  { id: 5, title: 'Candidate Rejected', message: 'Vikram Singh rejected after Manager Round', time: '1 day ago', type: 'error' },
  { id: 6, title: 'Pipeline Update', message: 'Sneha Reddy moved to Interview stage', time: '1 day ago', type: 'info' },
]

const todaysTasks = [
  { id: 1, task: 'Review 5 new applications for Senior React Developer', done: false },
  { id: 2, task: 'Prepare feedback for Rahul Sharma interview', done: false },
  { id: 3, task: 'Schedule technical round for Priya Patel', done: true },
  { id: 4, task: 'Update pipeline status for 3 candidates', done: false },
  { id: 5, task: 'Call client regarding new requirement', done: false },
  { id: 6, task: 'Submit weekly report to manager', done: true },
]

const recentActivities = [
  { action: 'Added candidate', detail: 'Rahul Sharma to Senior React Developer pipeline', time: '15 min ago', icon: UserPlus, color: 'text-blue-500' },
  { action: 'Scheduled interview', detail: 'Priya Patel for UX Designer at 2:00 PM', time: '45 min ago', icon: CalendarCheck, color: 'text-emerald-500' },
  { action: 'Moved pipeline', detail: 'Amit Kumar from Screening to Shortlisted', time: '2 hours ago', icon: ArrowUpRight, color: 'text-violet-500' },
  { action: 'Added feedback', detail: 'Sneha Reddy - Technical Round: Passed', time: '4 hours ago', icon: MessageSquare, color: 'text-orange-500' },
  { action: 'Downloaded resume', detail: 'Vikram Singh - DevOps Engineer', time: '6 hours ago', icon: Download, color: 'text-cyan-500' },
  { action: 'Updated profile', detail: 'Changed preferred locations to Chennai, Bangalore', time: '1 day ago', icon: UserCheck, color: 'text-amber-500' },
]

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#0a66c2', '#e65d2e']

const eventDays = [5, 12, 15, 22, 28]

export default function HrConsultantDashboardPage() {
  const [currentDate] = useState(() => new Date())
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const [tasks, setTasks] = useState(todaysTasks)

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Consultant! 👋</h1>
        <p className="text-muted-foreground">Here's your recruitment overview for today</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-[10px] mt-0.5 font-medium text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Monthly Hiring Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyHiring}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="hired" name="Hired" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offers" name="Offers" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                Interview Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={interviewConversion} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {interviewConversion.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {interviewConversion.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Candidate Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={candidateSource} cx="50%" cy="50%" outerRadius={55} paddingAngle={2} dataKey="value">
                    {candidateSource.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {candidateSource.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-[10px]">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Recruiter Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recruiterPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="candidates" name="Candidates" fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="interviews" name="Interviews" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="offers" name="Offers" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {currentMonth}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-[10px] text-muted-foreground font-medium py-1">{d}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const hasEvent = eventDays.includes(day)
                  const isToday = day === currentDate.getDate()
                  return (
                    <div
                      key={day}
                      className={`h-7 w-full flex items-center justify-center text-xs rounded-full cursor-pointer transition-colors
                        ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                        ${hasEvent && !isToday ? 'bg-primary/10 text-primary font-medium' : ''}
                        ${!isToday && !hasEvent ? 'hover:bg-accent' : ''}
                      `}
                    >
                      {day}
                      {hasEvent && !isToday && <div className="absolute mt-3 h-1 w-1 rounded-full bg-primary" />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[240px]">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center gap-3 p-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {interview.candidate.split(' ').map((s: string) => s[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{interview.candidate}</p>
                    <p className="text-xs text-muted-foreground truncate">{interview.position} at {interview.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{interview.type}</Badge>
                      <span className="text-[10px] text-muted-foreground">{interview.date} {interview.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[240px]">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      n.type === 'success' ? 'bg-green-500' :
                      n.type === 'error' ? 'bg-red-500' :
                      n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[240px]">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
                    task.done ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}>
                    {task.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <p className={`text-sm flex-1 ${task.done ? 'line-through text-muted-foreground' : ''}`}>{task.task}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-start gap-4 p-4 pl-6 relative">
                  <div className="absolute left-[22px] top-4 h-2.5 w-2.5 rounded-full bg-background border-2 border-primary z-10" />
                  <div className={`p-1.5 rounded-lg bg-muted/50 ml-4 ${activity.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
