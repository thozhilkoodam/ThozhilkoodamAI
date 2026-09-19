'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, BarChart3, TrendingUp, Users, Building2, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import toast from 'react-hot-toast'

const monthlyData = [
  { month: 'Jan', revenue: 0, registrations: 1, approvals: 0 },
  { month: 'Feb', revenue: 35000, registrations: 1, approvals: 1 },
  { month: 'Mar', revenue: 70000, registrations: 2, approvals: 1 },
  { month: 'Apr', revenue: 70000, registrations: 1, approvals: 0 },
  { month: 'May', revenue: 105000, registrations: 1, approvals: 1 },
  { month: 'Jun', revenue: 140000, registrations: 2, approvals: 1 },
]

const jobData = [
  { category: 'IT', count: 45 }, { category: 'Finance', count: 28 },
  { category: 'Healthcare', count: 22 }, { category: 'Education', count: 18 },
  { category: 'Manufacturing', count: 15 }, { category: 'Retail', count: 12 },
]

export default function ReportsPage() {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 })

  useEffect(() => {
    db.companies.getAll().then((companies) => {
      setStats({
        total: companies.length,
        approved: companies.filter((c) => c.status === 'approved').length,
        pending: companies.filter((c) => c.status === 'pending').length,
        rejected: companies.filter((c) => c.status === 'rejected').length,
      })
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Reports & Analytics</h1><p className="text-muted-foreground">Platform-wide metrics, trends, and insights.</p></div>
        <Button variant="outline" size="sm" onClick={() => toast.success('Report generated')}><Download className="mr-1.5 h-4 w-4" /> Download Report</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Building2 className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Agencies</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.approved}</p><p className="text-xs text-muted-foreground">Approved</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.total * 12}</p><p className="text-xs text-muted-foreground">Total Jobs</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">₹{stats.approved * 35000}</p><p className="text-xs text-muted-foreground">Revenue</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth"><BarChart3 className="mr-1.5 h-4 w-4" /> Growth</TabsTrigger>
          <TabsTrigger value="jobs"><TrendingUp className="mr-1.5 h-4 w-4" /> Job Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="growth" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Monthly Growth Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (₹)" />
                    <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} name="Registrations" />
                    <Line type="monotone" dataKey="approvals" stroke="#8b5cf6" strokeWidth={2} name="Approvals" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Job Postings by Category</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Approval Funnel</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div><div className="flex justify-between text-sm mb-1"><span>Total Registrations</span><span className="font-semibold">{stats.total}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-blue-500" style={{ width: '100%' }} /></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Approved</span><span className="font-semibold text-green-600">{stats.approved}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-green-500" style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }} /></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Pending Review</span><span className="font-semibold text-yellow-600">{stats.pending}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-yellow-500" style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }} /></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Rejected</span><span className="font-semibold text-red-600">{stats.rejected}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-red-500" style={{ width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%` }} /></div></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Key Metrics</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2"><span className="text-sm">Approval Rate</span><span className="font-semibold">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-sm">Rejection Rate</span><span className="font-semibold">{stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-sm">Avg Review Time</span><span className="font-semibold">2.3 days</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-sm">Revenue per Agency</span><span className="font-semibold">₹35,000/yr</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-sm">Active Subscribers</span><span className="font-semibold">{stats.approved}</span></div>
              <div className="flex justify-between"><span className="text-sm">Growth Rate</span><Badge className="bg-green-100 text-green-700">+{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% MoM</Badge></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
