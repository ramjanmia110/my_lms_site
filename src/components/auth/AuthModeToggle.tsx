'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

const MODES = [
  { key: 'login', label: 'Sign In', href: '/login' },
  { key: 'signup', label: 'Sign Up', href: '/signup' },
]

export function AuthModeToggle({
  active,
  enroll,
}: {
  active: 'login' | 'signup'
  enroll?: string | null
}) {
  const qs = enroll ? `?enroll=${enroll}` : ''
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative mb-6 grid grid-cols-2 rounded-xl border border-[#E7E0D7] bg-[#F7F3ED] p-1">
        {MODES.map((m) => {
          const isActive = active === m.key
          return (
            <Link
              key={m.key}
              href={`${m.href}${qs}`}
              className={cn(
                'relative z-10 rounded-lg py-2.5 text-center text-[13px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#E07B22]/30',
                isActive ? 'text-white' : 'text-[#667269] hover:text-[#1F4D3A]'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="auth-mode-pill"
                  className="absolute inset-0 rounded-lg bg-[#E07B22] shadow-[0_6px_18px_-4px_rgba(224,123,34,0.55)]"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', bounce: 0.18, duration: 0.5 }
                  }
                />
              )}
              <span className="relative z-10">{m.label}</span>
            </Link>
          )
        })}
    </div>
  )
}
