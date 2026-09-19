'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, RefreshCw, Trash2, UserX } from 'lucide-react'

interface Recruiter {
  _id: string
  employeeId?: string
  name?: string
  email?: string
  avatar?: string
  company?: { name?: string }
  department?: string
  suspensionReason?: string
  suspendedAt?: string
  status?: string
}

interface PaginatedResponse {
  recruiters: Recruiter[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function SuspendedHrRecruitersPage() {
  const router = useRouter()
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.hrRecruiters.getAll({
        status: 'suspended',
        search: search || undefined,
        page: String(page),
        limit: String(limit),
      })
      if (res) {
        setData(res as unknown as PaginatedResponse)
      } else {
        setData(null)
      }
    } catch {
      toast.error('Failed to load suspended recruiters')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const handleReactivate = async (id: string, name?: string) => {
    try {
      await api.hrRecruiters.reactivate(id)
      toast.success(`${name || 'Recruiter'} reactivated successfully`)
      fetchData()
    } catch {
      toast.error('Failed to reactivate recruiter')
    }
  }

  const handleDelete = async (id: string, name?: string) => {
    try {
      await api.hrRecruiters.remove(id)
      toast.success(`${name || 'Recruiter'} deleted`)
      fetchData()
    } catch {
      toast.error('Failed to delete recruiter')
    }
  }

  const totalPages = data?.totalPages || 1
  const total = data?.total || 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Suspended HR Recruiters
          </h1>
          <p className="text-muted-foreground text-sm">
            {total} suspended recruiter{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, email, or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Suspended Recruiters</CardTitle>
          <CardDescription>
            Recruiters who have been suspended from the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data || data.recruiters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserX className="text-muted-foreground mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm font-medium">
                No suspended recruiters
              </p>
              <p className="text-muted-foreground text-xs">
                Suspended recruiters will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Recruiter</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Suspension Reason</TableHead>
                    <TableHead>Suspended At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recruiters.map((recruiter) => (
                    <TableRow key={recruiter._id}>
                      <TableCell className="font-mono text-xs">
                        {recruiter.employeeId || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={recruiter.avatar} />
                            <AvatarFallback className="text-xs">
                              {(recruiter.name || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {recruiter.name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.email || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.company?.name || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.department || '—'}
                      </TableCell>
                      <TableCell>
                        {recruiter.suspensionReason ? (
                          <Badge variant="destructive" className="max-w-[200px] truncate text-xs whitespace-normal break-words">
                            {recruiter.suspensionReason}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-nowrap">
                        {recruiter.suspendedAt
                          ? new Date(recruiter.suspendedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivate(recruiter._id, recruiter.name)}
                          >
                            <UserX className="mr-1 h-3.5 w-3.5" />
                            Reactivate
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Recruiter</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete{' '}
                                  <strong>{recruiter.name || 'this recruiter'}</strong>?
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {}}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(recruiter._id, recruiter.name)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && data && data.recruiters.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-muted-foreground text-xs">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
