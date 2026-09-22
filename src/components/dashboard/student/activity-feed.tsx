'use client'

import { History, Trophy, Send, Video, CreditCard, BookOpen, Notebook, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard, SectionHeader, EmptyState } from './shared'
import type { StudentActivityEvent } from './types'

const typeStyles: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  log: { icon: Stethoscope, color: 'text-[#536078]', bg: 'bg-[#F8FAFC]' },
  attendance: { icon: Video, color: 'text-[#18A878]', bg: 'bg-[#ECFBF5]' },
  absent: { icon: Video, color: 'text-[#FF7A45]', bg: 'bg-[#FFF4EC]' },
  submission: { icon: Send, color: 'text-[#3478F6]', bg: 'bg-[#EEF4FF]' },
  certificate: { icon: Trophy, color: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]' },
  payment: { icon: CreditCard, color: 'text-[#18A878]', bg: 'bg-[#ECFBF5]' },
  enrollment: { icon: BookOpen, color: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]' },
  note: { icon: Notebook, color: 'text-[#536078]', bg: 'bg-[#F8FAFC]' },
}

export function ActivityFeed({ events }: { events: StudentActivityEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <SectionCard className="p-4">
        <SectionHeader icon={History} title="Recent Activity" />
        <EmptyState icon={History} title="No activity yet" description="Class attendance, submissions and achievements will appear here as they happen." />
      </SectionCard>
    )
  }

  return (
    <SectionCard className="p-4">
      <SectionHeader icon={History} title="Recent Activity" subtitle="Your learning journey in real time" />
      <div className="space-y-2 mt-3">
        {events.slice(0, 8).map((e, idx) => {
          const style = typeStyles[e.type] ?? typeStyles.log
          const Icon = style.icon
          const timeLabel = e.at ? new Date(e.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
          return (
            <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E9E7F5] bg-white hover:border-[#6D3DF5]/30 transition-colors">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', style.bg)}>
                <Icon className={cn('w-4 h-4', style.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#0F1B3D] truncate">{e.title}</p>
                {e.description && <p className="text-[10px] text-[#536078] truncate">{e.description}</p>}
              </div>
              <span className="text-[9px] text-[#536078] font-medium shrink-0">{timeLabel}</span>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}