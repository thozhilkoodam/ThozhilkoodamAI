'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Phone, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function HrLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [phone, setPhone] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const res = await api.auth.companyLogin(form.email, form.password).catch(() => null)
      const token = res?.accessToken || (res as any)?.token
      if (token) {
        localStorage.setItem('access_token', token)
      }
      const hrUser = {
        id: res?.user?.id || 'hr-001',
        companyId: res?.user?.companyId || 'KIKTK000001',
        name: res?.user?.name || res?.user?.agencyName || 'Recruiter',
        email: form.email,
        role: 'hr_recruiter',
        logo: '',
        status: 'active',
        token,
        accessToken: token,
      }
      localStorage.setItem('thozhil_hr_user', JSON.stringify(hrUser))
      if (rememberMe) {
        localStorage.setItem('thozhil_hr_remember', form.email)
      } else {
        localStorage.removeItem('thozhil_hr_remember')
      }
      toast.success('Login successful!')
      router.push('/hr/dashboard')
    } catch {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    toast.success('Redirecting to Google...')
  }

  const handleOtpLogin = () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }
    toast.success('OTP sent to your phone')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
      <Card className="w-full max-w-md shadow-2xl border-muted">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex justify-center">
            <BrandLogo size="medium" showTagline={false} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Recruiter Login</CardTitle>
            <CardDescription className="text-sm mt-1">
              Sign in to your Thozhil Koodam recruiter account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!showOtp ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="recruiter@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/hr/forgot-password" className="text-xs text-primary hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v as boolean)} />
                  <Label htmlFor="remember" className="text-sm cursor-pointer font-normal">Remember me</Label>
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full h-11" onClick={handleGoogleLogin}>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>

                <Button variant="ghost" className="w-full h-11 gap-2" onClick={() => setShowOtp(true)}>
                  <Phone className="h-4 w-4" />
                  Login with Phone OTP
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <Phone className="mx-auto h-10 w-10 text-primary mb-3" />
                <h3 className="font-semibold text-lg">Phone OTP Login</h3>
                <p className="text-sm text-muted-foreground mt-1">Enter your registered phone number</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button className="w-full h-11" onClick={handleOtpLogin}>
                Send OTP
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowOtp(false)}>
                Back to Email Login
              </Button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Back to main login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
