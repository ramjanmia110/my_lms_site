'use client'

import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  subtitle,
  backHref,
  actionHref,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onAction,
}: {
  title: string
  subtitle?: string
  backHref?: string
  actionHref?: string
  actionLabel?: string
  actionIcon?: any
  onAction?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E9E7F5] text-[#536078] hover:text-[#0F1B3D] hover:border-[#6D3DF5]/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-[#0F1B3D] tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-[#536078] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link
            href={actionHref}
            className={cn(
              'flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]',
              'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20'
            )}
          >
            <ActionIcon className="w-3.5 h-3.5" />
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className={cn(
              'flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]',
              'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20'
            )}
          >
            <ActionIcon className="w-3.5 h-3.5" />
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}
