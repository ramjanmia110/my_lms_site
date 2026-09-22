'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign, Percent, Clock, Undo2, Wallet, Landmark, Banknote, AlertTriangle,
  ShoppingBag, CreditCard, TrendingUp, ShieldAlert, Link2, Webhook, Scale, ArrowRight,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount } from '@/lib/payments'
import { cn } from '@/lib/utils'
import { FinanceShell } from '@/components/finance/FinanceShell'
import { PageHeader, Panel, RefreshBtn, LoadingBlock, ErrorBlock, StatusBadge } from '@/components/finance/ui'

function daysAgoIso(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState<any>(null)
  const [prevSummary, setPrevSummary] = useState<any>(null)
  const [earnings, setEarnings] = useState<any>({})
  const [pendingPayouts, setPendingPayouts] = useState<{ count: number }>({ count: 0 })
  const [series, setSeries] = useState<any[]>([])
  const [ops, setOps] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)
  const [days, setDays] = useState(7)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const from = daysAgoIso(30)
    const prevFrom = daysAgoIso(60)
    const prevTo = daysAgoIso(30)

    const safe = <T,>(p: Promise<any>, fallback: T): Promise<T> =>
      p.then((res) => (res && res.data ? res.data?.data ?? fallback : fallback)).catch(() => fallback)

    Promise.all([
      safe<Record<string, any> | null>(financeAPI.reports.summary({ from, to: daysAgoIso(0) }), null),
      safe<Record<string, any> | null>(financeAPI.reports.summary({ from: prevFrom, to: prevTo }), null),
      safe<any[]>(financeAPI.reports.series({ days }), []),
      safe<Record<string, any>>(financeAPI.earnings.summary(), {}),
      safe<Record<string, any>>(financeAPI.payouts.list({ per_page: 1, status: 'requested' }), {}),
      safe<Record<string, any>>(financeAPI.webhooks.list({ per_page: 1 }), {}),
      safe<Record<string, any>>(financeAPI.reconciliation.list({ per_page: 1 }), {}),
      safe<Record<string, any>>(financeAPI.settlements.list({ per_page: 1 }), {}),
      safe<Record<string, any>>(financeAPI.disputes.list({ per_page: 1, status: 'opened' }), {}),
      safe<Record<string, any>>(financeAPI.paymentLinks.list({ per_page: 1, status: 'active' }), {}),
      safe<Record<string, any>>(financeAPI.coupons.list({ per_page: 1 }), {}),
    ])
      .then(([s, prev, ser, earn, po, wh, rec, st, disp, links, coupons]: any) => {
        setSummary(s || null)
        setPrevSummary(prev || null)
        setSeries(ser || [])
        setEarnings(earn || {})
        const poData = po || {}
        setPendingPayouts({ count: poData.total ?? poData.data?.length ?? 0 })
        const count = (res: any) => res?.total ?? res?.data?.length ?? 0
        setOps({
          webhooks: count(wh),
          reconciliation: count(rec),
          settlements: count(st),
          disputesOpen: count(disp),
          linksActive: count(links),
          coupons: count(coupons),
        })
        setError('')
      })
      .catch(() => setError('Could not load finance overview.'))
      .finally(() => setLoading(false))
  }, [days])

  useEffect(() => { load() }, [load, loadKey])

  const primaryCurrency = (() => {
    const byCur = summary?.by_currency || []
    if (byCur.length) {
      const top = [...byCur].sort((a: any, b: any) => Number(b.amount || 0) - Number(a.amount || 0))[0]
      return top.currency || 'BDT'
    }
    return 'BDT'
  })()
  const sym = currencySymbol(primaryCurrency)

  const stats = useMemo(() => {
    if (!summary) return []
    const byStatus = (st: string) => (summary.by_payment_status || []).find((x: any) => x.status === st)
    const pendingAmt = Number(byStatus('pending')?.amount || 0)
    const pendingCount = Number(byStatus('pending')?.total || 0)
    const failedAmt = Number(byStatus('failed')?.amount || 0)
    const failedCount = Number(byStatus('failed')?.total || 0)

    const delta = (cur: number, prev: number) => {
      if (!prev) return cur > 0 ? 100 : 0
      return Math.round(((cur - prev) / prev) * 1000) / 10
    }
    const prevNet = Number(prevSummary?.net_revenue || 0)

    return [
      { label: 'Total Revenue (30d)', value: Number(summary.gross_revenue || 0), pct: delta(Number(summary.gross_revenue), Number(prevSummary?.gross_revenue || 0)), period: 'vs prev 30 days', icon: <DollarSign className="w-4 h-4" />, tone: 'sky' },
      { label: 'Net Revenue (30d)', value: Number(summary.net_revenue || 0), pct: delta(Number(summary.net_revenue), prevNet), period: 'vs prev 30 days', icon: <TrendingUp className="w-4 h-4" />, tone: 'indigo' },
      { label: 'Pending Payments', value: pendingAmt, pct: null, period: `${pendingCount} payments awaiting completion`, icon: <Clock className="w-4 h-4" />, tone: 'amber', count: pendingCount },
      { label: 'Refund Amount (30d)', value: Number(summary.refunds || 0), pct: null, period: 'succeeded refunds', icon: <Undo2 className="w-4 h-4" />, tone: 'rose' },
      { label: 'Instructor Earnings (30d)', value: Number(earnings.net || 0), pct: null, period: `${earnings.instructors || 0} instructors`, icon: <Wallet className="w-4 h-4" />, tone: 'emerald' },
      { label: 'Platform Commission (30d)', value: Number(earnings.platform_fee || 0), pct: null, period: 'platform service fee', icon: <Percent className="w-4 h-4" />, tone: 'indigo' },
      { label: 'Pending Payouts', value: Number(earnings.available || 0), pct: null, period: `${pendingPayouts.count} requested payouts`, icon: <Banknote className="w-4 h-4" />, tone: 'amber', count: pendingPayouts.count },
      { label: 'Failed Payments (30d)', value: failedAmt, pct: null, period: `${failedCount} failed transactions`, icon: <AlertTriangle className="w-4 h-4" />, tone: 'rose', count: failedCount },
    ]
  }, [summary, prevSummary, earnings, pendingPayouts])

  return (
    <FinanceShell>
      <PageHeader
        title="Finance Overview"
        subtitle="Executive command center — live revenue health and operations pulse"
        actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />}
      />

      {loading ? (
        <div className="mt-4"><SkeletonGrid /></div>
      ) : error ? (
        <div className="mt-4"><Panel><ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} /></Panel></div>
      ) : summary ? (
        <>
          {/* LMS finance summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 mb-4">
            {stats.map((s: any) => (
              <Card key={s.label} s={s} sym={sym} />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            {/* Trend */}
            <div className="lg:col-span-2 bg-white border border-[#E9E7F5] rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#0F1B3D]">Revenue trend</h2>
                  <p className="text-[11px] text-[#A9B3C8] mt-0.5">Daily completed-course-payment revenue</p>
                </div>
                <div className="flex gap-1.5">
                  {[7, 14, 30, 90].map((d) => (
                    <button key={d} onClick={() => setDays(d)}
                      className={cn('text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-colors',
                        days === d ? 'text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30' : 'text-[#536078] bg-[#F8FAFC] border border-[#E9E7F5]')}>{d}d</button>
                  ))}
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6D3DF5" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#6D3DF5" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E7F5" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#A9B3C8' }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis tick={{ fontSize: 10, fill: '#A9B3C8' }} tickLine={false} axisLine={false} width={56} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E9E7F5', borderRadius: 12, fontSize: 11, color: '#0F1B3D' }} labelStyle={{ color: '#536078' }} formatter={(value: any) => `${sym}${fmtAmount(value)}`} />
                    <Area type="monotone" dataKey="revenue" stroke="#6D3DF5" strokeWidth={2} fill="url(#ovGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Operations pulse */}
            <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-[#0F1B3D] mb-1">Operations pulse</h2>
              <p className="text-[11px] text-[#A9B3C8] mb-4">Current state across the finance domain</p>
              <div className="space-y-2">
                <OpRow icon={<Landmark className="w-3.5 h-3.5" />} label="Settlements" value={ops.settlements} href="/admin/settlements" />
                <OpRow icon={<ShieldAlert className="w-3.5 h-3.5" />} label="Open disputes" value={ops.disputesOpen} href="/admin/disputes" />
                <OpRow icon={<Link2 className="w-3.5 h-3.5" />} label="Active payment links" value={ops.linksActive} href="/admin/payment-links" />
                <OpRow icon={<Webhook className="w-3.5 h-3.5" />} label="Webhook events" value={ops.webhooks} href="/admin/webhooks" />
                <OpRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Coupons" value={ops.coupons} href="/admin/coupons" />
                <OpRow icon={<Scale className="w-3.5 h-3.5" />} label="Reconciliation runs" value={ops.reconciliation} href="/admin/reconciliation" />
              </div>
            </div>
          </div>

          {/* Period + quick links */}
          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-[#0F1B3D] mb-3">Net revenue by period</h2>
              <div className="space-y-2">
                {[
                  ['Today', summary.today?.net_revenue, summary.today?.orders_paid],
                  ['This week', summary.this_week?.net_revenue, summary.this_week?.orders_paid],
                  ['This month', summary.this_month?.net_revenue, summary.this_month?.orders_paid],
                  ['This year', summary.this_year?.net_revenue, summary.this_year?.orders_paid],
                ].map(([label, val, orders]) => (
                  <div key={String(label)} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2.5">
                    <span className="text-xs text-[#536078]">{String(label)}</span>
                    <span className="text-xs font-semibold text-[#0F1B3D] tabular-nums">{sym}{fmtAmount(Number(val || 0))}<span className="text-[10px] text-[#A9B3C8] font-normal"> · {orders || 0} orders</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-[#E9E7F5] rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-[#0F1B3D] mb-3">Quick access</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  { href: '/admin/payments', label: 'Payments hub', icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { href: '/admin/orders', label: 'Orders', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
                  { href: '/admin/gateways', label: 'Payment Gateways', icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { href: '/admin/earnings', label: 'Instructor Earnings', icon: <Wallet className="w-3.5 h-3.5" /> },
                  { href: '/admin/payouts', label: 'Payouts', icon: <Banknote className="w-3.5 h-3.5" /> },
                  { href: '/admin/disputes', label: 'Disputes', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
                  { href: '/admin/revenue', label: 'Reports', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                  { href: '/admin/transactions', label: 'Transactions', icon: <DollarSign className="w-3.5 h-3.5" /> },
                ].map((q) => (
                  <Link key={q.href} href={q.href}
                    className="flex items-center gap-2 text-xs font-medium text-[#0F1B3D] bg-[#F8FAFC] border border-[#E9E7F5] rounded-xl px-3 py-2.5 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 transition-colors">
                    <span className="text-[#6D3DF5]">{q.icon}</span>{q.label}<ArrowRight className="w-3 h-3 ml-auto text-[#A9B3C8]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Payment status snapshot */}
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-[#0F1B3D] mb-3">Payment status snapshot</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(summary.by_payment_status || []).map((s: any) => (
                <div key={s.status} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2.5">
                  <StatusBadge status={s.status} />
                  <span className="text-xs font-semibold text-[#0F1B3D] tabular-nums">{s.total} · {sym}{fmtAmount(s.amount)}</span>
                </div>
              ))}
              {!(summary.by_payment_status || []).length && <p className="text-xs text-[#A9B3C8]">No payments in range.</p>}
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-[#A9B3C8] mt-6">No overview data available.</p>
      )}
    </FinanceShell>
  )
}

function Card({ s, sym }: { s: any; sym: string }) {
  const tones: Record<string, string> = {
    emerald: 'text-[#18A878] bg-[#ECFBF5] border-[#18A878]/20',
    amber: 'text-[#B45309] bg-[#FFF7E6] border-[#B45309]/20',
    indigo: 'text-[#6D3DF5] bg-[#F3EEFF] border-[#6D3DF5]/20',
    sky: 'text-[#3478F6] bg-[#EEF4FF] border-[#3478F6]/20',
    rose: 'text-[#E11D48] bg-rose-50 border-rose-500/20',
  }
  const up = (s.pct ?? 0) >= 0
  return (
    <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,27,61,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-[#536078] font-medium">{s.label}</p>
          <p className="text-xl font-bold text-[#0F1B3D] tabular-nums mt-1">{sym}{fmtAmount(s.value)}</p>
          <div className="flex items-center gap-2 mt-1.5">
            {s.pct !== null && (
              <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-semibold', up ? 'text-[#18A878]' : 'text-[#E11D48]')}>
                {up ? '▲' : '▼'} {Math.abs(s.pct)}%
              </span>
            )}
            <span className="text-[10px] text-[#A9B3C8] truncate">{s.period}</span>
          </div>
        </div>
        <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', tones[s.tone] || tones.indigo)}>{s.icon}</div>
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E9E7F5] rounded-2xl p-4 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-3 w-24 bg-[#F3EEFF] rounded mb-2" />
              <div className="h-6 w-20 bg-[#F8FAFC] rounded" />
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F8FAFC]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function OpRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: React.ReactNode; href?: string }) {
  const inner = (
    <>
      <span className="text-[#6D3DF5] shrink-0">{icon}</span>
      <span className="text-xs text-[#536078] truncate">{label}</span>
      <span className="ml-auto text-xs font-bold text-[#0F1B3D] tabular-nums">{value}</span>
    </>
  )
  const cls = 'flex items-center gap-2 bg-[#F8FAFC] rounded-xl px-3 py-2.5'
  return href ? <Link href={href} className={cn(cls, 'hover:bg-[#F3EEFF] transition-colors')}>{inner}</Link> : <div className={cls}>{inner}</div>
}
