'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Shield, Phone, Mail, ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import toast from 'react-hot-toast'

export default function ClientLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' })

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      const userData = { email: form.email, companyName: 'Demo Client', role: 'client' }
      localStorage.setItem('thozhil_client_user', JSON.stringify(userData))
      localStorage.setItem('access_token', 'demo_token')
      toast.success('Login successful!')
      router.push('/client/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const sendOtp = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }
    toast.success('OTP sent to your phone!')
  }

  const handleOtpLogin = async () => {
    if (!form.otp || form.otp.length < 4) {
      toast.error('Please enter the OTP')
      return
    }
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      const userData = { phone: form.phone, companyName: 'Demo Client', role: 'client' }
      localStorage.setItem('thozhil_client_user', JSON.stringify(userData))
      localStorage.setItem('access_token', 'demo_token')
      toast.success('Login successful!')
      router.push('/client/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex justify-center">
            <BrandLogo size="medium" showTagline={false} />
          </div>
          <CardTitle className="mt-4">Client Login</CardTitle>
          <CardDescription>Sign in to your MSME client portal</CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtp ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => toast.success('Google login coming soon!')}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowOtp(true)}
              >
                <Phone className="h-4 w-4" />
                Login with Phone OTP
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/client/login" className="text-primary hover:underline">
                  Register here
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOtp(false)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back to email login
              </Button>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={sendOtp}>
                    Send OTP
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>OTP</Label>
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  maxLength={6}
                />
              </div>

              <Button
                type="button"
                className="w-full"
                disabled={loading}
                onClick={handleOtpLogin}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
