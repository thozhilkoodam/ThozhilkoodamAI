'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  FileText,
  FileCheck,
  UserCheck,
  Briefcase,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock4,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const stats: { label: string; value: string; icon: any; color: string; bg: string; badge?: string }[] = [
  { label: 'Company Status', value: 'Verified', icon: Building2, color: 'text-green-600', bg: 'bg-green-100', badge: 'success' },
  { label: 'Open Requirements', value: '3', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', badge: 'default' },
  { label: 'Pending Quotation', value: '1', icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-100', badge: 'warning' },
  { label: 'Assigned Recruiter', value: '2', icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-100', badge: 'secondary' },
  { label: 'Current Jobs', value: '5', icon: Briefcase, color: 'text-teal-600', bg: 'bg-teal-100', badge: 'outline' },
]

const notifications = [
  { id: 1, title: 'Quotation Generated', message: 'Quotation #QT-2024-001 for React Developer requirement has been generated.', time: '2 hours ago', type: 'info' },
  { id: 2, title: 'Document Verified', message: 'Your GST certificate has been verified successfully.', time: '1 day ago', type: 'success' },
  { id: 3, title: 'Recruiter Assigned', message: 'A dedicated recruiter has been assigned to your requirement.', time: '2 days ago', type: 'success' },
  { id: 4, title: 'Payment Reminder', message: 'Your invoice #INV-2024-001 is due for payment.', time: '3 days ago', type: 'warning' },
]

const recentActivity = [
  { action: 'Requirement posted', detail: 'Senior React Developer - 3 vacancies', time: '2 hours ago' },
  { action: 'Quotation sent', detail: 'Quotation for React Developer requirement', time: '1 day ago' },
  { action: 'Document verified', detail: 'GST Certificate - Approved', time: '2 days ago' },
  { action: 'Profile updated', detail: 'Company details were updated', time: '3 days ago' },
  { action: 'Recruiter assigned', detail: 'Rajesh Kumar assigned to your account', time: '5 days ago' },
]

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('thozhil_client_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.companyName || user?.name || 'Client'}!</h1>
        <p className="text-muted-foreground">Here is your recruitment overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.badge && (
                  <Badge variant={stat.badge as any}>
                    {stat.value}
                  </Badge>
                )}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{stat.label}</p>
              {!stat.badge && (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-lg border p-3">
                  {n.type === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                  ) : n.type === 'warning' ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 text-orange-500" />
                  ) : (
                    <Clock4 className="mt-0.5 h-4 w-4 text-blue-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-1"
              onClick={() => router.push('/client/requirements')}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">Post Requirement</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-1"
              onClick={() => router.push('/client/verification')}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Upload Documents</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-1"
              onClick={() => router.push('/client/quotation')}
            >
              <FileCheck className="h-5 w-5" />
              <span className="text-xs">View Quotations</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-1"
              onClick={() => router.push('/client/tracker')}
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-xs">Track Requirements</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
