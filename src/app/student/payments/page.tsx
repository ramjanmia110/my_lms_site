'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, ArrowLeft, Search, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { paymentsAPI } from '@/lib/api'
import { currencySymbol, statusBadgeClass, fmtAmount } from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'

interface SessionRow {
  id: number
  order_number: string
  course_title: string
  amount: number
  currency: string
  status: string
  method?: string
  gateway?: string
  transaction_id?: string | null
  created_at?: string | null
}

export default function StudentPaymentsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await paymentsAPI.listOrders({ per_page: 100 })
      const orders = res.data?.data?.data || res.data?.data || []
      const flat: SessionRow[] = []
      for (const o of orders) {
        for (const p of o.payments || []) {
          flat.push({
            id: p.id,
            order_number: o.order_number,
            course_title: o.items?.[0]?.title || 'Course order',
            amount: Number(p.amount || 0),
            currency: o.currency,
            status: p.status,
            method: p.method,
            gateway: p.gateway,
            transaction_id: p.transaction_id,
            created_at: o.created_at,
          })
        }
      }
      setSessions(flat)
    } catch {
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?next=/student/payments')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase()
    return !q || s.order_number.toLowerCase().includes(q) || s.course_title.toLowerCase().includes(q) || (s.transaction_id || '').toLowerCase().includes(q)
  })

  const completed = sessions.filter((s) => ['completed', 'paid', 'succeeded'].includes(s.status)).length
  const totalCharged = sessions.filter((s) => ['completed', 'paid', 'succeeded'].includes(s.status)).reduce((a, s) => a + s.amount, 0)

  return (
    <div className="min-h-screen bg-white pb-16 font-inter">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-[640px] h-[640px] bg-[#7C5CFC]/[0.10] rounded-full blur-3xl" />
        <div className="absolute -bottom-44 -left-32 w-[560px] h-[560px] bg-[#3B82F6]/[0.10] rounded-full blur-3xl" />
        <div className="absolute top-[45%] left-[42%] w-[320px] h-[320px] bg-[#2DD4BF]/[0.10] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pt-8">
        <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#6D3DF5] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3F] font-space-grotesk">Payment History</h1>
            <p className="text-xs text-slate-500 mt-0.5">All gateway payment sessions across your orders</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Successful Payments', value: completed, color: 'from-[#6D3DF5] to-[#8B5CF6]' },
            { label: 'Total Charged', value: `${currencySymbol(sessions[0]?.currency)}${fmtAmount(totalCharged)}`, color: 'from-[#3478F6] to-[#2B66E0]' },
            { label: 'Gateway Sessions', value: sessions.length, color: 'from-[#F59E0B] to-[#FBBF24]' },
          ].map((s) => (
            <div key={s.label} className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-3.5 ring-1 ring-black/[0.02] shadow-[0_1px_2px_rgba(15,27,61,0.05),0_4px_12px_-2px_rgba(15,27,61,0.06),0_20px_40px_-16px_rgba(15,27,61,0.10)] hover:-translate-y-0.5 transition-transform">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg mb-2`}><CreditCard className="w-4 h-4" /></div>
              <div className="text-lg font-bold text-[#0B1F3F]">{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 ring-1 ring-black/[0.02] shadow-[0_1px_2px_rgba(15,27,61,0.05),0_4px_12px_-2px_rgba(15,27,61,0.06),0_20px_40px_-16px_rgba(15,27,61,0.10)]">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, course or transaction..."
              className="w-full bg-white border border-slate-200 rounded-xl h-10 pl-9 pr-3 text-sm text-[#0B1F3F] placeholder:text-slate-400 focus:outline-none focus:border-[#6D3DF5]/50 focus:ring-2 focus:ring-[#6D3DF5]/10" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Order', 'Course', 'Method', 'Transaction', 'Amount', 'Status'].map((h, i) => (
                    <th key={h} className={`text-left text-[10px] text-slate-400 font-medium uppercase tracking-wider pb-2 pr-2 ${i >= 4 ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">{search ? 'No matching payments.' : 'No payments yet. Visit a course to checkout.'}</td></tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-2"><Link href={`/student/orders/${s.order_number}`}><span className="text-[11px] font-mono text-[#6D3DF5] hover:underline">{s.order_number}</span></Link></td>
                      <td className="py-3 pr-2"><p className="text-xs text-[#0B1F3F] max-w-[200px] truncate">{s.course_title}</p></td>
                      <td className="py-3 pr-2"><span className="text-[10px] text-slate-500 capitalize">{s.method || s.gateway || '—'}</span></td>
                      <td className="py-3 pr-2"><span className="text-[10px] font-mono text-slate-500">{s.transaction_id || '—'}</span></td>
                      <td className="py-3 pr-2 text-center"><span className="text-xs font-semibold text-[#0B1F3F]">{currencySymbol(s.currency)}{fmtAmount(s.amount)}</span></td>
                      <td className="py-3 pr-2 text-center"><span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 capitalize ${statusBadgeClass(s.status)}`}>{s.status.replace('_', ' ')}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}