'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DOBSelector } from '@/components/ui/dob-selector'
import { Textarea } from '@/components/ui/textarea'
import { LocationSelector } from '@/components/ui/location-selector'
import {
  User, Mail, Phone, MapPin, GraduationCap, Briefcase,
  Globe, Linkedin, Github, FileText, Save, Loader2, ArrowLeft,
  Plus, X, Trash2, Upload, Image
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { api as apiClient } from '@/lib/api-client'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const [educationList, setEducationList] = useState<any[]>([])
  const [experienceList, setExperienceList] = useState<any[]>([])
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const data = await api.portal.profile.get()
        setProfilePhotoUrl(data.profilePhoto || data.photo || '')
        setForm({
          gender: data.gender || '',
          dob: data.dob || '',
          nationality: data.nationality || 'Indian',
          address: data.address || '',
          state: data.state || '',
          district: data.district || '',
          city: data.city || '',
          pincode: data.pincode || '',
          countryId: data.countryId || null,
          stateId: data.stateId || null,
          districtId: data.districtId || null,
          cityId: data.cityId || null,
          linkedin: data.linkedin || '',
          github: data.github || '',
          portfolio: data.portfolio || '',
          portfolioUrl: data.portfolioUrl || '',
          currentCompany: data.currentCompany || '',
          designation: data.designation || '',
          experienceYears: data.experienceYears || '',
        })
        if (data.education) setEducationList(data.education)
        if (data.experience) setExperienceList(data.experience)
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const update = (f: string, v: any) => setForm((prev: Record<string, any>) => ({ ...prev, [f]: v }))

  const handleLocationChange = async (loc: { countryId?: number | null; stateId?: number | null; districtId?: number | null; cityId?: number | null }) => {
    const next: Record<string, any> = { ...loc }
    if (loc.stateId === null) { next.state = ''; next.district = ''; next.city = '' }
    if (loc.districtId === null) { next.district = ''; next.city = '' }
    if (loc.cityId === null) next.city = ''
    setForm((prev: Record<string, any>) => ({ ...prev, ...next }))

    if (loc.countryId && loc.stateId && !loc.districtId) {
      try {
        const states = await apiClient.locations.getStates(loc.countryId)
        if (states) {
          const s = states.find(s => s.id === loc.stateId)
          if (s) setForm((prev: Record<string, any>) => ({ ...prev, state: s.name }))
        }
      } catch {}
    }
    if (loc.stateId && loc.districtId && !loc.cityId) {
      try {
        const districts = await apiClient.locations.getDistricts(loc.stateId)
        if (districts) {
          const d = districts.find(d => d.id === loc.districtId)
          if (d) setForm((prev: Record<string, any>) => ({ ...prev, district: d.name }))
        }
      } catch {}
    }
    if (loc.districtId && loc.cityId) {
      try {
        const cities = await apiClient.locations.getCities(loc.districtId)
        if (cities) {
          const c = cities.find(c => c.id === loc.cityId)
          if (c) setForm((prev: Record<string, any>) => ({ ...prev, city: c.name }))
        }
      } catch {}
    }
  }

  const addEducation = () => {
    setEducationList(prev => [...prev, { qualification: '', degree: '', specialization: '', college: '', university: '', passingYear: '', percentage: '', gradingType: '', modeOfStudy: '', educationStatus: '', currentSemester: '', backlogs: '', _new: true }])
  }

  const updateEducation = (i: number, f: string, v: any) => {
    setEducationList(prev => prev.map((e, j) => j === i ? { ...e, [f]: v } : e))
  }

  const removeEducation = (i: number) => {
    setEducationList(prev => prev.filter((_, j) => j !== i))
  }

  const addExperience = () => {
    setExperienceList(prev => [...prev, { company: '', role: '', duration: '', _new: true }])
  }

  const updateExperience = (i: number, f: string, v: any) => {
    setExperienceList(prev => prev.map((e, j) => j === i ? { ...e, [f]: v } : e))
  }

  const removeExperience = (i: number) => {
    setExperienceList(prev => prev.filter((_, j) => j !== i))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let photoUrl = profilePhotoUrl
      if (profilePhotoFile) {
        const r = await api.upload.photo(profilePhotoFile)
        photoUrl = r.url || r.path || ''
      }

      const profileData: any = {}
      if (form.gender !== undefined) profileData.gender = form.gender
      if (form.dob !== undefined) profileData.dob = form.dob
      if (form.nationality !== undefined) profileData.nationality = form.nationality
      if (form.address !== undefined) profileData.address = form.address
      if (form.state !== undefined) profileData.state = form.state
      if (form.district !== undefined) profileData.district = form.district
      if (form.city !== undefined) profileData.city = form.city
      if (form.pincode !== undefined) profileData.pincode = form.pincode
      if (form.countryId !== undefined) profileData.countryId = form.countryId
      if (form.stateId !== undefined) profileData.stateId = form.stateId
      if (form.districtId !== undefined) profileData.districtId = form.districtId
      if (form.cityId !== undefined) profileData.cityId = form.cityId
      if (form.linkedin !== undefined) profileData.linkedin = form.linkedin
      if (form.github !== undefined) profileData.github = form.github
      if (form.portfolio !== undefined) profileData.portfolio = form.portfolio
      if (form.portfolioUrl !== undefined) profileData.portfolioUrl = form.portfolioUrl
      if (form.currentCompany !== undefined) profileData.currentCompany = form.currentCompany
      if (form.designation !== undefined) profileData.designation = form.designation
      if (form.experienceYears !== undefined) profileData.experienceYears = form.experienceYears

      if (photoUrl !== profilePhotoUrl) profileData.profilePhoto = photoUrl
      await api.portal.profile.update(profileData)

      for (const edu of educationList) {
        if (edu.id && !edu._new) {
          await api.portal.education.update(edu.id, {
            qualification: edu.qualification, degree: edu.degree, specialization: edu.specialization,
            college: edu.college, university: edu.university, passingYear: edu.passingYear,
            percentage: edu.percentage, gradingType: edu.gradingType,
            modeOfStudy: edu.modeOfStudy, educationStatus: edu.educationStatus,
            currentSemester: edu.currentSemester, backlogs: edu.backlogs,
          })
        } else if (edu._new) {
          await api.portal.education.create({
            qualification: edu.qualification, degree: edu.degree, specialization: edu.specialization,
            college: edu.college, university: edu.university, passingYear: edu.passingYear,
            percentage: edu.percentage, gradingType: edu.gradingType,
            modeOfStudy: edu.modeOfStudy, educationStatus: edu.educationStatus,
            currentSemester: edu.currentSemester, backlogs: edu.backlogs,
          })
        }
      }

      for (const exp of experienceList) {
        if (exp.id && !exp._new) {
          await api.portal.experience.update(exp.id, { company: exp.company, role: exp.role, duration: exp.duration })
        } else if (exp._new) {
          await api.portal.experience.create({ company: exp.company, role: exp.role, duration: exp.duration })
        }
      }

      toast.success('Profile updated successfully!')
      router.push('/candidate')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/candidate')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
            <p className="text-gray-500 dark:text-gray-400">Update your professional information</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-purple-600 hover:bg-purple-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {/* Profile Photo */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Image className="h-5 w-5 text-purple-500" /> Profile Photo</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {profilePhotoFile ? (
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-purple-200 bg-purple-50 flex items-center justify-center text-sm font-medium text-purple-600">
                {profilePhotoFile.name.slice(0, 2).toUpperCase()}
              </div>
            ) : profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover border-2 border-purple-200" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="h-8 w-8 text-purple-500" />
              </div>
            )}
            <div className="flex-1">
              {profilePhotoFile ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium truncate">{profilePhotoFile.name}</span>
                  <span className="text-xs text-gray-400">{(profilePhotoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  <button type="button" onClick={() => setProfilePhotoFile(null)} className="text-gray-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 hover:border-purple-400 transition-colors">
                  <Upload className="h-4 w-4 text-purple-500" />
                  Upload Photo
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 2 * 1024 * 1024) { toast.error('File too large. Max 2 MB'); return }
                      if (!['image/jpeg', 'image/png'].includes(file.type)) { toast.error('Only JPG, PNG files accepted'); return }
                      setProfilePhotoFile(file)
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-purple-500" /> Personal Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={v => update('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <DOBSelector value={form.dob} onChange={v => update('dob', v)} />
            </div>
            <div className="space-y-1">
              <Label>Nationality</Label>
              <Input value={form.nationality} onChange={e => update('nationality', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Textarea value={form.address} onChange={e => update('address', e.target.value)} rows={2} />
          </div>
          <LocationSelector
            countryId={form.countryId}
            stateId={form.stateId}
            districtId={form.districtId}
            cityId={form.cityId}
            onChange={handleLocationChange}
            hideCountry
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Pincode</Label>
              <Input value={form.pincode} onChange={e => update('pincode', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5 text-purple-500" /> Education</CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation} className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {educationList.length === 0 && <p className="text-sm text-gray-400">No education records.</p>}
          {educationList.map((edu, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Qualification</Label>
                    <Input value={edu.qualification || ''} onChange={e => updateEducation(i, 'qualification', e.target.value)} placeholder="e.g. Bachelor of Engineering" />
                  </div>
                  <div className="space-y-1">
                    <Label>Degree</Label>
                    <Input value={edu.degree || ''} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="e.g. B.E." />
                  </div>
                  <div className="space-y-1">
                    <Label>Specialization</Label>
                    <Input value={edu.specialization || ''} onChange={e => updateEducation(i, 'specialization', e.target.value)} placeholder="e.g. Computer Science" />
                  </div>
                  <div className="space-y-1">
                    <Label>College</Label>
                    <Input value={edu.college || ''} onChange={e => updateEducation(i, 'college', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>University</Label>
                    <Input value={edu.university || ''} onChange={e => updateEducation(i, 'university', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Passing Year</Label>
                    <Input value={edu.passingYear || ''} onChange={e => updateEducation(i, 'passingYear', e.target.value)} placeholder="e.g. 2023" />
                  </div>
                  <div className="space-y-1">
                    <Label>Percentage / CGPA</Label>
                    <Input value={edu.percentage || ''} onChange={e => updateEducation(i, 'percentage', e.target.value)} placeholder="e.g. 8.5 or 85%" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeEducation(i)} className="text-red-500 shrink-0 mt-6">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5 text-purple-500" /> Experience</CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience} className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {experienceList.length === 0 && <p className="text-sm text-gray-400">No experience records.</p>}
          {experienceList.map((exp, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Company</Label>
                    <Input value={exp.company || ''} onChange={e => updateExperience(i, 'company', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Designation</Label>
                    <Input value={exp.role || ''} onChange={e => updateExperience(i, 'role', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Duration</Label>
                    <Input value={exp.duration || ''} onChange={e => updateExperience(i, 'duration', e.target.value)} placeholder="e.g. 2 years" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeExperience(i)} className="text-red-500 shrink-0 mt-6">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-purple-500" /> Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn</Label>
              <Input value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><Github className="h-4 w-4" /> GitHub</Label>
              <Input value={form.github} onChange={e => update('github', e.target.value)} placeholder="https://github.com/username" />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><Globe className="h-4 w-4 text-purple-600" /> Website / Portfolio</Label>
              <Input value={form.portfolio} onChange={e => update('portfolio', e.target.value)} placeholder="https://yourportfolio.com" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
