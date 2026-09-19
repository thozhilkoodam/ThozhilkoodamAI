'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Search, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api-client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Recruiter {
  id: string
  employeeId: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  photo: string | null
  company: string
  department: string
  designation: string
  status: string
  createdAt: string
  agency: { agencyName: string; logo: string } | null
}

interface ApiResponse {
  recruiters: Recruiter[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PendingHRRecruitersPage() {
  const router = useRouter()

  const [data, setData] = useState<ApiResponse>({
    recruiters: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectRecruiterId, setRejectRecruiterId] = useState<string | null>(null)
  const [rejectRecruiterName, setRejectRecruiterName] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchRecruiters = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.hrRecruiters.getAll({
        status: 'pending',
        search,
        page: page.toString(),
        limit: limit.toString(),
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to fetch pending recruiters')
    } finally {
      setLoading(false)
    }
  }, [search, page, limit])

  useEffect(() => {
    fetchRecruiters()
  }, [fetchRecruiters])

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const handleRefresh = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
    fetchRecruiters()
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      await api.hrRecruiters.approve(id)
      toast.success('Recruiter approved successfully')
      fetchRecruiters()
    } catch (error) {
      toast.error('Failed to approve recruiter')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectDialog = (id: string, name: string) => {
    setRejectRecruiterId(id)
    setRejectRecruiterName(name)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!rejectRecruiterId || !rejectReason.trim()) return
    setActionLoading('reject')
    try {
      await api.hrRecruiters.reject(rejectRecruiterId, rejectReason.trim())
      toast.success('Recruiter rejected')
      setRejectDialogOpen(false)
      setRejectRecruiterId(null)
      setRejectReason('')
      fetchRecruiters()
    } catch (error) {
      toast.error('Failed to reject recruiter')
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = data.totalPages

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Pending Approval</h1>
              {!loading && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                  {data.total}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Review and approve new HR recruiter registrations
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, employee ID..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Recruiter</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : data.recruiters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <p className="text-lg font-medium text-muted-foreground">
                          No pending recruiters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          All registrations have been reviewed. New pending recruiters will appear here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recruiters.map((recruiter) => (
                    <TableRow key={recruiter.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {recruiter.employeeId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={recruiter.photo || undefined}
                              alt={recruiter.name}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(recruiter.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{recruiter.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{recruiter.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {recruiter.phone || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.company || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.department || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.designation || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(recruiter.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(recruiter.id)}
                            disabled={actionLoading === recruiter.id}
                          >
                            {actionLoading === recruiter.id ? (
                              <Clock className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openRejectDialog(recruiter.id, recruiter.name)}
                            disabled={actionLoading === recruiter.id}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && data.recruiters.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.page - 1) * data.limit + 1} to{' '}
                {Math.min(data.page * data.limit, data.total)} of {data.total}{' '}
                pending recruiters
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {data.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject HR Recruiter</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting{' '}
              <span className="font-medium text-foreground">{rejectRecruiterName}</span>.
              They will be notified of this decision.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="reject-reason" className="text-sm font-medium">
                Reason for rejection
              </label>
              <Textarea
                id="reject-reason"
                placeholder="Enter the reason for rejecting this recruiter..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading === 'reject' || !rejectReason.trim()}
            >
              {actionLoading === 'reject' ? 'Rejecting...' : 'Reject Recruiter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
