'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Eye, CheckCircle, XCircle, Briefcase, UserPlus, FileText, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const mockRequirements = [
  { id: 'REQ-001', company: 'Tech Solutions Pvt Ltd', position: 'Software Engineer', vacancies: 5, assignedRecruiter: 'Rahul Sharma', quotationStatus: 'approved', interviewStatus: 'in_progress', hiringProgress: 60, paymentStatus: 'partial' },
  { id: 'REQ-002', company: 'Green Farms India', position: 'Farm Manager', vacancies: 3, assignedRecruiter: 'Priya Patel', quotationStatus: 'pending', interviewStatus: 'scheduled', hiringProgress: 20, paymentStatus: 'pending' },
  { id: 'REQ-003', company: 'Blue Ocean Corp', position: 'Sales Executive', vacancies: 10, assignedRecruiter: 'Amit Singh', quotationStatus: 'generated', interviewStatus: 'completed', hiringProgress: 80, paymentStatus: 'completed' },
  { id: 'REQ-004', company: 'Red Maple Industries', position: 'Production Supervisor', vacancies: 2, assignedRecruiter: 'Unassigned', quotationStatus: 'draft', interviewStatus: 'yet_to_start', hiringProgress: 0, paymentStatus: 'pending' },
  { id: 'REQ-005', company: 'Silver Oak Enterprises', position: 'Accountant', vacancies: 4, assignedRecruiter: 'Sneha Reddy', quotationStatus: 'approved', interviewStatus: 'in_progress', hiringProgress: 45, paymentStatus: 'partial' },
]

const recruiters = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sneha Reddy', 'Vikram Joshi']

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  generated: 'bg-blue-100 text-blue-800 border-blue-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  yet_to_start: 'bg-gray-100 text-gray-800 border-gray-200',
  partial: 'bg-orange-100 text-orange-800 border-orange-200',
  yet_to_pay: 'bg-red-100 text-red-800 border-red-200',
}

export default function RequirementCRM() {
  const [requirements, setRequirements] = useState<any[]>(mockRequirements)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReq, setSelectedReq] = useState<any>(null)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedRecruiter, setSelectedRecruiter] = useState('')
  const [showView, setShowView] = useState(false)

  const filtered = requirements.filter((r) => {
    const matchesSearch = r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.position.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.quotationStatus === statusFilter || r.interviewStatus === statusFilter || r.paymentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const assignRecruiter = () => {
    if (!selectedRecruiter || !selectedReq) return
    setRequirements(requirements.map((r) =>
      r.id === selectedReq.id ? { ...r, assignedRecruiter: selectedRecruiter } : r
    ))
    toast.success(`Recruiter ${selectedRecruiter} assigned to ${selectedReq.id}`)
    setShowAssign(false)
    setSelectedRecruiter('')
    setSelectedReq(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Requirement CRM</h1>
        <p className="text-muted-foreground">Manage client requirements, quotations, interviews, and hiring progress.</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ID, company, or position..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Req ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-center">Vacancies</TableHead>
                <TableHead>Assigned Recruiter</TableHead>
                <TableHead>Quotation</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Hiring</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    <Briefcase className="mx-auto h-10 w-10 mb-2" />
                    No requirements found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono font-medium">{req.id}</TableCell>
                  <TableCell>{req.company}</TableCell>
                  <TableCell>{req.position}</TableCell>
                  <TableCell className="text-center">{req.vacancies}</TableCell>
                  <TableCell>
                    <span className={req.assignedRecruiter === 'Unassigned' ? 'text-muted-foreground italic' : ''}>
                      {req.assignedRecruiter}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[req.quotationStatus]}>{req.quotationStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[req.interviewStatus]}>{req.interviewStatus.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${req.hiringProgress}%` }} />
                      </div>
                      <span className="text-xs font-medium">{req.hiringProgress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[req.paymentStatus]}>{req.paymentStatus.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedReq(req); setShowView(true) }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Dialog open={showAssign && selectedReq?.id === req.id} onOpenChange={(o) => { setShowAssign(o); if (!o) setSelectedReq(null) }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedReq(req); setShowAssign(true) }}>
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Assign Recruiter</DialogTitle><DialogDescription>Select a recruiter for {req.id} - {req.position} at {req.company}.</DialogDescription></DialogHeader>
                          <div className="py-4">
                            <Label>Select Recruiter</Label>
                            <Select value={selectedRecruiter} onValueChange={setSelectedRecruiter}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a recruiter..." />
                              </SelectTrigger>
                              <SelectContent>
                                {recruiters.map((r) => (
                                  <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => { setShowAssign(false); setSelectedReq(null) }}>Cancel</Button>
                            <Button onClick={assignRecruiter} disabled={!selectedRecruiter}>Assign</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"><CheckCircle className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><XCircle className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"><FileText className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600"><Send className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Requirement Details</DialogTitle></DialogHeader>
          {selectedReq && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div><Label className="text-xs text-muted-foreground">Requirement ID</Label><p className="font-mono font-medium">{selectedReq.id}</p></div>
              <div><Label className="text-xs text-muted-foreground">Company</Label><p>{selectedReq.company}</p></div>
              <div><Label className="text-xs text-muted-foreground">Position</Label><p>{selectedReq.position}</p></div>
              <div><Label className="text-xs text-muted-foreground">Vacancies</Label><p>{selectedReq.vacancies}</p></div>
              <div><Label className="text-xs text-muted-foreground">Assigned Recruiter</Label><p>{selectedReq.assignedRecruiter}</p></div>
              <div><Label className="text-xs text-muted-foreground">Quotation Status</Label><Badge className={statusStyles[selectedReq.quotationStatus]}>{selectedReq.quotationStatus}</Badge></div>
              <div><Label className="text-xs text-muted-foreground">Interview Status</Label><Badge className={statusStyles[selectedReq.interviewStatus]}>{selectedReq.interviewStatus.replace(/_/g, ' ')}</Badge></div>
              <div><Label className="text-xs text-muted-foreground">Payment Status</Label><Badge className={statusStyles[selectedReq.paymentStatus]}>{selectedReq.paymentStatus.replace(/_/g, ' ')}</Badge></div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Hiring Progress</Label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${selectedReq.hiringProgress}%` }} />
                  </div>
                  <span className="text-sm font-medium">{selectedReq.hiringProgress}%</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowView(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
