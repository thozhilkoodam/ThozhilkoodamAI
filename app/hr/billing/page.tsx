'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Download, CreditCard, Star, FileText, Shield, Zap, Loader2, AlertCircle, Crown, Lock } from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '₹0',
    period: 'forever',
    jobPosts: 2,
    candidateAccess: 50,
    teamMembers: 1,
    features: ['2 Job Posts', '50 Candidates/Month', '1 Team Member'],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 35000,
    priceLabel: '₹35,000',
    period: '/year',
    jobPosts: 50,
    candidateAccess: 1500,
    teamMembers: 10,
    features: ['50+ Job Posts', '1500 Candidates/Month', '10 Team Members', 'AI Job Description', 'Advanced Analytics', 'Priority Support'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99999,
    priceLabel: '₹99,999',
    period: '/year',
    jobPosts: 500,
    candidateAccess: 10000,
    teamMembers: 50,
    features: ['Unlimited Job Posts', '10,000+ Candidates/Month', '50 Team Members', 'Dedicated Account Manager', 'Custom Integrations', 'API Access', 'SLA Guarantee'],
    popular: false,
  },
]

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [sub, pmts] = await Promise.all([
        api.billing.getMySubscription(),
        api.billing.getMyPayments(),
      ])
      setSubscription(sub)
      setPayments(pmts || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      toast('You are already on the Free plan')
      return
    }
    setSubscribing(planId)
    try {
      const order = await api.billing.createOrder(planId)
      if (!order) { toast.error('Failed to create order'); return }
      toast.success('Order created! Simulating payment...')
      const verify = await api.billing.verifyPayment({
        paymentId: order.paymentId,
        razorpayOrderId: 'rzp_sim_' + Date.now(),
        razorpayPaymentId: 'pay_sim_' + Date.now(),
        razorpaySignature: 'sig_sim_' + Date.now(),
      })
      if (verify?.success) {
        toast.success('Subscription activated!')
        fetchData()
      }
    } catch (e: any) {
      toast.error(e.message || 'Subscription failed')
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchData}>Retry</Button>
      </div>
    )
  }

  const activePlan = subscription
    ? PLANS.find((p) => p.id === (subscription.planName?.toLowerCase() === 'premium' ? 'professional' : subscription.planName?.toLowerCase()))
    : PLANS[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information.</p>
      </div>

      {subscription && activePlan && (
        <Card className="border-primary shadow-md relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-green-500">Active Plan</Badge>
          </div>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4">{subscription.planName}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">{activePlan.priceLabel}</span>
              <span className="text-muted-foreground">{activePlan.period}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Status: {subscription.status}</span>
              <span className="flex items-center gap-1"><Zap className="h-4 w-4" /> Valid until {new Date(subscription.endDate).toLocaleDateString()}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 max-w-lg mx-auto">
              {activePlan.features.map((feature: string) => (
                <div key={feature} className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">&check;</span>
                  </span>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!subscription && (
        <div className="text-center py-8">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-1">Free Plan (Active)</h3>
          <p className="text-sm text-muted-foreground mb-4">2 job posts, 50 candidates/month, 1 team member</p>
        </div>
      )}

      <Separator />

      <div>
        <h2 className="text-xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.filter((p) => p.id !== 'free').map((plan) => {
            const isCurrent = subscription && plan.id === 'professional' && subscription.planName?.toLowerCase() === 'premium'
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.priceLabel}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <span className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-xs font-bold">&check;</span>
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || subscribing === plan.id}
                  >
                    {subscribing === plan.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      `Subscribe - ${plan.priceLabel}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((pmt: any) => (
                <div key={pmt.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{pmt.orderId || pmt.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(pmt.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-sm">₹{pmt.amount?.toLocaleString()}</span>
                    <Badge variant={pmt.status === 'completed' ? 'success' : 'secondary'} className="text-xs">{pmt.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success('Invoice download simulated')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
