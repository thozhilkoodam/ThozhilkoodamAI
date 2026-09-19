'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Download, CheckCircle2, XCircle, Eye, IndianRupee, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'

const quotations = [
  {
    id: 'QT-2024-001',
    date: '18 Jun 2024',
    serviceCharges: 25000,
    placementCharges: 75000,
    gst: 18000,
    total: 118000,
    status: 'sent' as const,
    requirement: 'Senior React Developer',
    description: 'Recruitment services for Senior React Developer position (3 vacancies)',
  },
  {
    id: 'QT-2024-002',
    date: '20 Jun 2024',
    serviceCharges: 15000,
    placementCharges: 45000,
    gst: 10800,
    total: 70800,
    status: 'approved' as const,
    requirement: 'Product Manager',
    description: 'Recruitment services for Product Manager position (2 vacancies)',
  },
  {
    id: 'QT-2024-003',
    date: '22 Jun 2024',
    serviceCharges: 20000,
    placementCharges: 60000,
    gst: 14400,
    total: 94400,
    status: 'rejected' as const,
    requirement: 'UX Designer',
    description: 'Recruitment services for UX Designer position (1 vacancy)',
  },
]

export default function MSMEQuotationPage() {
  const [selectedQuotation, setSelectedQuotation] = useState<typeof quotations[0] | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary" className="gap-1"><Eye className="h-3 w-3" /> Sent</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleApprove = (id: string) => {
    toast.success(`Quotation ${id} approved successfully!`)
  }

  const handleReject = (id: string) => {
    toast.success(`Quotation ${id} rejected. Our team will contact you.`)
  }

  const handleDownload = (id: string) => {
    toast.success(`Quotation ${id} PDF downloaded!`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quotations</h1>
        <p className="text-muted-foreground">View and manage your recruitment quotations.</p>
      </div>

      <div className="space-y-4">
        {quotations.map((q) => (
          <Card key={q.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Receipt className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{q.id}</h3>
                      {getStatusBadge(q.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{q.requirement}</p>
                    <p className="text-xs text-muted-foreground">{q.date} &middot; {q.description}</p>

                    <div className="mt-3 flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground">Service Charges</p>
                        <p className="text-sm font-medium">₹{q.serviceCharges.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Placement Charges</p>
                        <p className="text-sm font-medium">₹{q.placementCharges.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">GST (18%)</p>
                        <p className="text-sm font-medium">₹{q.gst.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-primary">₹{q.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {q.status === 'sent' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900 gap-1"
                        onClick={() => handleApprove(q.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900 gap-1"
                        onClick={() => handleReject(q.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(q.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedQuotation(q)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Quotation Details</DialogTitle>
                        <DialogDescription>{q.id} — {q.requirement}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="rounded-lg bg-muted p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Service Charges</span>
                              <span>₹{q.serviceCharges.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Placement Charges</span>
                              <span>₹{q.placementCharges.toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>₹{(q.serviceCharges + q.placementCharges).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">GST (18%)</span>
                              <span>₹{q.gst.toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                              <span>Total Amount</span>
                              <span className="text-primary">₹{q.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          {getStatusBadge(q.status)}
                        </div>

                        <Button className="w-full gap-2" onClick={() => handleDownload(q.id)}>
                          <Download className="h-4 w-4" /> Download PDF
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
