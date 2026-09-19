'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  CreditCard, Download, CheckCircle, Crown, Calendar,
  Shield, Zap, Users, BarChart3, HeadphonesIcon,
  FileText, ArrowRight,
} from 'lucide-react'

const currentPlan = {
  name: 'Professional',
  price: '₹2,999',
  period: '/month',
  status: 'active',
  renewalDate: '15 Mar 2026',
  features: [
    { name: 'AI Resume Matching', included: true },
    { name: 'Unlimited Candidates', included: true },
    { name: 'Advanced Reports', included: true },
    { name: 'Bulk Upload', included: false },
    { name: 'Priority Support', included: false },
    { name: 'API Access', included: false },
  ],
}

const invoices = [
  { id: 'INV-001', date: '15 Jan 2026', amount: '₹2,999', status: 'paid', gst: 'INV-GST-001' },
  { id: 'INV-002', date: '15 Dec 2025', amount: '₹2,999', status: 'paid', gst: 'INV-GST-002' },
  { id: 'INV-003', date: '15 Nov 2025', amount: '₹2,999', status: 'paid', gst: 'INV-GST-003' },
  { id: 'INV-004', date: '15 Oct 2025', amount: '₹1,999', status: 'paid', gst: 'INV-GST-004' },
]

const payments = [
  { id: 'PAY-001', date: '15 Jan 2026', amount: '₹2,999', method: 'Credit Card', status: 'success' },
  { id: 'PAY-002', date: '15 Dec 2025', amount: '₹2,999', method: 'UPI', status: 'success' },
  { id: 'PAY-003', date: '15 Nov 2025', amount: '₹2,999', method: 'Net Banking', status: 'success' },
]

export default function HrConsultantBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and payment details</p>
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{currentPlan.name} Plan</h2>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                </div>
                <p className="text-3xl font-bold mt-2">
                  {currentPlan.price}
                  <span className="text-sm font-normal text-muted-foreground">{currentPlan.period}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Renews on {currentPlan.renewalDate}
                </p>
              </div>
            </div>
            <Link href="/hr-consultant/upgrade-plans">
              <Button><Zap className="h-4 w-4 mr-2" /> Upgrade Plan</Button>
            </Link>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {currentPlan.features.map((feature) => (
              <div key={feature.name} className="text-center p-3 rounded-lg bg-muted/30">
                {feature.included ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <div className="h-5 w-5 text-muted-foreground mx-auto">—</div>
                )}
                <p className="text-xs mt-1.5 text-muted-foreground">{feature.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="border-border/50">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="gst">GST Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Invoice History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Invoice #</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">GST</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                        <td className="p-3 text-sm font-medium">{inv.id}</td>
                        <td className="p-3 text-sm">{inv.date}</td>
                        <td className="p-3 text-sm">{inv.amount}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[10px]">{inv.status}</Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{inv.gst}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Payment #</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Method</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => (
                      <tr key={pay.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                        <td className="p-3 text-sm font-medium">{pay.id}</td>
                        <td className="p-3 text-sm">{pay.date}</td>
                        <td className="p-3 text-sm">{pay.amount}</td>
                        <td className="p-3 text-sm">{pay.method}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[10px]">{pay.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">GST Invoices</CardTitle>
              <CardDescription>Download GST-compliant invoices for your records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.gst}</p>
                      <p className="text-xs text-muted-foreground">{inv.date} • {inv.amount}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Download</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
