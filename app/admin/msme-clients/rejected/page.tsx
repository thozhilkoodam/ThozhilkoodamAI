'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, XCircle, CheckCircle, Building2, Mail } from 'lucide-react'

const mockRejected: any[] = [
  { id: '1', agencyName: 'Wipro Solutions', companyId: 'MSME000003', contactPerson: 'Amit Patel', email: 'amit@wipro.com', rejectionReason: 'Incomplete documentation - GST certificate missing', status: 'rejected' },
  { id: '2', agencyName: 'TechMahindra Ltd', companyId: 'MSME000007', contactPerson: 'Sneha R', email: 'sneha@techmahindra.com', rejectionReason: 'PAN verification failed', status: 'rejected' },
]

export default function RejectedClients() {
  const [clients, setClients] = useState<any[]>(mockRejected)
  const [search, setSearch] = useState('')

  const filtered = clients.filter((c) =>
    c.agencyName?.toLowerCase().includes(search.toLowerCase()) || c.companyId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Rejected Clients</h1><p className="text-muted-foreground">{clients.length} rejected clients</p></div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><CheckCircle className="mx-auto h-12 w-12 mb-3" />No rejected clients.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-red-100 text-red-700">{client.agencyName?.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 grid gap-2 sm:grid-cols-3">
                    <div><p className="font-semibold">{client.agencyName}</p><p className="text-xs font-mono text-muted-foreground">{client.companyId}</p><div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{client.email}</div></div>
                    <div><p className="text-xs text-red-600 font-medium">Reason:</p><p className="text-xs text-muted-foreground">{client.rejectionReason || 'Not specified'}</p></div>
                    <div className="flex items-center justify-end">
                      <Badge variant="destructive">Rejected</Badge>
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
