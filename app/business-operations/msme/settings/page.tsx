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
  CreditCard, Users, HeadphonesIcon, AlertTriangle,
  Save, Upload, CheckCircle, Loader2, ChevronRight,
  Smartphone, Globe, XCircle, Calendar, FileText,
  Download, MapPin, Building,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'company', label: 'Company Information', icon: Building2 },
  { id: 'preferences', label: 'Hiring Preferences', icon: Briefcase },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'support', label: 'Support', icon: HeadphonesIcon },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

export default function MSMESettingsPage() {
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
          <p className="text-muted-foreground">Manage your company settings and preferences</p>
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
                  <Label>Owner Name</Label>
                  <Input defaultValue="Rajesh Kumar" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="owner@company.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 9876543210" />
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
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave('account')} disabled={saving === 'account'}>
                {saving === 'account' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card id="company" ref={(el) => { sectionRefs.current.company = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Company Information</CardTitle>
              <CardDescription>Manage your company profile and documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <label className="cursor-pointer">
                  <Button variant="outline" type="button"><Upload className="mr-2 h-4 w-4" /> Upload Logo</Button>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="ABC Manufacturing Pvt Ltd" />
                </div>
                <div className="space-y-2">
                  <Label>MSME Registration Number</Label>
                  <Input defaultValue="MSME-2024-00421" />
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
                  <Input defaultValue="https://abcmfg.com" />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Manufacturing</option>
                    <option>IT Services</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Retail</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Employee Count</Label>
                  <Input type="number" defaultValue="150" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Company Address</Label>
                  <Input defaultValue="456, Industrial Estate, Coimbatore, Tamil Nadu" />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Documents</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Incorporation Certificate</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF up to 5MB</p>
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
              <Button onClick={() => handleSave('company')} disabled={saving === 'company'}>
                {saving === 'company' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Hiring Preferences */}
          <Card id="preferences" ref={(el) => { sectionRefs.current.preferences = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Hiring Preferences</CardTitle>
              <CardDescription>Configure your hiring workflow defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Hiring Location</Label>
                  <Input defaultValue="Coimbatore" />
                </div>
                <div className="space-y-2">
                  <Label>Interview Type</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>In-Person</option>
                    <option>Video Call</option>
                    <option>Phone Screen</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Salary Currency</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Recruiter</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option>Auto Assign</option>
                    <option>Specific Recruiter</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Hiring Manager</Label>
                  <Input defaultValue="Rajesh Kumar" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Job Approval Workflow</p>
                    <p className="text-xs text-muted-foreground">Require approval before posting jobs</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Candidate Visibility</p>
                    <p className="text-xs text-muted-foreground">Allow team members to view all candidates</p>
                  </div>
                  <Switch defaultChecked />
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
                { label: 'Email', desc: 'Receive email notifications' },
                { label: 'SMS', desc: 'Receive SMS notifications' },
                { label: 'WhatsApp', desc: 'Receive WhatsApp notifications' },
                { label: 'Interview Alerts', desc: 'Get notified about interview schedules' },
                { label: 'Job Approval Alerts', desc: 'Get notified when jobs need approval' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
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
                { label: 'Company Visibility', desc: 'Make your company profile visible to recruiters' },
                { label: 'Hide Company Details', desc: 'Hide sensitive company information' },
                { label: 'Candidate Access', desc: 'Allow recruiters to access your candidate data' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.label !== 'Hide Company Details'} />
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

          {/* Billing */}
          <Card id="billing" ref={(el) => { sectionRefs.current.billing = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Billing</CardTitle>
              <CardDescription>Manage payments and subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-bold mt-1">Premium Recruitment Plan</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-3">Invoices</h4>
                  <div className="space-y-2">
                    {['15 Jul 2026', '15 Jun 2026', '15 May 2026'].map((date) => (
                      <div key={date} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{date}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">₹2,999</span>
                          <Download className="h-3 w-3 text-muted-foreground cursor-pointer" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-3">Payments</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>July 2026</span>
                      <Badge variant="success">Paid</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>June 2026</span>
                      <Badge variant="success">Paid</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>May 2026</span>
                      <Badge variant="success">Paid</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Button><CreditCard className="h-4 w-4 mr-2" /> Renew Subscription</Button>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card id="team" ref={(el) => { sectionRefs.current.team = el }} className="scroll-mt-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Team Members</CardTitle>
              <CardDescription>Manage your team members and their roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  { name: 'Rajesh Kumar', role: 'Owner', email: 'owner@company.com', status: 'Active' },
                  { name: 'Priya Sharma', role: 'HR Manager', email: 'hr@company.com', status: 'Active' },
                  { name: 'Amit Patel', role: 'Hiring Manager', email: 'amit@company.com', status: 'Active' },
                ].map((member) => (
                  <div key={member.email} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email} &middot; {member.role}</p>
                      </div>
                    </div>
                    <Badge variant="success">{member.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button><User className="h-4 w-4 mr-2" /> Invite Member</Button>
                <div className="rounded-lg border p-3 flex-1">
                  <p className="text-xs text-muted-foreground">Permissions</p>
                  <p className="text-sm font-medium mt-1">Owner · HR Manager · Hiring Manager</p>
                </div>
              </div>
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
                { title: 'Raise Query', desc: 'Submit a query to our support team', icon: FileText },
                { title: 'Schedule Meeting', desc: 'Book a call with our team', icon: HeadphonesIcon },
                { title: 'Help Center', desc: 'Browse guides and documentation', icon: FileText },
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
              <CardDescription>Irreversible actions for your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="text-sm font-medium">Deactivate Company</p>
                  <p className="text-xs text-muted-foreground">Temporarily deactivate your company account</p>
                </div>
                <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                  Deactivate
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="text-sm font-medium">Delete Company</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your company and all data</p>
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
