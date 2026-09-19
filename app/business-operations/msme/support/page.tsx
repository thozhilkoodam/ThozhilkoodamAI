'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  HeadphonesIcon,
  MessageCircle,
  Clock,
  CheckCircle2,
  Paperclip,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'

const tickets = [
  {
    id: 'TKT-001',
    subject: 'Question about quotation charges',
    status: 'open' as const,
    date: '20 Jun 2024',
    messages: [
      { from: 'client', text: 'I have a question about the service charges in the quotation.', time: '20 Jun 2024, 10:30 AM' },
      { from: 'admin', text: 'Sure, please let us know your specific query. The service charges cover the entire recruitment process including candidate screening and initial interviews.', time: '20 Jun 2024, 11:45 AM' },
    ],
  },
  {
    id: 'TKT-002',
    subject: 'Document verification status',
    status: 'resolved' as const,
    date: '18 Jun 2024',
    messages: [
      { from: 'client', text: 'Can you please update me on the GST certificate verification?', time: '18 Jun 2024, 9:15 AM' },
      { from: 'admin', text: 'Your GST certificate has been verified successfully.', time: '18 Jun 2024, 2:30 PM' },
      { from: 'client', text: 'Thank you for the update!', time: '18 Jun 2024, 3:00 PM' },
    ],
  },
  {
    id: 'TKT-003',
    subject: 'Change in requirement details',
    status: 'pending' as const,
    date: '15 Jun 2024',
    messages: [
      { from: 'client', text: 'I need to update the vacancy count for the React Developer position.', time: '15 Jun 2024, 4:20 PM' },
    ],
  },
]

export default function MSMESupportPage() {
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', attachment: null as File | null })
  const [replyText, setReplyText] = useState('')

  const handleSubmitTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast.error('Please fill in subject and message')
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    toast.success('Ticket raised successfully!')
    setShowNewTicket(false)
    setNewTicket({ subject: '', message: '', attachment: null })
  }

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return
    toast.success('Reply sent!')
    setReplyText('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="gap-1"><MessageCircle className="h-3 w-3" /> Open</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1"><CheckCircle2 className="h-3 w-3" /> Resolved</Badge>
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground">Raise queries and track support tickets.</p>
        </div>
        <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Raise Query
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Raise a Query</DialogTitle>
              <DialogDescription>Submit your query and our support team will get back to you.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief title of your query"
                />
              </div>
              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea
                  rows={5}
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe your query in detail..."
                />
              </div>
              <div className="space-y-2">
                <Label>Attachment (optional)</Label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-muted/50">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {newTicket.attachment ? newTicket.attachment.name : 'Attach a file'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setNewTicket({ ...newTicket, attachment: file })
                    }}
                  />
                </label>
              </div>
              <Button className="w-full gap-2" onClick={handleSubmitTicket} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-0">
              <button
                className="flex w-full items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HeadphonesIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{ticket.subject}</h4>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ticket.id} &middot; {ticket.date} &middot; {ticket.messages.length} message(s)
                    </p>
                  </div>
                </div>
                {expandedTicket === ticket.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {expandedTicket === ticket.id && (
                <div className="border-t px-4 py-4 space-y-4">
                  <div className="space-y-3">
                    {ticket.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.from === 'client'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.from === 'client' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {ticket.status !== 'resolved' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply(ticket.id)}
                      />
                      <Button size="icon" onClick={() => handleSendReply(ticket.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
