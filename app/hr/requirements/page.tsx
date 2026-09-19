'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Search, Eye, Calendar, MapPin, IndianRupee, Briefcase, Star, ArrowUpRight, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const requirements = [
  { id: 'REQ-001', position: 'Senior React Developer', department: 'Engineering', vacancies: 3, priority: 'high', status: 'under_review', timeline: '2024-04-15', client: 'TechCorp', budget: '18-22 LPA', location: 'Bangalore', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'], experience: '4-7 yrs', description: 'Looking for an experienced React developer with 4+ years of experience in building scalable web applications.', progress: 65, assignedTo: 'John Doe' },
  { id: 'REQ-002', position: 'Product Manager', department: 'Product', vacancies: 1, priority: 'high', status: 'quoted', timeline: '2024-04-30', client: 'InnovateAI', budget: '25-30 LPA', location: 'Mumbai', skills: ['Product Strategy', 'Agile', 'Analytics', 'UX'], experience: '5-8 yrs', description: 'Need a senior product manager with AI/ML domain experience.', progress: 25, assignedTo: 'John Doe' },
  { id: 'REQ-003', position: 'DevOps Engineer', department: 'Engineering', vacancies: 2, priority: 'medium', status: 'recruiter_assigned', timeline: '2024-05-15', client: 'CloudNative', budget: '15-20 LPA', location: 'Chennai', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], experience: '3-6 yrs', description: 'Seeking a DevOps engineer skilled in AWS, Docker, and Kubernetes.', progress: 40, assignedTo: 'Jane Smith' },
  { id: 'REQ-004', position: 'UX Designer', department: 'Design', vacancies: 1, priority: 'low', status: 'open', timeline: '2024-05-30', client: 'DesignStudio', budget: '12-16 LPA', location: 'Remote', skills: ['Figma', 'User Research', 'Prototyping'], experience: '2-4 yrs', description: 'Looking for a creative UX designer with strong portfolio.', progress: 10, assignedTo: 'John Doe' },
  { id: 'REQ-005', position: 'Data Scientist', department: 'Data', vacancies: 2, priority: 'high', status: 'in_progress', timeline: '2024-05-01', client: 'DataMinds', budget: '20-28 LPA', location: 'Hyderabad', skills: ['Python', 'ML', 'SQL', 'TensorFlow'], experience: '3-6 yrs', description: 'Need a data scientist with strong ML and Python background.', progress: 80, assignedTo: 'Jane Smith' },
  { id: 'REQ-006', position: 'Full Stack Developer', department: 'Engineering', vacancies: 3, priority: 'medium', status: 'under_review', timeline: '2024-06-01', client: 'WebTech', budget: '14-18 LPA', location: 'Delhi', skills: ['React', 'Python', 'PostgreSQL', 'Docker'], experience: '3-5 yrs', description: 'Full stack developer proficient in React, Node.js, and PostgreSQL.', progress: 55, assignedTo: 'John Doe' },
  { id: 'REQ-007', position: 'HR Manager', department: 'HR', vacancies: 1, priority: 'low', status: 'open', timeline: '2024-04-20', client: 'PeopleFirst', budget: '15-18 LPA', location: 'Kochi', skills: ['HR Operations', 'Recruitment', 'Payroll'], experience: '5-8 yrs', description: 'Experienced HR manager to lead people operations.', progress: 5, assignedTo: '' },
  { id: 'REQ-008', position: 'Marketing Lead', department: 'Marketing', vacancies: 1, priority: 'medium', status: 'recruiter_assigned', timeline: '2024-05-10', client: 'BrandPro', budget: '18-22 LPA', location: 'Pune', skills: ['Digital Marketing', 'SEO', 'Content Strategy'], experience: '4-7 yrs', description: 'Marketing lead with expertise in digital marketing and brand strategy.', progress: 30, assignedTo: 'Jane Smith' },
]

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
}

const statusColors: Record<string, string> = {
  open: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  quoted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  recruiter_assigned: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  in_progress: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  fulfilled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

export default function RequirementsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [tab, setTab] = useState('all')

  const filtered = requirements.filter((r) => {
    const matchSearch = r.position.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.client.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchPriority = priorityFilter === 'all' || r.priority === priorityFilter
    const matchTab = tab === 'all' || r.status === tab
    return matchSearch && matchStatus && matchPriority && matchTab
  })

  const summaryStats = {
    total: requirements.length,
    high: requirements.filter((r) => r.priority === 'high').length,
    open: requirements.filter((r) => r.status === 'open').length,
    fulfilled: requirements.filter((r) => r.status === 'fulfilled' || r.progress === 100).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Requirements</h1>
          <p className="text-muted-foreground">Manage and track recruitment requirements from clients.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Star className="h-4 w-4" /> Upgrade Plan
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Requirements', value: summaryStats.total, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'High Priority', value: summaryStats.high, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Open Positions', value: summaryStats.open, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Fulfilled', value: summaryStats.fulfilled, color: 'text-green-600', bg: 'bg-green-100' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                <Briefcase className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ID, position, client..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="recruiter_assigned">Recruiter Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({requirements.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({requirements.filter((r) => r.status === 'open').length})</TabsTrigger>
          <TabsTrigger value="under_review">Review ({requirements.filter((r) => r.status === 'under_review').length})</TabsTrigger>
          <TabsTrigger value="in_progress">Active ({requirements.filter((r) => r.status === 'in_progress' || r.status === 'recruiter_assigned').length})</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled ({requirements.filter((r) => r.status === 'fulfilled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Briefcase className="mx-auto h-12 w-12 mb-3 opacity-30" />
                  <p className="font-medium">No requirements found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[1000px]">
                    <div className="grid grid-cols-10 gap-3 border-b pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <div>Req ID</div>
                      <div className="col-span-2">Position</div>
                      <div>Client</div>
                      <div>Department</div>
                      <div>Vacancies</div>
                      <div>Priority</div>
                      <div>Status</div>
                      <div>Progress</div>
                      <div className="text-right">Action</div>
                    </div>
                    {filtered.map((req) => (
                      <div
                        key={req.id}
                        className="grid grid-cols-10 gap-3 border-b py-3.5 text-sm items-center hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelected(req)}
                      >
                        <div className="font-mono text-xs text-primary font-medium">{req.id}</div>
                        <div className="col-span-2">
                          <p className="font-medium truncate">{req.position}</p>
                          <p className="text-xs text-muted-foreground">{req.experience} &middot; {req.budget}</p>
                        </div>
                        <div className="text-muted-foreground text-xs">{req.client}</div>
                        <div className="text-xs text-muted-foreground">{req.department}</div>
                        <div className="font-medium">{req.vacancies}</div>
                        <div>
                          <Badge className={priorityColors[req.priority]} variant="outline">{req.priority}</Badge>
                        </div>
                        <div>
                          <Badge className={statusColors[req.status]} variant="outline">{req.status.replace(/_/g, ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={req.progress} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{req.progress}%</span>
                        </div>
                        <div className="text-right">
                          <Button variant="ghost" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); setSelected(req) }}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">{selected?.id}</Badge>
              <DialogTitle className="text-lg">{selected?.position}</DialogTitle>
            </div>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-medium">{selected.client}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{selected.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vacancies</p>
                  <p className="font-medium">{selected.vacancies}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-medium">{selected.budget}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-medium">{selected.experience}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" /> {selected.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge className={priorityColors[selected.priority]} variant="outline">{selected.priority}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={statusColors[selected.status]} variant="outline">{selected.status.replace(/_/g, ' ')}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" /> {formatDate(new Date(selected.timeline))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{selected.assignedTo || 'Unassigned'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {selected.skills.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Hiring Progress</p>
                <div className="flex items-center gap-3">
                  <Progress value={selected.progress} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{selected.progress}%</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Job Description</p>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{selected.description}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1"><ExternalLink className="h-4 w-4 mr-1" /> Open in CRM</Button>
                <Button size="sm" className="flex-1"><Briefcase className="h-4 w-4 mr-1" /> View Candidates</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
