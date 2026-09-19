'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search, Filter, Building, MapPin, Clock, DollarSign, GraduationCap,
  Users, Briefcase, CalendarDays, AlertTriangle, Eye, Play, Plus,
  ChevronDown, ArrowUpDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Requirement = {
  id: string
  reqId: string
  company: string
  position: string
  department: string
  skills: string
  experience: string
  education: string
  vacancies: number
  salary: string
  location: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'review' | 'fulfilled'
  progress: number
  assignedDate: string
}

const mockRequirements: Requirement[] = [
  { id: 'r1', reqId: 'REQ-001', company: 'TechCorp India', position: 'Senior React Developer', department: 'Engineering', skills: 'React, TypeScript, Node.js, AWS', experience: '4-6 yrs', education: 'B.Tech/MCA', vacancies: 3, salary: '₹18-25 LPA', location: 'Chennai', deadline: '2026-03-15', priority: 'high', status: 'in_progress', progress: 60, assignedDate: '2026-01-10' },
  { id: 'r2', reqId: 'REQ-002', company: 'DesignStudio', position: 'UX Designer', department: 'Design', skills: 'Figma, Adobe XD, User Research', experience: '3-5 yrs', education: 'B.Des/M.Des', vacancies: 2, salary: '₹12-18 LPA', location: 'Bangalore', deadline: '2026-02-28', priority: 'high', status: 'open', progress: 25, assignedDate: '2026-01-15' },
  { id: 'r3', reqId: 'REQ-003', company: 'StartupXYZ', position: 'Full Stack Developer', department: 'Engineering', skills: 'Python, Django, React, PostgreSQL', experience: '2-4 yrs', education: 'B.Tech/MCA', vacancies: 4, salary: '₹10-16 LPA', location: 'Hyderabad', deadline: '2026-03-30', priority: 'medium', status: 'in_progress', progress: 40, assignedDate: '2026-01-20' },
  { id: 'r4', reqId: 'REQ-004', company: 'DataCorp', position: 'Data Analyst', department: 'Analytics', skills: 'SQL, Python, Tableau, Excel', experience: '2-3 yrs', education: 'B.Sc/M.Sc Statistics', vacancies: 2, salary: '₹8-12 LPA', location: 'Pune', deadline: '2026-02-20', priority: 'low', status: 'review', progress: 80, assignedDate: '2026-01-05' },
  { id: 'r5', reqId: 'REQ-005', company: 'CloudTech', position: 'DevOps Engineer', department: 'Infrastructure', skills: 'AWS, Docker, Kubernetes, Terraform', experience: '5-7 yrs', education: 'B.Tech/M.Tech', vacancies: 1, salary: '₹20-30 LPA', location: 'Bangalore', deadline: '2026-04-15', priority: 'high', status: 'open', progress: 10, assignedDate: '2026-02-01' },
  { id: 'r6', reqId: 'REQ-006', company: 'HealthTech Ltd', position: 'Product Manager', department: 'Product', skills: 'Product Strategy, Agile, Market Research', experience: '6-8 yrs', education: 'MBA', vacancies: 1, salary: '₹25-35 LPA', location: 'Mumbai', deadline: '2026-03-01', priority: 'medium', status: 'in_progress', progress: 50, assignedDate: '2026-01-12' },
  { id: 'r7', reqId: 'REQ-007', company: 'FinTech Solutions', position: 'Java Backend Developer', department: 'Engineering', skills: 'Java, Spring Boot, Kafka, MongoDB', experience: '4-6 yrs', education: 'B.Tech/MCA', vacancies: 3, salary: '₹15-22 LPA', location: 'Chennai', deadline: '2026-02-28', priority: 'high', status: 'fulfilled', progress: 100, assignedDate: '2025-12-01' },
  { id: 'r8', reqId: 'REQ-008', company: 'EduTech Corp', position: 'Frontend Developer', department: 'Engineering', skills: 'React, Vue.js, CSS, JavaScript', experience: '2-4 yrs', education: 'B.Tech/MCA', vacancies: 2, salary: '₹8-14 LPA', location: 'Remote', deadline: '2026-03-20', priority: 'low', status: 'open', progress: 5, assignedDate: '2026-02-05' },
]

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-violet-500/10 text-violet-500',
  review: 'bg-amber-500/10 text-amber-500',
  fulfilled: 'bg-green-500/10 text-green-500',
}

export default function HrConsultantRequirementsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null)
  const [showHiringDialog, setShowHiringDialog] = useState(false)
  const [hiringForm, setHiringForm] = useState({ company: '', position: '', vacancies: '', priority: 'medium' })

  const filtered = mockRequirements.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return r.company.toLowerCase().includes(q) || r.position.toLowerCase().includes(q) || r.skills.toLowerCase().includes(q)
    }
    return true
  })

  const handleStartHiring = () => {
    if (!hiringForm.company || !hiringForm.position || !hiringForm.vacancies) {
      toast.error('Please fill all fields')
      return
    }
    toast.success(`Started hiring for ${hiringForm.position} at ${hiringForm.company}`)
    setShowHiringDialog(false)
    setHiringForm({ company: '', position: '', vacancies: '', priority: 'medium' })
  }

  const stats = {
    total: mockRequirements.length,
    highPriority: mockRequirements.filter(r => r.priority === 'high').length,
    open: mockRequirements.filter(r => r.status === 'open').length,
    fulfilled: mockRequirements.filter(r => r.status === 'fulfilled').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Requirements</h1>
          <p className="text-muted-foreground">Manage your assigned recruitment requirements</p>
        </div>
        <Dialog open={showHiringDialog} onOpenChange={setShowHiringDialog}>
          <DialogTrigger asChild>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Start Hiring
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Start New Hiring</DialogTitle>
              <DialogDescription>Create a new recruitment requirement to start hiring.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="e.g. TechCorp" value={hiringForm.company} onChange={(e) => setHiringForm({ ...hiringForm, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input placeholder="e.g. Senior React Developer" value={hiringForm.position} onChange={(e) => setHiringForm({ ...hiringForm, position: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vacancies</Label>
                  <Input type="number" min="1" placeholder="e.g. 3" value={hiringForm.vacancies} onChange={(e) => setHiringForm({ ...hiringForm, vacancies: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={hiringForm.priority} onValueChange={(v) => setHiringForm({ ...hiringForm, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHiringDialog(false)}>Cancel</Button>
              <Button onClick={handleStartHiring}>
                <Play className="h-4 w-4 mr-2" /> Start Hiring
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Requirements</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{stats.highPriority}</p>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.open}</p>
            <p className="text-xs text-muted-foreground">Open Positions</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.fulfilled}</p>
            <p className="text-xs text-muted-foreground">Fulfilled</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by company, position, skills..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList className="border-border/50">
          <TabsTrigger value="all">All ({mockRequirements.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({mockRequirements.filter(r => r.status === 'open').length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({mockRequirements.filter(r => r.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="review">Review ({mockRequirements.filter(r => r.status === 'review').length})</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled ({mockRequirements.filter(r => r.status === 'fulfilled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Req ID</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Company</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Position</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Skills</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Exp</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Vacancies</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Salary</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Location</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Deadline</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Priority</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Progress</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((req) => (
                      <tr key={req.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="p-3">
                          <span className="text-xs font-mono font-medium text-primary">{req.reqId}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
                              <Building className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{req.company}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{req.position}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {req.skills.split(', ').slice(0, 3).map((s) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                            ))}
                            {req.skills.split(', ').length > 3 && (
                              <span className="text-[10px] text-muted-foreground">+{req.skills.split(', ').length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm">{req.experience}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{req.vacancies}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{req.salary}</td>
                        <td className="p-3 text-sm">{req.location}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(req.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${priorityColors[req.priority]}`}>
                            {req.priority}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={req.progress} className="h-1.5 w-16" />
                            <span className="text-xs text-muted-foreground">{req.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[req.status]}`}>
                            {req.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedReq(req)}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{selectedReq?.position}</DialogTitle>
                                  <DialogDescription>Requirement {selectedReq?.reqId} • {selectedReq?.company}</DialogDescription>
                                </DialogHeader>
                                {selectedReq && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Department</p>
                                        <p className="text-sm font-medium">{selectedReq.department}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Experience</p>
                                        <p className="text-sm font-medium">{selectedReq.experience}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Education</p>
                                        <p className="text-sm font-medium">{selectedReq.education}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Salary</p>
                                        <p className="text-sm font-medium">{selectedReq.salary}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Vacancies</p>
                                        <p className="text-sm font-medium">{selectedReq.vacancies}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Location</p>
                                        <p className="text-sm font-medium">{selectedReq.location}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Deadline</p>
                                        <p className="text-sm font-medium">{selectedReq.deadline}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Assigned Date</p>
                                        <p className="text-sm font-medium">{selectedReq.assignedDate}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Required Skills</p>
                                      <div className="flex flex-wrap gap-1">
                                        {selectedReq.skills.split(', ').map((s) => (
                                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                      <Badge variant="outline" className={priorityColors[selectedReq.priority]}>{selectedReq.priority} priority</Badge>
                                      <div className="flex items-center gap-2">
                                        <Progress value={selectedReq.progress} className="h-1.5 w-24" />
                                        <span className="text-xs text-muted-foreground">{selectedReq.progress}% complete</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                      <Button size="sm" variant="outline">View in CRM</Button>
                                      <Button size="sm">View Candidates</Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => {
                              setSelectedReq(req)
                              setHiringForm({ company: req.company, position: req.position, vacancies: String(req.vacancies), priority: req.priority })
                              setShowHiringDialog(true)
                            }}>
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
