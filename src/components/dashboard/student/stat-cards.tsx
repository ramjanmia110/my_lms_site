'use client'

import { BookOpen, TrendingUp, Award, Flame, Clock, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { StatPill, deltaPct } from './shared'
import type { StudentProfileBundle, MonthlySnap } from './types'

interface StatCardData {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  delta: number | null
  deltaLabel?: string
}

function buildCards(bundle: StudentProfileBundle): StatCardData[] {
  const s = bundle.summary
  const prev: MonthlySnap | null = bundle.analytics?.monthly?.previous ?? null
  const curr: MonthlySnap | null = bundle.analytics?.monthly?.current ?? null

  const enrolledDelta = deltaPct(s.enrolled_courses, prev ? 1 : null)
  const certDelta = deltaPct(s.certificates, prev?.certificates)
  const studyDelta = deltaPct(Math.round(s.study_time.this_month), prev?.study_hours)
  const streakDelta = deltaPct(s.streak, null)

  return [
    {
      label: 'Enrolled Courses',
      value: `${s.enrolled_courses}`,
      icon: BookOpen,
      color: 'text-[#3478F6]',
      bg: 'bg-[#EEF4FF]',
      delta: enrolledDelta,
      deltaLabel: 'vs last month',
    },
    {
      label: 'Completed',
      value: `${s.completed_courses}`,
      icon: Trophy,
      color: 'text-[#6D3DF5]',
      bg: 'bg-[#F3EEFF]',
      delta: deltaPct(s.completed_courses, prev && prev.certificates ? 1 : null),
    },
    {
      label: 'Study Hours (Month)',
      value: `${s.study_time.this_month ?? 0}h`,
      icon: Clock,
      color: 'text-[#18A878]',
      bg: 'bg-[#ECFBF5]',
      delta: studyDelta,
      deltaLabel: 'vs last month',
    },
    {
      label: 'Day Streak',
      value: `${s.streak}d`,
      icon: Flame,
      color: 'text-[#FF7A45]',
      bg: 'bg-[#FFF4EC]',
      delta: streakDelta,
      deltaLabel: 'keep it going',
    },
    {
      label: 'Certificates',
      value: `${s.certificates}`,
      icon: Award,
      color: 'text-[#6D3DF5]',
      bg: 'bg-[#F3EEFF]',
      delta: certDelta,
    },
    {
      label: 'Total XP',
      value: `${s.xp ?? 0}`,
      icon: TrendingUp,
      color: 'text-[#3478F6]',
      bg: 'bg-[#EEF4FF]',
      delta: null,
      deltaLabel: `Level ${s.level ?? 0}`,
    },
  ]
}

export function StatCards({ bundle, onRefresh }: { bundle: StudentProfileBundle; onRefresh?: () => void }) {
  const cards = buildCards(bundle)
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wide">Live Progress</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium transition-colors"
          >
            Refresh
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((m) => {
          const Ic = m.icon
          return (
            <div
              key={m.label}
              className="bg-white border border-[#E9E7F5] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#6D3DF5]/30 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', m.bg)}>
                <Ic className={cn('w-4.5 h-4.5 w-5 h-5', m.color)} />
              </div>
              <div className="text-xl font-bold text-[#0F1B3D] tabular-nums leading-none">{m.value}</div>
              <div className="text-[11px] text-[#536078] mt-1.5 font-medium">{m.label}</div>
              <div className="flex items-center gap-1 mt-1.5 min-h-[16px]">
                {m.delta !== null && <StatPill delta={m.delta} />}
                {m.deltaLabel && m.delta === null && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#EEF4FF] border border-[#3478F6]/20 text-[#3478F6] text-[10px] font-semibold">
                    {m.deltaLabel}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StatCardsSkeleton() {
  return (
    <div>
      <Skeleton className="h-3.5 w-24 mb-3" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E9E7F5] rounded-xl p-4">
            <Skeleton className="w-9 h-9 rounded-lg mb-3" />
            <Skeleton className="h-5 w-10 mb-1.5" />
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}