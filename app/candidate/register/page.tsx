'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { BrandLogo } from '@/components/brand-logo'
import { Separator } from '@/components/ui/separator'
import { DOBSelector } from '@/components/ui/dob-selector'
import { LocationSelector } from '@/components/ui/location-selector'
import { EducationForm, validateEducation } from '@/components/ui/education-form'
import type { EducationValues } from '@/components/ui/education-form'
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select'
import {
  ArrowLeft, ArrowRight, Send, Loader2, User, Smartphone,
  GraduationCap, Briefcase, Wrench, Upload, Chrome, CheckCheck,
  X, FileText, Image, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { api as apiClient } from '@/lib/api-client'

const steps = [
  { id: 1, label: 'Account', icon: Smartphone },
  { id: 2, label: 'Personal', icon: User },
  { id: 3, label: 'Education', icon: GraduationCap },
  { id: 4, label: 'Professional', icon: Briefcase },
  { id: 5, label: 'Skills', icon: Wrench },
  { id: 6, label: 'Upload', icon: Upload },
]

export default function CandidateRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const [touched, setTouched] = useState(false)
  const [educationErrors, setEducationErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    photo: '', gender: '', dob: '', nationality: 'Indian',
    address: '', state: '', district: '', city: '', pincode: '',
    countryId: 1 as number | null, stateId: null as number | null, districtId: null as number | null, cityId: null as number | null,
    qualification: '', college: '', university: '', collegeId: null as number | null, universityId: null as number | null, passingYear: '', cgpa: '',
    qualificationType: '', degree: '', specialization: '', modeOfStudy: '', percentage: '', gradingType: '', educationStatus: '', currentSemester: '', backlogs: '', backlogCount: '',
    experienceType: 'fresher', currentCompany: '', designation: '', yearsOfExperience: '',
    currentSalary: '', expectedSalary: '', noticePeriod: '',
    preferredRole: '', preferredIndustry: '', preferredLocation: '', employmentType: '',
    preferredRoles: [] as number[], preferredIndustries: [] as number[], preferredLocations: [] as number[],
    programmingLanguageIds: [] as number[], technicalSkillIds: [] as number[],
    frameworkIds: [] as number[], toolIds: [] as number[],
    softSkillIds: [] as number[], languageIds: [] as number[],
    skillLevel: '',
    resumeFile: null as File | null,
    certificateFiles: [] as File[],
    portfolioFile: null as File | null,
    portfolioUrl: '',
    profilePhotoFile: null as File | null,
    linkedin: '', github: '', portfolio: '',
  })

  const updateForm = (f: string, v: any) => setForm(prev => ({ ...prev, [f]: v }))
  const updateFormArray = (f: string, v: number[]) => setForm(prev => ({ ...prev, [f]: v }))

  const handleLocationChange = useCallback(async (loc: { countryId?: number | null; stateId?: number | null; districtId?: number | null; cityId?: number | null }) => {
    console.log('[handleLocationChange] received:', loc)
    console.log("Selected State:", loc.stateId)
    console.log("Selected District:", loc.districtId)

    setForm(prev => {
      const next = { ...prev, ...loc }
      if (loc.stateId === null) { next.state = ''; next.district = ''; next.city = '' }
      if (loc.districtId === null) { next.district = ''; next.city = '' }
      if (loc.cityId === null) next.city = ''
      console.log('[handleLocationChange] form after setForm:', next.countryId, next.stateId, next.districtId, next.cityId)
      return next
    })

    if (loc.countryId && loc.stateId && !loc.districtId) {
      try {
        const states = await apiClient.locations.getStates(loc.countryId)
        console.log('[handleLocationChange] states loaded:', states?.length ?? 0)
        if (states) {
          const s = states.find(s => s.id === loc.stateId)
          if (s) {
            console.log('[handleLocationChange] setting state name:', s.name)
            setForm(prev => ({ ...prev, state: s.name }))
          }
        }
      } catch (e) {
        console.error('[handleLocationChange] Error fetching state name:', e)
      }
    }

    if (loc.stateId && loc.districtId && !loc.cityId) {
      try {
        const districts = await apiClient.locations.getDistricts(loc.stateId)
        console.log('[handleLocationChange] districts loaded:', districts?.length ?? 0)
        if (districts) {
          const d = districts.find(d => d.id === loc.districtId)
          if (d) {
            console.log('[handleLocationChange] setting district name:', d.name)
            setForm(prev => ({ ...prev, district: d.name }))
          }
        }
      } catch (e) {
        console.error('[handleLocationChange] Error fetching district name:', e)
      }
    }

    if (loc.districtId && loc.cityId) {
      try {
        const cities = await apiClient.locations.getCities(loc.districtId)
        console.log('[handleLocationChange] cities loaded:', cities?.length ?? 0)
        if (cities) {
          const c = cities.find(c => c.id === loc.cityId)
          if (c) {
            console.log('[handleLocationChange] setting city name:', c.name)
            setForm(prev => ({ ...prev, city: c.name }))
          }
        }
      } catch (e) {
        console.error('[handleLocationChange] Error fetching city name:', e)
      }
    }
  }, [])

  function handleEducationChange(partial: Partial<EducationValues>) {
    setForm(prev => ({ ...prev, ...partial }))
    setEducationErrors(prev => {
      const updated = { ...prev }
      Object.keys(partial).forEach(k => delete updated[k])
      return updated
    })
  }

  function computeEducationErrors(): Record<string, string> {
    const ev: EducationValues = {
      qualification: form.qualification,
      qualificationType: form.qualificationType,
      degree: form.degree,
      specialization: form.specialization,
      college: form.college,
      collegeId: form.collegeId,
      university: form.university,
      universityId: form.universityId,
      modeOfStudy: form.modeOfStudy,
      passingYear: form.passingYear,
      percentage: form.percentage,
      gradingType: form.gradingType,
      educationStatus: form.educationStatus,
      currentSemester: form.currentSemester,
      backlogs: form.backlogs,
      backlogCount: form.backlogCount,
    }
    return validateEducation(ev)
  }

  const canProceed = () => {
    switch (step) {
      case 1: return form.fullName && form.email && form.phone
      case 2: return form.gender && form.dob && form.address && form.stateId
      case 3: {
        const errs = computeEducationErrors()
        setEducationErrors(errs)
        return Object.keys(errs).length === 0
      }
      case 4: {
        const expOk = form.experienceType === 'fresher' || (form.currentCompany && form.designation && form.yearsOfExperience && form.currentSalary && form.expectedSalary && form.noticePeriod)
        return expOk && !!form.employmentType && !!form.noticePeriod &&
          form.preferredRoles.length > 0 &&
          form.preferredIndustries.length > 0 &&
          form.preferredLocations.length > 0
      }
      case 5: return true
      case 6: return !!form.resumeFile
      default: return true
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const toastId = toast.loading('Creating account...')

      const generatedPassword = Math.random().toString(36).slice(-12) + 'A1!'
      const regRes = await api.candidate.register({
        name: form.fullName,
        email: form.email,
        password: generatedPassword,
        phone: form.phone,
      })
      localStorage.setItem('candidate_user', JSON.stringify(regRes.user))
      localStorage.setItem('candidate_token', regRes.accessToken)

      toast.loading('Uploading files...', { id: toastId })

      // Upload resume
      let resumeUrl = ''
      if (form.resumeFile) {
        const r = await api.upload.resume(form.resumeFile)
        resumeUrl = r.downloadUrl || r.url || r.path || ''
      }

      // Upload portfolio file
      let portfolioFileUrl = ''
      if (form.portfolioFile) {
        const r = await api.upload.portfolio(form.portfolioFile)
        portfolioFileUrl = r.downloadUrl || r.url || r.path || ''
      }

      // Upload profile photo
      let profilePhotoUrl = ''
      if (form.profilePhotoFile) {
        const r = await api.upload.photo(form.profilePhotoFile)
        profilePhotoUrl = r.downloadUrl || r.url || r.path || ''
      }

      // Upload certificates
      const certUrls: { fileName: string; fileUrl: string }[] = []
      if (form.certificateFiles.length > 0) {
        const r = await api.upload.certificates(form.certificateFiles)
        if (Array.isArray(r)) {
          r.forEach((item: any, i: number) => {
            certUrls.push({ fileName: form.certificateFiles[i].name, fileUrl: item.downloadUrl || item.url || item.path || '' })
          })
        }
      }

      toast.loading('Saving profile...', { id: toastId })

      // Collect all skill IDs
      const allSkillIds = [
        ...form.programmingLanguageIds,
        ...form.technicalSkillIds,
        ...form.frameworkIds,
        ...form.toolIds,
        ...form.softSkillIds,
        ...form.languageIds,
      ]

      const profileData: any = {
        gender: form.gender,
        dob: form.dob,
        nationality: form.nationality,
        address: form.address,
        state: form.state,
        district: form.district,
        city: form.city,
        pincode: form.pincode,
        countryId: form.countryId,
        stateId: form.stateId,
        districtId: form.districtId,
        cityId: form.cityId,
        currentCompany: form.currentCompany || null,
        designation: form.designation || null,
        experienceYears: form.yearsOfExperience || null,
        currentSalary: form.currentSalary || null,
        expectedSalary: form.expectedSalary || null,
        noticePeriod: form.noticePeriod || null,
        employmentType: form.employmentType || null,
        preferredRoles: form.preferredRoles,
        preferredIndustries: form.preferredIndustries,
        preferredLocations: form.preferredLocations,
        skillIds: allSkillIds,
        skillLevel: form.skillLevel || 'intermediate',
        resumeUrl,
        profilePhoto: profilePhotoUrl || null,
        portfolioUrl: portfolioFileUrl || form.portfolioUrl || null,
        portfolioType: portfolioFileUrl ? 'file' : form.portfolioUrl ? 'url' : null,
        linkedin: form.linkedin || null,
        github: form.github || null,
        portfolio: form.portfolio || null,
      }

      const profile = await api.portal.profile.update(profileData)

      // Add certificates via user JWT
      if (certUrls.length > 0) {
        for (const cert of certUrls) {
          if (cert.fileUrl) {
            await api.portal.certifications.create({ name: cert.fileName, fileUrl: cert.fileUrl })
          }
        }
      }

      // Create education record
      const educationData: any = {}
      if (form.qualification) educationData.qualification = form.qualification
      if (form.qualificationType) educationData.qualificationType = form.qualificationType
      if (form.degree) educationData.degree = form.degree
      if (form.specialization) educationData.specialization = form.specialization
      if (form.college) educationData.college = form.college
      if (form.collegeId) educationData.collegeId = form.collegeId
      if (form.university) educationData.university = form.university
      if (form.universityId) educationData.universityId = form.universityId
      if (form.modeOfStudy) educationData.modeOfStudy = form.modeOfStudy
      if (form.passingYear) educationData.passingYear = form.passingYear
      if (form.percentage) educationData.percentage = form.percentage
      if (form.gradingType) educationData.gradingType = form.gradingType
      if (form.educationStatus) educationData.educationStatus = form.educationStatus
      if (form.currentSemester) educationData.currentSemester = form.currentSemester
      if (form.backlogs) educationData.backlogs = form.backlogs
      if (form.backlogCount) educationData.backlogCount = form.backlogCount
      if (Object.keys(educationData).length > 0) {
        await api.portal.education.create(educationData)
      }

      // Create experience record for experienced candidates
      if (form.experienceType === 'experienced' && form.currentCompany && form.designation) {
        await api.portal.experience.create({
          company: form.currentCompany,
          role: form.designation,
          duration: form.yearsOfExperience ? `${form.yearsOfExperience} years` : null,
        })
      }

      // Clear auth — candidate must log in manually
      localStorage.removeItem('candidate_token')
      localStorage.removeItem('candidate_user')

      toast.success('Registration complete!', { id: toastId })
      router.push('/candidate/register/success')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
  const labelClass = "text-gray-700 dark:text-gray-300"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="mx-auto flex justify-center">
            <BrandLogo size="medium" showTagline={false} />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Create Your Account</h1>
          <p className="text-gray-500 dark:text-gray-400">Join Thozhil Koodam and start your career journey</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 overflow-x-auto pb-2 gap-1">
            {steps.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                  step > s.id ? 'bg-green-500 text-white' :
                  step === s.id ? 'bg-purple-600 text-white ring-2 ring-purple-300' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {step > s.id ? <CheckCheck className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] text-center ${step === s.id ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>
          <Progress value={(step / 6) * 100} className="h-2 bg-gray-200 dark:bg-gray-700" />
        </div>

        <Card className="border-0 shadow-xl bg-white dark:bg-gray-900 rounded-2xl">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <CardTitle className="text-xl text-gray-900 dark:text-white">Step {step}: {steps[step - 1].label}</CardTitle>
            <CardDescription>Fill in your {steps[step - 1].label.toLowerCase()} details</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2"><Label className={labelClass}>Full Name *</Label><Input className={inputClass} value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} placeholder="Enter your full name" /></div>
                  <div className="space-y-2"><Label className={labelClass}>Email Address *</Label><Input type="email" className={inputClass} value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="your@email.com" /></div>
                  <div className="space-y-2"><Label className={labelClass}>Mobile Number *</Label><Input type="tel" className={inputClass} value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+91 9876543210" /></div>
                </div>
                {touched && !canProceed() && <p className="text-sm text-red-500">Please fill all required fields.</p>}
                <Separator />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className={labelClass}>Profile Photo</Label>
                  {form.profilePhotoFile ? (
                    <div className="flex items-center gap-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 px-4 py-3">
                      <Image className="h-5 w-5 text-purple-500 shrink-0" />
                      <span className="flex-1 text-sm font-medium truncate">{form.profilePhotoFile.name}</span>
                      <span className="text-xs text-gray-400">{(form.profilePhotoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      <button type="button" onClick={() => updateForm('profilePhotoFile', null)} className="text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 transition-colors hover:border-purple-400">
                      <Upload className="h-5 w-5 text-purple-500 shrink-0" />
                      <span className="text-sm text-gray-500">Choose photo (JPG, PNG, max 2 MB)</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          if (file.size > 2 * 1024 * 1024) { toast.error('File too large. Max 2 MB'); return }
                          if (!['image/jpeg', 'image/png'].includes(file.type)) { toast.error('Only JPG, PNG files accepted'); return }
                          updateForm('profilePhotoFile', file)
                        }}
                      />
                    </label>
                  )}
                </div>
                <div className="space-y-2"><Label className={labelClass}>Gender *</Label>
                  <Select value={form.gender} onValueChange={v => updateForm('gender', v)}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{['Male', 'Female', 'Transgender', 'Prefer not to say'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  {touched && !form.gender && <p className="text-xs text-red-500">Please select your Gender.</p>}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <DOBSelector value={form.dob} onChange={v => updateForm('dob', v)} label="Date of Birth *" />
                  {touched && !form.dob && <p className="text-xs text-red-500">Please select your Date of Birth.</p>}
                </div>
                <div className="space-y-2"><Label className={labelClass}>Nationality</Label>
                  <Select value={form.nationality} onValueChange={v => updateForm('nationality', v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{['Indian', 'Other'].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2"><Label className={labelClass}>Current Address *</Label><Textarea className={inputClass} value={form.address} onChange={e => updateForm('address', e.target.value)} rows={2} />
                  {touched && !form.address && <p className="text-xs text-red-500">Please enter your Address.</p>}
                </div>
                <div className="sm:col-span-2">
                  <LocationSelector
                    countryId={form.countryId}
                    stateId={form.stateId}
                    districtId={form.districtId}
                    cityId={form.cityId}
                    onChange={handleLocationChange}
                    required
                    hideCountry
                  />
                  {touched && !form.stateId && <p className="text-xs text-red-500">Please select your State.</p>}
                </div>
                <div className="space-y-2"><Label className={labelClass}>Pincode</Label><Input className={inputClass} value={form.pincode} onChange={e => updateForm('pincode', e.target.value)} maxLength={6} /></div>
              </div>
            )}

            {step === 3 && (
              <EducationForm
                values={{
                  qualification: form.qualification,
                  qualificationType: form.qualificationType,
                  degree: form.degree,
                  specialization: form.specialization,
                  college: form.college,
                  collegeId: form.collegeId,
                  university: form.university,
                  universityId: form.universityId,
                  modeOfStudy: form.modeOfStudy,
                  passingYear: form.passingYear,
                  percentage: form.percentage,
                  gradingType: form.gradingType,
                  educationStatus: form.educationStatus,
                  currentSemester: form.currentSemester,
                  backlogs: form.backlogs,
                  backlogCount: form.backlogCount,
                }}
                onChange={handleEducationChange}
                errors={educationErrors}
              />
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={labelClass}>Are you a *</Label>
                  <div className="flex gap-3">
                    {['fresher', 'experienced'].map(t => (
                      <Button key={t} variant={form.experienceType === t ? 'default' : 'outline'} onClick={() => updateForm('experienceType', t)}
                        className={form.experienceType === t ? 'bg-purple-600' : ''}>{t.charAt(0).toUpperCase() + t.slice(1)}</Button>
                    ))}
                  </div>
                </div>
                {form.experienceType === 'experienced' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label className={labelClass}>Current Company</Label><Input className={inputClass} value={form.currentCompany} onChange={e => updateForm('currentCompany', e.target.value)} /></div>
                    <div className="space-y-2"><Label className={labelClass}>Designation</Label><Input className={inputClass} value={form.designation} onChange={e => updateForm('designation', e.target.value)} /></div>
                    <div className="space-y-2"><Label className={labelClass}>Years of Experience</Label><Input type="number" className={inputClass} value={form.yearsOfExperience} onChange={e => updateForm('yearsOfExperience', e.target.value)} /></div>
                    <div className="space-y-2"><Label className={labelClass}>Current Salary (LPA)</Label><Input type="number" className={inputClass} value={form.currentSalary} onChange={e => updateForm('currentSalary', e.target.value)} /></div>
                    <div className="space-y-2"><Label className={labelClass}>Expected Salary (LPA)</Label><Input type="number" className={inputClass} value={form.expectedSalary} onChange={e => updateForm('expectedSalary', e.target.value)} /></div>
                    <div className="space-y-2"><Label className={labelClass}>Notice Period (days)</Label><Input type="number" className={inputClass} value={form.noticePeriod} onChange={e => updateForm('noticePeriod', e.target.value)} /></div>
                  </div>
                )}
                <Separator />
                <div className="grid gap-6">
                  <SearchableMultiSelect
                    label="Preferred Job Roles"
                    selected={form.preferredRoles}
                    onChange={(ids) => updateFormArray('preferredRoles', ids)}
                    fetchItems={(s) => api.masterData.getJobRoles(s)}
                    placeholder="Search job roles..."
                    max={10}
                    required
                  />
                  <SearchableMultiSelect
                    label="Preferred Industries"
                    selected={form.preferredIndustries}
                    onChange={(ids) => updateFormArray('preferredIndustries', ids)}
                    fetchItems={(s) => api.masterData.getIndustries(s)}
                    placeholder="Search industries..."
                    max={10}
                    required
                  />
                  <SearchableMultiSelect
                    label="Preferred Locations"
                    selected={form.preferredLocations}
                    onChange={(ids) => updateFormArray('preferredLocations', ids)}
                    fetchItems={(s) => api.masterData.getLocations(s)}
                    placeholder="Search locations..."
                    max={10}
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label className={labelClass}>Employment Type</Label>
                      <Select value={form.employmentType} onValueChange={v => updateForm('employmentType', v)}>
                        <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClass}>Notice Period <span className="text-red-500">*</span></Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'immediate', label: 'Immediate' },
                          { value: 'fifteen_days', label: '15 Days' },
                          { value: 'thirty_days', label: '30 Days' },
                          { value: 'forty_five_days', label: '45 Days' },
                          { value: 'sixty_days', label: '60 Days' },
                          { value: 'ninety_days', label: '90 Days' },
                          { value: 'more_than_ninety_days', label: 'More than 90 Days' },
                        ].map(opt => (
                          <Button
                            key={opt.value}
                            type="button"
                            variant={form.noticePeriod === opt.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateForm('noticePeriod', opt.value)}
                            className={form.noticePeriod === opt.value ? 'bg-purple-600' : ''}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <SearchableMultiSelect
                  label="Programming Languages"
                  selected={form.programmingLanguageIds}
                  onChange={(ids) => updateFormArray('programmingLanguageIds', ids)}
                  fetchItems={(s) => api.skills.getList('programming_languages', s)}
                  placeholder="Search programming languages..."
                  max={10}
                />
                <SearchableMultiSelect
                  label="Technical Skills"
                  selected={form.technicalSkillIds}
                  onChange={(ids) => updateFormArray('technicalSkillIds', ids)}
                  fetchItems={(s) => api.skills.getList('technical_skills', s)}
                  placeholder="Search technical skills..."
                  max={10}
                />
                <SearchableMultiSelect
                  label="Frameworks & Libraries"
                  selected={form.frameworkIds}
                  onChange={(ids) => updateFormArray('frameworkIds', ids)}
                  fetchItems={(s) => api.skills.getList('frameworks_libraries', s)}
                  placeholder="Search frameworks..."
                  max={10}
                />
                <SearchableMultiSelect
                  label="Tools & Platforms"
                  selected={form.toolIds}
                  onChange={(ids) => updateFormArray('toolIds', ids)}
                  fetchItems={(s) => api.skills.getList('tools_platforms', s)}
                  placeholder="Search tools..."
                  max={10}
                />
                <SearchableMultiSelect
                  label="Soft Skills"
                  selected={form.softSkillIds}
                  onChange={(ids) => updateFormArray('softSkillIds', ids)}
                  fetchItems={(s) => api.skills.getList('soft_skills', s)}
                  placeholder="Search soft skills..."
                  max={10}
                />
                <SearchableMultiSelect
                  label="Languages Known"
                  selected={form.languageIds}
                  onChange={(ids) => updateFormArray('languageIds', ids)}
                  fetchItems={(s) => api.skills.getList('languages', s)}
                  placeholder="Search languages..."
                  max={10}
                />
                <div className="space-y-2">
                  <Label className={labelClass}>Skill Level <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={form.skillLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateForm('skillLevel', level)}
                        className={form.skillLevel === level ? 'bg-purple-600' : ''}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-8">
                {/* Resume Upload */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Resume <span className="text-red-500">*</span></h3>
                    <p className="text-xs text-gray-400">PDF, DOC, DOCX up to 5MB</p>
                  </div>
                  {form.resumeFile ? (
                    <div className="flex items-center gap-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 px-4 py-3">
                      <FileText className="h-5 w-5 text-purple-500 shrink-0" />
                      <span className="flex-1 text-sm font-medium truncate">{form.resumeFile.name}</span>
                      <span className="text-xs text-gray-400">{(form.resumeFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      <button type="button" onClick={() => updateForm('resumeFile', null)} className="text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 transition-colors hover:border-purple-400">
                      <Upload className="h-6 w-6 text-purple-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to choose file</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5 MB'); return }
                          if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
                            toast.error('Only PDF, DOC, DOCX files accepted'); return
                          }
                          updateForm('resumeFile', file)
                        }}
                      />
                    </label>
                  )}
                </div>

                <Separator />

                {/* Certificates */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Certificates</h3>
                    <p className="text-xs text-gray-400">PDF, JPG, PNG — multiple upload (max 5 MB each)</p>
                  </div>
                  {form.certificateFiles.length > 0 && (
                    <div className="space-y-2">
                      {form.certificateFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5">
                          <FileText className="h-4 w-4 text-purple-500 shrink-0" />
                          <span className="flex-1 text-sm truncate">{f.name}</span>
                          <span className="text-xs text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                          <button type="button" onClick={() => updateForm('certificateFiles', form.certificateFiles.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 transition-colors hover:border-purple-400">
                    <Upload className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-500">Add Certificate</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        const valid = files.filter(f => {
                          if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5 MB`); return false }
                          if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) { toast.error(`${f.name} — only PDF, JPG, PNG accepted`); return false }
                          return true
                        })
                        updateForm('certificateFiles', [...form.certificateFiles, ...valid])
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>

                <Separator />

                {/* Portfolio */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Portfolio</h3>
                    <p className="text-xs text-gray-400">Upload PDF or provide a URL</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={form.portfolioFile ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateForm('portfolioUrl', '')}
                      className={form.portfolioFile ? 'bg-purple-600' : ''}
                    >
                      <Upload className="h-4 w-4 mr-1" /> Upload PDF
                    </Button>
                    <Button
                      type="button"
                      variant={form.portfolioUrl ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateForm('portfolioFile', null)}
                      className={form.portfolioUrl ? 'bg-purple-600' : ''}
                    >
                      <Globe className="h-4 w-4 mr-1" /> Add URL
                    </Button>
                  </div>
                  {form.portfolioFile ? (
                    <div className="flex items-center gap-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 px-4 py-3">
                      <FileText className="h-5 w-5 text-purple-500 shrink-0" />
                      <span className="flex-1 text-sm font-medium truncate">{form.portfolioFile.name}</span>
                      <span className="text-xs text-gray-400">{(form.portfolioFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      <button type="button" onClick={() => updateForm('portfolioFile', null)} className="text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : !form.portfolioFile && (
                    <div style={{ display: form.portfolioUrl ? 'none' : '' }}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 transition-colors hover:border-purple-400">
                        <Upload className="h-5 w-5 text-purple-500" />
                        <span className="text-sm text-gray-500">Choose PDF file</span>
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5 MB'); return }
                            if (file.type !== 'application/pdf') { toast.error('Only PDF files accepted'); return }
                            updateForm('portfolioFile', file)
                          }}
                        />
                      </label>
                    </div>
                  )}
                  {form.portfolioUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-500 shrink-0" />
                      <Input
                        className={inputClass}
                        value={form.portfolioUrl}
                        onChange={(e) => updateForm('portfolioUrl', e.target.value)}
                        placeholder="https://github.com/your-profile"
                      />
                    </div>
                  )}
                </div>

                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Social Links</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input className={inputClass} value={form.linkedin} onChange={e => updateForm('linkedin', e.target.value)} placeholder="LinkedIn URL" />
                    <Input className={inputClass} value={form.github} onChange={e => updateForm('github', e.target.value)} placeholder="GitHub URL" />
                    <Input className={inputClass} value={form.portfolio} onChange={e => updateForm('portfolio', e.target.value)} placeholder="Personal Website" />
                  </div>
                </div>
              </div>
            )}

          </CardContent>
          <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 p-6">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            {step < 6 ? (
              <Button onClick={() => { setTouched(true); if (canProceed()) setStep(step + 1) }} className="gap-2 bg-purple-600 hover:bg-purple-700">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2 bg-green-600 hover:bg-green-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            )}
          </div>
        </Card>
        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account? <Link href="/candidate/login" className="text-purple-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
