'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  TrendingUp, Undo2, ShoppingBag, CreditCard, ArrowUpRight,
  Wallet, AlertCircle,
} from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount } from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'

/** Admin-only Finance Overview + Recent Orders for the main dashboard. */
export function FinanceOverviewSection() {
  const { user } = useAuth()
  const isAdmin = user && user.role === 'admin'

  const [summary, setSummary] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      financeAPI.reports.summary(),
      financeAPI.orders.list({ per_page: 5 }),
    ])
      .then(([s, o]: any) => {
        if (cancelled) return
        setSummary(s.data?.data || null)
        const d = o.data?.data || {}
        setOrders(Array.isArray(d) ? d : d.data || [])
      })
      .catch(() => { if (!cancelled) setError('Finance data unavailable right now.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isAdmin])

  if (!isAdmin) return null

  const primaryCurrency = (() => {
    const byCur = summary?.by_currency || []
    if (byCur.length) {
      const top = [...byCur].sort((a: any, b: any) => Number(b.amount || 0) - Number(a.amount || 0))[0]
      return top.currency || 'BDT'
    }
    return 'BDT'
  })()
  const sym = currencySymbol(primaryCurrency)

  const cards = [
    { label: 'Gross Revenue (30d)', value: `${sym}${fmtAmount(summary?.gross_revenue)}`, icon: <TrendingUp className="w-4 h-4" />, tint: 'bg-[#ECFBF5] text-[#18A878]' },
    { label: 'Net Revenue', value: `${sym}${fmtAmount(summary?.net_revenue)}`, icon: <Wallet className="w-4 h-4" />, tint: 'bg-[#F3EEFF] text-[#6D3DF5]' },
    { label: 'Refunds (30d)', value: `${sym}${fmtAmount(summary?.refunds)}`, icon: <Undo2 className="w-4 h-4" />, tint: 'bg-[#FFF7ED] text-[#F59E0B]' },
    { label: 'Orders Paid', value: summary?.orders_paid ?? 0, icon: <ShoppingBag className="w-4 h-4" />, tint: 'bg-[#EEF4FF] text-[#3478F6]' },
  ]

  return (
    <section className="mt-6 space-y-5">
      {/* Finance Overview cards */}
      <div className="bg-white border border-[#E9E7F5] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#6D3DF5]" />
            <div>
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Finance Overview</h2>
              <p className="text-[11px] text-[#536078] mt-0.5">Live commerce metrics from verified payments</p>
            </div>
          </div>
          <Link href="/admin/revenue" className="inline-flex items-center gap-1 text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium transition-colors">
            Revenue Report <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="px-5 pb-4">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] p-4 animate-pulse">
                  <div className="h-3 w-20 bg-[#E9E7F5] rounded mb-3" />
                  <div className="h-6 w-24 bg-[#E9E7F5] rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-xs text-[#536078] py-3">
              <AlertCircle className="w-4 h-4 text-red-400" /> {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((c) => (
                <div key={c.label} className="bg-gradient-to-b from-[#F8FAFC] to-white border border-[#E9E7F5] rounded-xl p-4 hover:border-[#6D3DF5]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.tint}`}>{c.icon}</div>
                    <p className="text-[11px] font-medium text-[#536078]">{c.label}</p>
                  </div>
                  <p className="text-lg font-bold text-[#0F1B3D] tabular-nums">{c.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#E9E7F5] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#6D3DF5]" />
            <div>
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Recent Orders</h2>
              <p className="text-[11px] text-[#536078] mt-0.5">Latest course checkout activity</p>
            </div>
          </div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium transition-colors">
            View All Orders <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="px-5 pb-4 overflow-x-auto">
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-[#E9E7F5]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-[#E9E7F5] rounded" />
                    <div className="h-3 w-1/4 bg-[#E9E7F5] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-xs text-[#536078] py-3">
              <AlertCircle className="w-4 h-4 text-red-400" /> {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F8FAFC] flex items-center justify-center mb-3"><CreditCard className="w-5 h-5 text-[#6D3DF5]" /></div>
              <p className="text-xs font-medium text-[#536078]">No orders yet</p>
            </div>
          ) : (
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#7A86A3]">
                  <th className="py-2 pr-3 font-semibold">Order</th>
                  <th className="py-2 pr-3 font-semibold">Customer</th>
                  <th className="py-2 pr-3 font-semibold">Gateway</th>
                  <th className="py-2 pr-3 font-semibold">Amount</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {orders.map((o: any) => (
                  <tr key={o.id} className="group hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 pr-3">
                      <p className="text-xs font-semibold text-[#0F1B3D]">{o.order_number}</p>
                      <p className="text-[10px] text-[#7A86A3] mt-0.5">#{o.id}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="text-xs text-[#0F1B3D]">{o.user?.name || '—'}</p>
                      <p className="text-[10px] text-[#7A86A3] mt-0.5">{o.user?.email || ''}</p>
                    </td>
                    <td className="py-3 pr-3 text-xs capitalize text-[#536078]">{o.gateway || '—'}</td>
                    <td className="py-3 pr-3 text-xs font-semibold text-[#0F1B3D] tabular-nums">{currencySymbol(o.currency)}{fmtAmount(o.total)}</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${badgeClass(o.status, o.payment_status)}`}>
                        {o.payment_status?.replace(/_/g, ' ') || o.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  )
}

function badgeClass(orderStatus?: string, paymentStatus?: string) {
  const s = paymentStatus || orderStatus || ''
  if (['completed', 'paid', 'succeeded', 'fulfilled'].includes(s)) return 'bg-[#ECFBF5] text-[#18A878]'
  if (['failed', 'cancelled', 'expired'].includes(s)) return 'bg-red-50 text-red-500 border border-red-200'
  if (['refunded', 'partially_refunded'].includes(s)) return 'bg-[#F3EEFF] text-[#6D3DF5]'
  return 'bg-[#FFF7ED] text-[#D97706] border border-amber-200'
}