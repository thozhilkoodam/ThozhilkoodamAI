'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User, Building2, Briefcase, Bell, Eye, Shield, Key,
  Activity, CreditCard, HeadphonesIcon, AlertTriangle,
  Save, Upload, CheckCircle, Loader2, ChevronRight,
  Smartphone, Globe, XCircle, Calendar, FileText,
  Download, MapPin, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'preferences', label: 'Professional Preferences', icon: Briefcase },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'activity', label: 'Activity Logs', icon: Activity },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'support', label: 'Support', icon: HeadphonesIcon },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

export default function HrConsultantSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('account')
  const [mobileNav, setMobileNav] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })
    return () => observer.disconnect()
  }, [loading])

  const scrollTo = (id: string) => {
    setActiveSection(id)
    setMobileNav(false)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSave = (section: string) => {
    setSaving(section)
    setTimeout(() => {
      setSaving(null)
      toast.success('Settings saved successfully!')
    }, 800)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        <div className="flex gap-6">
          <div className="hidden lg:block w-56 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="flex-1 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button variant="outline" className="lg:hidden" onClick={() => setMobileNav(!mobileNav)}>
          <ChevronRight className="h-4 w-4 mr-2" /> Menu
        </Button>
      </div>

      <div className="flex gap-6 relative">
        <aside className={cn(
          'w-56 shrink-0',
          mobileNav
            ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur flex lg:relative lg:inset-auto lg:z-auto'
            : 'hidden lg:block'
        )}>
          <div className="lg:sticky lg:top-6 space-y-1">
            <div className="flex items-center justify-between lg:hidden p-4 border-b">
              <span className="font-semibold">Navigation</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileNav(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                      activeSection === item.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <div className="flex-1 space-y-6 min-w-0">
          {/* Account */}
          <Card id="account" ref={(el) => { sectionRefs.current.account = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Account</CardTitle>
              <CardDescription>Manage your personal account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <label className="cursor-pointer">
                  <Button variant="outline" type="button"><Upload className="mr-2 h-4 w-4" /> Upload Photo</Button>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="text-sm font-medium">HRC-0042</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Priya Sharma" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="priya@agency.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input defaultValue="Human Resources" />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input defaultValue="Senior HR Consultant" />
                </div>
                <div className="space-y-2">
                  <Label>Reporting Manager</Label>
                  <Input defaultValue="Rajesh Kumar" />
                </div>
                <div className="space-y-2">
                  <Label>Hiring Manager</Label>
                  <Input defaultValue="Amit Patel" />
                </div>
              </div>
              <Button onClick={() => handleSave('account')} disabled={saving === 'account'}>
                {saving === 'account' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Company */}
          <Card id="company" ref={(el) => { sectionRefs.current.company = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Company</CardTitle>
              <CardDescription>Your company affiliation details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Agency Name</Label>
                  <Input defaultValue="Thozhil Recruitment Agency" disabled />
                  <p className="text-xs text-muted-foreground">Managed by agency admin</p>
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Input defaultValue="Chennai - HQ" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Human Resources</option>
                    <option>Talent Acquisition</option>
                    <option>Operations</option>
                    <option>Administration</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Team</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Tech Recruitment</option>
                    <option>Non-Tech Recruitment</option>
                    <option>Executive Search</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Manager</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Rajesh Kumar</option>
                    <option>Anita Desai</option>
                    <option>Vikram Singh</option>
                  </select>
                </div>
              </div>
              <Button onClick={() => handleSave('company')} disabled={saving === 'company'}>
                {saving === 'company' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Professional Preferences */}
          <Card id="preferences" ref={(el) => { sectionRefs.current.preferences = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Professional Preferences</CardTitle>
              <CardDescription>Configure your recruitment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Preferred Industries</Label>
                  <Input defaultValue="IT, Healthcare, Finance" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Job Roles</Label>
                  <Input defaultValue="Software Engineer, Data Analyst, HR Manager" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Locations</Label>
                  <Input defaultValue="Chennai, Bangalore, Hyderabad" />
                </div>
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <Input defaultValue="English, Tamil, Hindi" />
                </div>
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <Input defaultValue="Screening, Interviewing, Negotiation" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Resume Visibility</p>
                    <p className="text-xs text-muted-foreground">Control who can see your uploaded resumes</p>
                  </div>
                  <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>All Team Members</option>
                    <option>Only Managers</option>
                    <option>Only Me</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Availability Status</p>
                    <p className="text-xs text-muted-foreground">Show your current availability</p>
                  </div>
                  <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Available</option>
                    <option>Busy</option>
                    <option>On Leave</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto Accept Assignments</p>
                    <p className="text-xs text-muted-foreground">Automatically accept new requirement assignments</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <Button onClick={() => handleSave('preferences')} disabled={saving === 'preferences'}>
                {saving === 'preferences' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card id="notifications" ref={(el) => { sectionRefs.current.notifications = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</CardTitle>
              <CardDescription>Choose how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Candidate Assignment', desc: 'When a new candidate is assigned to you', channel: 'email' },
                { label: 'Interview Schedule', desc: 'When interviews are scheduled or changed', channel: 'email' },
                { label: 'Pipeline Updates', desc: 'When candidates move pipeline stages', channel: 'email' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Channels</h4>
                {[
                  { label: 'Email', desc: 'Receive via email' },
                  { label: 'SMS', desc: 'Receive via text message' },
                  { label: 'WhatsApp', desc: 'Receive via WhatsApp' },
                  { label: 'Browser', desc: 'Receive in-browser notifications' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
              <Button onClick={() => handleSave('notifications')} disabled={saving === 'notifications'}>
                {saving === 'notifications' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card id="privacy" ref={(el) => { sectionRefs.current.privacy = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> Privacy</CardTitle>
              <CardDescription>Manage your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Resume Visibility', desc: 'Make your uploaded resumes visible to the agency' },
                { label: 'Hide Contact Details', desc: 'Hide your phone and email from candidates' },
                { label: 'Candidate Visibility', desc: 'Allow candidates to see your profile' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.label !== 'Hide Contact Details'} />
                </div>
              ))}
              <Button onClick={() => handleSave('privacy')} disabled={saving === 'privacy'}>
                {saving === 'privacy' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card id="security" ref={(el) => { sectionRefs.current.security = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" />
                </div>
              </div>
              <Button size="sm">Update Password</Button>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Active Sessions</p>
                    <p className="text-xs text-muted-foreground">2 active sessions</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Trusted Devices</p>
                    <p className="text-xs text-muted-foreground">3 trusted devices</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card id="activity" ref={(el) => { sectionRefs.current.activity = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Activity Logs</CardTitle>
              <CardDescription>Track your account activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Assignments', desc: 'Requirements assigned to you', count: 34 },
                { title: 'Candidate Activity', desc: 'Interactions with candidates', count: 89 },
                { title: 'Login History', desc: 'Your login sessions', count: 42 },
              ].map((log) => (
                <div key={log.title} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{log.title}</p>
                    <p className="text-xs text-muted-foreground">{log.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{log.count} entries</Badge>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Billing */}
          <Card id="billing" ref={(el) => { sectionRefs.current.billing = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Billing</CardTitle>
              <CardDescription>View billing and subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-bold mt-1">Professional - ₹499 / 15 Days</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Recent Invoices</h4>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Download className="h-3 w-3 mr-1" /> All Invoices
                  </Button>
                </div>
                <div className="space-y-2">
                  {['15 Jul 2026', '30 Jun 2026', '15 Jun 2026'].map((date) => (
                    <div key={date} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{date}</span>
                      <span className="font-medium">₹588.82</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button><CreditCard className="h-4 w-4 mr-2" /> Upgrade Plan</Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card id="support" ref={(el) => { sectionRefs.current.support = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HeadphonesIcon className="h-5 w-5 text-primary" /> Support</CardTitle>
              <CardDescription>Get help when you need it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Create Ticket', desc: 'Submit a support request', icon: FileText },
                { title: 'Help Center', desc: 'Browse guides and FAQs', icon: HeadphonesIcon },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Open</Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card id="danger" ref={(el) => { sectionRefs.current.danger = el }} className="scroll-mt-20 border-destructive/20 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="text-sm font-medium">Deactivate Account</p>
                  <p className="text-xs text-muted-foreground">Temporarily disable your account</p>
                </div>
                <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                  Deactivate
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
