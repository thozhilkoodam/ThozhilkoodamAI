'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Users, Star, Calendar, Briefcase, CheckCircle, XCircle, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const allNotifications = [
  { id: 1, type: 'application', title: 'New Application Received', message: 'Rahul Sharma applied for Senior React Developer', time: '5 min ago', read: false, icon: Users, color: 'bg-blue-100 text-blue-600' },
  { id: 2, type: 'offer', title: 'Offer Accepted', message: 'Vikram Singh accepted the offer for Data Scientist position', time: '1 hour ago', read: false, icon: Star, color: 'bg-yellow-100 text-yellow-600' },
  { id: 3, type: 'interview', title: 'Interview Feedback Submitted', message: 'Feedback submitted for Ananya Gupta - Full Stack Developer', time: '3 hours ago', read: true, icon: Calendar, color: 'bg-purple-100 text-purple-600' },
  { id: 4, type: 'requirement', title: 'New Requirement Added', message: 'TechCorp posted a new requirement: Senior React Developer', time: '5 hours ago', read: true, icon: Briefcase, color: 'bg-green-100 text-green-600' },
  { id: 5, type: 'candidate', title: 'Candidate Stage Changed', message: 'Priya Patel moved to Interview stage', time: '1 day ago', read: true, icon: Users, color: 'bg-indigo-100 text-indigo-600' },
  { id: 6, type: 'application', title: 'Bulk Applications Received', message: '12 new applications for DevOps Engineer position', time: '2 days ago', read: true, icon: Briefcase, color: 'bg-orange-100 text-orange-600' },
  { id: 7, type: 'interview', title: 'Interview Reminder', message: 'Interview with Rohit Joshi tomorrow at 10:00 AM', time: '2 days ago', read: false, icon: Calendar, color: 'bg-pink-100 text-pink-600' },
  { id: 8, type: 'offer', title: 'Offer Letter Generated', message: 'Offer letter generated for Sneha Reddy - UX Designer', time: '3 days ago', read: true, icon: Star, color: 'bg-teal-100 text-teal-600' },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(allNotifications)
  const [filter, setFilter] = useState('all')

  const unreadCount = notifications.filter((n) => !n.read).length
  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter((n) => !n.read) : notifications.filter((n) => n.type === filter)

  const handleMarkRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success('Notification removed')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with recruitment activities.</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
            </Button>
          )}
          <Badge variant="secondary" className="text-sm px-3 py-1">{unreadCount} unread</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="application">Applications</SelectItem>
            <SelectItem value="interview">Interviews</SelectItem>
            <SelectItem value="offer">Offers</SelectItem>
            <SelectItem value="candidate">Candidates</SelectItem>
            <SelectItem value="requirement">Requirements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Bell className="mx-auto h-12 w-12 mb-3 opacity-30" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-4 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => n.read || handleMarkRead(n.id)}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${n.color}`}>
                    <n.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{n.time}</span>
                      <Badge variant="outline" className="text-xs">{n.type}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id) }}>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
