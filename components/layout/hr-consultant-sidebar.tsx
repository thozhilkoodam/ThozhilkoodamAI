'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, UserCircle, ClipboardList, Users, Kanban,
  CalendarCheck, BarChart3, CreditCard, Zap, Settings,
  LogOut, Repeat, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'

const sidebarItems = [
  { label: 'Dashboard', href: '/business-operations/hr-consultant/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/business-operations/hr-consultant/profile', icon: UserCircle },
  { label: 'Requirements', href: '/business-operations/hr-consultant/requirements', icon: ClipboardList },
  { label: 'Candidate Database', href: '/business-operations/hr-consultant/candidates', icon: Users },
  { label: 'Candidate Pipeline', href: '/business-operations/hr-consultant/pipeline', icon: Kanban },
  { label: 'Interview Management', href: '/business-operations/hr-consultant/interviews', icon: CalendarCheck },
  { label: 'Reports & Analytics', href: '/business-operations/hr-consultant/reports', icon: BarChart3 },
  { label: 'Billing', href: '/business-operations/hr-consultant/billing', icon: CreditCard },
  { label: 'Upgrade Plan', href: '/business-operations/hr-consultant/upgrade-plans', icon: Zap },
  { label: 'Settings', href: '/business-operations/hr-consultant/settings', icon: Settings },
]

export function HrConsultantSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('thozhil_hr_consultant_user')
    router.push('/business-operations/hr-consultant/login')
  }

  return (
    <aside className={cn(
      'h-screen bg-card border-r border-border flex flex-col transition-all duration-300',
      collapsed ? 'w-[68px]' : 'w-64',
    )}>
      <div className={cn('p-4 border-b border-border flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <BrandLogo size="small" showTagline={false} href="/business-operations/hr-consultant/dashboard" />
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}>
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-2 border-t border-border space-y-1">
        <button
          onClick={() => router.push('/login')}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all w-full',
            collapsed && 'justify-center px-2',
          )}
        >
          <Repeat className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Switch to Candidate</span>}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all w-full',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
