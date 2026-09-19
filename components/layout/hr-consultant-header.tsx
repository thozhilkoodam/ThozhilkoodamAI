'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bell, Moon, Search, Sun, User, Settings, LogOut, CreditCard } from 'lucide-react'
import { useTheme } from 'next-themes'

const mockNotifications = [
  { id: 'n1', title: 'New candidate match', message: 'AI found 3 matching candidates for Senior React Developer', time: '5m ago', read: false },
  { id: 'n2', title: 'Interview reminder', message: 'Interview with Rahul Sharma at 3:00 PM today', time: '1h ago', read: false },
  { id: 'n3', title: 'Requirement assigned', message: 'New requirement: Full Stack Developer at TechCorp', time: '3h ago', read: true },
  { id: 'n4', title: 'Offer accepted', message: 'Priya Patel accepted the offer for UX Designer role', time: '1d ago', read: true },
]

export function HrConsultantHeader() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  const [user, setUser] = useState<Record<string, any>>({})

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    try {
      const stored = localStorage.getItem('thozhil_hr_consultant_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  const initials = user?.name?.split(' ').map((s: string) => s[0]).join('').toUpperCase() || 'HC'

  const handleLogout = () => {
    localStorage.removeItem('thozhil_hr_consultant_user')
    router.push('/business-operations/hr-consultant/login')
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates, requirements..."
            className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>

        {showNotifications && (
          <div className="absolute top-16 right-20 w-80 bg-card border border-border rounded-xl shadow-2xl z-50">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
              >
                Mark all read
              </button>
            </div>
            <ScrollArea className="max-h-72">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-2">
                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photo} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name || 'HR Recruiter'}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email || ''}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/business-operations/hr-consultant/profile')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/business-operations/hr-consultant/billing')}>
              <CreditCard className="mr-2 h-4 w-4" /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/business-operations/hr-consultant/settings')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
