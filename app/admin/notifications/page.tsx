'use client'

import { useState, useEffect } from 'react'
import { db, DBNotification } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCheck, Trash2, Clock, AlertCircle, CreditCard, UserPlus, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const typeIcons: Record<string, any> = {
  registration: UserPlus,
  approval: Shield,
  payment: CreditCard,
  expiry: Clock,
  alert: AlertCircle,
}

const typeColors: Record<string, string> = {
  registration: 'bg-blue-100 text-blue-600',
  approval: 'bg-green-100 text-green-600',
  payment: 'bg-purple-100 text-purple-600',
  expiry: 'bg-orange-100 text-orange-600',
  alert: 'bg-red-100 text-red-600',
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<DBNotification[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    db.notifications.getAll().then(setNotifications)
  }, [])

  const markAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updated)
    toast.success('All notifications marked as read')
  }

  const clearAll = () => {
    setNotifications([])
    toast.success('Notifications cleared')
  }

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark All Read
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Clear All
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'registration', 'approval', 'payment', 'expiry', 'alert'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Bell className="mx-auto h-12 w-12 mb-3" />
            No notifications found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell
            const colorClass = typeColors[notification.type] || 'bg-gray-100 text-gray-600'
            return (
              <Card
                key={notification.id}
                className={`transition-colors hover:bg-accent/50 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs capitalize">{notification.type}</Badge>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString('en-IN')}
                    </p>
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
