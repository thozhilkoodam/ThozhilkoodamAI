'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
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
  Link2,
  Settings,
  LogOut,
  Menu,
  X,
  HeadphonesIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'

const notifications = [
  { id: 1, title: 'New applicant', message: 'John Doe applied for Senior Developer', time: '2 min ago' },
  { id: 2, title: 'Interview reminder', message: 'Interview with Sarah Smith at 3 PM', time: '1 hour ago' },
  { id: 3, title: 'Offer accepted', message: 'Mike Johnson accepted your offer', time: '3 hours ago' },
]

interface DashboardHeaderProps {
  onMenuToggle?: () => void
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search jobs, candidates, interviews..." className="pl-10 h-9" />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-2 text-primary border-primary/30 hover:bg-primary/5"
          onClick={() => router.push('/dashboard/contact-sales')}
        >
          <HeadphonesIcon className="h-4 w-4" /> Contact Sales
        </Button>

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
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm">{user?.name || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <span className="text-xs text-muted-foreground">ID: {user?.companyId}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link2 className="mr-2 h-4 w-4" /> Connected Accounts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowNotifications(true)}>
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
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
