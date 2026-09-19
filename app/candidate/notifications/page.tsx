'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Briefcase, MessageSquare, AlertCircle, CheckCircle2, Calendar, Award, Star, User, Trash2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

const iconMap: Record<string, any> = {
  application: Briefcase,
  interview: Calendar,
  message: MessageSquare,
  job: Star,
  profile: User,
  offer: Award,
  certificate: CheckCircle2,
  assessment: AlertCircle,
}

const colorMap: Record<string, string> = {
  application: 'text-blue-500 bg-blue-100 dark:bg-blue-950',
  interview: 'text-purple-500 bg-purple-100 dark:bg-purple-950',
  message: 'text-green-500 bg-green-100 dark:bg-green-950',
  job: 'text-amber-500 bg-amber-100 dark:bg-amber-950',
  offer: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchNotifs = async () => {
    setLoading(true)
    try {
      const data = await api.portal.notifications.list()
      if (data) setNotifications(data)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifs() }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await api.portal.notifications.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await api.portal.notifications.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch {}
  }

  const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.read)
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">{unread} unread</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" className="gap-1" onClick={handleMarkAllRead}>
            <CheckCircle2 className="h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm"><CardContent className="p-4"><div className="h-4 w-48 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center"><Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" /><p className="text-gray-500">No notifications.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((n: any) => {
            const Icon = iconMap[n.type] || Bell
            const colors = colorMap[n.type] || 'text-gray-500 bg-gray-100 dark:bg-gray-800'
            return (
              <Card
                key={n.id}
                className={`border-0 shadow-sm transition-all hover:shadow-md cursor-pointer ${!n.read ? 'border-l-2 border-l-purple-500' : ''}`}
                onClick={() => !n.read && handleMarkRead(n.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${colors}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`text-sm ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{n.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <p className="text-[10px] text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</p>
                          {!n.read && <div className="h-2 w-2 rounded-full bg-purple-600" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
