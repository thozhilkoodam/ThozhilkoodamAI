'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  UserCog,
  TrendingUp,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Briefcase,
  Clock,
  Archive,
  Calendar,
  MessageSquare,
  Mail,
  FileSpreadsheet,
  Star,
  Database,
  Building,
  GraduationCap,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { useState } from 'react'

const sidebarSections = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    ],
  },
  {
    label: 'Business Management',
    items: [
      { icon: Building2, label: 'Recruitment Agencies', href: '/admin/agencies' },
      { icon: Building2, label: 'MSME Clients', href: '/admin/msme-clients' },
      { icon: Users, label: 'All HR Recruiters', href: '/admin/hr-recruiters' },
      { icon: UserPlus, label: 'Pending Approvals', href: '/admin/hr-recruiters/pending' },
      { icon: UserCheck, label: 'Active', href: '/admin/hr-recruiters/active' },
      { icon: UserX, label: 'Suspended', href: '/admin/hr-recruiters/suspended' },
      { icon: TrendingUp, label: 'Performance', href: '/admin/hr-recruiters/performance' },
    ],
  },
  {
    label: 'Hiring Operations',
    items: [
      { icon: ClipboardCheck, label: 'Pending Job Posting', href: '/admin/jobs/pending', badge: 'NEW' },
      { icon: CheckCircle, label: 'Published Jobs', href: '/admin/jobs/published' },
      { icon: XCircle, label: 'Rejected Jobs', href: '/admin/jobs/rejected' },
      { icon: Clock, label: 'Expired Jobs', href: '/admin/jobs/expired' },
      { icon: Archive, label: 'Archived Jobs', href: '/admin/jobs/archived' },
      { icon: Briefcase, label: 'Requirements CRM', href: '/admin/requirements' },
      { icon: Users, label: 'Candidate Management', href: '/admin/candidates' },
      { icon: Calendar, label: 'Interview Management', href: '/admin/interviews' },
      { icon: Star, label: 'Placement Management', href: '/admin/placements' },
    ],
  },
  {
    label: 'Management',
    items: [
      { icon: UserCog, label: 'User Management', href: '/admin/users' },
      { icon: Building, label: 'College Management', href: '/admin/colleges' },
      { icon: GraduationCap, label: 'University Management', href: '/admin/universities' },
      { icon: Database, label: 'Master Data', href: '/admin/master-data' },
      { icon: CreditCard, label: 'Subscription Management', href: '/admin/subscriptions' },
      { icon: FileText, label: 'Payment Management', href: '/admin/payments' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { icon: BarChart3, label: 'Reports & Analytics', href: '/admin/reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
      { icon: Mail, label: 'Email Templates', href: '/admin/email-templates' },
      { icon: MessageSquare, label: 'SMS Templates', href: '/admin/sms-templates' },
      { icon: Settings, label: 'Platform Settings', href: '/admin/settings' },
      { icon: Shield, label: 'Audit Logs', href: '/admin/audit-logs' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActiveRoute = (href: string) => {
    if (href === '/admin/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300 h-full',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && <BrandLogo size="small" variant="admin" showTagline={false} />}
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
        {sidebarSections.map((section) => (
          <div key={section.label} className="px-3 py-1">
            {!collapsed && (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = isActiveRoute(item.href)
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'w-full justify-start gap-3',
                        collapsed ? 'justify-center px-2' : 'px-3',
                        isActive && 'bg-primary/10 text-primary'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4', isActive ? 'text-primary' : '')} />
                      {!collapsed && (
                        <span className="flex-1 text-left truncate">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
