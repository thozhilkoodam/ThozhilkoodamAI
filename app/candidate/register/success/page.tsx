'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react'

export default function RegisterSuccessPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Successful</h1>
        <p className="text-muted-foreground">Your account has been created successfully. Please login to continue.</p>
        <Card className="border-0 shadow-sm bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="p-4 flex items-center justify-center gap-2 text-sm text-purple-700 dark:text-purple-300">
            <Mail className="h-4 w-4" /> A welcome email has been sent to your registered email.
          </CardContent>
        </Card>
        <Button onClick={() => router.push('/candidate/login')} className="bg-purple-600 hover:bg-purple-700 gap-2">
          Go to Login <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
