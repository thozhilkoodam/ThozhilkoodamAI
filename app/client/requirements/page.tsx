'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'

import {
  Building2,
  IndianRupee,
  Send,
  Loader2,
  Plus,
  X,
  Video,
  MapPin,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function RequirementsPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [interviewType, setInterviewType] = useState<'walkin' | 'online'>('online')

  const [form, setForm] = useState({
    companyName: 'Demo Enterprises Pvt Ltd',
    department: '',
    position: '',
    vacancies: '',
    experience: '',
    education: '',
    skills: [] as string[],
    minSalary: '',
    maxSalary: '',
    hiringDeadline: '',
    joiningDate: '',
    location: '',
    jobDescription: '',
    employmentType: '',
    walkinVenue: '',
    walkinDate: '',
    walkinTime: '',
    walkinContactPerson: '',
    walkinContactPhone: '',
    walkinGoogleMapUrl: '',
    walkinInstructions: '',
    onlineInterviewDate: '',
    onlineInterviewTime: '',
    onlineMeetingLink: '',
    onlinePlatform: '',
    calendarInvite: false,
  })

  const [skillInput, setSkillInput] = useState('')

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    const val = skillInput.trim()
    if (val && !form.skills.includes(val)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, val] }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))
  }

  const handleSubmit = async () => {
    if (!form.position || !form.vacancies || !form.department) {
      toast.error('Please fill in the required fields')
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    localStorage.setItem('last_requirement', JSON.stringify({
      companyName: form.companyName,
      position: form.position,
      vacancies: form.vacancies,
      department: form.department,
      experience: form.experience,
      education: form.education,
      employmentType: form.employmentType,
      location: form.location,
      minSalary: form.minSalary,
      maxSalary: form.maxSalary,
    }))
    setSubmitting(false)
    toast.success('Requirement submitted successfully!')
    router.push('/client/requirements/success')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post Recruitment Requirement</h1>
        <p className="text-muted-foreground">Submit your hiring needs and we will find the right talent for you.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requirement Details</CardTitle>
          <CardDescription>Fill in the details about your recruitment requirement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{form.companyName}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={form.department} onValueChange={(v) => updateForm('department', v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Support', 'Legal'].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position / Job Title *</Label>
              <Input
                value={form.position}
                onChange={(e) => updateForm('position', e.target.value)}
                placeholder="e.g., Senior React Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Vacancies *</Label>
              <Input
                type="number"
                min="1"
                value={form.vacancies}
                onChange={(e) => updateForm('vacancies', e.target.value)}
                placeholder="e.g., 3"
              />
            </div>
            <div className="space-y-2">
              <Label>Experience Required</Label>
              <Select value={form.experience} onValueChange={(v) => updateForm('experience', v)}>
                <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                <SelectContent>
                  {['0-1 years', '1-2 years', '2-4 years', '3-5 years', '5-8 years', '8-12 years', '12+ years'].map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Education</Label>
              <Select value={form.education} onValueChange={(v) => updateForm('education', v)}>
                <SelectTrigger><SelectValue placeholder="Select education" /></SelectTrigger>
                <SelectContent>
                  {["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "Any"].map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={form.employmentType} onValueChange={(v) => updateForm('employmentType', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Temporary'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., React, Node.js, Python"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Salary (per annum)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-10"
                  value={form.minSalary}
                  onChange={(e) => updateForm('minSalary', e.target.value)}
                  placeholder="300000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Maximum Salary (per annum)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-10"
                  value={form.maxSalary}
                  onChange={(e) => updateForm('maxSalary', e.target.value)}
                  placeholder="1800000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <DatePicker
                value={form.hiringDeadline}
                onChange={(v) => updateForm('hiringDeadline', v)}
                label="Hiring Deadline"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="space-y-2">
              <DatePicker
                value={form.joiningDate}
                onChange={(v) => updateForm('joiningDate', v)}
                label="Expected Joining Date"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="space-y-2">
              <Label>Hiring Location</Label>
              <Input
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="e.g., Chennai, Bangalore"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea
              rows={6}
              value={form.jobDescription}
              onChange={(e) => updateForm('jobDescription', e.target.value)}
              placeholder="Describe the role, responsibilities, and expectations..."
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-semibold">Interview Mode</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={interviewType === 'walkin' ? 'default' : 'outline'}
                onClick={() => setInterviewType('walkin')}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" /> Walk-In Interview
              </Button>
              <Button
                type="button"
                variant={interviewType === 'online' ? 'default' : 'outline'}
                onClick={() => setInterviewType('online')}
                className="gap-2"
              >
                <Video className="h-4 w-4" /> Online Interview
              </Button>
            </div>
          </div>

          {interviewType === 'walkin' ? (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <h4 className="font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Walk-In Interview Details</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Venue Address</Label>
                  <Textarea
                    value={form.walkinVenue}
                    onChange={(e) => updateForm('walkinVenue', e.target.value)}
                    placeholder="Enter the venue address"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <DatePicker
                    value={form.walkinDate}
                    onChange={(v) => updateForm('walkinDate', v)}
                    label="Date"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <TimePicker
                    value={form.walkinTime}
                    onChange={(v) => updateForm('walkinTime', v)}
                    label="Time"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={form.walkinContactPerson}
                    onChange={(e) => updateForm('walkinContactPerson', e.target.value)}
                    placeholder="Name of contact person"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={form.walkinContactPhone}
                    onChange={(e) => updateForm('walkinContactPhone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Google Map URL</Label>
                  <Input
                    value={form.walkinGoogleMapUrl}
                    onChange={(e) => updateForm('walkinGoogleMapUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={form.walkinInstructions}
                    onChange={(e) => updateForm('walkinInstructions', e.target.value)}
                    placeholder="Documents to bring, dress code, etc."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <h4 className="font-medium flex items-center gap-2"><Video className="h-4 w-4 text-primary" /> Online Interview Details</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Interview Date</Label>
                  <DatePicker
                    value={form.onlineInterviewDate}
                    onChange={(v) => updateForm('onlineInterviewDate', v)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interview Time</Label>
                  <TimePicker
                    value={form.onlineInterviewTime}
                    onChange={(v) => updateForm('onlineInterviewTime', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meeting Link</Label>
                  <Input
                    value={form.onlineMeetingLink}
                    onChange={(e) => updateForm('onlineMeetingLink', e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={form.onlinePlatform} onValueChange={(v) => updateForm('onlinePlatform', v)}>
                    <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                    <SelectContent>
                      {['Google Meet', 'Zoom', 'Microsoft Teams', 'Skype', 'Other'].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="calendarInvite"
                    checked={form.calendarInvite}
                    onChange={(e) => updateForm('calendarInvite', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="calendarInvite" className="cursor-pointer">Send Calendar Invite</Label>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? 'Submitting...' : 'Submit Requirement'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
