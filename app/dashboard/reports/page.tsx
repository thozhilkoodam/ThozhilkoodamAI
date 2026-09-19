'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { ArrowUp, ArrowDown, Users, Briefcase, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react'

const hiringData = [
  { month: 'Jan', applied: 120, shortlisted: 45, interviewed: 28, joined: 12 },
  { month: 'Feb', applied: 150, shortlisted: 55, interviewed: 35, joined: 15 },
  { month: 'Mar', applied: 180, shortlisted: 65, interviewed: 42, joined: 20 },
  { month: 'Apr', applied: 140, shortlisted: 50, interviewed: 30, joined: 14 },
  { month: 'May', applied: 200, shortlisted: 75, interviewed: 48, joined: 22 },
  { month: 'Jun', applied: 170, shortlisted: 60, interviewed: 38, joined: 18 },
]

const pipelineData = [
  { name: 'Applied', value: 234, color: '#3b82f6' },
  { name: 'Screening', value: 156, color: '#eab308' },
  { name: 'Shortlisted', value: 89, color: '#8b5cf6' },
  { name: 'Interview', value: 45, color: '#f97316' },
  { name: 'Selected', value: 23, color: '#22c55e' },
  { name: 'Offer', value: 12, color: '#14b8a6' },
  { name: 'Joined', value: 8, color: '#10b981' },
]

const recruiterPerformance = [
  { name: 'Anita K.', applications: 45, shortlisted: 20, interviews: 15, offers: 8 },
  { name: 'Raj M.', applications: 52, shortlisted: 18, interviews: 12, offers: 6 },
  { name: 'Sara J.', applications: 38, shortlisted: 22, interviews: 16, offers: 10 },
  { name: 'Vikram P.', applications: 60, shortlisted: 25, interviews: 18, offers: 9 },
]

const metrics = [
  { label: 'Time to Hire', value: '18 days', change: '-2 days', up: true, icon: Clock },
  { label: 'Hiring Ratio', value: '1:28', change: '+5%', up: true, icon: Target },
  { label: 'Offer Acceptance', value: '85%', change: '+10%', up: true, icon: TrendingUp },
  { label: 'Source Quality', value: '92%', change: '+3%', up: true, icon: Users },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Track your recruitment metrics and performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={metric.up ? 'success' : 'destructive'}>
                  {metric.up ? <ArrowUp className="mr-0.5 h-3 w-3" /> : <ArrowDown className="mr-0.5 h-3 w-3" />}
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hiringData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="applied" name="Applied" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shortlisted" name="Shortlisted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="interviewed" name="Interviewed" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="joined" name="Joined" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recruiter Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recruiterPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" name="Applications" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="shortlisted" name="Shortlisted" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="interviews" name="Interviews" fill="#f97316" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="offers" name="Offers" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
