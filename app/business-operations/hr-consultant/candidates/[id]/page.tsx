'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, Phone, Mail, MapPin, Briefcase, Clock, GraduationCap,
  Award, Download, CalendarCheck, Star, TrendingUp, FileText,
  ChevronDown, Linkedin, Github, Globe, DollarSign, MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const candidateData = {
  id: 'c1',
  name: 'Rahul Sharma',
  photo: '',
  designation: 'Senior React Developer',
  currentCompany: 'TechSolutions',
  email: 'rahul.sharma@email.com',
  phone: '+91 9876543210',
  location: 'Chennai',
  experience: '5 yrs 3 months',
  currentCtc: '₹14,00,000',
  expectedCtc: '₹22,00,000',
  noticePeriod: '30 days',
  skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL', 'Redux', 'Docker'],
  education: [
    { degree: 'B.Tech Computer Science', institution: 'IIT Madras', year: '2020', score: '8.5 CGPA' },
    { degree: 'Higher Secondary', institution: 'DAV School', year: '2016', score: '94%' },
  ],
  experience_list: [
    { company: 'TechSolutions', role: 'Senior React Developer', duration: '2023 - Present', description: 'Building enterprise React applications with TypeScript and GraphQL' },
    { company: 'WebAgency', role: 'React Developer', duration: '2021 - 2023', description: 'Developed responsive web applications using React and Redux' },
    { company: 'StartupXYZ', role: 'Junior Developer', duration: '2020 - 2021', description: 'Frontend development with React and CSS' },
  ],
  projects: [
    { name: 'E-Commerce Platform', tech: 'React, Node.js, PostgreSQL', description: 'Built a full-stack e-commerce platform handling 10K+ daily users' },
    { name: 'Analytics Dashboard', tech: 'React, D3.js, AWS', description: 'Real-time analytics dashboard with interactive charts' },
  ],
  certificates: [
    { name: 'AWS Certified Developer', issuer: 'Amazon', year: '2024' },
    { name: 'Meta Frontend Developer', issuer: 'Coursera', year: '2023' },
  ],
  aiMatch: 92,
  languages: ['English', 'Hindi', 'Tamil'],
  documents: ['Resume_Rahul_Sharma.pdf', 'Portfolio.pdf', 'Certifications.pdf'],
  comments: 'Strong communicator, excellent technical skills. Ready to join within 30 days.',
  status: 'active',
  lastActive: '2 days ago',
  pipeline: [
    { stage: 'Applied', date: '2026-01-10', status: 'completed' },
    { stage: 'Resume Screening', date: '2026-01-12', status: 'completed' },
    { stage: 'Shortlisted', date: '2026-01-15', status: 'completed' },
    { stage: 'Interview Scheduled', date: '2026-01-20', status: 'completed' },
    { stage: 'Interview Completed', date: '2026-01-22', status: 'completed' },
    { stage: 'Technical Round', date: '2026-01-25', status: 'completed' },
    { stage: 'Manager Round', date: '2026-02-01', status: 'current' },
    { stage: 'Offer', date: null, status: 'pending' },
  ],
  interviews: [
    { round: 'HR Round', date: '2026-01-20', interviewer: 'Priya Sharma', feedback: 'Good communication, aligned with company values', rating: 4 },
    { round: 'Technical Round', date: '2026-01-25', interviewer: 'Arun Kumar', feedback: 'Excellent technical skills, solved all coding challenges', rating: 5 },
    { round: 'Manager Round', date: '2026-02-01', interviewer: 'Vikram Singh', feedback: 'Pending', rating: 0 },
  ],
}

const performanceData = [
  { month: 'Aug', score: 78 },
  { month: 'Sep', score: 82 },
  { month: 'Oct', score: 85 },
  { month: 'Nov', score: 80 },
  { month: 'Dec', score: 88 },
  { month: 'Jan', score: 92 },
]

export default function HrConsultantCandidateDetailPage() {
  const params = useParams()
  const [newComment, setNewComment] = useState('')

  const candidate = candidateData

  const addComment = () => {
    if (newComment.trim()) {
      toast.success('Comment added')
      setNewComment('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr-consultant/candidates">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          <p className="text-muted-foreground">{candidate.designation} at {candidate.currentCompany}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Download Resume</Button>
          <Button size="sm"><CalendarCheck className="h-4 w-4 mr-2" /> Schedule Interview</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={candidate.photo} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {candidate.name.split(' ').map((s: string) => s[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold mt-3">{candidate.name}</h3>
              <p className="text-xs text-muted-foreground">{candidate.designation}</p>

              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 text-[10px]">{candidate.status}</Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary text-[10px]">{candidate.experience}</Badge>
              </div>

              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Progress value={candidate.aiMatch} className="h-1.5 w-12" />
                  <span className="text-xs font-medium text-green-500">{candidate.aiMatch}%</span>
                </div>
                <span className="text-[10px] text-muted-foreground">AI Match</span>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2 text-left text-xs">
                <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" />{candidate.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" />{candidate.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground" />{candidate.location}</div>
                <div className="flex items-center gap-2"><Briefcase className="h-3 w-3 text-muted-foreground" />{candidate.currentCompany}</div>
                <div className="flex items-center gap-2"><DollarSign className="h-3 w-3 text-muted-foreground" />{candidate.expectedCtc}</div>
                <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-muted-foreground" />{candidate.noticePeriod}</div>
              </div>

              <Separator className="my-3" />

              <div className="text-left">
                <p className="text-xs font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>

              <Separator className="my-3" />

              <div className="text-left">
                <p className="text-xs font-medium mb-2">Languages</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.languages.map((l) => (
                    <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>
                  ))}
                </div>
              </div>

              <Separator className="my-3" />

              <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs">
                <option>Move to Pipeline</option>
                <option>Applied</option>
                <option>Resume Screening</option>
                <option>Shortlisted</option>
                <option>Interview Scheduled</option>
                <option>Interview Completed</option>
                <option>HR Round</option>
                <option>Technical Round</option>
                <option>Manager Round</option>
                <option>Offer Released</option>
                <option>Offer Accepted</option>
                <option>Joined</option>
                <option>Rejected</option>
              </select>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="border-border/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Performance Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Work Experience</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {candidate.experience_list.map((exp, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                        {i < candidate.experience_list.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{exp.role}</p>
                        <p className="text-xs text-muted-foreground">{exp.company} • {exp.duration}</p>
                        <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Projects</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {candidate.projects.map((proj, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{proj.name}</p>
                      <p className="text-xs text-muted-foreground">{proj.tech}</p>
                      <p className="text-xs text-muted-foreground mt-1">{proj.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidate.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm flex-1">{doc}</span>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Comments & Notes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm">{candidate.comments}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Added 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add a comment or note..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} />
                    <Button variant="outline" onClick={addComment}>Add</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interviews">
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Interview Rounds</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {candidate.interviews.map((interview, i) => (
                    <div key={i} className="p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{interview.round}</p>
                          <p className="text-xs text-muted-foreground">{interview.date} • Interviewer: {interview.interviewer}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= interview.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground">Feedback: {interview.feedback}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Education</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {candidate.education.map((edu, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{edu.degree}</p>
                        <p className="text-xs text-muted-foreground">{edu.institution} • {edu.year}</p>
                        <p className="text-xs text-muted-foreground">{edu.score}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Certifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {candidate.certificates.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Award className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.year}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Pipeline Progress</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {candidate.pipeline.map((stage, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                          stage.status === 'completed' ? 'bg-green-500' :
                          stage.status === 'current' ? 'bg-primary' : 'bg-muted'
                        }`}>
                          {stage.status === 'completed' ? (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ) : stage.status === 'current' ? (
                            <div className="h-2 w-2 bg-white rounded-full" />
                          ) : (
                            <div className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${stage.status === 'completed' ? 'text-green-500' : stage.status === 'current' ? 'font-medium' : 'text-muted-foreground'}`}>
                            {stage.stage}
                          </p>
                          {stage.date && <p className="text-[10px] text-muted-foreground">{stage.date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


