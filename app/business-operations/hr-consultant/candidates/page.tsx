'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search, LayoutGrid, List, Eye, Download, CalendarCheck,
  ArrowRight, MoreHorizontal, Mail, Phone, MapPin, Clock,
  Star, FileText, Briefcase, GraduationCap, TrendingUp,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getNoticePeriodLabel } from '@/lib/notice-period'

type Candidate = {
  id: string
  name: string
  photo: string
  designation: string
  currentCompany: string
  experience: string
  skills: string
  education: string
  location: string
  currentCtc: string
  expectedCtc: string
  noticePeriod: string
  email: string
  phone: string
  resumeUrl: string
  aiMatch: number
  status: string
  lastActive: string
}

const mockCandidates: Candidate[] = [
  { id: 'c1', name: 'Rahul Sharma', photo: '', designation: 'Senior React Developer', currentCompany: 'TechSolutions', experience: '5 yrs', skills: 'React, TypeScript, Node.js, AWS, GraphQL', education: 'B.Tech CSE', location: 'Chennai', currentCtc: '₹14 LPA', expectedCtc: '₹22 LPA', noticePeriod: 'thirty_days', email: 'rahul.sharma@email.com', phone: '+91 9876543210', resumeUrl: '#', aiMatch: 92, status: 'active', lastActive: '2 days ago' },
  { id: 'c2', name: 'Priya Patel', photo: '', designation: 'UX Designer', currentCompany: 'DesignHub', experience: '4 yrs', skills: 'Figma, Adobe XD, User Research, Prototyping', education: 'B.Des', location: 'Bangalore', currentCtc: '₹10 LPA', expectedCtc: '₹16 LPA', noticePeriod: 'forty_five_days', email: 'priya.patel@email.com', phone: '+91 9876543211', resumeUrl: '#', aiMatch: 88, status: 'active', lastActive: '1 day ago' },
  { id: 'c3', name: 'Amit Kumar', photo: '', designation: 'Full Stack Developer', currentCompany: 'WebAgency', experience: '3 yrs', skills: 'Python, Django, React, PostgreSQL, Docker', education: 'MCA', location: 'Hyderabad', currentCtc: '₹8 LPA', expectedCtc: '₹14 LPA', noticePeriod: 'fifteen_days', email: 'amit.kumar@email.com', phone: '+91 9876543212', resumeUrl: '#', aiMatch: 85, status: 'active', lastActive: '5 hours ago' },
  { id: 'c4', name: 'Sneha Reddy', photo: '', designation: 'Data Analyst', currentCompany: 'DataMinds', experience: '2 yrs', skills: 'SQL, Python, Tableau, Power BI, Excel', education: 'B.Sc Statistics', location: 'Pune', currentCtc: '₹6 LPA', expectedCtc: '₹11 LPA', noticePeriod: 'thirty_days', email: 'sneha.reddy@email.com', phone: '+91 9876543213', resumeUrl: '#', aiMatch: 78, status: 'active', lastActive: '1 week ago' },
  { id: 'c5', name: 'Vikram Singh', photo: '', designation: 'DevOps Engineer', currentCompany: 'CloudOps', experience: '6 yrs', skills: 'AWS, Docker, Kubernetes, Terraform, CI/CD', education: 'B.Tech IT', location: 'Bangalore', currentCtc: '₹18 LPA', expectedCtc: '₹28 LPA', noticePeriod: 'sixty_days', email: 'vikram.singh@email.com', phone: '+91 9876543214', resumeUrl: '#', aiMatch: 95, status: 'active', lastActive: '3 days ago' },
  { id: 'c6', name: 'Ananya Gupta', photo: '', designation: 'Product Manager', currentCompany: 'ProductLabs', experience: '7 yrs', skills: 'Product Strategy, Agile, JIRA, Market Research', education: 'MBA IIM', location: 'Mumbai', currentCtc: '₹22 LPA', expectedCtc: '₹32 LPA', noticePeriod: 'ninety_days', email: 'ananya.gupta@email.com', phone: '+91 9876543215', resumeUrl: '#', aiMatch: 72, status: 'active', lastActive: '1 month ago' },
  { id: 'c7', name: 'Arjun Nair', photo: '', designation: 'Java Backend Developer', currentCompany: 'FinServ', experience: '5 yrs', skills: 'Java, Spring Boot, Kafka, MongoDB, Microservices', education: 'B.Tech CSE', location: 'Chennai', currentCtc: '₹16 LPA', expectedCtc: '₹22 LPA', noticePeriod: 'thirty_days', email: 'arjun.nair@email.com', phone: '+91 9876543216', resumeUrl: '#', aiMatch: 90, status: 'active', lastActive: '1 day ago' },
  { id: 'c8', name: 'Neha Sharma', photo: '', designation: 'Frontend Developer', currentCompany: 'WebStudio', experience: '3 yrs', skills: 'React, Vue.js, CSS, JavaScript, Tailwind', education: 'BCA', location: 'Remote', currentCtc: '₹7 LPA', expectedCtc: '₹12 LPA', noticePeriod: 'fifteen_days', email: 'neha.sharma@email.com', phone: '+91 9876543217', resumeUrl: '#', aiMatch: 82, status: 'active', lastActive: '6 hours ago' },
]

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500',
  inactive: 'bg-gray-500/10 text-gray-500',
  placed: 'bg-blue-500/10 text-blue-500',
}

export default function HrConsultantCandidatesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [search, setSearch] = useState('')

  const filtered = mockCandidates.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.skills.toLowerCase().includes(q) || c.currentCompany.toLowerCase().includes(q) || c.designation.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidate Database</h1>
          <p className="text-muted-foreground">Professional CRM - Manage your candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'bg-accent' : ''}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setViewMode('card')} className={viewMode === 'card' ? 'bg-accent' : ''}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search candidates by name, skills, company..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Placed</option>
        </select>
        <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
          <option>All Experience</option>
          <option>0-2 yrs</option>
          <option>2-4 yrs</option>
          <option>4-6 yrs</option>
          <option>6+ yrs</option>
        </select>
        <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
          <option>All Location</option>
          <option>Chennai</option>
          <option>Bangalore</option>
          <option>Hyderabad</option>
          <option>Mumbai</option>
          <option>Remote</option>
        </select>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filtered.length}</span> candidates found
      </div>

      {viewMode === 'table' ? (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Candidate</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Experience</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Current Company</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Expected Salary</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Notice Period</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Skills</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Location</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <Link href={`/hr-consultant/candidates/${candidate.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={candidate.photo} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {candidate.name.split(' ').map((s: string) => s[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.designation}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-3 text-sm">{candidate.experience}</td>
                      <td className="p-3 text-sm">{candidate.currentCompany}</td>
                      <td className="p-3 text-sm">{candidate.expectedCtc}</td>
                      <td className="p-3 text-sm">{getNoticePeriodLabel(candidate.noticePeriod)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {candidate.skills.split(', ').slice(0, 3).map((s) => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                          ))}
                          {candidate.skills.split(', ').length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{candidate.skills.split(', ').length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{candidate.location}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[candidate.status]}`}>{candidate.status}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/hr-consultant/candidates/${candidate.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem><CalendarCheck className="h-4 w-4 mr-2" /> Schedule Interview</DropdownMenuItem>
                              <DropdownMenuItem><ArrowRight className="h-4 w-4 mr-2" /> Move Pipeline</DropdownMenuItem>
                              <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Add Notes</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((candidate) => (
            <Link key={candidate.id} href={`/hr-consultant/candidates/${candidate.id}`}>
              <Card className="border-border/50 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={candidate.photo} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {candidate.name.split(' ').map((s: string) => s[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.designation}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[candidate.status]}`}>{candidate.status}</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3" /><span>{candidate.currentCompany}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /><span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /><span>{getNoticePeriodLabel(candidate.noticePeriod)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3" /><span>{candidate.expectedCtc}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.skills.split(', ').slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">{candidate.lastActive}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
