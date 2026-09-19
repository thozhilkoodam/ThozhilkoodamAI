'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BrandLogo } from '@/components/brand-logo'
import { useState } from 'react'
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  FilePlus,
  Waypoints,
  FileText,
  HeadphonesIcon,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/business-operations/msme/dashboard' },
  { icon: Building2, label: 'Company Profile', href: '/business-operations/msme/profile' },
  { icon: ShieldCheck, label: 'Verification Documents', href: '/business-operations/msme/verification' },
  { icon: FilePlus, label: 'Post Requirement', href: '/business-operations/msme/requirements' },
  { icon: Waypoints, label: 'Requirement Tracker', href: '/business-operations/msme/tracker' },
  { icon: FileText, label: 'Quotation', href: '/business-operations/msme/quotation' },
  { icon: HeadphonesIcon, label: 'Support', href: '/business-operations/msme/support' },
  { icon: Calendar, label: 'Schedule Meeting', href: '/business-operations/msme/meetings' },
  { icon: CreditCard, label: 'Billing', href: '/business-operations/msme/billing' },
  { icon: Settings, label: 'Settings', href: '/business-operations/msme/settings' },
]

export function MSMESidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('thozhil_client_user')
    localStorage.removeItem('access_token')
    toast.success('Logged out successfully')
    router.push('/business-operations/msme/login')
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
          <Link href="/business-operations">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start gap-3 text-muted-foreground',
                collapsed ? 'justify-center px-2' : 'px-3'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              {!collapsed && <span>Back to Home</span>}
            </Button>
          </Link>
          <div className="border-t my-2" />
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
          <div className="px-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start gap-3 text-destructive hover:text-destructive',
                collapsed && 'justify-center px-2'
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </nav>
      </ScrollArea>
    </div>
  )
}
