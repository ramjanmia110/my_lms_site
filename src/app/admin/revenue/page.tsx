'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DollarSign, Undo2, TrendingUp, ShoppingBag, CalendarDays, BarChart3,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from 'recharts'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount } from '@/lib/payments'
import { cn } from '@/lib/utils'
import { FinanceShell } from '@/components/finance/FinanceShell'
import { PageHeader, Panel, RefreshBtn, PillBtn, StatusBadge, LoadingBlock, ErrorBlock } from '@/components/finance/ui'

export default function AdminRevenuePage() {
  const [summary, setSummary] = useState<any>(null)
  const [series, setSeries] = useState<any[]>([])
  const [byCourse, setByCourse] = useState<any[]>([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([
      financeAPI.reports.summary(),
      financeAPI.reports.series({ days }),
      financeAPI.reports.byCourse(),
    ])
      .then(([s, ser, bc]: any) => {
        setSummary(s.data?.data || null)
        setSeries(ser.data?.data || [])
        setByCourse(bc.data?.data || [])
      })
      .catch(() => setError('Could not load revenue reports.'))
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

  return (
    <FinanceShell>
      <PageHeader
        title="Revenue"
        subtitle="Live financial reporting from verified payments, refunds and orders"
        actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />}
      />

      {loading ? (
        <div className="mt-4"><Panel><LoadingBlock rows={6} /></Panel></div>
      ) : error ? (
        <div className="mt-4"><Panel><ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} /></Panel></div>
      ) : summary ? (
        <>
          {/* 30-day headline */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 mb-4">
            <Stat icon={<DollarSign className="w-4 h-4" />} tone="emerald" label="Gross revenue (30d)" value={`${sym}${fmtAmount(summary.gross_revenue)}`} sub={`Primary currency ${primaryCurrency}`} />
            <Stat icon={<Undo2 className="w-4 h-4" />} tone="amber" label="Refunds (30d)" value={`${sym}${fmtAmount(summary.refunds)}`} sub="succeeded refunds" />
            <Stat icon={<TrendingUp className="w-4 h-4" />} tone="indigo" label="Net revenue" value={`${sym}${fmtAmount(summary.net_revenue)}`} sub="gross − refunds" />
            <Stat icon={<ShoppingBag className="w-4 h-4" />} tone="sky" label="Orders paid" value={summary.orders_paid} sub="completed payments" />
          </div>

          {/* Period net */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Stat icon={<CalendarDays className="w-4 h-4" />} tone="slate" label="Today (net)" value={`${sym}${fmtAmount(summary.today?.net_revenue)}`} sub={`${summary.today?.orders_paid || 0} orders`} />
            <Stat icon={<CalendarDays className="w-4 h-4" />} tone="slate" label="This week (net)" value={`${sym}${fmtAmount(summary.this_week?.net_revenue)}`} sub={`${summary.this_week?.orders_paid || 0} orders`} />
            <Stat icon={<CalendarDays className="w-4 h-4" />} tone="slate" label="This month (net)" value={`${sym}${fmtAmount(summary.this_month?.net_revenue)}`} sub={`${summary.this_month?.orders_paid || 0} orders`} />
            <Stat icon={<CalendarDays className="w-4 h-4" />} tone="slate" label="This year (net)" value={`${sym}${fmtAmount(summary.this_year?.net_revenue)}`} sub={`${summary.this_year?.orders_paid || 0} orders`} />
          </div>

          {/* Trend chart */}
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 backdrop-blur mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#0F1B3D]">Revenue trend</h2>
                <p className="text-[11px] text-[#A9B3C8] mt-0.5">Daily completed-payment revenue and order volume</p>
              </div>
              <div className="flex gap-1.5">
                {[7, 14, 30, 90].map((d) => (
                  <PillBtn key={d} active={days === d} onClick={() => setDays(d)}>{d}d</PillBtn>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6D3DF5" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#6D3DF5" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9E7F5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#A9B3C8' }} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tick={{ fontSize: 10, fill: '#A9B3C8' }} tickLine={false} axisLine={false} width={56} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E9E7F5', borderRadius: 12, fontSize: 11, color: '#0F1B3D' }}
                    labelStyle={{ color: '#536078' }}
                    formatter={(value: any, name: any) => [name === 'revenue' ? `${sym}${fmtAmount(value)}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6D3DF5" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E9E7F5] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {[['Total revenue', series.reduce((s, r) => s + Number(r.revenue || 0), 0)], ['Total orders', series.reduce((s, r) => s + Number(r.orders || 0), 0)], ['Avg / day', series.length ? series.reduce((s, r) => s + Number(r.revenue || 0), 0) / series.length : 0], ['Best day', Math.max(0, ...series.map((r) => Number(r.revenue || 0)))]].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-[10px] uppercase tracking-wider text-[#A9B3C8]">{String(label)}</p>
                  <p className="text-sm font-bold text-[#0F1B3D] tabular-nums mt-1">{typeof value === 'number' ? `${sym}${fmtAmount(value)}` : value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Splits */}
          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <BreakdownCard title="By payment status" icon={<BarChart3 className="w-3.5 h-3.5" />}>
              {(summary.by_payment_status || []).map((s: any) => (
                <Row key={s.status} label={<StatusBadge status={s.status} />} value={`${s.total} · ${sym}${fmtAmount(s.amount)}`} />
              ))}
              {!(summary.by_payment_status || []).length && <p className="text-xs text-[#A9B3C8]">No payments in range.</p>}
            </BreakdownCard>
            <BreakdownCard title="By gateway" icon={<BarChart3 className="w-3.5 h-3.5" />}>
              {(summary.by_gateway || []).map((g: any) => (
                <Row key={g.gateway} label={<span className="capitalize text-[#536078]">{g.gateway || '—'}</span>} value={`${g.total} · ${sym}${fmtAmount(g.amount)}`} />
              ))}
              {!(summary.by_gateway || []).length && <p className="text-xs text-[#A9B3C8]">No gateway volume yet.</p>}
            </BreakdownCard>
            <BreakdownCard title="By currency" icon={<BarChart3 className="w-3.5 h-3.5" />}>
              {(summary.by_currency || []).map((c: any) => (
                <Row key={c.currency} label={<span className="text-[#536078]">{c.currency}</span>} value={`${c.total} · ${sym}${fmtAmount(c.amount)}`} />
              ))}
              {!(summary.by_currency || []).length && <p className="text-xs text-[#A9B3C8]">No settlement currency data.</p>}
            </BreakdownCard>
          </div>

          {/* Top courses */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#6D3DF5]" />
                  <h2 className="text-sm font-semibold text-[#0F1B3D]">Top courses by revenue</h2>
                </div>
                <span className="text-[11px] text-[#A9B3C8]">Top 5</span>
              </div>
              {(summary.top_courses || []).map((c: any) => (
                <div key={c.course_id || c.title} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2.5 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0F1B3D] truncate">{c.title}</p>
                    <p className="text-[10px] text-[#A9B3C8] mt-0.5">{c.orders} order{c.orders === 1 ? '' : 's'}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0F1B3D] tabular-nums">{sym}{fmtAmount(c.revenue)}</p>
                </div>
              ))}
              {!(summary.top_courses || []).length && <p className="text-xs text-[#A9B3C8]">No completed orders in range.</p>}
              {(summary.top_courses || []).length > 0 && <p className="text-[10px] text-[#A9B3C8] mt-1">Course-level figures use the order's primary cart item.</p>}
            </div>

            {/* Course revenue bars (full period) */}
            <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#6D3DF5]" />
                  <h2 className="text-sm font-semibold text-[#0F1B3D]">Course revenue rank</h2>
                </div>
              </div>
              {byCourse.length ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byCourse.slice(0, 8)} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E9E7F5" vertical={false} />
                      <XAxis dataKey="title" tick={{ fontSize: 9, fill: '#A9B3C8' }} tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 10, fill: '#A9B3C8' }} tickLine={false} axisLine={false} width={56} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #E9E7F5', borderRadius: 12, fontSize: 11, color: '#0F1B3D' }}
                        labelStyle={{ color: '#536078' }}
                        formatter={(value: any) => `${sym}${fmtAmount(value)}`}
                      />
                      <Bar dataKey="revenue" fill="#6D3DF5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-[#A9B3C8]">No course revenue data in range.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-[#A9B3C8] mt-6">No report data available.</p>
      )}
    </FinanceShell>
  )
}

function Stat({ icon, tone, label, value, sub }: { icon: React.ReactNode; tone: string; label: string; value: React.ReactNode; sub?: string }) {
  const tones: Record<string, string> = {
    emerald: 'text-[#18A878] bg-[#ECFBF5] border-[#18A878]/20',
    amber: 'text-[#B45309] bg-[#FFF7E6] border-[#B45309]/20',
    indigo: 'text-[#6D3DF5] bg-[#F3EEFF] border-[#6D3DF5]/20',
    sky: 'text-[#3478F6] bg-[#EEF4FF] border-[#3478F6]/20',
    slate: 'text-[#536078] bg-[#F8FAFC] border-[#E9E7F5]',
  }
  return (
    <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-[#536078] font-medium">{label}</p>
          <p className="text-xl font-bold text-[#0F1B3D] tabular-nums mt-1">{value}</p>
          {sub && <p className="text-[10px] text-[#A9B3C8] mt-1 truncate">{sub}</p>}
        </div>
        <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', tones[tone])}>{icon}</div>
      </div>
    </div>
  )
}

function BreakdownCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/20 flex items-center justify-center text-[#6D3DF5]">{icon}</div>
        <h3 className="text-sm font-semibold text-[#0F1B3D]">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2.5">
      <div className="min-w-0 truncate text-xs">{label}</div>
      <div className="text-xs font-semibold text-[#0F1B3D] tabular-nums ml-2 whitespace-nowrap">{value}</div>
    </div>
  )
}
