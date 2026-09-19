'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Save, Camera, Lock, Award, GraduationCap, Globe, Briefcase, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    employeeId: 'HR-2024-001',
    agencyName: 'Thozhil Koodam Recruitment Services',
    company: 'Thozhil Koodam',
    department: 'Human Resources',
    designation: 'Senior Recruiter',
    reportingManager: 'Priya Sharma',
    hiringManager: 'Rahul Verma',
    email: 'john.doe@thozhilkoodam.com',
    phone: '+91 9876543210',
    experience: '5-10',
    preferredIndustry: 'Technology',
    preferredLocations: 'Bangalore, Chennai, Hyderabad',
    skills: 'Technical Recruitment, Talent Sourcing, Interview Coordination, Offer Negotiation, Campus Recruitment',
  })

  const [languages, setLanguages] = useState(['English', 'Hindi', 'Tamil'])
  const [newLang, setNewLang] = useState('')
  const [achievements, setAchievements] = useState(['Best Recruiter Award Q4 2024', '100+ Placements in 2024'])
  const [newAchievement, setNewAchievement] = useState('')
  const [workHistory] = useState([
    { role: 'Senior Recruiter', company: 'Thozhil Koodam', period: '2023 - Present', description: 'Leading end-to-end recruitment for tech roles.' },
    { role: 'Recruiter', company: 'PeopleFirst HR', period: '2021 - 2023', description: 'Managed bulk hiring for IT clients.' },
    { role: 'Talent Acquisition Associate', company: 'HireSmart', period: '2019 - 2021', description: 'Sourced and screened candidates for junior roles.' },
  ])
  const [education] = useState([
    { degree: 'MBA in HR', institution: 'XLRI Jamshedpur', year: '2019', grade: '3.6 GPA' },
    { degree: 'B.Com', institution: 'St. Joseph\'s College', year: '2017', grade: '82%' },
  ])

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  const handleSave = () => toast.success('Profile updated successfully!')

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) { toast.error('Please fill all password fields'); return }
    if (passwords.new !== passwords.confirm) { toast.error('New passwords do not match'); return }
    toast.success('Password changed successfully!')
    setPasswords({ current: '', new: '', confirm: '' })
  }

  const updateField = (field: string, value: string) => setProfile((prev) => ({ ...prev, [field]: value }))

  const addLanguage = () => {
    if (newLang && !languages.includes(newLang)) { setLanguages([...languages, newLang]); setNewLang('') }
  }

  const removeLanguage = (lang: string) => setLanguages(languages.filter((l) => l !== lang))

  const addAchievement = () => {
    if (newAchievement) { setAchievements([...achievements, newAchievement]); setNewAchievement('') }
  }

  const removeAchievement = (ach: string) => setAchievements(achievements.filter((a) => a !== ach))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and career details.</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal"><Save className="mr-2 h-4 w-4" /> Personal</TabsTrigger>
          <TabsTrigger value="work"><Briefcase className="mr-2 h-4 w-4" /> Work History</TabsTrigger>
          <TabsTrigger value="education"><GraduationCap className="mr-2 h-4 w-4" /> Education</TabsTrigger>
          <TabsTrigger value="languages"><Globe className="mr-2 h-4 w-4" /> Languages</TabsTrigger>
          <TabsTrigger value="achievements"><Award className="mr-2 h-4 w-4" /> Achievements</TabsTrigger>
          <TabsTrigger value="password"><Lock className="mr-2 h-4 w-4" /> Password</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=JD" />
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                  </Avatar>
                  <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground shadow">
                    <Camera className="h-3.5 w-3.5" />
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.designation}</p>
                  <p className="text-xs text-muted-foreground">{profile.employeeId}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full Name</Label><Input value={profile.name} onChange={(e) => updateField('name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Employee ID</Label><Input value={profile.employeeId} disabled className="text-muted-foreground" /></div>
                <div className="space-y-2"><Label>Agency Name</Label><Input value={profile.agencyName} onChange={(e) => updateField('agencyName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Company</Label><Input value={profile.company} onChange={(e) => updateField('company', e.target.value)} /></div>
                <div className="space-y-2"><Label>Department</Label><Input value={profile.department} onChange={(e) => updateField('department', e.target.value)} /></div>
                <div className="space-y-2"><Label>Designation</Label><Input value={profile.designation} onChange={(e) => updateField('designation', e.target.value)} /></div>
                <div className="space-y-2"><Label>Reporting Manager</Label><Input value={profile.reportingManager} onChange={(e) => updateField('reportingManager', e.target.value)} /></div>
                <div className="space-y-2"><Label>Hiring Manager</Label><Input value={profile.hiringManager} onChange={(e) => updateField('hiringManager', e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={profile.email} onChange={(e) => updateField('email', e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} /></div>
                <div className="space-y-2"><Label>Experience</Label>
                  <Select value={profile.experience} onValueChange={(v) => updateField('experience', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Preferred Industry</Label><Input value={profile.preferredIndustry} onChange={(e) => updateField('preferredIndustry', e.target.value)} /></div>
                <div className="space-y-2"><Label>Preferred Locations</Label><Input value={profile.preferredLocations} onChange={(e) => updateField('preferredLocations', e.target.value)} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Skills</Label><Textarea value={profile.skills} onChange={(e) => updateField('skills', e.target.value)} rows={3} /></div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Resume</Label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Resume</Button>
                    <span className="text-sm text-muted-foreground">PDF, DOC, DOCX (max 5MB)</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Work History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {workHistory.map((w, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-4 pb-4 last:pb-0">
                  <p className="font-medium">{w.role}</p>
                  <p className="text-sm text-muted-foreground">{w.company} | {w.period}</p>
                  <p className="text-sm text-muted-foreground mt-1">{w.description}</p>
                </div>
              ))}
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Add Work Experience</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Education</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution} | {edu.year}</p>
                    <Badge variant="secondary" className="mt-1">{edu.grade}</Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Add Education</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Languages</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-sm py-1 pl-3 pr-2 flex items-center gap-1">
                    {lang}
                    <button onClick={() => removeLanguage(lang)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newLang} onChange={(e) => setNewLang(e.target.value)} placeholder="Add language..." className="max-w-xs" />
                <Button variant="outline" size="sm" onClick={addLanguage}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Achievements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((ach, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <p className="text-sm">{ach}</p>
                  </div>
                  <button onClick={() => removeAchievement(ach)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} placeholder="Add achievement..." className="max-w-xs" />
                <Button variant="outline" size="sm" onClick={addAchievement}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} /></div>
                <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
              </div>
              <Button onClick={handlePasswordChange}><Lock className="mr-2 h-4 w-4" /> Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
