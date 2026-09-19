'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Check, Download, CreditCard, Star, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const premiumFeatures = [
  '50+ Job Posts',
  '1500 Candidate Database Access per Month',
  '10 Team Members',
  '1 Year Validity',
  'AI Job Description Generator',
  'Voice Assistant Search',
  'Advanced Analytics & Reports',
  'Priority Email & Phone Support',
  'Custom Branding',
  'API Access',
]

export default function BillingPage() {
  const [showPayment, setShowPayment] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [active, setActive] = useState(false)

  const handlePayment = async () => {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 2000))
    setProcessing(false)
    setActive(true)
    setShowPayment(false)
    toast.success('Payment successful! Premium plan activated.')
  }

  const downloadInvoice = () => {
    toast.success('Invoice PDF downloaded!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and billing information.</p>
      </div>

      <Card className={`relative ${active ? 'border-green-500' : 'border-primary'} shadow-lg`}>
        {active && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-green-500">Active Plan</Badge>
          </div>
        )}
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Star className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl mt-4">Premium Plan</CardTitle>
          <CardDescription>Everything you need for efficient recruitment</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">₹35,000</span>
            <span className="text-muted-foreground">/year</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {premiumFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          {active ? (
            <div className="text-center">
              <Badge variant="success" className="mb-2">Subscription Active</Badge>
              <p className="text-sm text-muted-foreground">Valid until March 2025</p>
              <Button variant="outline" className="mt-4" onClick={downloadInvoice}>
                <Download className="mr-2 h-4 w-4" /> Download Invoice
              </Button>
            </div>
          ) : (
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full sm:w-auto">Purchase Premium Plan</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Complete Payment</DialogTitle>
                  <DialogDescription>Secure payment via Razorpay</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Premium Plan</span>
                      <span className="font-bold">₹35,000</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹35,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST (18%)</span>
                      <span>₹6,300</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹41,300</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 rounded-lg border p-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Pay with Razorpay</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPayment(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handlePayment} disabled={processing}>
                    {processing ? 'Processing...' : `Pay ₹41,300`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>

      {active && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '15 Mar 2024', amount: '₹41,300', status: 'Paid', id: 'INV-2024-001' },
              ].map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{inv.id}</p>
                      <p className="text-sm text-muted-foreground">{inv.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{inv.amount}</span>
                    <Badge variant="success">{inv.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={downloadInvoice}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
