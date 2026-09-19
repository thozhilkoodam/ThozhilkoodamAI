'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/lib/api-client'
import { Download, FileUp, Loader2, Plus, Search, SlidersHorizontal, UserCheck, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const statusLabels: Record<string, string> = {
  pending_activation: 'Pending Activation',
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
}

function statusVariant(status: string) {
  if (status === 'active') return 'success'
  if (status === 'pending_activation') return 'warning'
  if (status === 'inactive') return 'secondary'
  return 'destructive'
}

export default function HrConsultantsPage() {
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const loadConsultants = async () => {
    setLoading(true)
    try {
      const data = await api.hrConsultants.getAll({ status })
      setConsultants(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Unable to load consultants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConsultants()
  }, [status])

  const filteredConsultants = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return consultants
    return consultants.filter((consultant) =>
      [consultant.name, consultant.employeeId, consultant.email, consultant.phone, consultant.department, consultant.designation, consultant.branch]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    )
  }, [consultants, search])

  const stats = useMemo(() => ({
    total: consultants.length,
    active: consultants.filter((c) => c.status === 'active').length,
    pending: consultants.filter((c) => c.status === 'pending_activation').length,
  }), [consultants])

  const exportConsultants = () => {
    const headers = ['Employee ID', 'Full Name', 'Email', 'Mobile', 'Department', 'Designation', 'Branch', 'Status']
    const rows = filteredConsultants.map((c) => [c.employeeId, c.name, c.email, c.phone, c.department, c.designation, c.branch, statusLabels[c.status] || c.status])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hr-consultants.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">HR Recruiters</h1>
          <p className="text-muted-foreground">Create invite-only consultant accounts for your agency.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success('Import template ready')}>
            <FileUp className="mr-2 h-4 w-4" /> Import Consultants
          </Button>
          <Button variant="outline" onClick={exportConsultants}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Link href="/dashboard/hr-consultants/create">
            <Button><Plus className="mr-2 h-4 w-4" /> Add HR Recruiter</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Consultants</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{stats.total}</span>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{stats.active}</span>
            <UserCheck className="h-5 w-5 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Activation</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{stats.pending}</span>
            <SlidersHorizontal className="h-5 w-5 text-yellow-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search consultants" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="md:w-56"><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_activation">Pending Activation</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consultant</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading consultants...</TableCell></TableRow>
              ) : filteredConsultants.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No consultants found</TableCell></TableRow>
              ) : filteredConsultants.map((consultant) => (
                <TableRow key={consultant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={consultant.photo || ''} />
                        <AvatarFallback>{String(consultant.name || 'HC').split(' ').map((part) => part[0]).join('').slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{consultant.name}</p>
                        <p className="text-sm text-muted-foreground">{consultant.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{consultant.employeeId}</TableCell>
                  <TableCell>
                    <div>
                      <p>{consultant.department || '-'}</p>
                      <p className="text-sm text-muted-foreground">{consultant.designation || '-'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{consultant.branch || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(consultant.status) as any}>{statusLabels[consultant.status] || consultant.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
