'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Pencil,
  Ban,
  KeyRound,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Trophy,
  UserCheck,
} from 'lucide-react';

interface RecruiterData {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone: string;
  photo?: string;
  status: string;
  gender?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  department?: string;
  designation?: string;
  experience?: number;
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  uanNumber?: string;
  pfNumber?: string;
  esiNumber?: string;
  basicSalary?: number;
  panVerified?: boolean;
  pfOpted?: boolean;
  esiOpted?: boolean;
  createdAt?: string;
  lastLogin?: string;
  approvedAt?: string;
  updatedAt?: string;
  agency?: {
    agencyName?: string;
    logo?: string;
    email?: string;
  };
  assignments?: Array<{
    id: string;
    requirement: {
      id: string;
      title: string;
      location: string;
      status: string;
    };
  }>;
  interviews?: Array<{
    id: string;
    job: {
      title: string;
    };
  }>;
  stats?: {
    assignedJobs?: number;
    assignedCandidates?: number;
    interviews?: number;
    offersReleased?: number;
    placements?: number;
    conversionRate?: number;
  };
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export default function HRRecruiterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [recruiter, setRecruiter] = useState<RecruiterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspending, setSuspending] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    async function fetchRecruiter() {
      try {
        setLoading(true);
        const data = await api.hrRecruiters.getOne(id);
        setRecruiter(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRecruiter();
  }, [id]);

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }
    try {
      setSuspending(true);
      await api.hrRecruiters.suspend(id, suspendReason);
      setRecruiter((prev) =>
        prev ? { ...prev, status: 'suspended' } : prev
      );
      setSuspendOpen(false);
      setSuspendReason('');
      toast.success('Recruiter suspended successfully');
    } catch {
      toast.error('Failed to suspend recruiter');
    } finally {
      setSuspending(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setResettingPassword(true);
      await api.hrRecruiters.resetPassword(id);
      toast.success('Password reset email sent');
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const getInitials = (first?: string, last?: string) => {
    return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const reqStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'filled':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !recruiter) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <UserCheck className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          Recruiter not found
        </h2>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push('/admin/hr-recruiters')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>
    );
  }

  const stats = recruiter.stats || {};
  const statCards = [
    { label: 'Assigned Jobs', value: stats.assignedJobs ?? 0, icon: Briefcase },
    { label: 'Assigned Candidates', value: stats.assignedCandidates ?? 0, icon: UserCheck },
    { label: 'Interviews', value: stats.interviews ?? 0, icon: Calendar },
    { label: 'Offers Released', value: stats.offersReleased ?? 0, icon: Mail },
    { label: 'Placements', value: stats.placements ?? 0, icon: Trophy },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate ?? 0}%`,
      icon: Trophy,
    },
  ];

  const detailFields = [
    { label: 'Employee ID', value: recruiter.employeeId },
    { label: 'Email', value: recruiter.email },
    { label: 'Phone', value: recruiter.phone },
    { label: 'Gender', value: recruiter.gender },
    { label: 'Date of Birth', value: recruiter.dateOfBirth ? formatDate(recruiter.dateOfBirth) : undefined },
    { label: 'Joining Date', value: recruiter.joiningDate ? formatDate(recruiter.joiningDate) : undefined },
    { label: 'Department', value: recruiter.department },
    { label: 'Designation', value: recruiter.designation },
    { label: 'Experience (yrs)', value: recruiter.experience?.toString() },
    { label: 'Agency', value: recruiter.agency?.agencyName },
    { label: 'Current Address', value: recruiter.currentAddress },
    { label: 'Permanent Address', value: recruiter.permanentAddress },
    { label: 'Emergency Contact', value: recruiter.emergencyContact },
    { label: 'Emergency Contact Name', value: recruiter.emergencyContactName },
    { label: 'PAN Number', value: recruiter.panNumber },
    { label: 'Aadhaar Number', value: recruiter.aadhaarNumber },
    { label: 'PAN Verified', value: recruiter.panVerified ? 'Yes' : 'No' },
    { label: 'UAN Number', value: recruiter.uanNumber },
    { label: 'PF Number', value: recruiter.pfNumber },
    { label: 'PF Opted', value: recruiter.pfOpted ? 'Yes' : 'No' },
    { label: 'ESI Number', value: recruiter.esiNumber },
    { label: 'ESI Opted', value: recruiter.esiOpted ? 'Yes' : 'No' },
    { label: 'Bank Name', value: recruiter.bankName },
    { label: 'Account Number', value: recruiter.accountNumber },
    { label: 'IFSC Code', value: recruiter.ifscCode },
    {
      label: 'Basic Salary',
      value: recruiter.basicSalary != null
        ? `₹${recruiter.basicSalary.toLocaleString('en-IN')}`
        : undefined,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/hr-recruiters')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetPassword} disabled={resettingPassword}>
            <KeyRound className="mr-2 h-4 w-4" />
            {resettingPassword ? 'Sending…' : 'Reset Password'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setSuspendOpen(true)}
            disabled={recruiter.status === 'suspended'}
          >
            <Ban className="mr-2 h-4 w-4" />
            Suspend
          </Button>
          <Button onClick={() => router.push(`/admin/hr-recruiters/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={recruiter.photo} alt={`${recruiter.firstName} ${recruiter.lastName}`} />
          <AvatarFallback className="text-2xl">
            {getInitials(recruiter.firstName, recruiter.lastName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {recruiter.firstName} {recruiter.lastName}
          </h1>
          <p className="text-muted-foreground">{recruiter.email}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {recruiter.employeeId}
            </span>
            <Badge className={statusColor(recruiter.status)}>
              {recruiter.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center gap-1 py-4">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-center text-xs text-muted-foreground">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {detailFields.map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium">{field.value || '—'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Assignments ({recruiter.assignments?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recruiter.assignments && recruiter.assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recruiter.assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.requirement.title}
                        </TableCell>
                        <TableCell>{a.requirement.location}</TableCell>
                        <TableCell>
                          <Badge className={reqStatusColor(a.requirement.status)}>
                            {a.requirement.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No assignments yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interviews ({recruiter.interviews?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recruiter.interviews && recruiter.interviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recruiter.interviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell className="font-medium">
                          {interview.job.title}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No interviews yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Created At</p>
              <p className="text-sm font-medium">{formatDate(recruiter.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Login</p>
              <p className="text-sm font-medium">{formatDate(recruiter.lastLogin)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved At</p>
              <p className="text-sm font-medium">{formatDate(recruiter.approvedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Updated At</p>
              <p className="text-sm font-medium">{formatDate(recruiter.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Recruiter</DialogTitle>
            <DialogDescription>
              This action will suspend the recruiter. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for suspension…"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSuspendOpen(false);
                setSuspendReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={suspending}
            >
              {suspending ? 'Suspending…' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
