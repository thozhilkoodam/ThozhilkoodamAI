'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Shield, Bell, Globe, Key, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Thozhil Koodam',
    supportEmail: 'support@thozhilkoodam.com',
    fromEmail: 'noreply@thozhilkoodam.com',
    planPrice: '35000',
    planName: 'Premium',
    planJobs: '50',
    planCandidates: '1500',
    planTeamMembers: '10',
    enableRegistration: true,
    requireApproval: true,
    enableNotifications: true,
    enableEmailAlerts: true,
    maintenanceMode: false,
  })

  const update = (key: string, value: any) => setSettings((s) => ({ ...s, [key]: value }))

  const save = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Platform Settings</h1><p className="text-muted-foreground">Configure platform-wide settings and preferences.</p></div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Globe className="mr-1.5 h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="plan"><Key className="mr-1.5 h-4 w-4" /> Subscription Plan</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-1.5 h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">General Settings</CardTitle><CardDescription>Basic platform information.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Site Name</Label><Input value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Support Email</Label><Input value={settings.supportEmail} onChange={(e) => update('supportEmail', e.target.value)} /></div>
                <div><Label>From Email</Label><Input value={settings.fromEmail} onChange={(e) => update('fromEmail', e.target.value)} /></div>
              </div>
              <Separator />
              <div className="flex items-center justify-between"><div><Label className="text-sm">Enable Registration</Label><p className="text-xs text-muted-foreground">Allow new agencies to register</p></div><Switch checked={settings.enableRegistration} onCheckedChange={(v) => update('enableRegistration', v)} /></div>
              <div className="flex items-center justify-between"><div><Label className="text-sm">Require Admin Approval</Label><p className="text-xs text-muted-foreground">New registrations require admin approval</p></div><Switch checked={settings.requireApproval} onCheckedChange={(v) => update('requireApproval', v)} /></div>
              <div className="flex items-center justify-between"><div><Label className="text-sm">Maintenance Mode</Label><p className="text-xs text-muted-foreground">Disable public access to platform</p></div><Switch checked={settings.maintenanceMode} onCheckedChange={(v) => update('maintenanceMode', v)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Subscription Plan Configuration</CardTitle><CardDescription>Configure the premium subscription plan.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Plan Name</Label><Input value={settings.planName} onChange={(e) => update('planName', e.target.value)} /></div>
                <div><Label>Price (₹/yr)</Label><Input type="number" value={settings.planPrice} onChange={(e) => update('planPrice', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Max Jobs</Label><Input type="number" value={settings.planJobs} onChange={(e) => update('planJobs', e.target.value)} /></div>
                <div><Label>Max Candidates/mo</Label><Input type="number" value={settings.planCandidates} onChange={(e) => update('planCandidates', e.target.value)} /></div>
                <div><Label>Team Members</Label><Input type="number" value={settings.planTeamMembers} onChange={(e) => update('planTeamMembers', e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Notification Settings</CardTitle><CardDescription>Configure system notifications and alerts.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><div><Label className="text-sm">Enable Notifications</Label><p className="text-xs text-muted-foreground">Show notifications in admin panel</p></div><Switch checked={settings.enableNotifications} onCheckedChange={(v) => update('enableNotifications', v)} /></div>
              <div className="flex items-center justify-between"><div><Label className="text-sm">Email Alerts</Label><p className="text-xs text-muted-foreground">Send email notifications for important events</p></div><Switch checked={settings.enableEmailAlerts} onCheckedChange={(v) => update('enableEmailAlerts', v)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Security Settings</CardTitle><CardDescription>Manage security and access controls.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>JWT Secret Key</Label><Input type="password" value="********************************" readOnly className="font-mono" /></div>
              <div><Label>Session Timeout (minutes)</Label><Input type="number" defaultValue={60} /></div>
              <div className="flex items-center justify-between"><div><Label className="text-sm">Two-Factor Auth</Label><p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p></div><Switch /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={save}><Save className="mr-1.5 h-4 w-4" /> Save Settings</Button>
      </div>
    </div>
  )
}
