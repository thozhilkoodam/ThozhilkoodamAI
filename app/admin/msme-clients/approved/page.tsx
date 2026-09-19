'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, CheckCircle, Building2, Mail, Calendar } from 'lucide-react'

const mockApproved: any[] = [
  { id: '1', agencyName: 'Infosys Technologies', companyId: 'MSME000002', contactPerson: 'Priya Sharma', email: 'priya@infosys.com', gst: 'GSTIN789012', pan: 'FGHIJ5678K', status: 'verified', verifiedDate: new Date().toISOString() },
  { id: '2', agencyName: 'HCL Technologies', companyId: 'MSME000006', contactPerson: 'Vikram S', email: 'vikram@hcl.com', gst: 'GSTIN112233', pan: 'ABCDE1122F', status: 'verified', verifiedDate: new Date(Date.now() - 7 * 86400000).toISOString() },
]

export default function ApprovedClients() {
  const [clients, setClients] = useState<any[]>(mockApproved)
  const [search, setSearch] = useState('')

  const filtered = clients.filter((c) =>
    c.agencyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.companyId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Approved Clients</h1><p className="text-muted-foreground">{clients.length} verified clients</p></div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500" />No approved clients.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-green-100 text-green-700">{client.agencyName?.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 grid gap-2 sm:grid-cols-4">
                    <div><p className="font-semibold">{client.agencyName}</p><p className="text-xs font-mono text-muted-foreground">{client.companyId}</p></div>
                    <div><p className="text-sm">{client.contactPerson}</p><div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{client.email}</div></div>
                    <div><p className="text-xs text-muted-foreground">GST: {client.gst || 'N/A'} | PAN: {client.pan || 'N/A'}</p><div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />Verified: {client.verifiedDate ? new Date(client.verifiedDate).toLocaleDateString() : 'N/A'}</div></div>
                    <div className="flex items-center justify-end">
                      <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
