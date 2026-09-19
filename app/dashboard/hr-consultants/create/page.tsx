'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, Loader2, UserPlus, Mail, Phone, Building2,
  Briefcase, MapPin, Globe, Link2, UserCheck, Info, CheckCircle,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const emptyForm = {
  photo: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  branch: '',
  reportingManager: '',
  hiringManager: '',
  experience: '',
  preferredIndustry: '',
  preferredJobRoles: '',
  preferredLocations: '',
  skills: '',
  languages: '',
  linkedIn: '',
  github: '',
  portfolio: '',
  employmentType: 'Full Time',
  status: 'Active',
}

export default function CreateHrConsultantPage() {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const updateForm = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error('Full name, email, and mobile number are required')
      return
    }
    setSaving(true)
    try {
      sessionStorage.setItem('pendingRecruiterData', JSON.stringify(form))
      router.push('/business-operations/hr-consultant/upgrade-plans?action=addRecruiter')
    } catch {
      toast.error('Unable to proceed. Please try again.')
      setSaving(false)
    }
  }

  const fields: [keyof typeof emptyForm, string, string][] = [
    ['name', 'Full Name', 'Priya Raman'],
    ['email', 'Email Address', 'priya@agency.com'],
    ['phone', 'Mobile Number', '+91 6374741641'],
    ['department', 'Department', 'Technical Recruitment'],
    ['designation', 'Designation', 'Senior HR Recruiter'],
    ['branch', 'Branch', 'Chennai'],
    ['reportingManager', 'Reporting Manager', 'Anand Kumar'],
    ['hiringManager', 'Hiring Manager', 'Meera Nair'],
    ['experience', 'Experience', '5 years'],
    ['preferredIndustry', 'Preferred Industry', 'IT Services, SaaS'],
    ['preferredJobRoles', 'Preferred Job Roles', 'Frontend, Backend, QA'],
    ['preferredLocations', 'Preferred Locations', 'Chennai, Bengaluru'],
    ['skills', 'Skills', 'Sourcing, Screening, Negotiation'],
    ['languages', 'Languages', 'Tamil, English, Hindi'],
    ['linkedIn', 'LinkedIn', 'https://linkedin.com/in/priya'],
    ['github', 'GitHub (Optional)', 'https://github.com/priya'],
    ['portfolio', 'Portfolio (Optional)', 'https://priya.dev'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/hr-consultants">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add HR Recruiter</h1>
          <p className="text-muted-foreground">
            Fill in the details below. An invitation email will be sent for activation.
          </p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 text-primary" /> Recruiter Information
          </CardTitle>
          <CardDescription>
            The system will auto-generate the Employee ID and send the activation email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <Label>Employee ID</Label>
            <Input value="Auto Generate" readOnly className="bg-muted max-w-xs" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map(([key, label, placeholder]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => updateForm(key as keyof typeof form, e.target.value)}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={form.employmentType} onValueChange={(v) => updateForm('employmentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateForm('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 mb-6">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Choose a subscription plan to activate the HR Recruiter</li>
                <li>Complete the payment to create the recruiter account</li>
                <li>The HR Recruiter will receive an activation email to set their password</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/hr-consultants">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              {saving ? 'Please wait...' : 'Continue to Payment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
