'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  lastPage: number
  total?: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, lastPage, total, onPageChange, className }: PaginationProps) {
  if (lastPage <= 1) return null

  const pages: (number | '…')[] = []
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || Math.abs(i - page) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className={cn('flex items-center justify-between gap-3 flex-wrap', className)}>
      <span className="text-[11px] text-slate-500">
        {total != null ? `${total} results` : `Page ${page} of ${lastPage}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-slate-600 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'min-w-[28px] h-7 px-2 rounded-lg text-[11px] font-medium transition-colors',
                p === page
                  ? 'bg-[#FF8A36] text-white'
                  : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12]'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(lastPage, page + 1))}
          disabled={page >= lastPage}
          className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
