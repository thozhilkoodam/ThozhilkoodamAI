'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BrandLogo } from '@/components/brand-logo'
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  Upload,
  CheckCircle2,
  X,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Send,
  Users,
  Globe,
  MapPin,
  FileText,
  CheckCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function MSMESignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    companyName: '',
    gst: '',
    industry: '',
    companyType: '',
    employeeCount: '',
    website: '',
    logo: '',
    address: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    contactPerson: '',
    designation: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [documents, setDocuments] = useState<Record<string, { file: File | null; name: string; uploaded: boolean }>>({
    gstCert: { file: null, name: '', uploaded: false },
    pan: { file: null, name: '', uploaded: false },
    incorporationCert: { file: null, name: '', uploaded: false },
    msmeCert: { file: null, name: '', uploaded: false },
    logo: { file: null, name: '', uploaded: false },
  })

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [directorName, setDirectorName] = useState('')

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (docId: string, file: File) => {
    setDocuments((prev) => ({
      ...prev,
      [docId]: { file, name: file.name, uploaded: true },
    }))
    toast.success(`${docId === 'logo' ? 'Logo' : 'Document'} uploaded successfully!`)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSubmitting(false)
    toast.success('Registration submitted successfully!')
    router.push('/business-operations/msme/signup/success')
  }

  const canProceedStep1 = form.companyName && form.gst && form.industry && form.companyType && form.employeeCount
  const canProceedStep2 = form.address && form.state && form.city && form.pincode && form.contactPerson && form.phone && form.email && form.password && form.password.length >= 8 && form.password === form.confirmPassword
  const canProceedStep3 = directorName

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="mx-auto flex justify-center">
            <BrandLogo size="medium" showTagline={false} />
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>MSME Client Registration</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground">Register your company to start posting recruitment requirements.</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Company Details', 'Contact & Address', 'Documents & Verification'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step > i + 1 ? 'bg-green-100 text-green-600' :
                  step === i + 1 ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step > i + 1 ? <CheckCheck className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${step === i + 1 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Tell us about your company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={form.companyName}
                    onChange={(e) => updateForm('companyName', e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GST Number *</Label>
                  <Input
                    value={form.gst}
                    onChange={(e) => updateForm('gst', e.target.value)}
                    placeholder="33ABCDE1234F1Z5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry *</Label>
                  <Select value={form.industry} onValueChange={(v) => updateForm('industry', v)}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {['Information Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Retail', 'Construction', 'Hospitality', 'Automotive', 'Agriculture', 'Pharmaceutical', 'Other'].map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Type *</Label>
                  <Select value={form.companyType} onValueChange={(v) => updateForm('companyType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {['Private Limited', 'Public Limited', 'Partnership', 'Sole Proprietorship', 'LLP', 'Other'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Employee Count *</Label>
                  <Select value={form.employeeCount} onValueChange={(v) => updateForm('employeeCount', v)}>
                    <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                    <SelectContent>
                      {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map((r) => (
                        <SelectItem key={r} value={r}>{r} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => updateForm('website', e.target.value)}
                    placeholder="www.company.com"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="gap-2">
                  Next Step <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact & Address</CardTitle>
              <CardDescription>Provide your registered address and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Registered Address *</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  placeholder="Enter your registered business address"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select value={form.state} onValueChange={(v) => updateForm('state', v)}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Other'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District *</Label>
                  <Input
                    value={form.district}
                    onChange={(e) => updateForm('district', e.target.value)}
                    placeholder="Enter district"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input
                    value={form.pincode}
                    onChange={(e) => updateForm('pincode', e.target.value)}
                    placeholder="600001"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person *</Label>
                  <Input
                    value={form.contactPerson}
                    onChange={(e) => updateForm('contactPerson', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input
                    value={form.designation}
                    onChange={(e) => updateForm('designation', e.target.value)}
                    placeholder="e.g., HR Manager"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    placeholder="Min 8 characters"
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password *</Label>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
              {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="gap-2">
                  Next Step <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Documents & Verification</CardTitle>
              <CardDescription>Upload required documents and verify your identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> Upload Documents</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: 'gstCert', label: 'GST Certificate' },
                    { id: 'pan', label: 'PAN Card' },
                    { id: 'incorporationCert', label: 'Incorporation Certificate' },
                    { id: 'msmeCert', label: 'MSME Certificate' },
                  ].map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc.label}</span>
                        {documents[doc.id]?.uploaded && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 cursor-pointer"
                          onClick={() => fileInputRefs.current[doc.id]?.click()}
                        >
                          {documents[doc.id]?.uploaded ? 'Change' : 'Upload'}
                        </Button>
                        <input
                          ref={(el) => { fileInputRefs.current[doc.id] = el }}
                          type="file"
                          accept=".pdf,.jpg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(doc.id, file)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Director Name *</Label>
                <Input
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  placeholder="Full name of the director"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
                <Button onClick={handleSubmit} disabled={!canProceedStep3 || submitting} className="gap-2">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
