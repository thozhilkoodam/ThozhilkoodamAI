'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User, Building2, CreditCard, Briefcase, Bell, Shield, Key,
  Users, FileText, Link2, Activity, HeadphonesIcon, AlertTriangle,
  Save, Upload, Eye, EyeOff, Copy, CheckCircle, XCircle,
  Loader2, ChevronRight, Smartphone, Globe, Clock, Calendar,
  Download, MapPin, Building, Pencil, Trash2, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'agency', label: 'Agency Information', icon: Building2 },
  { id: 'subscription', label: 'Subscription & Usage', icon: CreditCard },
  { id: 'preferences', label: 'Recruitment Preferences', icon: Briefcase },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'team', label: 'Team Management', icon: Users },
  { id: 'billing', label: 'Billing', icon: FileText },
  { id: 'integrations', label: 'API & Integrations', icon: Link2 },
  { id: 'activity', label: 'Activity Logs', icon: Activity },
  { id: 'support', label: 'Support', icon: HeadphonesIcon },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

export default function RecruitmentAgencySettingsPage() {
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
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
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
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`)
    }, 800)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        <div className="flex gap-6">
          <div className="hidden lg:block w-56 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
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
          <p className="text-muted-foreground">Manage your agency settings and preferences</p>
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
              <CardDescription>Manage your personal account details</CardDescription>
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
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Agency Owner Name</Label>
                  <Input defaultValue="Rajesh Kumar" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue="rajesh@agency.com" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input defaultValue="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input defaultValue="Managing Director" />
                </div>
                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <Input value="14 Jul 2026, 09:30 AM" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email Verification</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Verification</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave('account')} disabled={saving === 'account'}>
                {saving === 'account' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Agency Information */}
          <Card id="agency" ref={(el) => { sectionRefs.current.agency = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Agency Information</CardTitle>
              <CardDescription>Manage your agency profile and documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Agency Name</Label>
                  <Input defaultValue="Thozhil Recruitment Agency" />
                </div>
                <div className="space-y-2">
                  <Label>Agency ID</Label>
                  <Input value="KIKTK000001" disabled />
                  <p className="text-xs text-muted-foreground">Agency ID cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input defaultValue="RGTN-2024-00421" />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input defaultValue="33AABCU9603R1ZW" />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input defaultValue="AABCU9603R" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input defaultValue="https://thozhilagency.com" />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input defaultValue="Recruitment & Staffing" />
                </div>
                <div className="space-y-2">
                  <Label>Number of Employees</Label>
                  <Input type="number" defaultValue="25" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Company Address</Label>
                  <Textarea defaultValue="123, Anna Nagar, Chennai" />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input defaultValue="Chennai" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input defaultValue="Tamil Nadu" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input defaultValue="India" />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Uploads</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Agency Logo</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                    <Button variant="outline" size="sm" className="mt-2">Upload</Button>
                  </div>
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Business License</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF up to 5MB</p>
                    <Button variant="outline" size="sm" className="mt-2">Upload</Button>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave('agency')} disabled={saving === 'agency'}>
                {saving === 'agency' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Subscription & Usage */}
          <Card id="subscription" ref={(el) => { sectionRefs.current.subscription = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Subscription & Usage</CardTitle>
              <CardDescription>View your current plan and usage statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-bold mt-1">Professional</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Plan Expiry</p>
                  <p className="text-lg font-bold mt-1 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    15 Aug 2026
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Remaining Job Posts</p>
                  <p className="text-lg font-bold mt-1">12 / 50</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Resume Search Credits</p>
                  <p className="text-lg font-bold mt-1">145 / 500</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Candidate Database</p>
                  <p className="text-lg font-bold mt-1">320 / 1,500</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Current Storage</p>
                  <p className="text-lg font-bold mt-1">2.4 GB / 10 GB</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Invoices</p>
                  <div className="flex gap-1 mt-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Download className="h-3 w-3" /> View All
                    </Button>
                  </div>
                </div>
              </div>
              <Button><CreditCard className="h-4 w-4 mr-2" /> Upgrade Plan</Button>
            </CardContent>
          </Card>

          {/* Recruitment Preferences */}
          <Card id="preferences" ref={(el) => { sectionRefs.current.preferences = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Recruitment Preferences</CardTitle>
              <CardDescription>Configure your recruitment workflow defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Hiring Manager</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Select hiring manager</option>
                    <option>Rajesh Kumar</option>
                    <option>Priya Sharma</option>
                    <option>Amit Patel</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Recruiter</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Select recruiter</option>
                    <option>Self</option>
                    <option>Team Member</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Interview Type</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>In-Person</option>
                    <option>Video Call</option>
                    <option>Phone Screen</option>
                    <option>Technical Test</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Candidate Stage</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Sourced</option>
                    <option>Screening</option>
                    <option>Interview</option>
                    <option>Offer</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto Assign Recruiters</p>
                  <p className="text-xs text-muted-foreground">Automatically assign recruiters to new requirements</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Email Template</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Standard Template</option>
                    <option>Professional Template</option>
                    <option>Custom Template</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Offer Letter Template</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Standard Offer</option>
                    <option>Executive Offer</option>
                    <option>Custom Offer</option>
                  </select>
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
                { label: 'Email Alerts', desc: 'Receive email notifications for updates' },
                { label: 'SMS Alerts', desc: 'Get SMS notifications for urgent updates' },
                { label: 'WhatsApp Alerts', desc: 'Receive notifications via WhatsApp' },
                { label: 'Browser Notifications', desc: 'Get real-time browser notifications' },
                { label: 'Weekly Reports', desc: 'Receive weekly recruitment summary' },
                { label: 'Marketing Emails', desc: 'Product updates and promotional offers' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.label !== 'Marketing Emails'} />
                </div>
              ))}
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
                { label: 'Profile Visibility', desc: 'Make your agency profile visible to clients' },
                { label: 'Candidate Data Access', desc: 'Allow team members to access candidate data' },
                { label: 'Hide Agency Logo', desc: 'Hide your logo from public listings' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.label !== 'Hide Agency Logo'} />
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
              <CardDescription>Manage account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div />
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
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
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
                    <p className="text-sm font-medium">Active Login Sessions</p>
                    <p className="text-xs text-muted-foreground">3 active sessions</p>
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
                    <p className="text-xs text-muted-foreground">5 trusted devices</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <Button onClick={() => handleSave('security')} disabled={saving === 'security'}>
                {saving === 'security' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Update Security
              </Button>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card id="team" ref={(el) => { sectionRefs.current.team = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Team Management</CardTitle>
              <CardDescription>Manage your team members and roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  { role: 'Recruiters', count: 8, color: 'bg-blue-100 text-blue-700' },
                  { role: 'HR Consultants', count: 3, color: 'bg-purple-100 text-purple-700' },
                  { role: 'Roles', count: 5, color: 'bg-green-100 text-green-700' },
                  { role: 'Permissions', count: 12, color: 'bg-amber-100 text-amber-700' },
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium text-sm">{item.role}</span>
                    <Badge className={item.color}>{item.count}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button><Plus className="h-4 w-4 mr-2" /> Invite Team Member</Button>
                <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Member
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing */}
          <Card id="billing" ref={(el) => { sectionRefs.current.billing = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Billing</CardTitle>
              <CardDescription>Manage payments, invoices, and subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {['15 Jun 2026', '15 May 2026', '15 Apr 2026'].map((date) => (
                      <div key={date} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{date}</span>
                        <span className="font-medium">₹588.82</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">View All</Button>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-3">Payment Methods</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Credit Card (•••• 4242)</span>
                      <Badge variant="success">Default</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>UPI (rajesh@upi)</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">Set Default</Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">Add Method</Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><Download className="h-4 w-4 mr-2" /> GST Invoice</Button>
                <Button variant="outline"><CreditCard className="h-4 w-4 mr-2" /> Manage Subscription</Button>
              </div>
            </CardContent>
          </Card>

          {/* API & Integrations */}
          <Card id="integrations" ref={(el) => { sectionRefs.current.integrations = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-primary" /> API & Integrations</CardTitle>
              <CardDescription>Manage API keys and third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">API Key</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">tk_live_••••••••••••••••</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Webhook URL</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">https://api.agency.com/webhook</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">Test</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Connected Apps</h4>
                {[
                  { name: 'Google Calendar', connected: true },
                  { name: 'Microsoft Outlook', connected: true },
                  { name: 'Zoom', connected: false },
                  { name: 'Google Meet', connected: true },
                ].map((app) => (
                  <div key={app.name} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{app.name}</span>
                    <Badge variant={app.connected ? 'success' : 'secondary'}>
                      {app.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button onClick={() => handleSave('integrations')} disabled={saving === 'integrations'}>
                {saving === 'integrations' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card id="activity" ref={(el) => { sectionRefs.current.activity = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Activity Logs</CardTitle>
              <CardDescription>Track all activities across your agency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Login History', desc: 'Track all login attempts and sessions', count: 47 },
                { title: 'Recruitment Activities', desc: 'Candidate applications, interviews, offers', count: 128 },
                { title: 'Audit Logs', desc: 'Configuration changes and admin actions', count: 23 },
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

          {/* Support */}
          <Card id="support" ref={(el) => { sectionRefs.current.support = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HeadphonesIcon className="h-5 w-5 text-primary" /> Support</CardTitle>
              <CardDescription>Get help when you need it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Raise Ticket', desc: 'Create a new support ticket', icon: FileText },
                { title: 'Live Chat', desc: 'Chat with our support team', icon: HeadphonesIcon },
                { title: 'Knowledge Base', desc: 'Browse help articles and guides', icon: FileText },
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
              <CardDescription>Irreversible actions for your agency account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="text-sm font-medium">Deactivate Agency</p>
                  <p className="text-xs text-muted-foreground">Temporarily disable your agency account</p>
                </div>
                <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                  Deactivate
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="text-sm font-medium">Delete Agency</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your agency and all data</p>
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
