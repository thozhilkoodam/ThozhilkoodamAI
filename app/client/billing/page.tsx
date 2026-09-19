'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Download, CreditCard, IndianRupee, AlertCircle, CheckCircle2, Clock, Crown } from 'lucide-react'
import toast from 'react-hot-toast'

const invoices = [
  { id: 'INV-2024-001', date: '20 Jun 2024', amount: 118000, status: 'pending' as const, description: 'Recruitment services - Senior React Developer' },
  { id: 'INV-2024-002', date: '15 Jun 2024', amount: 70800, status: 'paid' as const, description: 'Recruitment services - Product Manager' },
  { id: 'INV-2024-003', date: '10 Jun 2024', amount: 25000, status: 'paid' as const, description: 'Advance payment - UX Designer' },
]

const payments = [
  { id: 'PAY-001', date: '15 Jun 2024', amount: 70800, method: 'Bank Transfer', status: 'success' as const },
  { id: 'PAY-002', date: '10 Jun 2024', amount: 25000, method: 'UPI', status: 'success' as const },
]

export default function BillingPage() {
  const [outstandingAmount] = useState(118000)

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Invoice ${id} downloaded!`)
  }

  const handlePayNow = () => {
    toast.success('Redirecting to payment gateway...')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1"><CheckCircle2 className="h-3 w-3" /> Paid</Badge>
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      case 'overdue':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Overdue</Badge>
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1"><CheckCircle2 className="h-3 w-3" /> Success</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage invoices, payments, and GST receipts.</p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Crown className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-xl font-bold">Premium Recruitment Plan</p>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="default" className="bg-primary">Active</Badge>
                  <span className="text-xs text-muted-foreground">₹35,000/year &middot; Renews on 31 Dec 2024</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">Upgrade Plan</Button>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Job Postings', value: 'Unlimited' },
              { label: 'Active Requirements', value: '5/10' },
              { label: 'Team Members', value: '3/5' },
              { label: 'Support', value: 'Priority' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-sm font-medium">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {outstandingAmount > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <IndianRupee className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Amount</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ₹{outstandingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button onClick={handlePayNow} className="gap-2">
                <CreditCard className="h-4 w-4" /> Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices"><FileText className="mr-2 h-4 w-4" /> Invoices</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="mr-2 h-4 w-4" /> Payments</TabsTrigger>
          <TabsTrigger value="gst"><FileText className="mr-2 h-4 w-4" /> GST Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and download your invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{inv.id}</p>
                        <p className="text-xs text-muted-foreground">{inv.date} &middot; {inv.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">₹{inv.amount.toLocaleString()}</span>
                      {getStatusBadge(inv.status)}
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(inv.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track your payment transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((pay) => (
                  <div key={pay.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{pay.id}</p>
                        <p className="text-xs text-muted-foreground">{pay.date} &middot; {pay.method}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">₹{pay.amount.toLocaleString()}</span>
                      {getStatusBadge(pay.status)}
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(pay.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst">
          <Card>
            <CardHeader>
              <CardTitle>GST Receipts</CardTitle>
              <CardDescription>Download GST-compliant receipts for your records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.filter((inv) => inv.status === 'paid').map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">GST Receipt — {inv.id}</p>
                        <p className="text-xs text-muted-foreground">{inv.date} &middot; GST 18% included</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownloadInvoice(inv.id)}>
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </div>
                ))}
                {invoices.filter((inv) => inv.status === 'paid').length === 0 && (
                  <div className="rounded-lg bg-muted p-6 text-center">
                    <p className="text-sm text-muted-foreground">No paid invoices yet. Receipts will appear here once payments are completed.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
