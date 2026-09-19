'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Menu, X, Sun, Moon, ChevronDown, User, Briefcase } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { useAuth } from '@/hooks/use-auth'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Candidate Portal', href: '/login' },
  { label: 'Job Portal', href: '/job-portal' },
  { label: 'Business Opportunities', href: '/business-operations' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [getStartedOpen, setGetStartedOpen] = useState(false)
  const getStartedRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (getStartedRef.current && !getStartedRef.current.contains(e.target as Node)) {
        setGetStartedOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo size="small" />
            <div className="hidden lg:flex lg:items-center lg:gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link href="/login">
              <Button variant="ghost" size="sm" className="h-9">Sign In</Button>
            </Link>
            <div className="relative" ref={getStartedRef}>
              <Button size="sm" className="h-9 gap-1.5" onClick={() => setGetStartedOpen(!getStartedOpen)}>
                Get Started <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {getStartedOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-background shadow-lg z-50">
                  <Link href="/login" onClick={() => setGetStartedOpen(false)}>
                    <div className="flex items-center gap-3 rounded-t-lg px-4 py-3 hover:bg-accent transition-colors">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Candidate</p>
                        <p className="text-xs text-muted-foreground">Browse and apply for jobs</p>
                      </div>
                    </div>
                  </Link>
                  <div className="border-t" />
                  <Link href="/business-operations/hr-consultant/login" onClick={() => setGetStartedOpen(false)}>
                    <div className="flex items-center gap-3 rounded-b-lg px-4 py-3 hover:bg-accent transition-colors">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Recruiter</p>
                        <p className="text-xs text-muted-foreground">Manage recruitments and candidates</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t lg:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
