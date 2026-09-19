'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Download, CreditCard, Building2, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const mockPayments = [
  { id: 'PAY-001', agency: 'ABC Recruitment Solutions', amount: 35000, status: 'completed', date: '2025-01-15', method: 'Razorpay', txnId: 'txn_abc123' },
  { id: 'PAY-002', agency: 'Global Staffing Inc', amount: 35000, status: 'completed', date: '2025-03-01', method: 'Razorpay', txnId: 'txn_def456' },
  { id: 'PAY-003', agency: 'Premier Recruiters', amount: 35000, status: 'completed', date: '2024-07-10', method: 'Razorpay', txnId: 'txn_ghi789' },
  { id: 'PAY-004', agency: 'Talent Source India', amount: 35000, status: 'refunded', date: '2024-01-20', method: 'Razorpay', txnId: 'txn_jkl012' },
  { id: 'PAY-005', agency: 'HR Connect Services', amount: 35000, status: 'failed', date: '2024-06-15', method: 'Razorpay', txnId: 'txn_mno345' },
]

const monthlyData = [
  { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 35000 },
  { month: 'Mar', amount: 70000 }, { month: 'Apr', amount: 0 },
  { month: 'May', amount: 35000 }, { month: 'Jun', amount: 0 },
]

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = mockPayments.filter((p) => {
    const m = p.agency.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
    return filter === 'all' ? m : m && p.status === filter
  })

  const totalRevenue = mockPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Payment Management</h1><p className="text-muted-foreground">Track payments, refunds, and transaction history.</p></div>
        <Button variant="outline" size="sm" onClick={() => toast.success('Payments exported')}><Download className="mr-1.5 h-4 w-4" /> Export</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Revenue</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{mockPayments.filter(p => p.status === 'completed').length}</p><p className="text-xs text-muted-foreground">Successful Payments</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{mockPayments.filter(p => p.status === 'failed').length}</p><p className="text-xs text-muted-foreground">Failed Payments</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-orange-600">{mockPayments.filter(p => p.status === 'refunded').length}</p><p className="text-xs text-muted-foreground">Refunds</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Monthly Revenue</CardTitle></CardHeader>
        <CardContent><div className="h-[200px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></CardContent>
      </Card>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search payments..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="flex gap-1">
          {['all', 'completed', 'failed', 'refunded'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize">{f}</Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><CreditCard className="h-5 w-5 text-primary" /></div>
              <div className="flex-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="font-medium text-sm">{payment.agency}</p><p className="text-xs text-muted-foreground font-mono">{payment.id}</p></div>
                <div><p className="font-semibold text-sm">₹{payment.amount.toLocaleString()}</p><p className="text-xs text-muted-foreground">{payment.method}</p></div>
                <div className="text-xs text-muted-foreground"><Calendar className="inline h-3 w-3 mr-1" />{new Date(payment.date).toLocaleDateString('en-IN')}</div>
                <div className="flex items-center justify-between gap-2">
                  <Badge className={payment.status === 'completed' ? 'bg-green-100 text-green-700' : payment.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}>
                    {payment.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => toast.success(`Txn ID: ${payment.txnId}`)}>View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
