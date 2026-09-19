'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Clock, CheckCircle, XCircle, Building2, Mail, Phone, FileText, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const mockPending: any[] = [
  { id: '1', agencyName: 'TechStart Solutions', companyId: 'MSME000004', contactPerson: 'Sundar R', email: 'sundar@techstart.com', phone: '+91 9988776655', gst: 'GSTIN998877', pan: 'PQRST3456U', status: 'pending', createdAt: new Date().toISOString() },
  { id: '2', agencyName: 'GreenField Enterprises', companyId: 'MSME000005', contactPerson: 'Meena K', email: 'meena@greenfield.com', phone: '+91 8877665544', gst: 'GSTIN556677', pan: 'UVWXY7890Z', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
]

export default function PendingVerification() {
  const [clients, setClients] = useState<any[]>(mockPending)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const updateStatus = async (id: string, status: string, reason?: string) => {
    setClients((prev) => prev.filter((c: any) => c.id !== id))
    toast.success(`Client ${status} successfully!`)
    setShowReject(false)
    setShowDetails(false)
    setSelectedClient(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pending Verification</h1>
        <p className="text-muted-foreground">Review and verify new MSME client registrations.</p>
      </div>

      {clients.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500" />No pending verifications. All caught up!</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.id} className="border-yellow-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-yellow-100 text-yellow-700 text-lg">
                      {client.agencyName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{client.agencyName}</h3>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground mt-0.5">{client.companyId}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{client.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{client.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Registered: {new Date(client.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        GST: {client.gst || 'N/A'} | PAN: {client.pan || 'N/A'}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedClient(client); setShowDetails(true) }}>
                        <FileText className="mr-1.5 h-4 w-4" /> View Details
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(client.id, 'verified')}>
                        <CheckCircle className="mr-1.5 h-4 w-4" /> Verify
                      </Button>
                      <Dialog open={showReject && selectedClient?.id === client.id} onOpenChange={(o) => { setShowReject(o); if (!o) setSelectedClient(null) }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedClient(client); setShowReject(true) }}>
                            <XCircle className="mr-1.5 h-4 w-4" /> Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Reject Client</DialogTitle><DialogDescription>Provide a reason for rejecting {client.agencyName}.</DialogDescription></DialogHeader>
                          <div className="py-4">
                            <Label>Rejection Reason</Label>
                            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..." rows={4} />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => { setShowReject(false); setSelectedClient(null) }}>Cancel</Button>
                            <Button variant="destructive" onClick={() => updateStatus(client.id, 'rejected', rejectReason)} disabled={!rejectReason}>Reject Client</Button>
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
          <DialogHeader><DialogTitle>Client Details</DialogTitle></DialogHeader>
          {selectedClient && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedClient.agencyName?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedClient.agencyName}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{selectedClient.companyId}</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Contact Person</Label><p className="font-medium">{selectedClient.contactPerson}</p></div>
                <div><Label className="text-xs text-muted-foreground">Official Email</Label><p>{selectedClient.email}</p></div>
                <div><Label className="text-xs text-muted-foreground">Phone</Label><p>{selectedClient.phone || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">GST Number</Label><p>{selectedClient.gst || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">PAN Number</Label><p>{selectedClient.pan || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Registration Date</Label><p>{new Date(selectedClient.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
            {selectedClient && (
              <>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selectedClient.id, 'verified')}>
                  <CheckCircle className="mr-1.5 h-4 w-4" /> Verify
                </Button>
                <Button variant="destructive" onClick={() => { setShowDetails(false); setShowReject(true) }}>
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
