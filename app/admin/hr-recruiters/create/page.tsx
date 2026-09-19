'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { DOBSelector } from '@/components/ui/dob-selector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CreateHRRecruiterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    photo: '',
    company: '',
    branch: '',
    department: '',
    designation: '',
    reportingManager: '',
    hiringManager: '',
    joiningDate: '',
    employmentType: '',
    experience: '',
    preferredIndustry: '',
    preferredJobRoles: '',
    preferredLocations: '',
    skills: '',
    certifications: '',
    username: '',
    password: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    resumeUrl: '',
    agencyId: '',
    status: 'pending',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.email) {
      toast.error('Email is required')
      return
    }
    if (!form.username) {
      toast.error('Username is required')
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, any> = { ...form }
      if (!payload.password) delete payload.password
      await api.hrRecruiters.create(payload)
      toast.success('HR Recruiter created successfully')
      router.push('/admin/hr-recruiters')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create HR Recruiter')
    } finally {
      setLoading(false)
    }
  }

  const field =
    'flex flex-col gap-1.5'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/hr-recruiters')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create HR Recruiter</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to create a new HR Recruiter account.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={field}>
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className={field}>
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className={field}>
              <Label>Email *</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className={field}>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className={field}>
              <DOBSelector
                value={form.dateOfBirth}
                onChange={(v) => set('dateOfBirth', v)}
                label="Date of Birth"
              />
            </div>
            <div className={field}>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={`${field} md:col-span-2`}>
              <Label>Photo URL</Label>
              <Input
                value={form.photo}
                onChange={(e) => set('photo', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={field}>
              <Label>Company</Label>
              <Input
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div className={field}>
              <Label>Branch</Label>
              <Input
                value={form.branch}
                onChange={(e) => set('branch', e.target.value)}
                placeholder="Branch"
              />
            </div>
            <div className={field}>
              <Label>Department</Label>
              <Input
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                placeholder="Department"
              />
            </div>
            <div className={field}>
              <Label>Designation</Label>
              <Input
                value={form.designation}
                onChange={(e) => set('designation', e.target.value)}
                placeholder="Designation"
              />
            </div>
            <div className={field}>
              <Label>Reporting Manager</Label>
              <Input
                value={form.reportingManager}
                onChange={(e) => set('reportingManager', e.target.value)}
                placeholder="Reporting manager"
              />
            </div>
            <div className={field}>
              <Label>Hiring Manager</Label>
              <Input
                value={form.hiringManager}
                onChange={(e) => set('hiringManager', e.target.value)}
                placeholder="Hiring manager"
              />
            </div>
            <div className={field}>
              <DatePicker
                value={form.joiningDate}
                onChange={(v) => set('joiningDate', v)}
                placeholder="DD/MM/YYYY"
                label="Joining Date"
              />
            </div>
            <div className={field}>
              <Label>Employment Type</Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) => set('employmentType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={field}>
              <Label>Experience (years)</Label>
              <Input
                type="number"
                min={0}
                value={form.experience}
                onChange={(e) => set('experience', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className={field}>
              <Label>Preferred Industry</Label>
              <Input
                value={form.preferredIndustry}
                onChange={(e) => set('preferredIndustry', e.target.value)}
                placeholder="e.g. IT, Healthcare"
              />
            </div>
            <div className={`${field} md:col-span-2`}>
              <Label>Preferred Job Roles</Label>
              <Input
                value={form.preferredJobRoles}
                onChange={(e) => set('preferredJobRoles', e.target.value)}
                placeholder="Comma separated, e.g. Frontend Developer, UI/UX Designer"
              />
            </div>
            <div className={`${field} md:col-span-2`}>
              <Label>Preferred Locations</Label>
              <Input
                value={form.preferredLocations}
                onChange={(e) => set('preferredLocations', e.target.value)}
                placeholder="Comma separated, e.g. Chennai, Bangalore"
              />
            </div>
            <div className={`${field} md:col-span-2`}>
              <Label>Skills</Label>
              <Input
                value={form.skills}
                onChange={(e) => set('skills', e.target.value)}
                placeholder="Comma separated, e.g. React, Node.js, Python"
              />
            </div>
            <div className={`${field} md:col-span-2`}>
              <Label>Certifications</Label>
              <Input
                value={form.certifications}
                onChange={(e) => set('certifications', e.target.value)}
                placeholder="Comma separated, e.g. PMP, AWS Certified"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Account Setup</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={field}>
              <Label>Username *</Label>
              <Input
                required
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                placeholder="Username"
              />
            </div>
            <div className={field}>
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Leave empty for auto-generated"
              />
            </div>
            <div className={field}>
              <Label>LinkedIn URL</Label>
              <Input
                value={form.linkedIn}
                onChange={(e) => set('linkedIn', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className={field}>
              <Label>GitHub URL</Label>
              <Input
                value={form.github}
                onChange={(e) => set('github', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className={field}>
              <Label>Portfolio URL</Label>
              <Input
                value={form.portfolio}
                onChange={(e) => set('portfolio', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className={field}>
              <Label>Resume URL</Label>
              <Input
                value={form.resumeUrl}
                onChange={(e) => set('resumeUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={field}>
              <Label>Agency Assignment</Label>
              <Input
                value={form.agencyId}
                onChange={(e) => set('agencyId', e.target.value)}
                placeholder="Agency ID"
              />
            </div>
            <div className={field}>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/hr-recruiters')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Recruiter'}
          </Button>
        </div>
      </form>
    </div>
  )
}
