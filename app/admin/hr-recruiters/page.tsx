'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Ban,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api-client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

interface Recruiter {
  id: string;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string | null;
  company: string;
  branch: string;
  department: string;
  designation: string;
  status: string;
  assignedJobs: number;
  assignedCandidates: number;
  interviewsCount: number;
  offersReleased: number;
  placements: number;
  conversionRate: number;
  lastLogin: string | null;
  createdAt: string;
  agency: { agencyName: string; logo: string } | null;
  _count: { assignments: number; interviews: number };
}

interface ApiResponse {
  recruiters: Recruiter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'inactive', label: 'Inactive' },
];

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function HRRecruitersPage() {
  const router = useRouter();

  const [data, setData] = useState<ApiResponse>({
    recruiters: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendRecruiterId, setSuspendRecruiterId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspending, setSuspending] = useState(false);

  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetRecruiterId, setResetRecruiterId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchRecruiters = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.hrRecruiters.getAll({
        search,
        status: status === 'all' ? '' : status,
        page: page.toString(),
        limit: limit.toString(),
      });
      setData(result);
      setSelectedRows([]);
    } catch (error) {
      toast.error('Failed to fetch HR recruiters');
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit]);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleRefresh = () => {
    setSearchInput('');
    setSearch('');
    setStatus('all');
    setPage(1);
    setSelectedRows([]);
    fetchRecruiters();
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(data.recruiters.map((r) => r.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const openSuspendDialog = (id: string) => {
    setSuspendRecruiterId(id);
    setSuspendReason('');
    setSuspendDialogOpen(true);
  };

  const handleSuspend = async () => {
    if (!suspendRecruiterId) return;
    setSuspending(true);
    try {
      await api.hrRecruiters.update(suspendRecruiterId, {
        status: 'suspended',
        suspendReason,
      });
      toast.success('HR Recruiter suspended successfully');
      setSuspendDialogOpen(false);
      fetchRecruiters();
    } catch (error) {
      toast.error('Failed to suspend HR Recruiter');
    } finally {
      setSuspending(false);
    }
  };

  const openResetPasswordDialog = (id: string) => {
    setResetRecruiterId(id);
    setResetPasswordDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetRecruiterId) return;
    setResetting(true);
    try {
      await api.hrRecruiters.resetPassword(resetRecruiterId);
      toast.success('Password reset email sent successfully');
      setResetPasswordDialogOpen(false);
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedRows.length === 0) return;
    setBulkActionLoading(true);
    try {
      for (const id of selectedRows) {
        if (action === 'approve') await api.hrRecruiters.approve(id);
        else if (action === 'reject') await api.hrRecruiters.reject(id, 'Bulk rejected');
        else if (action === 'delete') await api.hrRecruiters.remove(id);
      }
      toast.success(`${selectedRows.length} recruiter(s) ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'deleted'}`);
      setSelectedRows([]);
      fetchRecruiters();
    } catch (error) {
      toast.error(`Failed to ${action} recruiters`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const totalPages = data.totalPages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HR Recruiters</h1>
          <p className="text-muted-foreground">
            Manage all HR recruiters in your organization
          </p>
        </div>
        <Button onClick={() => router.push('/admin/hr-recruiters/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add HR Recruiter
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recruiters..."
                  className="w-[300px] pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  disabled={bulkActionLoading}
                >
                  Approve All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                  disabled={bulkActionLoading}
                >
                  Reject All
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkActionLoading}
                >
                  Delete All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        data.recruiters.length > 0 &&
                        selectedRows.length === data.recruiters.length
                          ? true
                          : selectedRows.length > 0
                            ? 'indeterminate'
                            : false
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Recruiter</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Department / Designation</TableHead>
                  <TableHead>Company / Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Assigned Jobs</TableHead>
                  <TableHead className="text-center">Placements</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : data.recruiters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <p className="text-lg font-medium text-muted-foreground">
                          No recruiters found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recruiters.map((recruiter) => (
                    <TableRow
                      key={recruiter.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(recruiter.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(recruiter.id, checked === true)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {recruiter.employeeId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={recruiter.photo || undefined} alt={recruiter.name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(recruiter.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{recruiter.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{recruiter.email}</div>
                          <div className="text-muted-foreground">{recruiter.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{recruiter.department || '—'}</div>
                          <div className="text-muted-foreground">
                            {recruiter.designation || '—'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{recruiter.company || '—'}</div>
                          <div className="text-muted-foreground">
                            {recruiter.agency?.agencyName || 'Direct'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[recruiter.status] || ''}
                        >
                          {recruiter.status.charAt(0).toUpperCase() + recruiter.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {recruiter.assignedJobs}
                      </TableCell>
                      <TableCell className="text-center">
                        {recruiter.placements}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(recruiter.lastLogin)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(recruiter.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/hr-recruiters/${recruiter.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/hr-recruiters/${recruiter.id}/edit`)
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openSuspendDialog(recruiter.id)}
                              className="text-amber-600 focus:text-amber-600"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openResetPasswordDialog(recruiter.id)}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                recruiters
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

      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend HR Recruiter</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend this recruiter? They will no longer
              be able to access the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="suspend-reason" className="text-sm font-medium">
                Reason for suspension
              </label>
              <Textarea
                id="suspend-reason"
                placeholder="Enter the reason for suspending this recruiter..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspendDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={suspending || !suspendReason.trim()}
            >
              {suspending ? 'Suspending...' : 'Suspend Recruiter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              A password reset link will be sent to the recruiter's email address.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetting}
            >
              {resetting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}