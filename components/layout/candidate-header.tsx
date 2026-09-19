'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Search, Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/use-auth'

export function CandidateHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [candidateName, setCandidateName] = useState('C')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('candidate_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setCandidateName(parsed.name?.charAt(0) || 'C')
      }
    } catch {}
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search jobs..." className="h-9 w-64 pl-9 bg-muted/50" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link href="/candidate/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
            </Button>
          </Link>
          <Link href="/candidate/profile">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0) || candidateName}
              </div>
              <span className="hidden sm:block text-sm font-medium">{user?.name || (candidateName !== 'C' ? candidateName : 'Candidate')}</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
