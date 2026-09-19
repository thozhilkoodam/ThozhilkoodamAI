'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Search,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'

const notifications = [
  { id: 1, title: 'Quotation sent', message: 'Your quotation for React Developer is ready', time: '10 min ago' },
  { id: 2, title: 'Verification update', message: 'Your GST certificate has been verified', time: '1 hour ago' },
  { id: 3, title: 'Meeting reminder', message: 'Scheduled call with recruiter at 3 PM', time: '2 hours ago' },
]

interface ClientHeaderProps {
  onMenuToggle?: () => void
}

export function ClientHeader({ onMenuToggle }: ClientHeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)

  const getClientUser = () => {
    try {
      const stored = localStorage.getItem('thozhil_client_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  const user = getClientUser()

  const handleLogout = () => {
    localStorage.removeItem('thozhil_client_user')
    localStorage.removeItem('access_token')
    toast.success('Logged out successfully')
    router.push('/client/login')
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search requirements, quotations..." className="pl-10 h-9" />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start py-2">
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-sm">{n.title}</span>
                  <Badge variant="outline" className="text-xs">{n.time}</Badge>
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">{n.message}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.logo} />
                <AvatarFallback className="text-xs">
                  {user?.companyName?.charAt(0) || user?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm">{user?.companyName || user?.name || 'Client'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.companyName || user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/client/profile')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowNotifications(true)}>
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/client/settings')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
