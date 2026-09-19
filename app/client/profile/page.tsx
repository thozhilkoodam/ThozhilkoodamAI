'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Upload, Building2, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClientProfilePage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      toast.success('Logo uploaded successfully!')
    }
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
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-muted">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <label className="cursor-pointer">
              <Button variant="outline" type="button" className="gap-2">
                <Camera className="h-4 w-4" /> Upload Logo
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>

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
