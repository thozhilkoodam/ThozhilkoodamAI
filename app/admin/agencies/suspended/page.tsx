'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, AlertTriangle, CheckCircle, Building2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SuspendedAgencies() {
  const [agencies, setAgencies] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    db.companies.getByStatus('suspended').then(setAgencies)
  }, [])

  const activateAgency = async (id: string) => {
    await db.companies.updateStatus(id, 'approved')
    setAgencies(agencies.filter((a: any) => a.id !== id))
    toast.success('Agency activated successfully!')
  }

  const filtered = agencies.filter((a) =>
    a.agencyName?.toLowerCase().includes(search.toLowerCase()) || a.companyId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Suspended Agencies</h1><p className="text-muted-foreground">{agencies.length} suspended agencies</p></div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500" />No suspended agencies.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((agency) => (
            <Card key={agency.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-orange-100 text-orange-700">{agency.agencyName?.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 grid gap-2 sm:grid-cols-3">
                    <div><p className="font-semibold">{agency.agencyName}</p><p className="text-xs font-mono text-muted-foreground">{agency.companyId}</p><div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{agency.email}</div></div>
                    <div><p className="text-xs text-muted-foreground">Contact: {agency.contactPerson} | Vacancies: {agency.vacancyCount}</p></div>
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Suspended</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => activateAgency(agency.id)}><CheckCircle className="h-4 w-4" /></Button>
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
