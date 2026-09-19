'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { ArrowUp, ArrowDown, Users, Briefcase, CheckCircle, TrendingUp, Target, DollarSign } from 'lucide-react'

const monthlyHiring = [
  { month: 'Jan', applications: 120, shortlisted: 45, joined: 12 },
  { month: 'Feb', applications: 150, shortlisted: 55, joined: 15 },
  { month: 'Mar', applications: 180, shortlisted: 65, joined: 20 },
  { month: 'Apr', applications: 140, shortlisted: 50, joined: 14 },
  { month: 'May', applications: 200, shortlisted: 75, joined: 22 },
  { month: 'Jun', applications: 170, shortlisted: 60, joined: 18 },
]

const pipelineConversion = [
  { name: 'Applied', value: 234, color: '#3b82f6' },
  { name: 'Screening', value: 156, color: '#eab308' },
  { name: 'Shortlisted', value: 89, color: '#8b5cf6' },
  { name: 'Interview', value: 45, color: '#f97316' },
  { name: 'Selected', value: 23, color: '#22c55e' },
  { name: 'Joined', value: 8, color: '#10b981' },
]

const interviewConversion = [
  { name: 'Passed', value: 65, color: '#22c55e' },
  { name: 'Failed', value: 25, color: '#ef4444' },
  { name: 'No Show', value: 10, color: '#eab308' },
]

const recruiterPerformance = [
  { name: 'Anita Kumar', hired: 12, pipeline: 28 },
  { name: 'Rahul Verma', hired: 10, pipeline: 22 },
  { name: 'Priya Sharma', hired: 8, pipeline: 18 },
  { name: 'John Doe', hired: 15, pipeline: 32 },
  { name: 'Sneha Patel', hired: 6, pipeline: 14 },
]

const sourceAnalysis = [
  { name: 'LinkedIn', value: 85, color: '#0a66c2' },
  { name: 'Naukri', value: 45, color: '#e31b23' },
  { name: 'Indeed', value: 38, color: '#2164f3' },
  { name: 'Referral', value: 52, color: '#10b981' },
  { name: 'Company Site', value: 28, color: '#8b5cf6' },
  { name: 'Other', value: 15, color: '#6b7280' },
]

const revenueData = [
  { month: 'Jan', revenue: 120000, target: 100000 },
  { month: 'Feb', revenue: 150000, target: 120000 },
  { month: 'Mar', revenue: 180000, target: 150000 },
  { month: 'Apr', revenue: 140000, target: 150000 },
  { month: 'May', revenue: 210000, target: 180000 },
  { month: 'Jun', revenue: 195000, target: 180000 },
]

const summaryStats = [
  { label: 'Total Placements', value: '156', change: '+18%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Active Requirements', value: '24', change: '+4', up: true, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Interview Conversion', value: '72%', change: '+8%', up: true, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Offer Acceptance', value: '85%', change: '+5%', up: true, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Revenue MTD', value: '₹1.95L', change: '+12%', up: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { label: 'Avg. Time to Hire', value: '18 days', change: '-3 days', up: true, icon: Target, color: 'text-rose-600', bg: 'bg-rose-100' },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive recruitment metrics, performance, and revenue tracking.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant={stat.up ? 'default' : 'destructive'} className="flex items-center gap-0.5 text-xs">
                  {stat.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Monthly Hiring Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyHiring}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="shortlisted" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="joined" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Pipeline Conversion</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineConversion}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" name="Candidates" radius={[4, 4, 0, 0]}>
                    {pipelineConversion.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recruiter Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recruiterPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={90} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pipeline" name="Pipeline" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="hired" name="Hired" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Source Analysis</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceAnalysis} cx="50%" cy="50%" outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {sourceAnalysis.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Revenue vs Target</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Interview Conversion</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={interviewConversion} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {interviewConversion.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
