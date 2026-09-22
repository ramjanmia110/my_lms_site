'use client'

import { GraduationCap, ArrowUpRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import { ProgressBar, SectionCard, SectionHeader, EmptyState } from './shared'
import type { StudentCourse } from './types'

export function ActiveEnrollments({
  courses,
  onViewAll,
  onOpen,
}: {
  courses: StudentCourse[]
  onViewAll?: () => void
  onOpen?: (course: StudentCourse) => void
}) {
  const active = courses.filter((c) => !c.completed)
  return (
    <SectionCard className="p-4">
      <SectionHeader
        icon={GraduationCap}
        title="Active Enrollments"
        subtitle="Pick up where you left off"
        action={
          active.length > 3 ? (
            <button onClick={onViewAll} className="text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium inline-flex items-center gap-1 transition-colors shrink-0">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          ) : null
        }
      />
      {active.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No active enrollments"
          description="You haven't started any courses yet. Browse the catalog and enroll to begin."
          action={
            <button onClick={onViewAll} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold hover:brightness-110 transition-colors">
              Browse Courses
            </button>
          }
        />
      ) : (
        <div className="space-y-2.5 mt-3">
          {active.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#F3EEFF]/60 via-[#EEF4FF]/25 to-transparent border border-[#6D3DF5]/10 hover:border-[#6D3DF5]/40 transition-all duration-300 cursor-pointer"
              onClick={() => onOpen?.(c)}
            >
              {c.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getImageUrl(c.thumbnail)} alt={c.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center shrink-0 shadow-md shadow-[#6D3DF5]/20">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0F1B3D] truncate">{c.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1">
                    <ProgressBar value={c.progress} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#6D3DF5] tabular-nums">{c.progress}%</span>
                </div>
                <p className="text-[10px] text-[#536078] mt-1 truncate">
                  {c.current_lesson ?? c.level ?? c.category} · {c.estimated_completion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}