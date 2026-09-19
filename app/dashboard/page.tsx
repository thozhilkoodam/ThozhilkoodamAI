'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, CheckCircle, Calendar, ArrowUp, ArrowDown } from 'lucide-react'

const stats = [
  { label: 'Jobs Posted', value: '24', change: '+12%', icon: Briefcase, up: true, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Candidates Applied', value: '1,234', change: '+23%', icon: Users, up: true, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Shortlisted', value: '456', change: '+8%', icon: CheckCircle, up: true, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Interviews Scheduled', value: '89', change: '-5%', icon: Calendar, up: false, color: 'text-orange-600', bg: 'bg-orange-100' },
]

const recentActivities = [
  { action: 'New application received', detail: 'Senior React Developer - Bangalore', time: '5 min ago' },
  { action: 'Interview scheduled', detail: 'Sarah Smith - Product Manager', time: '1 hour ago' },
  { action: 'Candidate shortlisted', detail: 'Rajesh Kumar - DevOps Engineer', time: '2 hours ago' },
  { action: 'Offer sent', detail: 'Priya Sharma - UX Designer', time: '1 day ago' },
  { action: 'Offer accepted', detail: 'Amit Singh - Data Scientist', time: '2 days ago' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here is your recruitment overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiring Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'Applied', count: 234, color: 'bg-blue-500' },
                { stage: 'Screening', count: 156, color: 'bg-yellow-500' },
                { stage: 'Shortlisted', count: 89, color: 'bg-purple-500' },
                { stage: 'Interview', count: 45, color: 'bg-orange-500' },
                { stage: 'Selected', count: 23, color: 'bg-green-500' },
                { stage: 'Offer', count: 12, color: 'bg-teal-500' },
                { stage: 'Joined', count: 8, color: 'bg-emerald-500' },
              ].map((stage) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="w-24 text-sm">{stage.stage}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${stage.color}`}
                        style={{ width: `${(stage.count / 234) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{stage.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
