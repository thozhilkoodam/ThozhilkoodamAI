"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Search, RefreshCw, Eye, Ban, UserCheck } from "lucide-react"

import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Recruiter {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  avatar?: string
  company?: string
  department?: string
  designation?: string
  assignedJobs: number
  placements: number
  lastLogin: string | null
  status: string
}

interface GetAllResponse {
  recruiters: Recruiter[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ActiveRecruitersPage() {
  const router = useRouter()
  const [data, setData] = useState<GetAllResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [suspendTarget, setSuspendTarget] = useState<Recruiter | null>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspending, setSuspending] = useState(false)

  const fetchRecruiters = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.hrRecruiters.getAll({
        status: "active",
        search,
        page: String(page),
        limit: "10",
      })
      setData(res)
    } catch {
      toast.error("Failed to load recruiters")
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchRecruiters()
  }, [fetchRecruiters])

  const handleSuspend = async () => {
    if (!suspendTarget || !suspendReason.trim()) return
    setSuspending(true)
    try {
      await api.hrRecruiters.suspend(suspendTarget.id, suspendReason)
      toast.success(`${suspendTarget.name} has been suspended`)
      setSuspendTarget(null)
      setSuspendReason("")
      fetchRecruiters()
    } catch {
      toast.error("Failed to suspend recruiter")
    } finally {
      setSuspending(false)
    }
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Active HR Recruiters
          </h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.total} recruiter{data.total !== 1 ? "s" : ""} active
            </p>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={fetchRecruiters}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton />
          ) : !data || data.recruiters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No active recruiters</p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Try adjusting your search terms"
                  : "There are no active recruiters at the moment"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Recruiter</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company / Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-center">
                      Assigned Jobs
                    </TableHead>
                    <TableHead className="text-center">Placements</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recruiters.map((recruiter) => (
                    <TableRow key={recruiter.id}>
                      <TableCell className="font-mono text-xs">
                        {recruiter.employeeId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={recruiter.avatar}
                              alt={recruiter.name}
                            />
                            <AvatarFallback>
                              {initials(recruiter.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{recruiter.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.phone}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.company}
                        {recruiter.department && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {recruiter.department}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recruiter.designation ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {recruiter.assignedJobs}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {recruiter.placements}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {recruiter.lastLogin
                          ? new Date(recruiter.lastLogin).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/admin/hr-recruiters/${recruiter.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSuspendTarget(recruiter)}
                          >
                            <Ban className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages}
                  </p>
                  <div className="flex gap-2">
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
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendTarget(null)
            setSuspendReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Recruiter</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend{" "}
              <strong>{suspendTarget?.name}</strong>? They will lose access
              until reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Enter reason for suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSuspendTarget(null)
                setSuspendReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason.trim() || suspending}
            >
              {suspending ? "Suspending..." : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-40 flex-1" />
          <Skeleton className="h-4 w-28 flex-1" />
          <Skeleton className="h-4 w-28 flex-1" />
          <Skeleton className="h-4 w-24 flex-1" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}
