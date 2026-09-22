'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Loader2, Search, RefreshCw,
  AlertCircle, Inbox, ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { statusBadgeClass } from '@/lib/payments'

/* Brand palette
   Main Background #FFFFFF · Soft Purple Glow #F3EEFF
   Soft Blue Glow #EEF4FF · Soft Green Glow #ECFBF5
   Main Heading #0F1B3D · Purple Accent #6D3DF5
   Blue Accent #3478F6 · Green Accent #18A878
   Card Background #FFFFFF · Card Border #E9E7F5 · Body Text #536078 */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1B3D] font-space-grotesk">{title}</h1>
        {subtitle && <p className="text-xs text-[#536078] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ children, search, onSearch, extra }: {
  children: ReactNode
  search?: boolean
  onSearch?: (v: string) => void
  extra?: ReactNode
}) {
  const [q, setQ] = useState('')
  return (
    <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,27,61,0.04)]">
      {(search || extra) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {search && (
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536078]" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); onSearch?.(e.target.value) }}
                placeholder="Search..."
                className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 pl-9 pr-3 text-sm text-[#0F1B3D] placeholder:text-[#A9B3C8] focus:outline-none focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15"
              />
            </div>
          )}
          {extra && <div className="flex items-center gap-2 flex-wrap">{extra}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export function RefreshBtn({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 disabled:opacity-50 transition-colors"
    >
      <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} /> Refresh
    </button>
  )
}

export function PillBtn({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={active
        ? 'inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-full px-3 py-1.5 transition-colors'
        : 'inline-flex items-center gap-1.5 text-xs font-medium text-[#536078] bg-white border border-[#E9E7F5] rounded-full px-3 py-1.5 hover:bg-[#EEF4FF] hover:border-[#3478F6]/30 transition-colors'}
    >
      {children}
    </button>
  )
}

export function GradientBtn({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] rounded-xl px-4 py-2.5 disabled:opacity-50 transition-colors"
    >
      {children}
    </button>
  )
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-[#A9B3C8]">—</span>
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', statusBadgeClass(status))}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function StatTile({ label, value, sub, icon, tone = 'indigo' }: {
  label: string
  value: ReactNode
  sub?: string
  icon?: ReactNode
  tone?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate'
}) {
  const tones: Record<string, string> = {
    indigo: 'text-[#6D3DF5] bg-[#F3EEFF] border-[#6D3DF5]/20',
    emerald: 'text-[#18A878] bg-[#ECFBF5] border-[#18A878]/20',
    amber: 'text-[#B45309] bg-[#FFF7E6] border-amber-500/20',
    rose: 'text-[#E11D48] bg-rose-50 border-rose-500/20',
    sky: 'text-[#3478F6] bg-[#EEF4FF] border-[#3478F6]/20',
    slate: 'text-[#536078] bg-[#F8FAFC] border-[#E9E7F5]',
  }
  return (
    <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,27,61,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-[#536078] font-medium">{label}</p>
          <p className="text-xl font-bold text-[#0F1B3D] tabular-nums mt-1">{value}</p>
          {sub && <p className="text-[10px] text-[#536078] mt-1 truncate">{sub}</p>}
        </div>
        {icon && (
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center border shrink-0', tones[tone])}>{icon}</div>
        )}
      </div>
    </div>
  )
}

export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div className="py-12 flex flex-col items-center">
      <Loader2 className="w-5 h-5 animate-spin text-[#6D3DF5] mb-2" />
      <p className="text-xs text-[#536078]">Loading…</p>
    </div>
  )
}

export function ErrorBlock({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="py-12 flex flex-col items-center">
      <AlertCircle className="w-8 h-8 text-[#E11D48] mb-3" />
      <p className="text-xs text-[#B91C1C] max-w-sm text-center">{message || 'Something went wrong while loading this data.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-xl px-3 py-2 hover:bg-[#EEE3FF] transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  )
}

export function EmptyBlock({ message = 'No records found yet.', hint }: { message?: string; hint?: string }) {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6 text-[#6D3DF5]" />
      </div>
      <p className="text-sm font-semibold text-[#0F1B3D]">{message}</p>
      {hint && <p className="text-xs text-[#536078] mt-1 max-w-xs">{hint}</p>}
    </div>
  )
}

export function Pagination({ page, lastPage, total, from, to, onChange }: {
  page: number
  lastPage: number
  total: number
  from: number | string
  to: number | string
  onChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
      <p className="text-[11px] text-[#536078]">Showing <span className="text-[#0F1B3D] font-semibold">{from}–{to}</span> of <span className="text-[#0F1B3D] font-semibold">{total}</span></p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>
        <span className="text-[11px] text-[#536078]">Page {page} of {lastPage || 1}</span>
        <button
          onClick={() => onChange(Math.min(lastPage, page + 1))}
          disabled={page >= lastPage}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 disabled:opacity-40 transition-colors"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export function ViewLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6D3DF5] hover:text-[#5B2EE0] underline-offset-2 hover:underline" onClick={(e) => e.stopPropagation()}>
      {children} <ArrowUpRight className="w-3 h-3" />
    </a>
  )
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn('text-left text-[10px] uppercase tracking-wider text-[#536078] font-semibold px-3 py-2.5 whitespace-nowrap bg-[#F8FAFC]', className)}>{children}</th>
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('px-3 py-3 text-xs text-[#536078] align-middle', className)}>{children}</td>
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export interface PaginatedState {
  page: number
  setPage: (page: number) => void
  params: Record<string, any>
  setParams: (patch: Record<string, any>) => void
  query: Record<string, any>
}

/** Server-side paginated list driver (page + params → fresh query object). */
export function usePaginatedState(): PaginatedState {
  const [page, setPage] = useState(1)
  const [params, setParams] = useState<Record<string, any>>({})

  useEffect(() => { setPage(1) }, [params])

  const query = useMemo(() => ({ ...params, page }), [params, page])

  return { page, setPage, params, setParams, query }
}