'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { Calendar, ChevronLeft, ChevronRight, Clock, Video, MapPin, Plus, Mail, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

const interviews = [
  { id: 1, candidate: 'Rahul Sharma', role: 'Senior React Developer', date: '2024-03-15', time: '10:00 AM', duration: '60 min', type: 'online', status: 'scheduled', avatar: 'RS' },
  { id: 2, candidate: 'Priya Patel', role: 'Product Manager', date: '2024-03-15', time: '2:00 PM', duration: '45 min', type: 'online', status: 'scheduled', avatar: 'PP' },
  { id: 3, candidate: 'Arun Kumar', role: 'DevOps Engineer', date: '2024-03-16', time: '11:00 AM', duration: '60 min', type: 'offline', status: 'scheduled', avatar: 'AK' },
  { id: 4, candidate: 'Sneha Reddy', role: 'UX Designer', date: '2024-03-16', time: '3:00 PM', duration: '45 min', type: 'online', status: 'scheduled', avatar: 'SR' },
  { id: 5, candidate: 'Vikram Singh', role: 'Data Scientist', date: '2024-03-17', time: '9:30 AM', duration: '60 min', type: 'online', status: 'scheduled', avatar: 'VS' },
]

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function InterviewSchedulePage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [showSchedule, setShowSchedule] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const handleSchedule = () => {
    toast.success('Interview scheduled successfully!')
    setShowSchedule(false)
  }

  const sendReminder = () => {
    toast.success('Reminder notification sent!')
  }

  const todayInterviews = interviews.filter(
    (i) => i.date === currentDate.toISOString().split('T')[0]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Schedule</h1>
          <p className="text-muted-foreground">Manage and schedule interviews.</p>
        </div>
        <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Schedule Interview</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>Set up a new interview with a candidate.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Candidate</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                  <SelectContent>
                    {interviews.map((i) => (
                      <SelectItem key={i.id} value={i.candidate}>{i.candidate}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <DatePicker placeholder="DD/MM/YYYY" label="Date" />
                </div>
                <div className="space-y-2">
                  <TimePicker label="Time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online (Video Call)</SelectItem>
                    <SelectItem value="offline">Offline (In-Person)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
              <Button onClick={handleSchedule}>Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Tabs value={view} onValueChange={(v: any) => setView(v)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'month' && (
            <div>
              <div className="grid grid-cols-7 gap-px">
                {weekDays.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[80px] p-2" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayInterviews = interviews.filter((inv) => inv.date === dateStr)
                  return (
                    <div
                      key={day}
                      className={`min-h-[80px] border-t p-1 ${
                        dayInterviews.length > 0 ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className="text-sm">{day}</span>
                      {dayInterviews.map((inv) => (
                        <div key={inv.id} className="mt-1 rounded bg-primary/10 px-1 py-0.5 text-[10px]">
                          {inv.time}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(view === 'day' || view === 'week') && (
            <div className="space-y-3">
              {todayInterviews.length > 0 ? todayInterviews.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${inv.candidate}`} />
                    <AvatarFallback>{inv.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{inv.candidate}</h4>
                    <p className="text-sm text-muted-foreground">{inv.role}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {inv.time}</span>
                      <span className="flex items-center gap-1">
                        {inv.type === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {inv.type === 'online' ? 'Online' : 'In-Person'}
                      </span>
                      <span>{inv.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={inv.status === 'scheduled' ? 'success' : 'secondary'}>
                      {inv.status}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={sendReminder}>
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12" />
                  <p className="mt-2">No interviews scheduled for this day.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
