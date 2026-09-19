'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight, Mail, Phone, Globe, Clock, Sparkles } from 'lucide-react'

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-lg space-y-6 py-10">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Registration Submitted Successfully!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for registering with Thozhil Koodam.
          </p>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Verification Under Review</p>
                  <p className="text-sm text-muted-foreground">Your company verification is under review. Once approved, you can submit recruitment requirements.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">What happens next?</p>
                  <p className="text-sm text-muted-foreground">Our team will review your documents and verify your company. You will receive an email notification once verified.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@thozhilkoodam.com</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 6374741641</div>
              <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.thozhilkoodam.com</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/business-operations/msme/login">
            <Button className="gap-2">
              Go to Login <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
