'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BrandLogo } from '@/components/brand-logo'
import { Chrome, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { getSupabase } from '@/lib/supabase'

export default function CandidateLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('email')
  const [email, setEmail] = useState('testcandidate@example.com')
  const [password, setPassword] = useState('Password123!')

  // Google linking flow
  const [googleSetup, setGoogleSetup] = useState<{
    googleId: string; email: string; name: string; photo?: string
  } | null>(null)
  const [setupPhone, setSetupPhone] = useState('')
  const [setupOtp, setSetupOtp] = useState('')
  const [setupOtpSent, setSetupOtpSent] = useState(false)

  const handlePostLogin = useCallback(async () => {
    try {
      const { redirect } = await api.candidate.checkProfile()
      router.push(redirect)
    } catch {
      router.push('/candidate')
    }
  }, [router])

  const storeSession = useCallback((res: { accessToken: string; user: any }) => {
    localStorage.setItem('candidate_user', JSON.stringify(res.user))
    localStorage.setItem('candidate_token', res.accessToken)
    localStorage.setItem('access_token', res.accessToken)
    localStorage.setItem('thozhil_user', JSON.stringify(res.user))
  }, [])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true)
        const u = session.user
        try {
          const res = await api.candidate.googleLogin({
            googleId: u.id,
            email: u.email || '',
            name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
            photo: u.user_metadata?.avatar_url || '',
          })

          if ((res as any).needsSetup) {
            setGoogleSetup({
              googleId: u.id,
              email: u.email || '',
              name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
              photo: u.user_metadata?.avatar_url || '',
            })
            return
          }

          storeSession(res as any)
          await handlePostLogin()
        } catch (err: any) {
          toast.error(err.message)
        } finally {
          setLoading(false)
        }
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [handlePostLogin, storeSession])

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/candidate/login`,
          },
        })
        if (error) throw error
      } else {
        toast.error('Google sign-in requires Supabase configuration. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendOtp = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit phone number')
      return
    }
    try {
      await api.candidate.sendOtp({ phone })
      setOtpSent(true)
      toast.success('OTP sent to your phone!')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Enter the OTP sent to your phone')
      return
    }
    setLoading(true)
    try {
      const res = await api.candidate.verifyOtp({ phone, otp })
      storeSession(res)
      toast.success('Login successful!')
      await handlePostLogin()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error('Enter your email and password')
      return
    }
    setLoading(true)
    try {
      const res = await api.candidate.login({ email, password })
      storeSession(res)
      toast.success('Login successful!')
      await handlePostLogin()
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const sendSetupOtp = async () => {
    if (!setupPhone || setupPhone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit phone number')
      return
    }
    try {
      await api.candidate.sendOtp({ phone: setupPhone })
      setSetupOtpSent(true)
      toast.success('OTP sent to your phone!')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const verifySetupOtp = async () => {
    if (!setupOtp || setupOtp.length < 4) {
      toast.error('Enter the OTP')
      return
    }
    if (!googleSetup) return
    setLoading(true)
    try {
      const res = await api.candidate.googleSetup({
        googleId: googleSetup.googleId,
        email: googleSetup.email,
        name: googleSetup.name,
        photo: googleSetup.photo,
        phone: setupPhone,
        otp: setupOtp,
      })
      storeSession(res)
      toast.success('Account linked!')
      await handlePostLogin()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Google linking/setup screen
  if (googleSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 px-4 py-8">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex justify-center mb-2">
              <BrandLogo size="medium" showTagline={false} />
            </div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Complete Your Account</CardTitle>
            <CardDescription>
              We found a Google account (<span className="font-medium">{googleSetup.email}</span>).<br />
              Enter your phone number to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!setupOtpSent ? (
              <>
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium">+91</span>
                    <Input
                      type="tel" placeholder="9876543210" value={setupPhone}
                      onChange={e => setSetupPhone(e.target.value)}
                      className="rounded-l-none" disabled={loading}
                    />
                  </div>
                </div>
                <Button onClick={sendSetupOtp} className="w-full bg-purple-600 hover:bg-purple-700 h-11" disabled={!setupPhone || setupPhone.replace(/\D/g, '').length < 10 || loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>OTP sent to +91 {setupPhone}</span>
                </div>
                <div className="space-y-1">
                  <Label>Enter OTP</Label>
                  <Input
                    placeholder="Enter OTP" value={setupOtp}
                    onChange={e => setSetupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-[0.5em]" disabled={loading}
                  />
                </div>
                <Button onClick={verifySetupOtp} className="w-full bg-purple-600 hover:bg-purple-700 h-11" disabled={!setupOtp || setupOtp.length < 4 || loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Verifying...' : 'Verify & Complete'}
                </Button>
                <button onClick={() => { setSetupOtpSent(false); setSetupOtp(''); setSetupPhone('') }} className="w-full text-sm text-purple-600 hover:underline">
                  Change phone number
                </button>
              </>
            )}
            <div className="text-center">
              <button onClick={() => { setGoogleSetup(null); setSetupOtpSent(false); setSetupOtp(''); setSetupPhone('') }} className="text-sm text-gray-500 hover:underline flex items-center justify-center gap-1 mx-auto">
                <ArrowLeft className="h-3 w-3" /> Back to login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 px-4 py-8">
      <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mb-3">
              <Link href="/" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </Link>
            </div>
            <div className="mx-auto flex justify-center mb-2">
              <BrandLogo size="medium" showTagline={false} />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Candidate Login</CardTitle>
          <CardDescription>Sign in to manage your applications and profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign-In */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full gap-3 h-12 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <Chrome className="h-5 w-5" />
            Continue with Google
          </Button>

          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 font-medium">OR</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => setLoginMode('email')}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                loginMode === 'email'
                  ? 'bg-white dark:bg-gray-900 text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('phone')}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                loginMode === 'phone'
                  ? 'bg-white dark:bg-gray-900 text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Phone OTP
            </button>
          </div>

          {loginMode === 'email' ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm text-gray-600 dark:text-gray-400">Email Address</Label>
                <Input
                  type="email"
                  placeholder="testcandidate@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-600 dark:text-gray-400">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleEmailLogin}
                className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base"
                disabled={!email || !password || loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </div>
          ) : (
            <>
              {/* Phone Input */}
              <div className="space-y-1">
                <Label className="text-sm text-gray-600 dark:text-gray-400">Phone Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium">
                    +91
                  </span>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="rounded-l-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* OTP Section */}
              {!otpSent ? (
                <Button
                  onClick={sendOtp}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base"
                  disabled={!phone || phone.replace(/\D/g, '').length < 10 || loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>OTP sent to +91 {phone}</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Enter OTP</Label>
                    <Input
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="text-center text-lg tracking-[0.5em] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    onClick={verifyOtp}
                    className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base"
                    disabled={!otp || otp.length < 4 || loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </Button>
                  <button
                    onClick={() => { setOtpSent(false); setOtp('') }}
                    className="w-full text-sm text-purple-600 hover:underline text-center"
                  >
                    Change phone number
                  </button>
                </div>
              )}
            </>
          )}

          {/* Register Link */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            New to Thozhil Koodam?{' '}
            <Link href="/candidate/register" className="text-purple-600 hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
