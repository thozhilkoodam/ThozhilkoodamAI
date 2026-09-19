'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  KanbanSquare,
  Calendar,
  BarChart3,
  CreditCard,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Briefcase,
  FileText,
  Bell,
  Repeat,
  UserCheck,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { useState } from 'react'
import toast from 'react-hot-toast'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/hr/dashboard' },
  { icon: ClipboardList, label: 'Job Requirements', href: '/hr/requirements' },
  { icon: FileText, label: 'Job Posting', href: '/hr/job-post' },
  { icon: Users, label: 'Candidate Database', href: '/hr/candidates' },
  { icon: KanbanSquare, label: 'Pipeline', href: '/hr/pipeline' },
  { icon: Calendar, label: 'Interviews', href: '/hr/interviews' },
  { icon: UserCheck, label: 'Onboarding', href: '/hr/onboarding' },
  { icon: BarChart3, label: 'Reports', href: '/hr/reports' },
  { icon: CreditCard, label: 'Billing', href: '/hr/billing' },
  { icon: Bell, label: 'Notifications', href: '/hr/notifications' },
  { icon: UserCircle, label: 'Profile', href: '/hr/profile' },
  { icon: Settings, label: 'Settings', href: '/hr/settings' },
]

export function HrSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('thozhil_hr_user')
    toast.success('Logged out successfully')
    router.push('/hr/login')
  }

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && <BrandLogo size="small" showTagline={false} />}
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto h-7 w-7', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-3',
                    collapsed ? 'justify-center px-2' : 'px-3'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', isActive ? 'text-primary' : '')} />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-2 space-y-1">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'w-full justify-start gap-3 border-primary/20 text-primary hover:bg-primary/5',
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
          onClick={() => router.push('/login')}
        >
          <Repeat className="h-4 w-4" />
          {!collapsed && <span>Switch to Candidate</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-start gap-3 text-destructive hover:text-destructive',
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
