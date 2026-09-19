'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, User, Search, FileText, Bell, Settings, LogOut,
  Briefcase, ChevronLeft, Heart, Clock, Calendar,
  Award, BookOpen, UserCheck,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/candidate', icon: LayoutDashboard },
  { label: 'My Profile', href: '/candidate/profile', icon: User },
  { label: 'Browse Jobs', href: '/candidate/jobs', icon: Search },
  { label: 'Saved Jobs', href: '/candidate/saved-jobs', icon: Heart },
  { label: 'Applied Jobs', href: '/candidate/applied-jobs', icon: Briefcase },
  { label: 'Application Tracker', href: '/candidate/application-tracker', icon: Clock },
  { label: 'Interviews', href: '/candidate/interviews', icon: Calendar },
  { label: 'Onboarding', href: '/candidate/onboarding', icon: UserCheck },
  { label: 'Resume', href: '/candidate/resume', icon: FileText },
  { label: 'Resume Builder', href: '/candidate/resume-builder', icon: BookOpen },
  { label: 'Notifications', href: '/candidate/notifications', icon: Bell },
  { label: 'Certificates', href: '/candidate/certificates', icon: Award },
  { label: 'Settings', href: '/candidate/settings', icon: Settings },
]

export function CandidateSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('candidate_user')
    localStorage.removeItem('candidate_token')
    localStorage.removeItem('candidate_profile')
    window.location.href = '/candidate/login'
  }

  return (
    <div className={cn(
      "flex flex-col border-r bg-background transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && <span className="font-semibold text-lg">Candidate Portal</span>}
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/candidate' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-2">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
