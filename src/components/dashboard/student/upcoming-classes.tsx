'use client'

import { Video, ArrowUpRight } from 'lucide-react'
import { SectionCard, SectionHeader, EmptyState } from './shared'
import type { StudentLiveClass } from './types'

export function UpcomingClasses({
  classes,
  onViewAll,
  onJoin,
}: {
  classes: StudentLiveClass[]
  onViewAll?: () => void
  onJoin?: (cls: StudentLiveClass) => void
}) {
  return (
    <SectionCard className="p-4">
      <SectionHeader
        icon={Video}
        title="Upcoming Live Classes"
        subtitle="Your scheduled sessions"
        action={
          <button onClick={onViewAll} className="text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium inline-flex items-center gap-1 transition-colors shrink-0">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        }
      />
      {classes.length === 0 ? (
        <EmptyState icon={Video} title="No upcoming classes" description="You're all caught up. New sessions will show here once scheduled." />
      ) : (
        <div className="space-y-2.5 mt-3">
          {classes.slice(0, 3).map((c) => {
            const dt = c.date ? new Date(`${c.date}${c.time ? 'T' + c.time : ''}`) : null
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#E9E7F5] hover:border-[#3478F6]/40 bg-white transition-all duration-300 cursor-pointer" onClick={() => onJoin?.(c)}>
                <div className="w-10 h-10 rounded-lg bg-[#EEF4FF] flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-[#3478F6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#0F1B3D] truncate">{c.title ?? 'Live class'}</p>
                  <p className="text-[10px] text-[#536078] mt-0.5">
                    {c.date ? new Date(c.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBA'}
                    {c.time ? ` · ${c.time.replace(/-/g, ':')}` : ''}
                  </p>
                </div>
                {dt && (
                  <span className="text-[10px] font-semibold text-[#18A878] bg-[#ECFBF5] border border-[#18A878]/20 rounded-full px-2 py-0.5 shrink-0">
                    {dt > new Date() ? 'Upcoming' : 'Today'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}