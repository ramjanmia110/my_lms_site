'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, ArrowLeft, Printer, Search, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { paymentsAPI } from '@/lib/api'
import { currencySymbol, statusBadgeClass, fmtAmount } from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'

interface InvoiceRow {
  id: number
  invoice_number: string
  order_number?: string | null
  currency: string
  total: number
  status: string
  created_at?: string | null
  paid_at?: string | null
}

export default function StudentInvoicesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await paymentsAPI.listInvoices({ per_page: 100 })
      setInvoices(res.data?.data?.data || res.data?.data || [])
    } catch {
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?next=/student/invoices')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  const filtered = invoices.filter((i) => {
    const q = search.toLowerCase()
    return !q || i.invoice_number.toLowerCase().includes(q) || (i.order_number || '').toLowerCase().includes(q)
  })

  const totalIssued = invoices.reduce((a, i) => a + Number(i.total || 0), 0)

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
            <h1 className="text-2xl font-bold text-[#0B1F3F] font-space-grotesk">My Invoices</h1>
            <p className="text-xs text-slate-500 mt-0.5">Tax-compliant invoices for your purchases</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Invoices Issued', value: invoices.length, color: 'from-[#6D3DF5] to-[#8B5CF6]' },
            { label: 'Total Billed', value: `${currencySymbol(invoices[0]?.currency)}${fmtAmount(totalIssued)}`, color: 'from-[#3478F6] to-[#2B66E0]' },
            { label: 'Refunded / Void', value: invoices.filter((i) => ['refunded', 'partially_refunded', 'void'].includes(i.status)).length, color: 'from-[#F59E0B] to-[#FBBF24]' },
          ].map((s) => (
            <div key={s.label} className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-3.5 ring-1 ring-black/[0.02] shadow-[0_1px_2px_rgba(15,27,61,0.05),0_4px_12px_-2px_rgba(15,27,61,0.06),0_20px_40px_-16px_rgba(15,27,61,0.10)] hover:-translate-y-0.5 transition-transform">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg mb-2`}><FileText className="w-4 h-4" /></div>
              <div className="text-lg font-bold text-[#0B1F3F]">{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 ring-1 ring-black/[0.02] shadow-[0_1px_2px_rgba(15,27,61,0.05),0_4px_12px_-2px_rgba(15,27,61,0.06),0_20px_40px_-16px_rgba(15,27,61,0.10)]">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or order number..."
              className="w-full bg-white border border-slate-200 rounded-xl h-10 pl-9 pr-3 text-sm text-[#0B1F3F] placeholder:text-slate-400 focus:outline-none focus:border-[#6D3DF5]/50 focus:ring-2 focus:ring-[#6D3DF5]/10" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Invoice', 'Order', 'Date', 'Amount', 'Status', ''].map((h, i) => (
                    <th key={h} className={`text-left text-[10px] text-slate-400 font-medium uppercase tracking-wider pb-2 pr-2 ${i >= 3 ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">{search ? 'No matching invoices.' : 'No invoices yet.'}</td></tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-2"><Link href={`/student/invoices/${inv.id}`}><span className="text-[11px] font-mono text-[#6D3DF5] hover:underline">{inv.invoice_number}</span></Link></td>
                      <td className="py-3 pr-2"><span className="text-[10px] font-mono text-slate-500">{inv.order_number || '—'}</span></td>
                      <td className="py-3 pr-2"><span className="text-[10px] text-slate-500 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : (inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '—')}</span></td>
                      <td className="py-3 pr-2 text-center"><span className="text-xs font-semibold text-[#0B1F3F]">{currencySymbol(inv.currency)}{fmtAmount(inv.total)}</span></td>
                      <td className="py-3 pr-2 text-center"><span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 capitalize ${statusBadgeClass(inv.status)}`}>{inv.status.replace('_', ' ')}</span></td>
                      <td className="py-3 pr-2 text-right">
                        <button onClick={() => paymentsAPI.downloadInvoice(inv.id).then((res) => {
                          const html = res.data?.data?.html
                          const w = window.open('', '_blank')
                          if (w && html) { w.document.write(html); w.onload = () => w.print() }
                        }).catch(() => router.push(`/student/invoices/${inv.id}`))}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2B66E0] rounded-lg px-2 py-1 shadow-[0_6px_16px_-6px_rgba(109,61,245,0.6)] transition-all">
                          <Printer className="w-3 h-3" /> Print
                        </button>
                      </td>
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