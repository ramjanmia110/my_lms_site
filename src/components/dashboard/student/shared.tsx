'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'

export function SectionCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-white border border-[#E9E7F5] rounded-xl shadow-sm', className)}>{children}</div>
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon?: LucideIcon
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#0F1B3D] truncate">{title}</h2>
          {subtitle && <p className="text-[11px] text-[#536078] mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <SectionCard className="p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </SectionCard>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 text-center px-4', className)}>
      <div className="w-12 h-12 rounded-full bg-[#F8FAFC] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[#6D3DF5]" />
      </div>
      <p className="text-xs font-medium text-[#536078]">{title}</p>
      {description && <p className="text-[10px] text-[#536078] mt-1 max-w-[220px] leading-relaxed">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function StatPill({ delta }: { delta: number | null }) {
  if (delta === null || delta === undefined || !isFinite(delta)) return null
  const up = delta >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border',
        up ? 'bg-[#ECFBF5] border-[#18A878]/30 text-[#18A878]' : 'bg-red-50 border-red-200 text-red-500',
      )}
    >
      {up ? '▲' : '▼'} {Math.abs(delta)}%
    </span>
  )
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('w-full h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function deltaPct(current: number, previous: number | undefined | null): number | null {
  if (!previous && previous !== 0) return null
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export function formatBDT(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0)
  return '৳' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}