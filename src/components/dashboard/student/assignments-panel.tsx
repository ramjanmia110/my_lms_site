'use client'

import { ClipboardList, CheckCircle2, Clock3, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard, SectionHeader, EmptyState } from './shared'
import type { StudentAssignment, StudentAssignmentStats } from './types'

export function AssignmentsPanel({
  assignments,
  stats,
  onViewAll,
  onOpen,
}: {
  assignments: StudentAssignment[]
  stats?: StudentAssignmentStats
  onViewAll?: () => void
  onOpen?: (a: StudentAssignment) => void
}) {
  const upcoming = (assignments || [])
    .filter((a) => a.status === 'assigned' && a.due_date)
    .sort((a, b) => (a.due_date && b.due_date ? new Date(a.due_date).getTime() - new Date(b.due_date).getTime() : 0))
    .slice(0, 3)

  const gradedCount = stats?.graded ?? 0
  const totalCount = stats?.total ?? assignments?.length ?? 0
  const pct = totalCount > 0 ? Math.round((gradedCount / totalCount) * 100) : 0

  return (
    <SectionCard className="p-4">
      <SectionHeader
        icon={ClipboardList}
        title="Assignments"
        subtitle="Due soon & grading"
        action={
          <button onClick={onViewAll} className="text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium inline-flex items-center gap-1 transition-colors shrink-0">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        }
      />
      {stats && totalCount > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/10 p-2.5 text-center">
            <p className="text-base font-bold text-[#6D3DF5] tabular-nums">{stats.submitted}</p>
            <p className="text-[10px] text-[#536078]">Submitted</p>
          </div>
          <div className="rounded-lg bg-[#ECFBF5] border border-[#18A878]/10 p-2.5 text-center">
            <p className="text-base font-bold text-[#18A878] tabular-nums">{gradedCount}</p>
            <p className="text-[10px] text-[#536078]">Graded</p>
          </div>
          <div className="rounded-lg bg-[#FFF4EC] border border-[#FF7A45]/10 p-2.5 text-center">
            <p className="text-base font-bold text-[#FF7A45] tabular-nums">{stats.upcoming_deadlines ?? upcoming.length}</p>
            <p className="text-[10px] text-[#536078]">Due within 7d</p>
          </div>
        </div>
      )}
      {upcoming.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No pending deadlines" description={gradedCount > 0 ? `${pct}% of your assignments are graded. Great work!` : 'Assignments will show up here as they are published to your courses.'} />
      ) : (
        <div className="space-y-2.5 mt-3">
          {upcoming.map((a) => {
            const overdue = a.due_date && new Date(a.due_date) < new Date()
            return (
              <div key={String(a.id)} className="flex items-center gap-3 p-3 rounded-xl border border-[#E9E7F5] hover:border-[#6D3DF5]/40 bg-white transition-all duration-300 cursor-pointer" onClick={() => onOpen?.(a)}>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', overdue ? 'bg-[#FFF4EC]' : 'bg-[#ECFBF5]')}>
                  {overdue ? <Clock3 className="w-4 h-4 text-[#FF7A45]" /> : <CheckCircle2 className="w-4 h-4 text-[#18A878]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#0F1B3D] truncate">{a.title}</p>
                  <p className="text-[10px] text-[#536078] mt-0.5 truncate">{a.course ?? 'Unknown course'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn('text-[10px] font-bold', overdue ? 'text-[#FF7A45]' : 'text-[#6D3DF5]')}>
                    {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}
                  </p>
                  <p className="text-[9px] text-[#536078] mt-0.5">{overdue ? 'Overdue' : 'Due'}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}