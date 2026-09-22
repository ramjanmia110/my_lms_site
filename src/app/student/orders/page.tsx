'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Loader2, ShoppingBag, FileText, Wallet, RefreshCw, ArrowLeft,
  Banknote, Search, CalendarDays
} from 'lucide-react'
import { paymentsAPI } from '@/lib/api'
import { currencySymbol, statusBadgeClass, isPayable, fmtAmount } from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface OrderRow {
  id: number
  order_number: string
  user_id?: number
  currency: string
  subtotal?: number
  discount?: number
  total: number
  refunded_amount?: number
  status: string
  payment_status?: string
  created_at?: string | null
  paid_at?: string | null
  items?: { course_id: number; title: string; thumbnail?: string | null; price: number }[]
  invoice?: { id: number; invoice_number: string; status: string } | null
}

export default function StudentOrdersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await paymentsAPI.listOrders({ per_page: 100 })
      setOrders(res.data?.data?.data || res.data?.data || [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?next=/student/orders')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchQ = !q || o.order_number.toLowerCase().includes(q) || (o.items?.[0]?.title || '').toLowerCase().includes(q)
    const matchF = filter === 'all' || o.status === filter
    return matchQ && matchF
  })

  const totals = orders.reduce((acc, o) => {
    acc.total += Number(o.total || 0)
    if (o.status === 'paid' || o.status === 'completed') acc.spent += Number(o.total || 0)
    return acc
  }, { total: 0, spent: 0 })

  const filters = ['all', 'pending', 'payment_processing', 'paid', 'failed', 'cancelled', 'expired', 'refunded']

  return (
    <div className="min-h-screen bg-white pb-16 font-inter">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-[640px] h-[640px] bg-[#7C5CFC]/[0.10] rounded-full blur-3xl" />
        <div className="absolute -bottom-44 -left-32 w-[560px] h-[560px] bg-[#3B82F6]/[0.10] rounded-full blur-3xl" />
        <div className="absolute top-[45%] left-[42%] w-[320px] h-[320px] bg-[#2DD4BF]/[0.10] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#6D3DF5] mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
            <h1 className="text-2xl font-bold text-[#0B1F3F] font-space-grotesk">My Orders</h1>
            <p className="text-xs text-slate-500 mt-0.5">All your course purchase orders in one place</p>
          </div>
          <Link href="/payment" className="hidden" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Orders', value: orders.length, icon: <ShoppingBag className="w-4 h-4" />, color: 'from-[#6D3DF5] to-[#8B5CF6]' },
            { label: 'Total Spent', value: `${currencySymbol(orders[0]?.currency)}${fmtAmount(totals.spent)}`, icon: <Banknote className="w-4 h-4" />, color: 'from-[#3478F6] to-[#2B66E0]' },
            { label: 'Active Payments', value: orders.filter((o) => isPayable(o.status)).length, icon: <RefreshCw className="w-4 h-4" />, color: 'from-[#F59E0B] to-[#FBBF24]' },
            { label: 'Invoices', value: orders.filter((o) => o.invoice).length, icon: <FileText className="w-4 h-4" />, color: 'from-[#2DD4BF] to-[#14B8A6]' },
          ].map((s) => (
            <div key={s.label} className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-3.5 ring-1 ring-black/[0.02] shadow-[0_1px_2px_rgba(15,27,61,0.05),0_4px_12px_-2px_rgba(15,27,61,0.06),0_20px_40px_-16px_rgba(15,27,61,0.10)] hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>{s.icon}</div>
              </div>
              <div className="text-lg font-bold text-[#0B1F3F]">{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 ring-1 ring-black/[0.02] shadow-[0_1px_2px_rgba(15,27,61,0.05),0_4px_12px_-2px_rgba(15,27,61,0.06),0_20px_40px_-16px_rgba(15,27,61,0.10)]">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order number or course..."
                className="w-full bg-white border border-slate-200 rounded-xl h-10 pl-9 pr-3 text-sm text-[#0B1F3F] placeholder:text-slate-400 focus:outline-none focus:border-[#6D3DF5]/50 focus:ring-2 focus:ring-[#6D3DF5]/10"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cnFilter(filter === f)}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Order', 'Course', 'Amount', 'Date', 'Status', 'Invoice', 'Actions'].map((h, i) => (
                    <th key={h} className={`text-left text-[10px] text-slate-400 font-medium uppercase tracking-wider pb-2 pr-2 ${i >= 2 ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">No orders {search && 'matching your search'}.</td></tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-2"><Link href={`/student/orders/${o.order_number}`}><span className="text-[11px] font-mono text-[#6D3DF5] hover:underline">{o.order_number}</span></Link></td>
                      <td className="py-3 pr-2"><p className="text-xs text-[#0B1F3F] max-w-[240px] truncate">{o.items?.[0]?.title || 'Course order'}</p></td>
                      <td className="py-3 pr-2 text-center"><span className="text-xs font-semibold text-[#0B1F3F]">{currencySymbol(o.currency)}{fmtAmount(o.total)}</span></td>
                      <td className="py-3 pr-2 text-center"><span className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><CalendarDays className="w-3 h-3" />{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</span></td>
                      <td className="py-3 pr-2 text-center"><span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 capitalize ${statusBadgeClass(o.status)}`}>{o.status.replace('_', ' ')}</span></td>
                      <td className="py-3 pr-2 text-center">
                        {o.invoice ? (
                          <Link href={`/student/invoices/${o.invoice.id}`} className="text-[10px] font-mono text-[#6D3DF5] hover:underline">{o.invoice.invoice_number}</Link>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPayable(o.status) && o.items?.[0]?.course_id && (
                            <Link href={`/payment/${o.items[0].course_id}`} className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2B66E0] rounded-lg px-2 py-1 shadow-[0_6px_16px_-6px_rgba(109,61,245,0.6)] transition-all">
                              <RefreshCw className="w-3 h-3" /> Pay
                            </Link>
                          )}
                          <Link href={`/student/invoices/${o.invoice?.id ?? ''}`} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50/60 rounded-lg px-2 py-1 transition-colors">
                            <Wallet className="w-3 h-3" /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">No orders found.</div>
            ) : (
              filtered.map((o) => (
                <div key={o.id} className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-[0_1px_2px_rgba(15,27,61,0.05),0_8px_20px_-8px_rgba(15,27,61,0.08)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/student/orders/${o.order_number}`}><span className="text-[11px] font-mono text-[#6D3DF5]">{o.order_number}</span></Link>
                      <p className="text-sm text-[#0B1F3F] mt-1">{o.items?.[0]?.title || 'Course order'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{(o.created_at || '—').slice(0, 10)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0B1F3F]">{currencySymbol(o.currency)}{fmtAmount(o.total)}</p>
                      <span className={`inline-block text-[9px] font-medium border rounded-full px-2 py-0.5 mt-1 capitalize ${statusBadgeClass(o.status)}`}>{o.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {(isPayable(o.status) || o.invoice) && (
                    <div className="flex gap-2 mt-3">
                      {isPayable(o.status) && o.items?.[0]?.course_id && (
                        <Link href={`/payment/${o.items[0].course_id}`} className="flex-1 text-center text-[10px] font-semibold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2B66E0] rounded-lg px-2 py-1.5 shadow-[0_6px_16px_-6px_rgba(109,61,245,0.6)] transition-all">Pay Now</Link>
                      )}
                      {o.invoice && (
                        <Link href={`/student/invoices/${o.invoice.id}`} className="flex-1 text-center text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50/60 rounded-lg px-2 py-1.5 transition-colors">Invoice</Link>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function cnFilter(active: boolean): string {
  return active
    ? 'text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-full px-3 py-1 text-[10px] font-medium capitalize transition-colors'
    : 'text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1 text-[10px] font-medium capitalize hover:border-violet-300 hover:text-[#6D3DF5] hover:bg-violet-50/60 transition-colors'
}