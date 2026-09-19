'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Phone, Loader2, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function HrConsultantSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
  })

  const handleGoogleSignup = () => {
    setGoogleConnected(true)
    toast.success('Google account connected successfully!')
  }

  const handleSendOtp = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }
    setLoading(true)
    try {
      const response = await api.hrConsultants.sendOtp(form.phone)
      setOtpSent(true)
      toast.success(response?.otp ? `OTP sent: ${response.otp}` : 'OTP sent to your phone')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!form.otp || form.otp.length < 4) {
      toast.error('Please enter the 4 digit OTP')
      return
    }
    setLoading(true)
    try {
      const result = await api.hrConsultants.verifyOtp(form.phone, form.otp)
      if (!result) {
        toast.error('Invalid OTP')
        return
      }
      setOtpVerified(true)
      toast.success('Phone verified successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await api.hrConsultants.signup({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        phoneVerified: otpVerified,
        googleConnected,
      })
      toast.success('Account created successfully! Please login.')
      router.push('/business-operations/hr-consultant/login')
    } catch (error: any) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-8">
      <Card className="w-full max-w-md border-muted shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex justify-center">
            <BrandLogo size="medium" showTagline={false} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">HR Recruiter Signup</CardTitle>
            <CardDescription className="mt-1 text-sm">
              Create your HR Recruiter account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'form' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">HR Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="consultant@agency.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      disabled={otpVerified}
                    />
                    {otpVerified && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {!otpVerified && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                      disabled={loading}
                      className="shrink-0"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? 'Verify' : 'Send OTP'}
                    </Button>
                  )}
                  {otpVerified && (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-2.5" />
                  )}
                </div>
                {otpSent && !otpVerified && (
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Enter 4 digit OTP"
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                />
                {form.password !== form.confirmPassword && form.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> Passwords do not match
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Create Account
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <Phone className="mx-auto h-10 w-10 text-primary mb-3" />
                <h3 className="font-semibold text-lg">Phone Verification</h3>
                <p className="text-sm text-muted-foreground mt-1">Verify your phone number</p>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              {otpSent && (
                <div className="space-y-2">
                  <Label>OTP</Label>
                  <Input inputMode="numeric" maxLength={4} placeholder="Enter 4 digit OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                </div>
              )}
              <Button className="w-full h-11" onClick={otpSent ? handleVerifyOtp : handleSendOtp} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : otpSent ? 'Verify OTP' : 'Send OTP'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('form')}>Back to Signup</Button>
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">Or sign up with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={handleGoogleSignup}
              disabled={googleConnected}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleConnected ? 'Google Connected ✓' : 'Continue with Google'}
            </Button>
          </div>

          <div className="mt-6 border-t pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/business-operations/hr-consultant/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
