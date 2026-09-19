'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api-client'
import {
  Check, Crown, Zap, Star, Shield, CreditCard, Smartphone,
  Landmark, Wallet, HeadphonesIcon, Sparkles, UserPlus, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentSummary {
  planPrice: number
  gst: number
  total: number
}

interface PlanFeature {
  name: string
  included: boolean
  sub?: string
}

interface Plan {
  name: string
  price: string
  period: string
  gst?: string
  tagline: string
  features: PlanFeature[]
  popular: boolean
  icon: React.ElementType
  color: string
  buttonText: string
  buttonVariant: 'default' | 'outline'
  paymentSummary?: PaymentSummary
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '₹0',
    period: 'Unlimited',
    tagline: 'Get started with basic recruitment tools',
    features: [
      { name: 'First 2 Job Posts Free', included: true },
      { name: 'Basic Candidate Database', included: true },
      { name: 'Email Support', included: true },
      { name: 'Dashboard Access', included: true },
      { name: 'Reports & Analytics (Basic)', included: true }
    ],
    popular: false,
    icon: Zap,
    color: 'bg-slate-500',
    buttonText: 'Start Free',
    buttonVariant: 'outline',
  },
  {
    name: 'Professional',
    price: '₹499',
    period: '/ 15 Days',
    gst: '+18% GST Applicable',
    tagline: 'For growing recruitment agencies',
    features: [
      { name: 'Total 5 Job Posts', included: true, sub: '(3 Professional + 2 Free Bonus Job Posts)' },
      { name: 'Duration 15 Days', included: true },
      { name: 'Up to 60 Candidates', included: true },
      { name: 'Candidate Database', included: true },
      { name: 'Resume Search', included: true },
      { name: 'Interview Management', included: true },
      { name: 'Candidate Pipeline CRM', included: true },
      { name: 'Reports & Analytics', included: true },
      { name: 'Email Support', included: true }
    ],
    popular: true,
    icon: Crown,
    color: 'bg-primary',
    buttonText: 'Upgrade to Professional',
    buttonVariant: 'default',
    paymentSummary: { planPrice: 499, gst: 89.82, total: 588.82 },
  },
  {
    name: 'Business',
    price: '₹5,999',
    period: '/ Month',
    gst: '+18% GST Applicable',
    tagline: 'For established recruitment firms',
    features: [
      { name: '1 Month Validity', included: true },
      { name: 'Up to 350 Candidates', included: true },
      { name: 'Up to 3 Team Members', included: true },
      { name: 'Unlimited Job Posts', included: true },
      { name: 'Candidate CRM', included: true },
      { name: 'Resume Database', included: true },
      { name: 'Interview Scheduling', included: true },
      { name: 'Reports & Analytics', included: true },
      { name: 'Team Collaboration', included: true },
      { name: 'Bulk Resume Upload', included: true },
      { name: 'Priority Email Support', included: true },
    ],
    popular: false,
    icon: Star,
    color: 'bg-violet-500',
    buttonText: 'Upgrade to Business',
    buttonVariant: 'default',
    paymentSummary: { planPrice: 5999, gst: 1079.82, total: 7078.82 },
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'Pricing',
    tagline: 'For large enterprises with custom needs',
    features: [
      { name: 'Unlimited Job Posts', included: true },
      { name: 'Unlimited Candidates', included: true },
      { name: 'Unlimited Team Members', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'API Access', included: true },
      { name: 'Priority Support', included: true },
      { name: 'White Label Solution', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Multi Branch Management', included: true },
      { name: 'Custom SLA', included: true },
    ],
    popular: false,
    icon: Shield,
    color: 'bg-amber-500',
    buttonText: 'Contact Sales',
    buttonVariant: 'outline',
  },
]

const paymentMethods = [
  { name: 'UPI', icon: Smartphone },
  { name: 'Razorpay', icon: CreditCard },
  { name: 'Credit Card', icon: CreditCard },
  { name: 'Debit Card', icon: CreditCard },
  { name: 'Net Banking', icon: Landmark },
  { name: 'Wallet', icon: Wallet },
]

export default function UpgradePlansPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <UpgradePlansContent />
    </Suspense>
  )
}

function UpgradePlansContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAddingRecruiter = searchParams.get('action') === 'addRecruiter'
  const [selectedPlan, setSelectedPlan] = useState('Professional')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null)
  const [processing, setProcessing] = useState(false)
  const [creatingRecruiter, setCreatingRecruiter] = useState(false)

  const handleSelectPlan = (plan: Plan) => {
    if (plan.name === 'Enterprise') {
      toast.success('Enterprise sales team will contact you')
      return
    }
    if (plan.name === 'Free') {
      if (isAddingRecruiter) {
        toast.error('Please select a paid plan to add an HR Recruiter')
        return
      }
      toast.success('Free plan activated! Start posting jobs.')
      return
    }
    if (plan.paymentSummary) {
      setPaymentPlan(plan)
      setShowPayment(true)
    }
  }

  const handlePayment = async () => {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 2000))
    setProcessing(false)
    setShowPayment(false)
    setSelectedPlan(paymentPlan?.name || 'Professional')

    if (isAddingRecruiter) {
      const data = sessionStorage.getItem('pendingRecruiterData')
      if (!data) {
        toast.error('Recruiter data not found. Please try again.')
        return
      }
      setCreatingRecruiter(true)
      try {
        await api.hrConsultants.create(JSON.parse(data))
        sessionStorage.removeItem('pendingRecruiterData')
        toast.success('HR Recruiter created and invitation email sent!')
        router.push('/dashboard/hr-consultants')
      } catch (error: any) {
        toast.error(error.message || 'Failed to create HR Recruiter')
        setCreatingRecruiter(false)
      }
      return
    }

    toast.success(`Payment successful! ${paymentPlan?.name} plan activated.`)
  }

  const formatPrice = (amount: number) =>
    '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {isAddingRecruiter ? 'Select a Plan to Add HR Recruiter' : 'Upgrade Your Plan'}
        </h1>
        <p className="text-muted-foreground">
          {isAddingRecruiter
            ? 'Choose a paid subscription plan to activate the new HR Recruiter account.'
            : 'Choose the perfect plan for your recruitment needs. Upgrade anytime to unlock more features.'}
        </p>
      </div>

      {isAddingRecruiter && (
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 p-4 max-w-2xl mx-auto">
          <UserPlus className="h-5 w-5 text-primary shrink-0" />
          <div className="text-sm">
            <span className="font-medium">Pending HR Recruiter</span>
            <span className="text-muted-foreground">
              {' '}— Select a paid plan and complete payment to create the recruiter account. An invitation email will be sent afterward.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.name
          const Icon = plan.icon
          const hasPayment = !!plan.paymentSummary

          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                plan.popular
                  ? 'border-primary shadow-md ring-1 ring-primary/20'
                  : ''
              } ${isSelected && plan.name !== 'Free' && plan.name !== 'Enterprise' ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-md whitespace-nowrap">
                    <Sparkles className="h-3 w-3 mr-1.5" /> Most Popular
                  </Badge>
                </div>
              )}

              {isSelected && plan.name !== 'Free' && plan.name !== 'Enterprise' && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="success" className="text-[10px] px-2 py-0.5">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2 pt-7">
                <div className={`w-14 h-14 rounded-2xl ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-xs mt-1">{plan.tagline}</CardDescription>
                <div className="mt-4 space-y-0.5">
                  <div>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                    )}
                  </div>
                  {plan.gst && (
                    <p className="text-[11px] text-muted-foreground/70 font-medium">{plan.gst}</p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-2.5 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <div className="h-4 w-4 shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground line-through'}>
                        {feature.name}
                        {feature.sub && (
                          <span className="text-muted-foreground text-[11px] block">{feature.sub}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full mt-6 ${
                    plan.buttonVariant === 'outline' && plan.name === 'Free'
                      ? 'border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950'
                      : ''
                  }`}
                  variant={plan.buttonVariant}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-8 text-center">
          <div className="max-w-lg mx-auto space-y-3">
            <h3 className="text-lg font-semibold">Need Custom Recruitment Solution?</h3>
            <p className="text-sm text-muted-foreground">
              Get a tailored plan designed specifically for your organization&apos;s unique hiring needs.
            </p>
            <Button variant="outline" className="mt-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950">
              <HeadphonesIcon className="h-4 w-4 mr-2" />
              Contact help
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Payment Summary</DialogTitle>
            <DialogDescription>
              Complete your subscription to {paymentPlan?.name} plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="rounded-xl bg-muted/50 border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{paymentPlan?.name} Plan</span>
                <span className="font-bold text-lg">
                  {paymentPlan?.paymentSummary && `₹${paymentPlan.paymentSummary.planPrice.toLocaleString('en-IN')}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Plan Price</span>
                <span>{paymentPlan?.paymentSummary && `₹${paymentPlan.paymentSummary.planPrice.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST (18%)</span>
                <span>{paymentPlan?.paymentSummary && formatPrice(paymentPlan.paymentSummary.gst)}</span>
              </div>
              <Separator className="border-dashed" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{paymentPlan?.paymentSummary && formatPrice(paymentPlan.paymentSummary.total)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Payment Methods
              </p>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const MethodIcon = method.icon
                  return (
                    <div
                      key={method.name}
                      className="flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <MethodIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
                        {method.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowPayment(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handlePayment} disabled={processing || creatingRecruiter}>
              {creatingRecruiter ? 'Creating Recruiter...' : processing ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
