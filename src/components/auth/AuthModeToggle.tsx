'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
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
  return (
    <div className="relative mb-6 grid grid-cols-2 rounded-xl border border-[#E5E0F4] bg-[#F1EEFB] p-1">
      {MODES.map((m) => {
        const isActive = active === m.key
        return (
          <Link
            key={m.key}
            href={`${m.href}${qs}`}
            className={cn(
              'relative z-10 rounded-lg py-2.5 text-center text-[13px] font-semibold transition-colors',
              isActive ? 'text-white' : 'text-[#6B7694] hover:text-[#0F1B3D]'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="auth-mode-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] shadow-[0_4px_14px_-3px_rgba(109,61,245,0.45)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{m.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
