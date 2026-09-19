'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Phone, Mail, MessageSquare, Send, HeadphonesIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const contactMethods = [
  { icon: MessageCircle, label: 'WhatsApp', value: '+91 6374741641', action: 'https://wa.me/916374741641', color: 'bg-green-100 text-green-600' },
  { icon: Phone, label: 'Call', value: '+91 6374741641', action: 'tel:+916374741641', color: 'bg-blue-100 text-blue-600' },
  { icon: Mail, label: 'Email', value: 'sales@thozhilkoodam.com', action: 'mailto:sales@thozhilkoodam.com', color: 'bg-red-100 text-red-600' },
]

export default function ContactSalesPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Message sent! Our sales team will contact you shortly.')
    setForm({ name: '', email: '', company: '', message: '' })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <HeadphonesIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Contact Sales</h1>
        <p className="text-muted-foreground">Our sales team is here to help you.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {contactMethods.map((method) => (
          <a key={method.label} href={method.action} target="_blank" rel="noopener noreferrer">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${method.color}`}>
                  <method.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-semibold">{method.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{method.value}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
          <CardDescription>Fill out the form and we will get back to you within 24 hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Your company name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your requirements..." rows={4} required />
            </div>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
