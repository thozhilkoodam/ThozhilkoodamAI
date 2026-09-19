'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandLogo } from '@/components/brand-logo'
import { api } from '@/lib/api-client'
import { Loader2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HrConsultantGoogleLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })

  const connectGoogle = async () => {
    if (!form.name || !form.email) {
      toast.error('Enter your Google name and email')
      return
    }
    setLoading(true)
    try {
      const result = await api.hrConsultants.googleLogin({
        googleId: `google-${form.email}`,
        name: form.name,
        email: form.email,
      })
      if (!result) throw new Error('Google login failed')
      localStorage.setItem('access_token', result.accessToken)
      localStorage.setItem('thozhil_hr_consultant_user', JSON.stringify(result.consultant))
      toast.success('Google account connected')
      router.push('/business-operations/hr-consultant/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex justify-center">
            <BrandLogo size="medium" showTagline={false} />
          </div>
          <div>
            <CardTitle>Google Login</CardTitle>
            <CardDescription>Connect and allow Google login for your HR Recruiter account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Google Name</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Google Email</Label>
            <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </div>
          <Button className="h-11 w-full" onClick={connectGoogle} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Connect and Allow
          </Button>
          <div className="text-center">
            <Link href="/business-operations/hr-consultant/login" className="text-sm text-muted-foreground hover:text-primary">
              Back to HR Recruiter Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
