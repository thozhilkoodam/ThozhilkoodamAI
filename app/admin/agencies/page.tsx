'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Eye, CheckCircle, XCircle, AlertTriangle, Building2, Mail, Phone, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AllAgencies() {
  const router = useRouter()
  const [agencies, setAgencies] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedAgency, setSelectedAgency] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  useEffect(() => {
    db.companies.getAll().then(setAgencies)
  }, [])

  const filtered = agencies.filter((a) =>
    a.agencyName?.toLowerCase().includes(search.toLowerCase()) ||
    a.companyId?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  )

  const updateStatus = async (id: string, status: string, reason?: string) => {
    await db.companies.updateStatus(id, status as any, {
      rejectionReason: reason,
    })
    const updated = await db.companies.getAll()
    setAgencies(updated)
    const msg = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'suspended'
    toast.success(`Agency ${msg} successfully!`)
    setShowReject(false)
    setSelectedAgency(null)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    suspended: 'bg-orange-100 text-orange-800 border-orange-200',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Agencies</h1>
        <p className="text-muted-foreground">Manage all recruitment agencies on the platform.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, UID, or email..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground"><Building2 className="mx-auto h-12 w-12 mb-3" />No agencies found.</CardContent></Card>
        ) : filtered.map((agency) => (
          <Card key={agency.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {agency.agencyName?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="font-semibold">{agency.agencyName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{agency.companyId}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {agency.email}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">{agency.contactPerson}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {agency.phone}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employees: {agency.employeeCount || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Vacancies: {agency.vacancyCount || 'N/A'}</p>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={statusColors[agency.status]}>{agency.status}</Badge>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedAgency(agency)}><Eye className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Agency Details</DialogTitle>
                            <DialogDescription>Full information for {agency.agencyName}</DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div><Label className="text-xs text-muted-foreground">Company UID</Label><p className="font-mono font-medium">{agency.companyId}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Status</Label><Badge className={statusColors[agency.status]}>{agency.status}</Badge></div>
                            <div><Label className="text-xs text-muted-foreground">Agency Name</Label><p>{agency.agencyName}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Contact Person</Label><p>{agency.contactPerson}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Email</Label><p>{agency.email}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Phone</Label><p>{agency.phone}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Employees</Label><p>{agency.employeeCount}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Vacancies</Label><p>{agency.vacancyCount}</p></div>
                            <div className="col-span-2"><Label className="text-xs text-muted-foreground">Registration Number</Label><p>{agency.registrationNumber || 'N/A'}</p></div>
                            <div className="col-span-2"><Label className="text-xs text-muted-foreground">Registration Date</Label><p>{new Date(agency.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                            {agency.rejectionReason && <div className="col-span-2"><Label className="text-xs text-muted-foreground text-red-600">Rejection Reason</Label><p className="text-sm text-red-600">{agency.rejectionReason}</p></div>}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {agency.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateStatus(agency.id, 'approved')}><CheckCircle className="h-4 w-4" /></Button>
                          <Dialog open={showReject && selectedAgency?.id === agency.id} onOpenChange={(o) => { setShowReject(o); if (!o) setSelectedAgency(null) }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setSelectedAgency(agency); setShowReject(true) }}><XCircle className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Reject Agency</DialogTitle><DialogDescription>Provide a reason for rejection.</DialogDescription></DialogHeader>
                              <div className="py-4"><Label>Rejection Reason</Label><Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..." /></div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => { setShowReject(false); setSelectedAgency(null) }}>Cancel</Button>
                                <Button variant="destructive" onClick={() => updateStatus(agency.id, 'rejected', rejectReason)} disabled={!rejectReason}>Reject</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {agency.status === 'approved' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600" onClick={() => updateStatus(agency.id, 'suspended')}><AlertTriangle className="h-4 w-4" /></Button>
                      )}

                      {(agency.status === 'suspended' || agency.status === 'rejected') && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateStatus(agency.id, 'approved')}><CheckCircle className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
