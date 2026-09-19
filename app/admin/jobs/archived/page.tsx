'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { api } from '@/lib/api-client'

const STATUS_STYLES: Record<string, string> = {
  archived: 'bg-gray-100 text-gray-800 border-gray-200',
}

export default function ArchivedJobsPage() {
  return <JobListPage status="archived" title="Archived Jobs" />
}

function JobListPage({ status, title }: { status: string; title?: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchJobs = async () => {
    setLoading(true); setError(null)
    try {
      const data = await api.jobs.getByStatus(status, { search, page: String(page), limit: '20' })
      if (data) { setJobs(data.jobs || []); setTotalPages(data.totalPages || 1); setTotal(data.total || 0) }
    } catch (e: any) { setError(e.message || 'Failed') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [status, page])
  useEffect(() => { const t = setTimeout(() => page === 1 ? fetchJobs() : setPage(1), 400); return () => clearTimeout(t) }, [search])

  const formatDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">{title || 'Archived Jobs'}</h1><p className="text-sm text-muted-foreground">View all archived job postings.</p></div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search jobs..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        : error ? <div className="flex flex-col items-center justify-center py-20 gap-3"><AlertCircle className="h-10 w-10 text-destructive" /><p className="text-muted-foreground">{error}</p><Button variant="outline" onClick={fetchJobs}>Retry</Button></div>
        : jobs.length === 0 ? <div className="py-20 text-center text-muted-foreground"><p className="text-lg">No archived jobs</p></div>
        : <div className="overflow-x-auto"><Table>
          <TableHeader><TableRow className="bg-muted/50">
            <TableHead>Title</TableHead><TableHead>Company</TableHead><TableHead>Location</TableHead><TableHead>Type</TableHead><TableHead>Experience</TableHead><TableHead>Salary</TableHead><TableHead>Status</TableHead><TableHead>Archived</TableHead>
          </TableRow></TableHeader>
          <TableBody>{jobs.map((job) => (
            <TableRow key={job.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.organizationName || job.company?.agencyName || '-'}</TableCell>
              <TableCell className="text-muted-foreground">{job.location || '-'}</TableCell>
              <TableCell><Badge variant="outline" className="text-xs">{job.employmentType || '-'}</Badge></TableCell>
              <TableCell>{job.experience || '-'}</TableCell>
              <TableCell>{job.salaryRange || (job.salaryMin ? `₹${job.salaryMin}-${job.salaryMax}` : '-')}</TableCell>
              <TableCell><Badge className={STATUS_STYLES[job.status] || ''} variant="outline">{job.status}</Badge></TableCell>
              <TableCell className="text-xs">{formatDate(job.archivedAt)}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table></div>}
      </CardContent></Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {jobs.length} of {total}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((p) => (
              <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" className="w-8" onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
