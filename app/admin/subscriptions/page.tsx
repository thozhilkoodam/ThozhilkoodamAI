'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search, CreditCard, Calendar, Building2, Download,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import toast from 'react-hot-toast'

interface Subscription {
  id: string
  planName: string
  price: number
  gst: number
  totalAmount: number
  startDate: string
  expiryDate: string
  company: string
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  transactionId: string
  invoice: string
}

const mockSubscriptions: Subscription[] = [
  {
    id: 'SUB-001', planName: 'Professional', price: 499, gst: 89.82, totalAmount: 588.82,
    startDate: '2026-07-01', expiryDate: '2026-07-15', company: 'ABC Recruitment Solutions',
    paymentStatus: 'paid', transactionId: 'TXN-RAZ-001', invoice: 'INV-2026-001',
  },
  {
    id: 'SUB-002', planName: 'Business', price: 5999, gst: 1079.82, totalAmount: 7078.82,
    startDate: '2026-06-15', expiryDate: '2026-07-15', company: 'Global Staffing Inc',
    paymentStatus: 'paid', transactionId: 'TXN-RAZ-002', invoice: 'INV-2026-002',
  },
  {
    id: 'SUB-003', planName: 'Professional', price: 499, gst: 89.82, totalAmount: 588.82,
    startDate: '2026-07-05', expiryDate: '2026-07-20', company: 'Premier Recruiters',
    paymentStatus: 'pending', transactionId: 'TXN-RAZ-003', invoice: 'INV-2026-003',
  },
  {
    id: 'SUB-004', planName: 'Business', price: 5999, gst: 1079.82, totalAmount: 7078.82,
    startDate: '2026-05-01', expiryDate: '2026-06-01', company: 'Talent Source India',
    paymentStatus: 'failed', transactionId: 'TXN-RAZ-004', invoice: 'INV-2026-004',
  },
  {
    id: 'SUB-005', planName: 'Professional', price: 499, gst: 89.82, totalAmount: 588.82,
    startDate: '2026-04-10', expiryDate: '2026-04-25', company: 'HR Connect Services',
    paymentStatus: 'refunded', transactionId: 'TXN-RAZ-005', invoice: 'INV-2026-005',
  },
  {
    id: 'SUB-006', planName: 'Business', price: 5999, gst: 1079.82, totalAmount: 7078.82,
    startDate: '2026-07-10', expiryDate: '2026-08-10', company: 'Elite Hiring Agency',
    paymentStatus: 'paid', transactionId: 'TXN-RAZ-006', invoice: 'INV-2026-006',
  },
]

const paymentStatusConfig = {
  paid: { class: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400', label: 'Paid' },
  pending: { class: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
  failed: { class: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400', label: 'Failed' },
  refunded: { class: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400', label: 'Refunded' },
}

export default function SubscriptionManagement() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 5

  const filtered = mockSubscriptions.filter((s) =>
    s.company.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.transactionId.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  const totalRevenue = mockSubscriptions
    .filter((s) => s.paymentStatus === 'paid')
    .reduce((sum, s) => sum + s.totalAmount, 0)

  const downloadInvoice = (invoice: string) => {
    toast.success(`Invoice ${invoice} downloaded`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage all HR consultant subscriptions</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {mockSubscriptions.filter((s) => s.paymentStatus === 'paid').length}
            </p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {mockSubscriptions.filter((s) => s.paymentStatus === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {mockSubscriptions.filter((s) => s.paymentStatus === 'failed').length}
            </p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Subscription List</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search company, ID, or transaction..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>GST (18%)</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.planName}</TableCell>
                    <TableCell>₹{sub.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{sub.gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{sub.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">{sub.company}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(sub.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(sub.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusConfig[sub.paymentStatus].class}>
                        {paymentStatusConfig[sub.paymentStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono">
                        {sub.transactionId}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => downloadInvoice(sub.invoice)}
                      >
                        <Download className="h-3 w-3" />
                        {sub.invoice}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
