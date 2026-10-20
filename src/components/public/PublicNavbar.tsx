'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Learn2EarnLogo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/#courses' },
  { label: 'Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Instructors', href: '/#instructors' },
  { label: 'Community', href: '/#community' },
  { label: 'Pricing', href: '/#pricing' },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E9E7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Learn2EarnLogo size="sm" showText={false} />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-[#6D3DF5]'
                      : 'text-[#536078] hover:text-[#6D3DF5]'
                  )}
                >
                  {active && <span className="absolute left-3 right-3 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6]" />}
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="h-9 px-5 rounded-lg font-medium text-sm transition-all active:scale-[0.98] text-[#0F1B3D] border border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5] flex items-center"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="h-9 px-5 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2FE0] hover:to-[#2B66E0] text-white font-medium text-sm transition-all shadow-sm focus:outline-none active:scale-[0.98] flex items-center"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg text-[#0F1B3D] hover:bg-[#F3EEFF] transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-[#E9E7F5]">
          <div className="px-6 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-[#536078] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] font-medium transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              <Link href="/login" className="block">
                <button className="w-full h-10 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white font-medium text-sm transition-all">
                  Sign In
                </button>
              </Link>
              <Link href="/signup" className="block">
                <button className="w-full h-10 rounded-lg border border-[#E9E7F5] text-[#0F1B3D] font-medium text-sm transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
