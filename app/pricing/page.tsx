'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For small teams getting started',
    features: [
      '3 Job Posts',
      '100 Candidate Views/month',
      '2 Team Members',
      'Basic Analytics',
      'Email Support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    price: '₹35,000',
    period: '/year',
    description: 'For growing businesses',
    features: [
      '50+ Job Posts',
      '1500 Candidate Database Access/month',
      '10 Team Members',
      '1 Year Validity',
      'AI Job Description Generator',
      'Voice Assistant Search',
      'Advanced Analytics',
      'Priority Support',
    ],
    cta: 'Choose Premium',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited Job Posts',
      'Unlimited Candidate Access',
      'Unlimited Team Members',
      'Custom Integrations',
      'Dedicated Account Manager',
      'SLA Guarantee',
      'Custom Training',
      '24/7 Phone Support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your needs.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative transition-shadow hover:shadow-lg ${
                  plan.popular ? 'border-primary shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      <Star className="h-3 w-3" /> Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.name === 'Enterprise' ? (
                    <Link href="/contact" className="w-full">
                      <Button variant="outline" className="w-full">
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : plan.name === 'Premium' ? (
                    <Link href="/recruiter" className="w-full">
                      <Button className="w-full">{plan.cta}</Button>
                    </Link>
                  ) : (
                    <Link href="/recruiter" className="w-full">
                      <Button variant="outline" className="w-full">
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
