'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      if (u.role === 'super_admin' || u.role === 'admin' || u.role === 'support') {
        toast.success('Welcome back, Admin!')
        router.push('/admin/dashboard')
      } else {
        toast.error('This portal is for administrators only.')
        logout()
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15)_0%,transparent_50%)]" />
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <Card className="border-slate-700 bg-slate-900/80 backdrop-blur shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="mt-4 text-2xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-slate-400">
              Secure administrator access only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  placeholder="admin@thozhilkoodam.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating...
                  </span>
                ) : (
                  'Sign In to Admin Panel'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-slate-500">
          Unauthorized access is prohibited. All activities are monitored and logged.
        </p>
      </div>
    </div>
  )
}
