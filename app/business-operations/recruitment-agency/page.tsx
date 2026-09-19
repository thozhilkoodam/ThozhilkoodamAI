'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { api } from '@/lib/api-client'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Building2, Upload, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useRef } from 'react'
import toast from 'react-hot-toast'

function isValidEmail(email: string): boolean {
  if (email.length > 255) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function RecruitmentAgencyRegistration() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [previewCompanyId] = useState('KIKTK------')
  const documentInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    logo: '',
    agencyName: '',
    contactPerson: '',
    position: '',
    employeeCount: '',
    vacancyCount: '',
    registrationNumber: '',
    documentUrl: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const totalSteps = 3

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await api.upload.logo(file)
      setLogoPreview(result.url)
      updateForm('logo', result.url)
      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload logo')
    }
  }

  const handleDocumentUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    const result = await api.upload.document(file)
    updateForm('documentUrl', result.url)
    toast.success('Document uploaded successfully')
  } catch (error: any) {
    console.error('[Document] Upload failed:', error)
    toast.error(error?.message || 'Failed to upload document')
  }
}

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!form.agencyName || !form.contactPerson || !form.position) {
          toast.error('Please fill in all required fields')
          return false
        }
        return true
      case 2:
        if (!form.email || !form.password || !form.confirmPassword) {
          toast.error('Please fill in all required fields')
          return false
        }
        if (!isValidEmail(form.email)) {
          toast.error('Please enter a valid email address')
          return false
        }
        if (form.password.length < 8) {
          toast.error('Password must be at least 8 characters')
          return false
        }
        if (form.password !== form.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, totalSteps))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    try {
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      const { confirmPassword, ...registerData } = form
      const company = { ...registerData, category: 'recruitment-agencies' }
      const created = await db.companies.create(company)
      localStorage.setItem('thozhil_registration_pending', JSON.stringify(created))
      toast.success('Registration submitted successfully!')
      router.push('/business-operations/recruitment-agency/pending')
    } catch (error: any) {
      console.error('[Registration] FAILED:', error?.message || error)
      toast.error(error?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 text-3xl font-bold">Recruitment Agency Registration</h1>
            <p className="mt-2 text-muted-foreground">
              Create your company account to get started with Thozhil Koodam.
            </p>
          </div>

          <div className="mb-8">
            <Progress value={(step / totalSteps) * 100} className="h-2" />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>Company Details</span>
              <span>Account Information</span>
              <span>Documents</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Company Details'}
                {step === 2 && 'Account Information'}
                {step === 3 && 'Documents & Verification'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Tell us about your agency'}
                {step === 2 && 'Set up your account credentials'}
                {step === 3 && 'Upload required documents'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <label className="cursor-pointer">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted hover:bg-accent transition-colors">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Logo</span>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Agency Name *</Label>
                      <Input value={form.agencyName} onChange={(e) => updateForm('agencyName', e.target.value)} placeholder="Enter agency name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person Name *</Label>
                      <Input value={form.contactPerson} onChange={(e) => updateForm('contactPerson', e.target.value)} placeholder="Enter contact person name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Position *</Label>
                      <Input value={form.position} onChange={(e) => updateForm('position', e.target.value)} placeholder="e.g., Managing Director" />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Employees</Label>
                      <Select value={form.employeeCount} onValueChange={(v) => updateForm('employeeCount', v)}>
                        <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          {['1-10', '11-50', '51-200', '201-500', '500+'].map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Vacancies</Label>
                      <Input type="number" value={form.vacancyCount} onChange={(e) => updateForm('vacancyCount', e.target.value)} placeholder="e.g., 25" />
                    </div>
                    <div className="space-y-2">
                      <Label>Registration/Incorporation Number</Label>
                      <Input value={form.registrationNumber} onChange={(e) => updateForm('registrationNumber', e.target.value)} placeholder="Enter registration number" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+91 9876543210" />
                    </div>
                    <div className="space-y-2">
                      <Label>Official Email Address *</Label>
                      <Input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="you@company.com" />
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll use this email for login, verification, and important account notifications.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Min 8 characters" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password *</Label>
                      <div className="relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} placeholder="Confirm your password" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="rounded-lg border-2 border-dashed p-8 text-center hover:bg-accent/50 transition-colors">
                    <div className="cursor-pointer" onClick={() => documentInputRef.current?.click()}>
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 font-medium">Upload Company Document</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        GST Certificate, Incorporation Certificate, or Business Registration
                      </p>
                      <Button variant="outline" className="mt-4" type="button">
                        Choose File
                      </Button>
                      <input ref={documentInputRef} type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handleDocumentUpload} />
                      {form.documentUrl && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" /> Document uploaded successfully
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/5 p-4">
                    <h4 className="font-medium">Company ID Preview</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your company will be assigned a unique ID:
                    </p>
                    <p className="mt-2 font-mono text-lg font-bold text-primary">
                      {previewCompanyId}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This ID cannot be edited or deleted after registration.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                  Previous
                </Button>
                {step < totalSteps ? (
                  <Button onClick={nextStep}>Next</Button>
                ) : (
                  <Button onClick={handleSubmit}>Complete Registration</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
