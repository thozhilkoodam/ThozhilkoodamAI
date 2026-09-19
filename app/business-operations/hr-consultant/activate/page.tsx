'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { BrandLogo } from '@/components/brand-logo'
import { api } from '@/lib/api-client'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function ActivateHrConsultantContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [consultant, setConsultant] = useState<any>(null)
  const [form, setForm] = useState({ password: '', confirmPassword: '', acceptTerms: false })

  useEffect(() => {
    const loadActivation = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await api.hrConsultants.getActivation(token)
        setConsultant(data)
      } catch (error: any) {
        toast.error(error.message || 'Activation link is invalid or expired')
      } finally {
        setLoading(false)
      }
    }
    loadActivation()
  }, [token])

  const activateAccount = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.acceptTerms) {
      toast.error('Please accept the terms')
      return
    }
    setSaving(true)
    try {
      await api.hrConsultants.activate({ token, ...form })
      toast.success('Account activated. Please log in.')
      router.push('/business-operations/hr-consultant/login')
    } catch (error: any) {
      toast.error(error.message || 'Unable to activate account')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex justify-center">
            <BrandLogo size="medium" showTagline={false} />
          </div>
          <CardTitle className="mt-4">Activate Account</CardTitle>
          <CardDescription>Create your password to start using your HR Recruiter dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking activation link
            </div>
          ) : !consultant ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">This activation link is invalid or expired.</p>
              <Button asChild><Link href="/business-operations/hr-consultant/login">Back to Login</Link></Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={activateAccount}>
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value={consultant.employeeId} readOnly className="bg-muted font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={consultant.email} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Create Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={form.acceptTerms}
                  onCheckedChange={(value) => setForm({ ...form, acceptTerms: Boolean(value) })}
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm font-normal">Accept Terms</Label>
              </div>
              <Button className="w-full" type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Activate Account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ActivateHrConsultantPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading activation page
          </CardContent>
        </Card>
      </div>
    }>
      <ActivateHrConsultantContent />
    </Suspense>
  )
}
