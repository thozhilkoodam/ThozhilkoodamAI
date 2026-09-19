'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  Calendar,
  Trophy,
  Search,
  TrendingUp,
  Star,
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  photo: string;
  email: string;
  company: string;
  department: string;
  designation: string;
  assignedJobs: number;
  assignedCandidates: number;
  interviewsCount: number;
  offersReleased: number;
  placements: number;
  conversionRate: number;
  _count: {
    assignments: number;
    interviews: number;
  };
}

interface PerformanceData {
  stats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    totalAssignments: number;
    totalInterviews: number;
  };
  leaderboard: LeaderboardEntry[];
}

export default function HRRecruitersPerformancePage() {
  const router = useRouter();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const result = await api.hrRecruiters.getPerformance();
        setData(result);
      } catch {
        toast.error('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, []);

  const filteredLeaderboard = data?.leaderboard.filter((entry) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      entry.name.toLowerCase().includes(q) ||
      entry.email.toLowerCase().includes(q) ||
      entry.company.toLowerCase().includes(q)
    );
  }) ?? [];

  const kpiCards = data
    ? [
        { label: 'Total Recruiters', value: data.stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active', value: data.stats.active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Pending', value: data.stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Suspended', value: data.stats.suspended, icon: UserX, color: 'text-red-600', bg: 'bg-red-100' },
        { label: 'Total Assignments', value: data.stats.totalAssignments, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Total Interviews', value: data.stats.totalInterviews, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100' },
      ]
    : [];

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function getRankBadge(rank: number) {
    if (rank === 1)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Trophy className="h-3 w-3 mr-1" />
          1
        </Badge>
      );
    if (rank === 2)
      return (
        <Badge className="bg-gray-400 hover:bg-gray-500 text-white">
          <Star className="h-3 w-3 mr-1" />
          2
        </Badge>
      );
    if (rank === 3)
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
          <Star className="h-3 w-3 mr-1" />
          3
        </Badge>
      );
    return <Badge variant="secondary">#{rank}</Badge>;
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No performance data available</h3>
          <p className="text-muted-foreground mt-1">
            Performance data will appear once recruiters have assignments and activity.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recruiter Performance</h1>
        <p className="text-muted-foreground">
          Track and compare recruiter performance metrics and leaderboard rankings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div className={`rounded-md p-2 ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle>Performance Leaderboard</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                className="pl-8 w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {search ? 'No recruiters match your search.' : 'No performance data available.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Recruiter</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-center">Jobs</TableHead>
                    <TableHead className="text-center">Candidates</TableHead>
                    <TableHead className="text-center">Interviews</TableHead>
                    <TableHead className="text-center">Offers</TableHead>
                    <TableHead className="text-center">Placements</TableHead>
                    <TableHead className="text-center">Conv. Rate</TableHead>
                    <TableHead className="text-center">Assignments</TableHead>
                    <TableHead className="text-center">Interviews Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaderboard.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell>{getRankBadge(index + 1)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.photo} alt={entry.name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(entry.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{entry.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {entry.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{entry.company}</TableCell>
                      <TableCell className="text-sm">{entry.department}</TableCell>
                      <TableCell className="text-sm">{entry.designation}</TableCell>
                      <TableCell className="text-center">{entry.assignedJobs}</TableCell>
                      <TableCell className="text-center">{entry.assignedCandidates}</TableCell>
                      <TableCell className="text-center">{entry.interviewsCount}</TableCell>
                      <TableCell className="text-center">{entry.offersReleased}</TableCell>
                      <TableCell className="text-center font-medium">{entry.placements}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            entry.conversionRate >= 50
                              ? 'default'
                              : entry.conversionRate >= 20
                                ? 'secondary'
                                : 'outline'
                          }
                          className={
                            entry.conversionRate >= 50
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : ''
                          }
                        >
                          {entry.conversionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{entry._count.assignments}</TableCell>
                      <TableCell className="text-center">{entry._count.interviews}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
