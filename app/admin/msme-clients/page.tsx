'use client'

import { useState } from 'react'
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
import { Search, Eye, CheckCircle, XCircle, Building2, Mail, Phone, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const mockClients: any[] = [
  { id: '1', agencyName: 'Tata Consultancy', companyId: 'MSME000001', contactPerson: 'Rajesh Kumar', email: 'rajesh@tcs.com', phone: '+91 9876543210', gst: 'GSTIN123456', pan: 'ABCDE1234F', status: 'pending', verifiedDate: null, rejectionReason: null, createdAt: new Date().toISOString() },
  { id: '2', agencyName: 'Infosys Technologies', companyId: 'MSME000002', contactPerson: 'Priya Sharma', email: 'priya@infosys.com', phone: '+91 9876543211', gst: 'GSTIN789012', pan: 'FGHIJ5678K', status: 'verified', verifiedDate: new Date().toISOString(), rejectionReason: null, createdAt: new Date().toISOString() },
  { id: '3', agencyName: 'Wipro Solutions', companyId: 'MSME000003', contactPerson: 'Amit Patel', email: 'amit@wipro.com', phone: '+91 9876543212', gst: 'GSTIN345678', pan: 'KLMNO9012P', status: 'rejected', verifiedDate: null, rejectionReason: 'Incomplete documentation', createdAt: new Date().toISOString() },
]

export default function MSMEClients() {
  const [clients, setClients] = useState<any[]>(mockClients)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  const filtered = clients.filter((c) =>
    c.agencyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.companyId?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  )

  const updateStatus = async (id: string, status: string, reason?: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status, rejectionReason: reason || null, verifiedDate: status === 'verified' ? new Date().toISOString() : c.verifiedDate }
          : c
      )
    )
    toast.success(`Client ${status} successfully!`)
    setShowReject(false)
    setSelectedClient(null)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">MSME Clients</h1>
        <p className="text-muted-foreground">Manage all MSME clients on the platform.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, UID, email or phone..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground"><Building2 className="mx-auto h-12 w-12 mb-3" />No clients found.</CardContent></Card>
        ) : filtered.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="font-semibold">{client.agencyName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{client.companyId}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {client.email}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3 text-muted-foreground" /> {client.phone || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground mt-1">GST: {client.gst || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">PAN: {client.pan || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact: {client.contactPerson}</p>
                    <p className="text-xs text-muted-foreground">Verified: {client.verifiedDate ? new Date(client.verifiedDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={statusColors[client.status] || 'bg-gray-100 text-gray-800'}>{client.status || 'N/A'}</Badge>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedClient(client)}><Eye className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Client Details</DialogTitle>
                            <DialogDescription>Full information for {client.agencyName}</DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div><Label className="text-xs text-muted-foreground">Company UID</Label><p className="font-mono font-medium">{client.companyId}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Status</Label><Badge className={statusColors[client.status]}>{client.status}</Badge></div>
                            <div><Label className="text-xs text-muted-foreground">Company Name</Label><p>{client.agencyName}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Contact Person</Label><p>{client.contactPerson}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Email</Label><p>{client.email}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Phone</Label><p>{client.phone || 'N/A'}</p></div>
                            <div><Label className="text-xs text-muted-foreground">GST Number</Label><p>{client.gst || 'N/A'}</p></div>
                            <div><Label className="text-xs text-muted-foreground">PAN Number</Label><p>{client.pan || 'N/A'}</p></div>
                            <div className="col-span-2"><Label className="text-xs text-muted-foreground">Verified Date</Label><p>{client.verifiedDate ? new Date(client.verifiedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not verified'}</p></div>
                            {client.rejectionReason && <div className="col-span-2"><Label className="text-xs text-muted-foreground text-red-600">Rejection Reason</Label><p className="text-sm text-red-600">{client.rejectionReason}</p></div>}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {client.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateStatus(client.id, 'verified')}><CheckCircle className="h-4 w-4" /></Button>
                          <Dialog open={showReject && selectedClient?.id === client.id} onOpenChange={(o) => { setShowReject(o); if (!o) setSelectedClient(null) }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setSelectedClient(client); setShowReject(true) }}><XCircle className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Reject Client</DialogTitle><DialogDescription>Provide a reason for rejecting {client.agencyName}.</DialogDescription></DialogHeader>
                              <div className="py-4"><Label>Rejection Reason</Label><Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..." /></div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => { setShowReject(false); setSelectedClient(null) }}>Cancel</Button>
                                <Button variant="destructive" onClick={() => updateStatus(client.id, 'rejected', rejectReason)} disabled={!rejectReason}>Reject</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
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
