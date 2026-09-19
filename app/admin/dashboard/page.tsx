'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2, Users, Clock, CheckCircle, XCircle, AlertTriangle,
  Briefcase, CreditCard, TrendingUp, ArrowUp, ArrowDown,
  Download, DollarSign, Activity,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 0, agencies: 1 },
  { month: 'Feb', revenue: 35000, agencies: 2 },
  { month: 'Mar', revenue: 70000, agencies: 3 },
  { month: 'Apr', revenue: 70000, agencies: 3 },
  { month: 'May', revenue: 105000, agencies: 4 },
  { month: 'Jun', revenue: 140000, agencies: 5 },
]

const recentActivities = [
  { action: 'New Agency Registered', detail: 'XYZ Talent Hunt - Pending approval', time: '2 hours ago', type: 'pending' },
  { action: 'Payment Received', detail: 'Global Staffing Inc - ₹41,300', time: '3 hours ago', type: 'payment' },
  { action: 'Agency Approved', detail: 'ABC Recruitment Solutions approved', time: '2 days ago', type: 'approved' },
  { action: 'Agency Rejected', detail: 'Talent Bridge HR - Incomplete docs', time: '5 days ago', type: 'rejected' },
  { action: 'Subscription Expiring', detail: 'Premier Recruiters - 3 days left', time: '1 week ago', type: 'warning' },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAgencies: 0,
    pendingApprovals: 0,
    approvedAgencies: 0,
    rejectedAgencies: 0,
    activeJobs: 0,
    totalCandidates: 0,
    premiumSubscriptions: 0,
    revenue: 0,
  })

  useEffect(() => {
    db.companies.getAll().then((companies) => {
      if (!companies || !Array.isArray(companies)) return
      const pending = companies.filter((c) => c.status === 'pending').length
      const approved = companies.filter((c) => c.status === 'approved').length
      const rejected = companies.filter((c) => c.status === 'rejected').length
      setStats({
        totalAgencies: companies.length,
        pendingApprovals: pending,
        approvedAgencies: approved,
        rejectedAgencies: rejected,
        activeJobs: approved * 12,
        totalCandidates: approved * 450,
        premiumSubscriptions: approved,
        revenue: approved * 35000,
      })
    })
  }, [])

  const pieData = [
    { name: 'Approved', value: stats.approvedAgencies || 1 },
    { name: 'Pending', value: stats.pendingApprovals || 1 },
    { name: 'Rejected', value: stats.rejectedAgencies || 1 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview, analytics, and recent activities.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100"><Building2 className="h-5 w-5 text-blue-600" /></div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Total</Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.totalAgencies}</p>
            <p className="text-xs text-muted-foreground">Total Companies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-100"><Clock className="h-5 w-5 text-yellow-600" /></div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{stats.pendingApprovals}</Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.pendingApprovals}</p>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{stats.approvedAgencies}</Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.approvedAgencies}</p>
            <p className="text-xs text-muted-foreground">Approved Companies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-100"><XCircle className="h-5 w-5 text-red-600" /></div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{stats.rejectedAgencies}</Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.rejectedAgencies}</p>
            <p className="text-xs text-muted-foreground">Rejected Companies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100"><Briefcase className="h-5 w-5 text-purple-600" /></div>
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.activeJobs.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Active Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100"><Users className="h-5 w-5 text-indigo-600" /></div>
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.totalCandidates.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-100"><CreditCard className="h-5 w-5 text-teal-600" /></div>
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.premiumSubscriptions}</p>
            <p className="text-xs text-muted-foreground">Active Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100"><DollarSign className="h-5 w-5 text-orange-600" /></div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <ArrowUp className="mr-0.5 h-3 w-3" /> +100%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Revenue & Agency Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="revenue" name="Revenue (₹)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="agencies" name="Agencies" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Agency Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((act, i) => {
                const colors: Record<string, string> = {
                  pending: 'bg-yellow-500', payment: 'bg-green-500',
                  approved: 'bg-blue-500', rejected: 'bg-red-500', warning: 'bg-orange-500',
                }
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${colors[act.type] || 'bg-gray-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{act.action}</p>
                      <p className="text-xs text-muted-foreground">{act.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{act.time}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Platform Statistics</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Total Companies</span>
                <span className="font-semibold">{stats.totalAgencies}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Approval Rate</span>
                <span className="font-semibold">
                  {stats.totalAgencies > 0
                    ? Math.round((stats.approvedAgencies / stats.totalAgencies) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Avg Jobs per Agency</span>
                <span className="font-semibold">{stats.approvedAgencies > 0 ? 12 : 0}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Avg Candidates per Agency</span>
                <span className="font-semibold">{stats.approvedAgencies > 0 ? 450 : 0}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Revenue per Agency</span>
                <span className="font-semibold">₹{stats.approvedAgencies > 0 ? '35,000' : '0'}/yr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Reviews</span>
                <span className="font-semibold">{stats.pendingApprovals}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
