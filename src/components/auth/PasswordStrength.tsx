'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export function passwordScore(password: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  const p = password || ''
  let score: 0 | 1 | 2 | 3 | 4 = 0
  if (p.length >= 4) score++
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  const map: Record<number, { label: string; color: string }> = {
    0: { label: '', color: '' },
    1: { label: 'Weak', color: '#E11D48' },
    2: { label: 'Fair', color: '#F59E0B' },
    3: { label: 'Good', color: '#3478F6' },
    4: { label: 'Strong', color: '#18A878' },
  }
  const clamped = Math.min(Math.max(score, 0), 4) as 0 | 1 | 2 | 3 | 4
  return { score: clamped, ...map[clamped] }
}

export default function PasswordStrength({ value }: { value: string }) {
  const { score, label, color } = useMemo(() => passwordScore(value), [value])

  const met = (i: number) => i < score

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              met(i) ? '' : 'bg-[#E9E7F5]'
            )}
            style={met(i) ? { backgroundColor: color } : undefined}
          />
        ))}
        {score > 0 && (
          <span className="text-[10px] font-semibold ml-1" style={{ color }}>{label}</span>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10.5px] text-[#A9B3C8]">
        <li className={cn('flex items-center gap-1', value.length >= 8 && 'text-[#18A878]')}>
          <span className={cn('inline-block h-1 w-1 rounded-full', value.length >= 8 ? 'bg-[#18A878]' : 'bg-[#D5D0E8]')} />
          8+ characters
        </li>
        <li className={cn('flex items-center gap-1', /\d/.test(value) && 'text-[#18A878]')}>
          <span className={cn('inline-block h-1 w-1 rounded-full', /\d/.test(value) ? 'bg-[#18A878]' : 'bg-[#D5D0E8]')} />
          Contains a number
        </li>
        <li className={cn('flex items-center gap-1', /[A-Z]/.test(value) && /[a-z]/.test(value) && 'text-[#18A878]')}>
          <span className={cn('inline-block h-1 w-1 rounded-full', /[A-Z]/.test(value) && /[a-z]/.test(value) ? 'bg-[#18A878]' : 'bg-[#D5D0E8]')} />
          Uppercase &amp; lowercase
        </li>
        <li className={cn('flex items-center gap-1', /[^A-Za-z0-9]/.test(value) && 'text-[#18A878]')}>
          <span className={cn('inline-block h-1 w-1 rounded-full', /[^A-Za-z0-9]/.test(value) ? 'bg-[#18A878]' : 'bg-[#D5D0E8]')} />
          Special character
        </li>
      </ul>
    </div>
  )
}
