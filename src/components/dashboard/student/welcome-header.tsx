'use client'

import { motion } from 'framer-motion'
import { Quote, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { DailyQuote } from './types'

export function WelcomeHeader({
  name,
  quote,
  onboardingPct,
}: {
  name: string
  quote?: DailyQuote
  onboardingPct?: number
}) {
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 5) return 'Burning the midnight oil'
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const firstName = name?.split(' ')[0] || 'Student'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6D3DF5] via-[#5B4CE5] to-[#3478F6] p-5 text-white shadow-xl shadow-[#6D3DF5]/20"
    >
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-[10px] font-semibold">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Learn2Earn Academy
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">{greeting}, {firstName}!</h1>
          <p className="text-[13px] text-white/80 mt-1 max-w-xl">Let&apos;s pick up where you left off and keep the momentum going.</p>
          {typeof onboardingPct === 'number' && (
            <div className="mt-4 max-w-xs">
              <div className="flex items-center justify-between text-[11px] text-white/90 mb-1">
                <span>Onboarding progress</span>
                <span className="font-semibold">{onboardingPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-amber-300 transition-all duration-500" style={{ width: `${onboardingPct}%` }} />
              </div>
            </div>
          )}
        </div>
        {quote && (
          <div className="max-w-sm md:max-w-md bg-white/10 backdrop-blur border border-white/15 rounded-xl p-4">
            <div className="flex gap-2.5">
              <Quote className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] leading-relaxed italic text-white/95">&ldquo;{quote.quote}&rdquo;</p>
                <p className="text-[11px] font-semibold text-amber-200 mt-1.5">— {quote.author}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function WelcomeHeaderSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#6D3DF5] via-[#5B4CE5] to-[#3478F6] p-5 shadow-xl shadow-[#6D3DF5]/20">
      <Skeleton className="h-5 w-40 bg-white/25 mb-3" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <Skeleton className="h-6 w-56 bg-white/25 mb-2" />
          <Skeleton className="h-3 w-72 bg-white/25" />
        </div>
        <Skeleton className="h-24 w-full md:w-80 bg-white/25" />
      </div>
    </div>
  )
}