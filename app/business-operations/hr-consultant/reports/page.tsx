'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts'
import {
  TrendingUp, Users, CalendarCheck, DollarSign, Clock, Target,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const monthlyHiring = [
  { month: 'Jan', applications: 45, screened: 32, interviewed: 20, offers: 12, joined: 8 },
  { month: 'Feb', applications: 52, screened: 38, interviewed: 25, offers: 15, joined: 10 },
  { month: 'Mar', applications: 48, screened: 35, interviewed: 22, offers: 14, joined: 9 },
  { month: 'Apr', applications: 55, screened: 40, interviewed: 28, offers: 16, joined: 11 },
  { month: 'May', applications: 62, screened: 45, interviewed: 30, offers: 18, joined: 14 },
  { month: 'Jun', applications: 58, screened: 42, interviewed: 26, offers: 15, joined: 10 },
]

const pipelineConversion = [
  { stage: 'Applied', count: 320 },
  { stage: 'Screened', count: 232 },
  { stage: 'Shortlisted', count: 168 },
  { stage: 'Interviewed', count: 130 },
  { stage: 'Offered', count: 85 },
  { stage: 'Joined', count: 62 },
]

const consultantPerformance = [
  { name: 'You', hired: 45, target: 50 },
  { name: 'Rajesh K', hired: 38, target: 40 },
  { name: 'Priya S', hired: 52, target: 45 },
  { name: 'Amit R', hired: 30, target: 35 },
  { name: 'Sneha M', hired: 42, target: 40 },
]

const sourceAnalysis = [
  { name: 'LinkedIn', value: 120, color: '#0a66c2' },
  { name: 'Naukri', value: 85, color: '#e65d2e' },
  { name: 'Referral', value: 65, color: '#22c55e' },
  { name: 'Company Site', value: 45, color: '#8b5cf6' },
  { name: 'Consultant', value: 35, color: '#f59e0b' },
  { name: 'Other', value: 25, color: '#64748b' },
]

const revenueData = [
  { month: 'Jan', revenue: 250000, target: 200000 },
  { month: 'Feb', revenue: 280000, target: 200000 },
  { month: 'Mar', revenue: 320000, target: 250000 },
  { month: 'Apr', revenue: 290000, target: 250000 },
  { month: 'May', revenue: 380000, target: 300000 },
  { month: 'Jun', revenue: 420000, target: 300000 },
]

const interviewConversionData = [
  { name: 'Selected', value: 38, color: '#22c55e' },
  { name: 'Rejected', value: 22, color: '#ef4444' },
  { name: 'Pending', value: 40, color: '#f59e0b' },
]

const stats = [
  { label: 'Total Applications', value: '320', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', change: '+12% vs last month' },
  { label: 'Total Interviews', value: '130', icon: CalendarCheck, color: 'text-violet-500', bg: 'bg-violet-500/10', change: '40.6% conversion' },
  { label: 'Offer Rate', value: '26.6%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', change: '+3.2% improvement' },
  { label: 'Avg Time to Hire', value: '18 days', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', change: '-2 days vs target' },
  { label: 'Revenue MTD', value: '₹4.2L', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', change: '₹4.2L this month' },
  { label: 'Target Achievement', value: '78%', icon: Target, color: 'text-rose-500', bg: 'bg-rose-500/10', change: '₹4.2L of ₹5.4L' },
]

export default function HrConsultantReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive recruitment analytics and insights</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export Report</Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-3 text-center">
                <div className={`p-1.5 rounded-lg ${stat.bg} inline-flex mx-auto`}>
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold mt-2">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                <p className="text-[9px] mt-0.5 text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="hiring" className="space-y-6">
        <TabsList className="border-border/50">
          <TabsTrigger value="hiring">Monthly Hiring</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Conversion</TabsTrigger>
          <TabsTrigger value="performance">Consultant Performance</TabsTrigger>
          <TabsTrigger value="source">Source Analysis</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="hiring">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Monthly Hiring Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyHiring}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="applications" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="screened" name="Screened" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="interviewed" name="Interviewed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="offers" name="Offers" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="joined" name="Joined" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Pipeline Conversion Funnel</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={pipelineConversion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" name="Candidates" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {pipelineConversion.map((entry, index) => (
                      <Cell key={index} fill={`rgba(99, 102, 241, ${1 - index * 0.12})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Consultant Performance</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={consultantPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="hired" name="Hired" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="target" name="Target" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Candidate Source Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={sourceAnalysis} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {sourceAnalysis.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Interview Conversion</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={interviewConversionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {interviewConversionData.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Revenue vs Target</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${(v / 1000)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
