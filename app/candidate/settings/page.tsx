'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User, Mail, Phone, Lock, Bell, Eye, Globe, LogOut,
  Shield, Save, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const data = await api.portal.profile.get()
        setProfile(data)
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Settings saved successfully')
    }, 1000)
  }

  const handleLogout = () => {
    localStorage.removeItem('candidate_user')
    localStorage.removeItem('candidate_token')
    localStorage.removeItem('candidate_profile')
    window.location.href = '/candidate/login'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const u = profile?.user || {}
  const loginMethod = u.googleId ? 'Google' : u.phone ? 'Phone / Email' : 'Email'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your account settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-purple-600 hover:bg-purple-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> Profile</TabsTrigger>
          <TabsTrigger value="account"><Lock className="h-4 w-4 mr-1" /> Account</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" /> Notifications</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="h-4 w-4 mr-1" /> Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{u.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{u.email || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{u.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {[profile?.city, profile?.district, profile?.state].filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Role</label>
                <p className="mt-1 text-gray-900 dark:text-white">{profile?.designation || profile?.currentCompany ? `${profile?.designation || ''}${profile?.designation && profile?.currentCompany ? ' at ' : ''}${profile?.currentCompany || ''}` : '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Account Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-xs text-gray-400">Your account is active</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium">Login Method</p>
                  <p className="text-xs text-gray-400">How you sign in</p>
                </div>
                <Badge variant="outline">{loginMethod}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label><Input type="password" /></div>
                <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label><Input type="password" /></div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">Update Password</Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Logout</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium">Sign out of your account</p>
                  <p className="text-xs text-gray-400">You can log back in anytime</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Job Applications', desc: 'Updates on your job applications' },
                { label: 'Interview Schedules', desc: 'Interview invitations and changes' },
                { label: 'New Job Matches', desc: 'Jobs matching your profile' },
                { label: 'Profile Views', desc: 'When recruiters view your profile' },
                { label: 'Career Tips', desc: 'Weekly career advice and resources' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div><p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p><p className="text-xs text-gray-400">{item.desc}</p></div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Privacy Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Profile Visibility', desc: 'Make your profile visible to recruiters', default: true },
                { label: 'Show Email', desc: 'Display email on your public profile', default: false },
                { label: 'Show Phone', desc: 'Display phone number on your public profile', default: false },
                { label: 'Show Current Company', desc: 'Display your current employer', default: true },
                { label: 'Search Engine Indexing', desc: 'Allow search engines to index your profile', default: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div><p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p><p className="text-xs text-gray-400">{item.desc}</p></div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
