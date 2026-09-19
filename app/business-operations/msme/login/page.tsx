'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Phone, Loader2, Briefcase } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import toast from 'react-hot-toast'

export default function MSMELoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' })
  const [rememberMe, setRememberMe] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      const userData = { email: form.email, companyName: 'Demo MSME', role: 'msme_client' }
      localStorage.setItem('thozhil_client_user', JSON.stringify(userData))
      localStorage.setItem('access_token', 'demo_token')
      toast.success('Login successful!')
      router.push('/business-operations/msme/dashboard')
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
      const userData = { phone: form.phone, companyName: 'Demo MSME', role: 'msme_client' }
      localStorage.setItem('thozhil_client_user', JSON.stringify(userData))
      localStorage.setItem('access_token', 'demo_token')
      toast.success('Login successful!')
      router.push('/business-operations/msme/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    toast.success('Google login connected!')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-purple-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex justify-center">
              <BrandLogo size="medium" showTagline={false} />
            </div>
            <div className="mx-auto mt-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">MSME Login</CardTitle>
            <CardDescription className="text-sm mt-1">
              Sign in to your client portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showOtp ? (
              <>
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <span className="text-xs text-primary hover:underline font-medium cursor-pointer">Forgot Password?</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
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

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm cursor-pointer">Remember Me</Label>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base bg-purple-600 hover:bg-purple-700" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground font-medium">OR</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-2"
                    onClick={handleGoogleLogin}
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
                    variant="ghost"
                    className="w-full h-11 gap-2"
                    onClick={() => setShowOtp(true)}
                  >
                    <Phone className="h-4 w-4" />
                    Login with Phone OTP
                  </Button>

                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/business-operations/msme/signup" className="text-purple-600 hover:underline font-medium">
                      Create Account
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-5">
                <Button variant="ghost" size="sm" onClick={() => setShowOtp(false)} className="gap-2">
                  ← Back to email login
                </Button>

                <div className="text-center">
                  <Phone className="mx-auto h-10 w-10 text-primary mb-3" />
                  <h3 className="font-semibold text-lg">Phone OTP Login</h3>
                  <p className="text-sm text-muted-foreground mt-1">Enter your registered phone number</p>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <Button type="button" variant="outline" className="w-full h-11" onClick={sendOtp}>
                  Send OTP
                </Button>

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
                  className="w-full h-11 bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                  onClick={handleOtpLogin}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
