'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Bell, Lock, Shield, Save, Smartphone, Chrome } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' })
  const [notifications, setNotifications] = useState({
    email: true,
    interviewReminders: true,
    requirementUpdates: false,
    reportSummaries: true,
  })
  const [twoFA, setTwoFA] = useState(false)

  const handleSaveProfile = () => toast.success('Profile settings saved!')
  const handleSavePassword = () => {
    if (!passwords.current || !passwords.newPassword || !passwords.confirm) {
      toast.error('Please fill all password fields')
      return
    }
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    toast.success('Password changed successfully!')
    setPasswords({ current: '', newPassword: '', confirm: '' })
  }
  const handleSaveNotifications = () => toast.success('Notification preferences saved!')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="password"><Lock className="mr-2 h-4 w-4" /> Password</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and manage your profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Manage your full profile details from the{' '}
                  <a href="/hr/profile" className="text-primary hover:underline">Profile</a> page.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="john.doe@thozhilkoodam.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input defaultValue="Senior Recruiter" />
                </div>
              </div>
              <Button onClick={handleSaveProfile}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive email notifications for important updates' },
                { key: 'interviewReminders', label: 'Interview Reminders', desc: 'Get reminded before scheduled interviews' },
                { key: 'requirementUpdates', label: 'Requirement Updates', desc: 'Notifications about new and updated requirements' },
                { key: 'reportSummaries', label: 'Report Summaries', desc: 'Weekly summary of recruitment reports' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [item.key]: v }))}
                  />
                </div>
              ))}
              <Separator />
              <Button onClick={handleSaveNotifications}><Save className="mr-2 h-4 w-4" /> Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleSavePassword}><Lock className="mr-2 h-4 w-4" /> Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch checked={twoFA} onCheckedChange={setTwoFA} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Google Login</p>
                  <p className="text-sm text-muted-foreground">Connect your Google account for single sign-on</p>
                </div>
                <Button variant="outline" size="sm">
                  <Chrome className="mr-2 h-4 w-4" /> Connect
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Phone Verification</p>
                  <p className="text-sm text-muted-foreground">Verify your phone number for additional security</p>
                </div>
                <Button variant="outline" size="sm">
                  <Smartphone className="mr-2 h-4 w-4" /> Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
