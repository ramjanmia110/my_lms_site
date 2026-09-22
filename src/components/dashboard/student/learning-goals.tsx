'use client'

import { Target, Clock, Users, Award, Flame } from 'lucide-react'
import { ProgressBar, SectionCard, SectionHeader, EmptyState } from './shared'
import type { LearningGoal } from './types'

const iconMap: Record<string, React.ElementType> = { clock: Clock, users: Users, award: Award, flame: Flame, calendar: Clock }

export function LearningGoals({ goals, overall }: { goals: LearningGoal[]; overall: number | undefined }) {
  return (
    <SectionCard className="p-4">
      <SectionHeader icon={Target} title="Learning Goals" subtitle="Your targets this month" />
      {!goals || goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="Start learning to build your monthly goals and track your progress." />
      ) : (
        <div className="space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#0F1B3D]">Overall completion</span>
            <span className="text-[11px] font-bold text-[#6D3DF5]">{overall ?? 0}%</span>
          </div>
          <ProgressBar value={overall ?? 0} className="h-2" />
          <div className="space-y-2 pt-1">
            {goals.map((g) => {
              const Icon = iconMap[g.icon] ?? Target
              const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0
              return (
                <div key={g.key} className="rounded-xl border border-[#E9E7F5] p-2.5 hover:border-[#6D3DF5]/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#6D3DF5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-[#0F1B3D] truncate">{g.title}</p>
                        <span className="text-[10px] font-bold text-[#6D3DF5] tabular-nums whitespace-nowrap">
                          {g.current}{g.unit} / {g.target}{g.unit}
                        </span>
                      </div>
                      <ProgressBar value={pct} className="mt-1.5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}