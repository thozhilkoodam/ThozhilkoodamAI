'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { Upload, Building2, Bell, Mail, Shield, Users, Palette, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useAuth()

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company settings and preferences.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company"><Building2 className="mr-2 h-4 w-4" /> Company Profile</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="mr-2 h-4 w-4" /> Branding</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" /> Email Settings</TabsTrigger>
          <TabsTrigger value="team"><Users className="mr-2 h-4 w-4" /> Team Access</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Manage your company information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  {user?.logo ? (
                    <img src={user.logo} alt="Company" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <Button variant="outline" type="button">
                    <Upload className="mr-2 h-4 w-4" /> Upload Logo
                  </Button>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="Your Agency" />
                </div>
                <div className="space-y-2">
                  <Label>Company UID</Label>
                  <Input value={user?.companyId || 'KIKTK000001'} disabled />
                  <p className="text-xs text-muted-foreground">Company ID cannot be edited.</p>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={user?.email || 'admin@company.com'} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea defaultValue="Chennai, Tamil Nadu, India" />
                </div>
              </div>

              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your company branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" defaultValue="#2563eb" className="w-12 h-10 p-1" />
                    <Input defaultValue="#2563eb" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" defaultValue="#1e40af" className="w-12 h-10 p-1" />
                    <Input defaultValue="#1e40af" />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Company Description</Label>
                <Textarea defaultValue="Leading recruitment agency providing top talent to companies across India." rows={4} />
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'New Applications', desc: 'When a candidate applies to a job' },
                { label: 'Interview Reminders', desc: 'Reminders before scheduled interviews' },
                { label: 'Candidate Updates', desc: 'When a candidate status changes' },
                { label: 'Offer Updates', desc: 'When offers are sent or accepted' },
                { label: 'Team Activities', desc: 'When team members take actions' },
                { label: 'Billing Alerts', desc: 'Payment and subscription updates' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email templates and delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Sender Email</Label>
                <Input defaultValue="noreply@thozhilkoodam.com" />
              </div>
              <div className="space-y-2">
                <Label>Sender Name</Label>
                <Input defaultValue="Thozhil Koodam" />
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Email Templates</h4>
                {['Application Received', 'Interview Scheduled', 'Offer Letter', 'Welcome Email'].map((template) => (
                  <div key={template} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">{template}</span>
                    <Button variant="outline" size="sm">Edit Template</Button>
                  </div>
                ))}
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Access</CardTitle>
              <CardDescription>Manage team permissions and access levels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Manage your team members and their roles from the{' '}
                  <a href="/dashboard/team" className="text-primary hover:underline">Team Management</a> page.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { role: 'Admin', members: 1 },
                  { role: 'HR Manager', members: 1 },
                  { role: 'Recruiter', members: 1 },
                  { role: 'Interviewer', members: 1 },
                  { role: 'Viewer', members: 0 },
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium">{item.role}</span>
                    <span className="text-sm text-muted-foreground">{item.members} member(s)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">Manage active sessions</p>
                </div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  Note: Company account cannot be deleted. Contact support for assistance.
                </p>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Update Security</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
