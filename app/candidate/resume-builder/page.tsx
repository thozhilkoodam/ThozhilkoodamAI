'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText, Download, Eye, Trash2, Plus, Upload, CheckCircle2,
  Edit, Sparkles, Star, Award, Target
} from 'lucide-react'

const templates = [
  { id: 1, name: 'Professional Resume', industry: 'IT', format: 'ATS-friendly', popular: true },
  { id: 2, name: 'Creative CV', industry: 'Design', format: 'Modern', popular: false },
  { id: 3, name: 'Executive Resume', industry: 'Management', format: 'Formal', popular: false },
  { id: 4, name: 'Entry Level', industry: 'Freshers', format: 'Simple', popular: false },
]

export default function ResumeBuilderPage() {
  const [showBuilder, setShowBuilder] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Builder</h1>
          <p className="text-gray-500 dark:text-gray-400">Create and manage your resumes</p>
        </div>
        <Button onClick={() => setShowBuilder(!showBuilder)} className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" /> {showBuilder ? 'Back' : 'Create Resume'}
        </Button>
      </div>

      {!showBuilder ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map(t => (
              <Card key={t.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="h-32 rounded-lg bg-gray-100 dark:bg-gray-800 mb-3 flex items-center justify-center group-hover:ring-2 group-hover:ring-purple-500 transition-all">
                    <FileText className="h-10 w-10 text-purple-400" />
                  </div>
                  <h4 className="font-medium text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-400">{t.industry} • {t.format}</p>
                  {t.popular && <Badge className="mt-2 bg-purple-100 text-purple-700 text-[10px] border-0"><Sparkles className="h-3 w-3 mr-1" /> Popular</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">My Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Full Stack Developer Resume', format: 'PDF', updated: '2 days ago', size: '245 KB' },
                  { name: 'UI/UX Designer Resume', format: 'PDF', updated: '1 week ago', size: '189 KB' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.format} • {r.size} • Updated {r.updated}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Full Name" defaultValue="Kumar" />
                  <Input placeholder="Email" defaultValue="kumar@email.com" />
                  <Input placeholder="Phone" defaultValue="+91 9876543210" />
                  <Input placeholder="Location" defaultValue="Chennai, Tamil Nadu" />
                </div>
                <Input placeholder="Professional Summary (2-3 lines)" className="h-20" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Experience</h3>
                  <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
                </div>
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                  <div className="grid gap-3">
                    <Input placeholder="Job Title" defaultValue="Full Stack Developer" />
                    <Input placeholder="Company" defaultValue="TechCorp" />
                    <div className="grid grid-cols-2 gap-3"><Input placeholder="Start Date" defaultValue="Jun 2022" /><Input placeholder="End Date" defaultValue="Present" /></div>
                    <Input placeholder="Description" className="h-16" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Education</h3>
                  <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
                </div>
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                  <div className="grid gap-3">
                    <Input placeholder="Degree" defaultValue="Bachelor of Engineering" />
                    <Input placeholder="Institution" defaultValue="Anna University" />
                    <div className="grid grid-cols-2 gap-3"><Input placeholder="Start Year" defaultValue="2016" /><Input placeholder="End Year" defaultValue="2020" /></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Skills</h3>
                <Input placeholder="Add skill..." />
                <div className="flex flex-wrap gap-1.5">
                  {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL'].map(s => (
                    <Badge key={s} className="bg-purple-100 text-purple-700 dark:bg-purple-950 cursor-pointer">{s} ✕</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Links</h3>
                <Input placeholder="LinkedIn URL" />
                <Input placeholder="GitHub URL" />
                <Input placeholder="Portfolio URL" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2"><Sparkles className="h-4 w-4" /> AI Optimize</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
