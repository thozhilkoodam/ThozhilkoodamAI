'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Phone, Mail, MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const contactOptions = [
  { icon: MessageCircle, label: 'WhatsApp', action: 'https://wa.me/918000123456', color: 'hover:bg-green-100 hover:text-green-600' },
  { icon: Phone, label: 'Call', action: 'tel:+9118001234567', color: 'hover:bg-blue-100 hover:text-blue-600' },
  { icon: Mail, label: 'Email', action: 'mailto:sales@thozhilkoodam.com', color: 'hover:bg-red-100 hover:text-red-600' },
  { icon: MessageSquare, label: 'Live Chat', action: '#', color: 'hover:bg-purple-100 hover:text-purple-600' },
]

export function ContactSalesFloat() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <Card className="mb-4 w-72 shadow-xl animate-in slide-in-from-bottom-5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Contact Sales</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {contactOptions.map((option) => (
              <a
                key={option.label}
                href={option.action}
                target={option.label === 'Live Chat' ? '_self' : '_blank'}
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  className={cn('w-full justify-start gap-3', option.color)}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </Button>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
