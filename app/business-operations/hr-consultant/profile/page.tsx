'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Plus, X, Save, Linkedin, Github, Globe, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

const initialProfile = {
  employeeId: 'HCTK000001',
  name: 'HR Recruiter',
  photo: '',
  email: 'consultant@thozhilagency.com',
  phone: '+91 9876543210',
  agencyName: 'Thozhil Recruitment Agency',
  branch: 'Chennai - Main',
  department: 'Technical Recruitment',
  designation: 'Senior HR Recruiter',
  reportingManager: 'Mr. Arun Kumar',
  hiringManager: 'Ms. Priya Sharma',
  experience: '8 Years',
  specialization: 'IT Recruitment',
  preferredIndustries: 'Information Technology, Banking, Healthcare',
  preferredJobRoles: 'Software Developer, DevOps Engineer, Data Analyst',
  preferredLocations: 'Chennai, Bangalore, Hyderabad',
  languages: 'Tamil, English, Hindi',
  skills: 'Sourcing, Interviewing, Negotiation, Client Management, ATS',
  certifications: 'SHRM-CP, Naukri RMS Certified, LinkedIn Recruiter Certified',
  achievements: 'Best Recruiter Award 2024, 200% of Target Q3 2024',
  linkedInUrl: 'https://linkedin.com/in/consultant',
  githubUrl: 'https://github.com/consultant',
  portfolioUrl: 'https://consultant.dev',
}

export default function HrConsultantProfilePage() {
  const [profile, setProfile] = useState(initialProfile)
  const [saving, setSaving] = useState(false)
  const [languagesList, setLanguagesList] = useState(profile.languages.split(', '))
  const [achievementsList, setAchievementsList] = useState(profile.achievements.split(', '))
  const [newLang, setNewLang] = useState('')
  const [newAchievement, setNewAchievement] = useState('')

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Profile updated successfully!')
    setSaving(false)
  }

  const addLanguage = () => {
    if (newLang.trim() && !languagesList.includes(newLang.trim())) {
      setLanguagesList([...languagesList, newLang.trim()])
      setProfile({ ...profile, languages: [...languagesList, newLang.trim()].join(', ') })
      setNewLang('')
    }
  }

  const removeLanguage = (lang: string) => {
    const updated = languagesList.filter(l => l !== lang)
    setLanguagesList(updated)
    setProfile({ ...profile, languages: updated.join(', ') })
  }

  const addAchievement = () => {
    if (newAchievement.trim() && !achievementsList.includes(newAchievement.trim())) {
      setAchievementsList([...achievementsList, newAchievement.trim()])
      setProfile({ ...profile, achievements: [...achievementsList, newAchievement.trim()].join(', ') })
      setNewAchievement('')
    }
  }

  const removeAchievement = (ach: string) => {
    const updated = achievementsList.filter(a => a !== ach)
    setAchievementsList(updated)
    setProfile({ ...profile, achievements: updated.join(', ') })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your professional profile</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={profile.photo} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {profile.name.split(' ').map((s: string) => s[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.designation} • {profile.agencyName}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Employee ID: {profile.employeeId}</Badge>
                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20">{profile.experience}</Badge>
                <Badge variant="outline" className="bg-violet-500/5 text-violet-500 border-violet-500/20">{profile.department}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="border-border/50">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input value={profile.employeeId} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Consultant Name</Label>
                <Input value={profile.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Recruitment Agency</Label>
                <Input value={profile.agencyName} onChange={(e) => handleChange('agencyName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Branch</Label>
                <Input value={profile.branch} onChange={(e) => handleChange('branch', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input value={profile.department} onChange={(e) => handleChange('department', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Designation</Label>
                <Input value={profile.designation} onChange={(e) => handleChange('designation', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Reporting Manager</Label>
                <Input value={profile.reportingManager} onChange={(e) => handleChange('reportingManager', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Hiring Manager</Label>
                <Input value={profile.hiringManager} onChange={(e) => handleChange('hiringManager', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Experience</Label>
                <Input value={profile.experience} onChange={(e) => handleChange('experience', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={profile.email} onChange={(e) => handleChange('email', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={profile.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Skills & Certifications</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Skills</Label>
                <Textarea value={profile.skills} onChange={(e) => handleChange('skills', e.target.value)} rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>Certifications</Label>
                <Textarea value={profile.certifications} onChange={(e) => handleChange('certifications', e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Resume</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-border">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Upload Resume</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX - Max 5MB</p>
                </div>
                <Button variant="outline" size="sm">Choose File</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Job Preferences</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Specialization</Label>
                <Input value={profile.specialization} onChange={(e) => handleChange('specialization', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Industries</Label>
                <Textarea value={profile.preferredIndustries} onChange={(e) => handleChange('preferredIndustries', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Job Roles</Label>
                <Textarea value={profile.preferredJobRoles} onChange={(e) => handleChange('preferredJobRoles', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Locations</Label>
                <Textarea value={profile.preferredLocations} onChange={(e) => handleChange('preferredLocations', e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Languages Known</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {languagesList.map((lang) => (
                  <Badge key={lang} variant="secondary" className="px-3 py-1 gap-1.5">
                    {lang}
                    <button onClick={() => removeLanguage(lang)} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add language" value={newLang} onChange={(e) => setNewLang(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLanguage()} />
                <Button variant="outline" onClick={addLanguage}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Achievements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {achievementsList.map((ach) => (
                  <Badge key={ach} variant="secondary" className="px-3 py-1 gap-1.5">
                    {ach}
                    <button onClick={() => removeAchievement(ach)} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add achievement" value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addAchievement()} />
                <Button variant="outline" onClick={addAchievement}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Social & Professional Links</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn Profile</Label>
                <Input value={profile.linkedInUrl} onChange={(e) => handleChange('linkedInUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</Label>
                <Input value={profile.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} placeholder="https://github.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Portfolio</Label>
                <Input value={profile.portfolioUrl} onChange={(e) => handleChange('portfolioUrl', e.target.value)} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
              <div className="flex items-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
