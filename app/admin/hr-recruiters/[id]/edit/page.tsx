'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { DOBSelector } from '@/components/ui/dob-selector';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  photo: '',
  company: '',
  branch: '',
  department: '',
  designation: '',
  reportingManager: '',
  hiringManager: '',
  joiningDate: '',
  employmentType: '',
  experience: '',
  preferredIndustry: '',
  preferredJobRoles: '',
  preferredLocations: '',
  skills: '',
  certifications: '',
  username: '',
  password: '',
  linkedIn: '',
  github: '',
  portfolio: '',
  resumeUrl: '',
  agency: '',
  status: '',
};

export default function EditHRRecruiterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState(emptyForm);
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchRecruiter() {
      try {
        setLoading(true);
        const data = await api.hrRecruiters.getOne(id);
        if (!data) {
          setError(true);
          return;
        }
        setEmployeeId(data.employeeId || '');
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
          gender: data.gender || '',
          photo: data.photo || '',
          company: data.company || '',
          branch: data.branch || '',
          department: data.department || '',
          designation: data.designation || '',
          reportingManager: data.reportingManager || '',
          hiringManager: data.hiringManager || '',
          joiningDate: data.joiningDate ? data.joiningDate.slice(0, 10) : '',
          employmentType: data.employmentType || '',
          experience: data.experience?.toString() || '',
          preferredIndustry: data.preferredIndustry || '',
          preferredJobRoles: data.preferredJobRoles || '',
          preferredLocations: data.preferredLocations || '',
          skills: data.skills || '',
          certifications: data.certifications || '',
          username: data.username || '',
          password: '',
          linkedIn: data.linkedIn || '',
          github: data.github || '',
          portfolio: data.portfolio || '',
          resumeUrl: data.resumeUrl || '',
          agency: data.agency?.agencyName || data.agency || '',
          status: data.status || '',
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRecruiter();
  }, [id]);

  const updateForm = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      toast.error('First name, last name, email, and phone are required');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = { ...form };
      if (!payload.password) delete payload.password;
      if (payload.experience) payload.experience = Number(payload.experience);
      await api.hrRecruiters.update(id, payload);
      toast.success('HR Recruiter updated successfully');
      router.push(`/admin/hr-recruiters/${id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update HR Recruiter');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg font-semibold text-muted-foreground">Recruiter not found</p>
        <Link href="/admin/hr-recruiters">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/hr-recruiters/${id}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit HR Recruiter</h1>
            <p className="text-muted-foreground">
              Update recruiter details below.
            </p>
          </div>
        </div>
      </div>

      {/* Employee ID */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="space-y-2 max-w-xs">
            <Label>Employee ID</Label>
            <Input value={employeeId} readOnly className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Basic personal details of the recruiter.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => updateForm('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => updateForm('lastName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <DOBSelector
                value={form.dateOfBirth}
                onChange={(v) => updateForm('dateOfBirth', v)}
                label="Date of Birth"
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => updateForm('gender', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Photo URL</Label>
              <Input
                placeholder="https://example.com/photo.jpg"
                value={form.photo}
                onChange={(e) => updateForm('photo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Employment Details</CardTitle>
          <CardDescription>Work-related information and organizational details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                placeholder="Company name"
                value={form.company}
                onChange={(e) => updateForm('company', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input
                placeholder="Branch location"
                value={form.branch}
                onChange={(e) => updateForm('branch', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                placeholder="Department"
                value={form.department}
                onChange={(e) => updateForm('department', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input
                placeholder="Designation"
                value={form.designation}
                onChange={(e) => updateForm('designation', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Reporting Manager</Label>
              <Input
                placeholder="Reporting manager"
                value={form.reportingManager}
                onChange={(e) => updateForm('reportingManager', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hiring Manager</Label>
              <Input
                placeholder="Hiring manager"
                value={form.hiringManager}
                onChange={(e) => updateForm('hiringManager', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <DatePicker
                value={form.joiningDate}
                onChange={(v) => updateForm('joiningDate', v)}
                placeholder="DD/MM/YYYY"
                label="Joining Date"
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={form.employmentType} onValueChange={(v) => updateForm('employmentType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Professional Details</CardTitle>
          <CardDescription>Skills, experience, and professional preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 5"
                value={form.experience}
                onChange={(e) => updateForm('experience', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Industry</Label>
              <Input
                placeholder="e.g. IT Services, SaaS"
                value={form.preferredIndustry}
                onChange={(e) => updateForm('preferredIndustry', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Job Roles</Label>
              <Input
                placeholder="e.g. Frontend, Backend, QA"
                value={form.preferredJobRoles}
                onChange={(e) => updateForm('preferredJobRoles', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Locations</Label>
              <Input
                placeholder="e.g. Chennai, Bengaluru"
                value={form.preferredLocations}
                onChange={(e) => updateForm('preferredLocations', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <Input
                placeholder="e.g. Sourcing, Screening, Negotiation"
                value={form.skills}
                onChange={(e) => updateForm('skills', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Certifications</Label>
              <Input
                placeholder="e.g. SHRM-CP, AIRS"
                value={form.certifications}
                onChange={(e) => updateForm('certifications', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Setup */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Account Setup</CardTitle>
          <CardDescription>
            Login credentials and online profiles. Leave password blank to keep the current one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                placeholder="Username"
                value={form.username}
                onChange={(e) => updateForm('username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Leave blank to keep current"
                value={form.password}
                onChange={(e) => updateForm('password', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                placeholder="https://linkedin.com/in/username"
                value={form.linkedIn}
                onChange={(e) => updateForm('linkedIn', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input
                placeholder="https://github.com/username"
                value={form.github}
                onChange={(e) => updateForm('github', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Portfolio</Label>
              <Input
                placeholder="https://portfolio.dev"
                value={form.portfolio}
                onChange={(e) => updateForm('portfolio', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Resume URL</Label>
              <Input
                placeholder="https://example.com/resume.pdf"
                value={form.resumeUrl}
                onChange={(e) => updateForm('resumeUrl', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Permissions</CardTitle>
          <CardDescription>Agency assignment and account status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Agency</Label>
              <Input
                placeholder="Agency name"
                value={form.agency}
                onChange={(e) => updateForm('agency', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateForm('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href={`/admin/hr-recruiters/${id}`}>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
