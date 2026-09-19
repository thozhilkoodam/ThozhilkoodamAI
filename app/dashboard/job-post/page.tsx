'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, ArrowRight, Sparkles, Mic, Plus, X, Eye, Send,
  Loader2, RefreshCw, TrendingUp, Star, BookOpen, ListChecks,
  GraduationCap, MapPin, Clock, Users, Briefcase,
} from 'lucide-react'
import toast from 'react-hot-toast'

const steps = ['Basic Details', 'AI Description', 'Skills', 'Preferences', 'Screening', 'Preview']

const generateStructuredJD = (title: string) => {
  const jds: Record<string, any> = {
    'Senior React Developer': {
      summary: 'We are looking for an experienced Senior React Developer to join our growing engineering team. You will build and maintain high-performance web applications using React, TypeScript, and modern frontend technologies.',
      responsibilities: [
        'Design and implement scalable React components and features',
        'Collaborate with cross-functional teams to define and ship new features',
        'Optimize application performance and ensure best practices',
        'Mentor junior developers and conduct code reviews',
        'Participate in architectural decisions and technical planning',
      ],
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'CSS/SASS', 'Testing (Jest/Cypress)'],
      qualifications: [
        "Bachelor's degree in Computer Science or related field",
        '4+ years of experience in frontend development',
        'Strong understanding of web performance optimization',
        'Experience with state management (Redux/Zustand)',
      ],
      benefits: [
        'Competitive salary with yearly bonuses',
        'Health insurance coverage',
        'Flexible work hours and remote options',
        'Learning and development budget',
        'Quarterly team outings and events',
      ],
    },
  }
  return jds[title] || {
    summary: `We are looking for a talented ${title || 'professional'} to join our team. The ideal candidate will bring expertise, creativity, and a passion for excellence.`,
    responsibilities: [
      `Lead and execute ${title || 'key'} initiatives`,
      'Collaborate with team members to achieve goals',
      'Drive continuous improvement and innovation',
      'Contribute to team culture and best practices',
    ],
    skills: ['Communication', 'Problem Solving', 'Team Collaboration'],
    qualifications: [
      "Bachelor's degree in relevant field",
      '3+ years of professional experience',
      'Strong analytical and problem-solving skills',
    ],
    benefits: [
      'Competitive salary package',
      'Health and wellness benefits',
      'Professional development opportunities',
      'Flexible work environment',
    ],
  }
}

export default function JobPostPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [listening, setListening] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSection, setAiSection] = useState<'summary' | 'responsibilities' | 'skills' | 'qualifications' | 'benefits'>('summary')

  const [form, setForm] = useState({
    title: '',
    department: '',
    employmentType: '',
    workMode: '',
    location: '',
    experience: '',
    experienceYears: '',
    experienceMonths: '',
    salaryType: 'fixed',
    salaryMin: '',
    salaryMax: '',
    salaryPeriod: 'monthly',
    salaryRange: '',
    vacancyCount: '',
    noticePeriod: '',
    summary: '',
    responsibilities: [] as string[],
    requiredSkills: [] as string[],
    qualifications: [] as string[],
    benefits: [] as string[],
    primarySkills: [] as string[],
    secondarySkills: [] as string[],
    mandatorySkills: [] as string[],
    education: '',
    preferredExperience: '',
    gender: '',
    locationPreference: '',
    preferredNoticePeriod: '',
    industryPreference: '',
    screeningQuestions: [] as string[],
  })

  const [skillInputs, setSkillInputs] = useState({
    primary: '',
    secondary: '',
    mandatory: '',
  })
  const [respInput, setRespInput] = useState('')
  const [qualInput, setQualInput] = useState('')
  const [benefitInput, setBenefitInput] = useState('')
  const [questionInput, setQuestionInput] = useState('')

  const updateForm = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const addToList = (field: 'primarySkills' | 'secondarySkills' | 'mandatorySkills', listKey: 'primary' | 'secondary' | 'mandatory') => {
    const val = skillInputs[listKey].trim()
    if (val && !form[field].includes(val)) {
      setForm((prev) => ({ ...prev, [field]: [...prev[field], val] }))
      setSkillInputs((prev) => ({ ...prev, [listKey]: '' }))
    }
  }

  const removeFromList = (field: 'primarySkills' | 'secondarySkills' | 'mandatorySkills', item: string) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((s) => s !== item) }))
  }

  const addResp = () => {
    if (respInput.trim()) {
      setForm((prev) => ({ ...prev, responsibilities: [...prev.responsibilities, respInput.trim()] }))
      setRespInput('')
    }
  }
  const removeResp = (item: string) => setForm((prev) => ({ ...prev, responsibilities: prev.responsibilities.filter((r) => r !== item) }))

  const addQual = () => {
    if (qualInput.trim()) {
      setForm((prev) => ({ ...prev, qualifications: [...prev.qualifications, qualInput.trim()] }))
      setQualInput('')
    }
  }
  const removeQual = (item: string) => setForm((prev) => ({ ...prev, qualifications: prev.qualifications.filter((q) => q !== item) }))

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setForm((prev) => ({ ...prev, benefits: [...prev.benefits, benefitInput.trim()] }))
      setBenefitInput('')
    }
  }
  const removeBenefit = (item: string) => setForm((prev) => ({ ...prev, benefits: prev.benefits.filter((b) => b !== item) }))

  const addQuestion = () => {
    if (questionInput.trim()) {
      setForm((prev) => ({ ...prev, screeningQuestions: [...prev.screeningQuestions, questionInput.trim()] }))
      setQuestionInput('')
    }
  }
  const removeQuestion = (q: string) => setForm((prev) => ({ ...prev, screeningQuestions: prev.screeningQuestions.filter((x) => x !== q) }))

  const generateAiDescription = async () => {
    if (!form.title) { toast.error('Please enter a job title first'); return }
    setAiLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    const jd = generateStructuredJD(form.title)
    setForm((prev) => ({
      ...prev,
      summary: jd.summary,
      responsibilities: jd.responsibilities,
      requiredSkills: jd.skills,
      qualifications: jd.qualifications,
      benefits: jd.benefits,
    }))
    setAiLoading(false)
    toast.success('AI job description generated!')
  }

  const regenerateSection = () => {
    if (!form.title) return
    const jd = generateStructuredJD(form.title)
    const updateMap: Record<string, () => void> = {
      summary: () => setForm((prev) => ({ ...prev, summary: jd.summary })),
      responsibilities: () => setForm((prev) => ({ ...prev, responsibilities: jd.responsibilities })),
      skills: () => setForm((prev) => ({ ...prev, requiredSkills: jd.skills })),
      qualifications: () => setForm((prev) => ({ ...prev, qualifications: jd.qualifications })),
      benefits: () => setForm((prev) => ({ ...prev, benefits: jd.benefits })),
    }
    updateMap[aiSection]?.()
    toast.success(`${aiSection.charAt(0).toUpperCase() + aiSection.slice(1)} regenerated!`)
  }

  const improveSection = () => {
    toast.success(`${aiSection.charAt(0).toUpperCase() + aiSection.slice(1)} improved with AI suggestions!`)
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setForm((prev) => ({ ...prev, summary: prev.summary + ' ' + transcript }))
        setListening(false)
      }
      recognition.start()
      setListening(true)
    } else {
      toast.error('Voice recognition not supported in this browser.')
    }
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  const handleSaveDraft = async () => {
    if (!form.title || !form.title.trim()) {
      toast.error('Please enter a job title')
      return
    }
    setSubmitting(true)
    try {
      const payload: any = {
        title: form.title,
        department: form.department || 'General',
        employmentType: form.employmentType || 'Full-time',
        workMode: form.workMode || 'Office',
        location: form.location || 'Chennai, TN',
        description: form.summary || form.title,
        status: 'draft',
        isPublished: false,
        skills: form.primarySkills.length > 0 ? form.primarySkills : ['General'],
        primarySkills: form.primarySkills,
        secondarySkills: form.secondarySkills,
        mandatorySkills: form.mandatorySkills,
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : undefined,
        salaryType: form.salaryType,
        salaryPeriod: form.salaryPeriod,
        screeningQuestions: form.screeningQuestions,
      }
      const res = await api.jobs.create(payload)
      if (res) {
        toast.success('Job saved as draft successfully!')
        router.push('/hr/job-post')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to save draft')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublish = async () => {
    if (!form.title || !form.title.trim()) {
      toast.error('Please enter a job title')
      return
    }
    setSubmitting(true)
    try {
      const payload: any = {
        title: form.title,
        department: form.department || 'General',
        employmentType: form.employmentType || 'Full-time',
        workMode: form.workMode || 'Office',
        location: form.location || 'Chennai, TN',
        description: form.summary || form.title,
        status: 'published',
        isPublished: true,
        skills: form.primarySkills.length > 0 ? form.primarySkills : ['General'],
        primarySkills: form.primarySkills,
        secondarySkills: form.secondarySkills,
        mandatorySkills: form.mandatorySkills,
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : undefined,
        salaryType: form.salaryType,
        salaryPeriod: form.salaryPeriod,
        screeningQuestions: form.screeningQuestions,
      }
      const res = await api.jobs.create(payload)
      if (res) {
        toast.success('Job published successfully!')
        router.push('/hr/job-post')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to publish job')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0: return !!form.title && !!form.employmentType && !!form.location
      case 2: return form.primarySkills.length > 0
      default: return true
    }
  }

  const aiSections = [
    { id: 'summary' as const, label: 'Job Summary', icon: BookOpen },
    { id: 'responsibilities' as const, label: 'Roles & Responsibilities', icon: ListChecks },
    { id: 'skills' as const, label: 'Required Skills', icon: Star },
    { id: 'qualifications' as const, label: 'Qualifications', icon: GraduationCap },
    { id: 'benefits' as const, label: 'Benefits', icon: TrendingUp },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Job Posting</h1>
        <p className="text-muted-foreground">Create a job posting with our step-by-step wizard.</p>
      </div>

      <div className="mb-8">
        <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
        <div className="mt-3 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <Badge key={s} variant={i === step ? 'default' : i < step ? 'secondary' : 'outline'}>
              {i + 1}. {s}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>
            {step === 0 && 'Enter the basic details for your job posting'}
            {step === 1 && 'Generate an AI-powered job description with structured sections'}
            {step === 2 && 'Categorize skills for this position'}
            {step === 3 && 'Set candidate preferences and requirements'}
            {step === 4 && 'Add screening questions for candidates'}
            {step === 5 && 'Review and publish your job'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Details */}
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="e.g., Senior React Developer" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => updateForm('department', v)}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product'].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employment Type *</Label>
                <Select value={form.employmentType} onValueChange={(v) => updateForm('employmentType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Temporary'].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Mode</Label>
                <Select value={form.workMode} onValueChange={(v) => updateForm('workMode', v)}>
                  <SelectTrigger><SelectValue placeholder="Select work mode" /></SelectTrigger>
                  <SelectContent>
                    {['On-site', 'Remote', 'Hybrid'].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input value={form.location} onChange={(e) => updateForm('location', e.target.value)} placeholder="e.g., Bangalore" />
              </div>
              <div className="space-y-2">
                <Label>Minimum Experience Required</Label>
                <div className="flex gap-2">
                  <Select value={form.experienceYears} onValueChange={(v) => updateForm('experienceYears', v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Years" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 16 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>{i} Year{i !== 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={form.experienceMonths} onValueChange={(v) => updateForm('experienceMonths', v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Months" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>{i} Month{i !== 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Salary Type</Label>
                <Select value={form.salaryType} onValueChange={(v) => updateForm('salaryType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select salary type" /></SelectTrigger>
                  <SelectContent>
                    {['fixed', 'negotiable', 'confidential'].map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.salaryType === 'fixed' && (
                <>
                  <div className="space-y-2">
                    <Label>Minimum Salary</Label>
                    <Input type="number" value={form.salaryMin} onChange={(e) => updateForm('salaryMin', e.target.value)} placeholder="e.g., 25000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Salary</Label>
                    <Input type="number" value={form.salaryMax} onChange={(e) => updateForm('salaryMax', e.target.value)} placeholder="e.g., 35000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary Period</Label>
                    <Select value={form.salaryPeriod} onValueChange={(v) => updateForm('salaryPeriod', v)}>
                      <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                      <SelectContent>
                        {['monthly', 'yearly', 'hourly'].map((p) => (
                          <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Vacancy Count</Label>
                <Input type="number" value={form.vacancyCount} onChange={(e) => updateForm('vacancyCount', e.target.value)} placeholder="e.g., 3" />
              </div>
              <div className="space-y-2">
                <Label>Notice Period</Label>
                <Select value={form.noticePeriod} onValueChange={(v) => updateForm('noticePeriod', v)}>
                  <SelectTrigger><SelectValue placeholder="Select notice period" /></SelectTrigger>
                  <SelectContent>
                    {['Immediate', '15 days', '30 days', '45 days', '60 days', '90 days'].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: AI Description */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-lg bg-primary/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Job Description Generator</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={startListening}>
                      <Mic className={`mr-1.5 h-3.5 w-3.5 ${listening ? 'text-red-500 animate-pulse' : ''}`} />
                      {listening ? 'Listening...' : 'Voice'}
                    </Button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate a complete, structured job description using AI.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={generateAiDescription} disabled={aiLoading || !form.title} size="sm">
                    {aiLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                    Generate Full JD
                  </Button>
                  <Button variant="outline" size="sm" onClick={regenerateSection} disabled={!form.summary}>
                    <RefreshCw className="mr-1.5 h-4 w-4" /> Regenerate Section
                  </Button>
                  <Button variant="outline" size="sm" onClick={improveSection} disabled={!form.summary}>
                    <TrendingUp className="mr-1.5 h-4 w-4" /> Improve
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {aiSections.map((s) => (
                  <Button
                    key={s.id}
                    variant={aiSection === s.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAiSection(s.id)}
                  >
                    <s.icon className="mr-1.5 h-3.5 w-3.5" /> {s.label}
                  </Button>
                ))}
              </div>

              <Separator />

              {aiSection === 'summary' && (
                <div className="space-y-2">
                  <Label>Job Summary</Label>
                  <Textarea
                    rows={5}
                    value={form.summary}
                    onChange={(e) => updateForm('summary', e.target.value)}
                    placeholder="AI-generated job summary will appear here..."
                  />
                </div>
              )}

              {aiSection === 'responsibilities' && (
                <div className="space-y-3">
                  <Label>Roles & Responsibilities</Label>
                  <div className="flex gap-2">
                    <Input value={respInput} onChange={(e) => setRespInput(e.target.value)} placeholder="Add a responsibility" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResp())} />
                    <Button onClick={addResp}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-2">
                    {form.responsibilities.map((r) => (
                      <div key={r} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-start gap-2">
                          <Checkbox className="mt-0.5" />
                          <span className="text-sm">{r}</span>
                        </div>
                        <button onClick={() => removeResp(r)}><X className="h-4 w-4 text-muted-foreground" /></button>
                      </div>
                    ))}
                    {form.responsibilities.length === 0 && <p className="text-sm text-muted-foreground">No responsibilities added.</p>}
                  </div>
                </div>
              )}

              {aiSection === 'skills' && (
                <div className="space-y-3">
                  <Label>Required Skills (from AI)</Label>
                  <div className="flex flex-wrap gap-2">
                    {form.requiredSkills.map((s) => (
                      <Badge key={s} variant="secondary">{s}<button onClick={() => setForm((prev) => ({ ...prev, requiredSkills: prev.requiredSkills.filter((x) => x !== s) }))} className="ml-1.5"><X className="h-3 w-3" /></button></Badge>
                    ))}
                  </div>
                </div>
              )}

              {aiSection === 'qualifications' && (
                <div className="space-y-3">
                  <Label>Qualifications</Label>
                  <div className="flex gap-2">
                    <Input value={qualInput} onChange={(e) => setQualInput(e.target.value)} placeholder="Add a qualification" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQual())} />
                    <Button onClick={addQual}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-2">
                    {form.qualifications.map((q) => (
                      <div key={q} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-start gap-2">
                          <GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{q}</span>
                        </div>
                        <button onClick={() => removeQual(q)}><X className="h-4 w-4 text-muted-foreground" /></button>
                      </div>
                    ))}
                    {form.qualifications.length === 0 && <p className="text-sm text-muted-foreground">No qualifications added.</p>}
                  </div>
                </div>
              )}

              {aiSection === 'benefits' && (
                <div className="space-y-3">
                  <Label>Benefits</Label>
                  <div className="flex gap-2">
                    <Input value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)} placeholder="Add a benefit" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())} />
                    <Button onClick={addBenefit}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-2">
                    {form.benefits.map((b) => (
                      <div key={b} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="mt-0.5 h-4 w-4 text-green-500" />
                          <span className="text-sm">{b}</span>
                        </div>
                        <button onClick={() => removeBenefit(b)}><X className="h-4 w-4 text-muted-foreground" /></button>
                      </div>
                    ))}
                    {form.benefits.length === 0 && <p className="text-sm text-muted-foreground">No benefits added.</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Primary Skills */}
              <div className="rounded-lg border p-4">
                <Label className="text-base font-semibold">Primary Skills</Label>
                <p className="text-xs text-muted-foreground mb-3">Core skills required for the role</p>
                <div className="flex gap-2">
                  <Input value={skillInputs.primary} onChange={(e) => setSkillInputs({ ...skillInputs, primary: e.target.value })} placeholder="e.g., React" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('primarySkills', 'primary'))} />
                  <Button onClick={() => addToList('primarySkills', 'primary')}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.primarySkills.map((s) => (
                    <Badge key={s} className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100">
                      {s}<button onClick={() => removeFromList('primarySkills', s)} className="ml-1.5"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Secondary Skills */}
              <div className="rounded-lg border p-4">
                <Label className="text-base font-semibold">Secondary Skills</Label>
                <p className="text-xs text-muted-foreground mb-3">Nice-to-have skills</p>
                <div className="flex gap-2">
                  <Input value={skillInputs.secondary} onChange={(e) => setSkillInputs({ ...skillInputs, secondary: e.target.value })} placeholder="e.g., GraphQL" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('secondarySkills', 'secondary'))} />
                  <Button onClick={() => addToList('secondarySkills', 'secondary')}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.secondarySkills.map((s) => (
                    <Badge key={s} variant="outline" className="border-purple-300 text-purple-700">
                      {s}<button onClick={() => removeFromList('secondarySkills', s)} className="ml-1.5"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Mandatory Skills */}
              <div className="rounded-lg border p-4">
                <Label className="text-base font-semibold">Mandatory Skills</Label>
                <p className="text-xs text-muted-foreground mb-3">Non-negotiable requirements</p>
                <div className="flex gap-2">
                  <Input value={skillInputs.mandatory} onChange={(e) => setSkillInputs({ ...skillInputs, mandatory: e.target.value })} placeholder="e.g., 5+ years React" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('mandatorySkills', 'mandatory'))} />
                  <Button onClick={() => addToList('mandatorySkills', 'mandatory')}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.mandatorySkills.map((s) => (
                    <Badge key={s} className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100">
                      {s}<button onClick={() => removeFromList('mandatorySkills', s)} className="ml-1.5"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Candidate Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Education</Label>
                  <Select value={form.education} onValueChange={(v) => updateForm('education', v)}>
                    <SelectTrigger><SelectValue placeholder="Select minimum education" /></SelectTrigger>
                    <SelectContent>
                      {["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "Any"].map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Experience</Label>
                  <Select value={form.preferredExperience} onValueChange={(v) => updateForm('preferredExperience', v)}>
                    <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                    <SelectContent>
                      {['0-1 years', '1-3 years', '3-5 years', '5-8 years', '8-12 years', '12+ years'].map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gender Preference</Label>
                  <Select value={form.gender} onValueChange={(v) => updateForm('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Any gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location Preference</Label>
                  <Input value={form.locationPreference} onChange={(e) => updateForm('locationPreference', e.target.value)} placeholder="e.g., Bangalore only" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Notice Period</Label>
                  <Select value={form.preferredNoticePeriod} onValueChange={(v) => updateForm('preferredNoticePeriod', v)}>
                    <SelectTrigger><SelectValue placeholder="Select notice" /></SelectTrigger>
                    <SelectContent>
                      {['Immediate', '15 days', '30 days', '45 days', '60 days', '90 days'].map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Industry Preference</Label>
                  <Select value={form.industryPreference} onValueChange={(v) => updateForm('industryPreference', v)}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Media', 'Any'].map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Screening Questions */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="e.g., Do you have experience with React?"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                />
                <Button onClick={addQuestion}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-2">
                {form.screeningQuestions.map((q) => (
                  <div key={q} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-start gap-2">
                      <Checkbox className="mt-0.5" />
                      <span className="text-sm">{q}</span>
                    </div>
                    <button onClick={() => removeQuestion(q)}><X className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                ))}
                {form.screeningQuestions.length === 0 && (
                  <div className="rounded-lg bg-muted p-6 text-center">
                    <p className="text-sm text-muted-foreground">No screening questions yet. Add questions to filter candidates.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Preview & Publish */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{form.title || 'Job Title'}</h3>
                    <p className="text-sm text-muted-foreground">{form.department} &middot; {form.employmentType}</p>
                  </div>
                  <Badge className="text-xs">{form.workMode || 'Work Mode'}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {form.location || 'Location'}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {form.experienceYears || form.experienceMonths ? `${form.experienceYears || '0'} Year${form.experienceYears !== '1' ? 's' : ''} ${form.experienceMonths || '0'} Month${form.experienceMonths !== '1' ? 's' : ''}` : 'Experience'}</span>
                  <span className="font-medium text-foreground">
                    {form.salaryType === 'confidential' ? 'Confidential' : form.salaryType === 'fixed' ? form.salaryMin || form.salaryMax ? `₹${Number(form.salaryMin).toLocaleString('en-IN')} - ₹${Number(form.salaryMax).toLocaleString('en-IN')} / ${form.salaryPeriod}` : 'Salary' : 'Negotiable'}
                  </span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {form.vacancyCount || '0'} vacancies</span>
                </div>

                <Separator className="my-4" />

                {form.summary && (
                  <>
                    <h4 className="font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Job Summary</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{form.summary}</p>
                  </>
                )}

                {form.responsibilities.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /> Roles & Responsibilities</h4>
                    <ul className="mt-2 list-inside list-disc text-sm space-y-1">
                      {form.responsibilities.map((r) => (<li key={r}>{r}</li>))}
                    </ul>
                  </>
                )}

                {form.primarySkills.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold">Primary Skills</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.primarySkills.map((s) => (<Badge key={s} className="bg-blue-100 text-blue-800">{s}</Badge>))}
                    </div>
                  </>
                )}

                {form.qualifications.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Qualifications</h4>
                    <ul className="mt-2 list-inside list-disc text-sm space-y-1">
                      {form.qualifications.map((q) => (<li key={q}>{q}</li>))}
                    </ul>
                  </>
                )}

                {form.benefits.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Benefits</h4>
                    <ul className="mt-2 list-inside list-disc text-sm space-y-1">
                      {form.benefits.map((b) => (<li key={b}>{b}</li>))}
                    </ul>
                  </>
                )}

                {form.screeningQuestions.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold">Screening Questions ({form.screeningQuestions.length})</h4>
                    <ul className="mt-2 space-y-2">
                      {form.screeningQuestions.map((q, i) => (
                        <li key={q} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">{i + 1}</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="gap-2" onClick={handleSaveDraft}>
                  <Eye className="h-4 w-4" /> Save as Draft
                </Button>
                <Button onClick={handlePublish} className="gap-2">
                  <Send className="h-4 w-4" /> Publish Job
                </Button>
              </div>
            </div>
          )}

          {step < 5 && (
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={step === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed()}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
