'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Building2, Save, CheckCircle2, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MSMEProfilePage() {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    companyName: 'Demo Enterprises Pvt Ltd',
    gst: '33ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    address: '123, Anna Salai, Chennai - 600002',
    phone: '+91 9876543210',
    email: 'contact@demoenterprises.com',
    website: 'www.demoenterprises.com',
    industry: '',
    employeeCount: '',
  })

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
    toast.success('Company profile saved successfully!')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">Manage your company information and details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Update your company details for verification and communication.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input
                value={form.companyName}
                onChange={(e) => updateForm('companyName', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input
                value={form.gst}
                onChange={(e) => updateForm('gst', e.target.value)}
                placeholder="33ABCDE1234F1Z5"
              />
            </div>
            <div className="space-y-2">
              <Label>PAN Number</Label>
              <Input
                value={form.pan}
                onChange={(e) => updateForm('pan', e.target.value)}
                placeholder="ABCDE1234F"
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(v) => updateForm('industry', v)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {['Information Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Retail', 'Construction', 'Hospitality', 'Automotive', 'Other'].map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employee Count</Label>
              <Select value={form.employeeCount} onValueChange={(v) => updateForm('employeeCount', v)}>
                <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                <SelectContent>
                  {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map((r) => (
                    <SelectItem key={r} value={r}>{r} employees</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => updateForm('website', e.target.value)}
                placeholder="www.company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Registered Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              placeholder="Enter your registered business address"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
