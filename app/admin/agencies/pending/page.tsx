'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Clock, CheckCircle, XCircle, Building2, Mail, Phone, FileText, Calendar, ExternalLink, Download, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PendingApprovals() {
  const [agencies, setAgencies] = useState<any[]>([])
  const [selectedAgency, setSelectedAgency] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    db.companies.getByStatus('pending').then(setAgencies)
  }, [])

  const updateStatus = async (id: string, status: string, reason?: string) => {
    await db.companies.updateStatus(id, status as any, {
      rejectionReason: reason,
    })
    setAgencies(agencies.filter((a: any) => a.id !== id))
    toast.success(`Agency ${status} successfully!`)
    setShowReject(false)
    setShowDetails(false)
    setSelectedAgency(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground">Review and approve new agency registrations.</p>
      </div>

      {agencies.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500" />No pending approvals. All caught up!</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {agencies.map((agency) => (
            <Card key={agency.id} className="border-yellow-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-yellow-100 text-yellow-700 text-lg">
                      {agency.agencyName?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{agency.agencyName}</h3>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground mt-0.5">{agency.companyId}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{agency.contactPerson} - {agency.position}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{agency.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{agency.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Registered: {new Date(agency.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Employees: {agency.employeeCount || 'N/A'} | Vacancies: {agency.vacancyCount || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Reg No: {agency.registrationNumber || 'N/A'}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedAgency(agency); setShowDetails(true) }}>
                        <FileText className="mr-1.5 h-4 w-4" /> View Details
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(agency.id, 'approved')}>
                        <CheckCircle className="mr-1.5 h-4 w-4" /> Approve
                      </Button>
                      <Dialog open={showReject && selectedAgency?.id === agency.id} onOpenChange={(o) => { setShowReject(o); if (!o) setSelectedAgency(null) }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedAgency(agency); setShowReject(true) }}>
                            <XCircle className="mr-1.5 h-4 w-4" /> Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Reject Agency</DialogTitle><DialogDescription>Provide a reason for rejecting {agency.agencyName}.</DialogDescription></DialogHeader>
                          <div className="py-4">
                            <Label>Rejection Reason</Label>
                            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..." rows={4} />
                            {!rejectReason && <p className="text-xs text-red-500 mt-1">Reason is required</p>}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => { setShowReject(false); setSelectedAgency(null) }}>Cancel</Button>
                            <Button variant="destructive" onClick={() => updateStatus(agency.id, 'rejected', rejectReason)} disabled={!rejectReason}>Reject Agency</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Agency Details</DialogTitle></DialogHeader>
          {selectedAgency && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  {selectedAgency.logo ? (
                    <img src={selectedAgency.logo} alt={selectedAgency.agencyName} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedAgency.agencyName?.charAt(0) || 'A'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedAgency.agencyName}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{selectedAgency.companyId}</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Contact Person</Label><p className="font-medium">{selectedAgency.contactPerson}</p></div>
                <div><Label className="text-xs text-muted-foreground">Position</Label><p>{selectedAgency.position || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Official Email</Label><p>{selectedAgency.email}</p></div>
                <div><Label className="text-xs text-muted-foreground">Phone</Label><p>{selectedAgency.phone || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">No. of Employees</Label><p>{selectedAgency.employeeCount || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">No. of Vacancies</Label><p>{selectedAgency.vacancyCount || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Registration Number</Label><p className="font-mono">{selectedAgency.registrationNumber || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Registration Date</Label><p>{new Date(selectedAgency.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
              </div>
              <div className="mt-6">
                <Label className="text-xs text-muted-foreground">Uploaded Documents</Label>
                <div className="mt-1 rounded-lg border p-4">
                  {selectedAgency.documentUrl ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Company Document</p>
                          <p className="text-xs text-muted-foreground">{selectedAgency.documentUrl}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(selectedAgency.documentUrl, '_blank')}>
                          <ExternalLink className="mr-1.5 h-4 w-4" /> View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const a = document.createElement('a')
                          a.href = selectedAgency.documentUrl
                          a.download = selectedAgency.documentUrl
                          a.click()
                        }}>
                          <Download className="mr-1.5 h-4 w-4" /> Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-5 w-5" />
                      No document uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
            {selectedAgency && (
              <>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selectedAgency.id, 'approved')}>
                  <CheckCircle className="mr-1.5 h-4 w-4" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => { setShowDetails(false); setShowReject(true) }}>
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject
                </Button>
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50" onClick={() => updateStatus(selectedAgency.id, 'suspended')}>
                  <AlertTriangle className="mr-1.5 h-4 w-4" /> Suspend
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
