'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  KanbanSquare,
  Calendar,
  BarChart3,
  CreditCard,
  UserPlus,
  Settings,
  Contact,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { useState } from 'react'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Job Posts', href: '/dashboard/job-post' },
  { icon: Users, label: 'Candidates', href: '/dashboard/candidates' },
  { icon: KanbanSquare, label: 'Hiring Pipeline', href: '/dashboard/hiring-pipeline' },
  { icon: Calendar, label: 'Interview Schedule', href: '/dashboard/interview-schedule' },
  { icon: BarChart3, label: 'Reports & Analytics', href: '/dashboard/reports' },
  { icon: CreditCard, label: 'Billing & Subscription', href: '/dashboard/billing' },
  { icon: UserPlus, label: 'Team Management', href: '/dashboard/team' },
  { icon: Contact, label: 'HR Recruiters', href: '/dashboard/hr-consultants' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

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
    </div>
  )
}
