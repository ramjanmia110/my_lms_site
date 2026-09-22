'use client'

import { Wallet, CreditCard, CheckCircle2, Clock3, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard, SectionHeader, EmptyState, formatBDT } from './shared'
import type { StudentPayment } from './types'

export function OrdersPayments({
  payments,
  totals,
  onViewAll,
}: {
  payments: StudentPayment[]
  totals?: { total_paid: number; pending: number; outstanding: number }
  onViewAll?: () => void
}) {
  const recent = (payments || []).slice(0, 3)
  const totalPaid = totals?.total_paid ?? payments?.filter((p) => p.status === 'completed').reduce((acc, p) => acc + Number(p.amount ?? 0), 0) ?? 0
  const pending = totals?.pending ?? payments?.filter((p) => p.status === 'pending').length ?? 0

  return (
    <SectionCard className="p-4">
      <SectionHeader
        icon={Wallet}
        title="Orders & Payments"
        subtitle="Your payment history at a glance"
        action={
          <button onClick={onViewAll} className="text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium inline-flex items-center gap-1 transition-colors shrink-0">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        }
      />
      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 rounded-xl bg-gradient-to-br from-[#18A878] to-[#0B8A63] p-3 text-white">
          <p className="text-[10px] text-white/80">Total paid</p>
          <p className="text-lg font-bold tabular-nums leading-tight mt-0.5">{formatBDT(totalPaid)}</p>
        </div>
        <div className="flex-1 rounded-xl border border-[#E9E7F5] bg-[#F8FAFC] p-3">
          <p className="text-[10px] text-[#536078]">Outstanding</p>
          <p className="text-lg font-bold tabular-nums leading-tight mt-0.5 text-[#FF7A45]">{formatBDT(totals?.outstanding ?? 0)}</p>
        </div>
        <div className="flex-1 rounded-xl border border-[#E9E7F5] bg-[#F8FAFC] p-3">
          <p className="text-[10px] text-[#536078]">Pending</p>
          <p className="text-lg font-bold tabular-nums leading-tight mt-0.5 text-[#6D3DF5]">{typeof pending === 'number' ? pending : 0}</p>
        </div>
      </div>
      {recent.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" description="Your course orders and receipts will show up here after your first purchase." />
      ) : (
        <div className="space-y-2 mt-3">
          {recent.map((p) => {
            const paid = p.status === 'completed'
            return (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E9E7F5] bg-white">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', paid ? 'bg-[#ECFBF5]' : 'bg-[#FFF4EC]')}>
                  {paid ? <CheckCircle2 className="w-4 h-4 text-[#18A878]" /> : <Clock3 className="w-4 h-4 text-[#FF7A45]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#0F1B3D] truncate">{p.course ?? 'Course payment'}</p>
                  <p className="text-[9px] text-[#536078] mt-0.5 capitalize">{p.method ?? p.status} · {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
                </div>
                <span className={cn('text-[11px] font-bold tabular-nums shrink-0', paid ? 'text-[#0F1B3D]' : 'text-[#FF7A45]')}>{formatBDT(p.amount)}</span>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}