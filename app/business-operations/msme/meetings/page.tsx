'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar, Clock, Video, MapPin, Plus, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const meetings = [
  { id: 'MTG-001', date: '25 Jun 2024', time: '10:00 AM', purpose: 'Initial discussion on requirements', type: 'online', status: 'scheduled' as const },
  { id: 'MTG-002', date: '20 Jun 2024', time: '3:00 PM', purpose: 'Quotation review meeting', type: 'online', status: 'completed' as const },
  { id: 'MTG-003', date: '15 Jun 2024', time: '11:00 AM', purpose: 'Company verification call', type: 'offline', status: 'cancelled' as const },
]

export default function MSMEMeetingsPage() {
  const [showSchedule, setShowSchedule] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    date: '',
    time: '',
    purpose: '',
    type: 'online' as 'online' | 'offline',
    notes: '',
  })

  const handleSchedule = async () => {
    if (!form.date || !form.time || !form.purpose) {
      toast.error('Please fill in the required fields')
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    toast.success('Meeting scheduled successfully!')
    setShowSchedule(false)
    setForm({ date: '', time: '', purpose: '', type: 'online', notes: '' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Scheduled</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule Meeting</h1>
          <p className="text-muted-foreground">Schedule and manage meetings with the Thozhil Koodam team.</p>
        </div>
        <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule a Meeting</DialogTitle>
              <DialogDescription>Fill in the details to schedule a meeting with our team.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <DatePicker
                    value={form.date}
                    onChange={(v) => setForm({ ...form, date: v })}
                    label="Date *"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <TimePicker
                    value={form.time}
                    onChange={(v) => setForm({ ...form, time: v })}
                    label="Time *"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purpose *</Label>
                <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                  <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                  <SelectContent>
                    {['Initial Discussion', 'Quotation Review', 'Requirement Discussion', 'Contract Signing', 'General Inquiry', 'Other'].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Meeting Type</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={form.type === 'online' ? 'default' : 'outline'}
                    onClick={() => setForm({ ...form, type: 'online' })}
                    className="gap-2 flex-1"
                  >
                    <Video className="h-4 w-4" /> Online
                  </Button>
                  <Button
                    type="button"
                    variant={form.type === 'offline' ? 'default' : 'outline'}
                    onClick={() => setForm({ ...form, type: 'offline' })}
                    className="gap-2 flex-1"
                  >
                    <MapPin className="h-4 w-4" /> Offline
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional information..."
                />
              </div>
              <Button className="w-full gap-2" onClick={handleSchedule} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                {submitting ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    meeting.type === 'online' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-orange-100 dark:bg-orange-900'
                  }`}>
                    {meeting.type === 'online' ? (
                      <Video className={`h-6 w-6 ${meeting.type === 'online' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
                    ) : (
                      <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{meeting.purpose}</h4>
                      {getStatusBadge(meeting.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {meeting.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {meeting.time}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">{meeting.type}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
