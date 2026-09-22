'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, FileText, Printer, AlertCircle, CheckCircle2, Banknote } from 'lucide-react'
import { paymentsAPI } from '@/lib/api'
import { currencySymbol, statusBadgeClass, fmtAmount } from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

function InvoiceDetail() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push(`/login?next=/student/invoices/${id}`)
  }, [authLoading, isAuthenticated, id, router])

  useEffect(() => {
    if (!id || !isAuthenticated) return
    paymentsAPI.getInvoice(id)
      .then((res) => setInvoice(res.data?.data))
      .catch((err: any) => {
        if (err?.response?.status === 403) router.push('/student/invoices')
        toast.error('Could not load invoice.')
      })
      .finally(() => setLoading(false))
  }, [id, isAuthenticated, router])

  const handlePrint = async () => {
    try {
      const res = await paymentsAPI.downloadInvoice(id)
      const html = res.data?.data?.html
      const w = window.open('', '_blank')
      if (w && html) {
        w.document.write(html)
        w.onload = () => w.print()
      } else {
        toast.error('Could not open printable invoice.')
      }
    } catch {
      toast.error('Could not open printable invoice.')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin text-[#6D3DF5]" /><span className="text-sm text-slate-500">Loading invoice...</span></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center"><AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" /><h2 className="text-base font-semibold text-[#0B1F3F] mb-1">Invoice not found</h2><Link href="/student/invoices" className="text-sm text-[#6D3DF5] hover:underline">Back to invoices</Link></div>
      </div>
    )
  }

  const symbol = currencySymbol(invoice.currency)

  return (
    <div className="min-h-screen bg-white py-8 px-4 font-inter">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-[640px] h-[640px] bg-[#7C5CFC]/[0.10] rounded-full blur-3xl" />
        <div className="absolute -bottom-44 -left-32 w-[560px] h-[560px] bg-[#3B82F6]/[0.10] rounded-full blur-3xl" />
        <div className="absolute top-[30%] left-[38%] w-[320px] h-[320px] bg-[#2DD4BF]/[0.08] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto">
        <Link href="/student/invoices" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#6D3DF5] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> My Invoices
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(15,27,61,0.05),0_4px_12px_-2px_rgba(15,27,61,0.06),0_24px_60px_-20px_rgba(15,27,61,0.18)] ring-1 ring-slate-900/[0.03]">
          <div className="bg-gradient-to-br from-[#0F1B3D] to-[#1E3A6B] px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-1"><FileText className="w-3 h-3" /> Invoice</div>
                <h1 className="font-mono text-xl font-bold">{invoice.invoice_number}</h1>
              </div>
              <span className={`text-[10px] font-medium border rounded-full px-2.5 py-1 capitalize ${statusBadgeClass(invoice.status)}`}>{invoice.status.replace('_', ' ')}</span>
            </div>
            <p className="text-[11px] text-white/50 mt-2">Issued {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : '—'}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Billed To</p>
                <p className="text-slate-800 font-medium mt-1">{invoice.billing_name || invoice.billing_email || '—'}</p>
                <p className="text-xs text-slate-500">{invoice.billing_email}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Order</p>
                <p className="text-slate-800 font-mono mt-1">{invoice.order_number || '—'}</p>
                <p className="text-xs text-slate-500 capitalize">{invoice.payment_method || '—'}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              {(invoice.items || []).map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-600">{i.title}</span>
                  <span className="text-slate-800 font-medium">{symbol}{fmtAmount(i.total)}</span>
                </div>
              ))}
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-sm text-[#6D3DF5]">
                  <span>{invoice.coupon_code ? `Coupon (${invoice.coupon_code})` : 'Discount'}</span>
                  <span>-{symbol}{fmtAmount(invoice.discount)}</span>
                </div>
              )}
              {Number(invoice.tax) > 0 && (
                <div className="flex justify-between text-sm text-slate-500"><span>Tax / VAT</span><span>{symbol}{fmtAmount(invoice.tax)}</span></div>
              )}
              {Number(invoice.fee) > 0 && (
                <div className="flex justify-between text-sm text-slate-500"><span>Gateway fee</span><span>{symbol}{fmtAmount(invoice.fee)}</span></div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#0B1F3F]">{symbol}{fmtAmount(invoice.total)}</span>
                <span className="text-xs text-slate-400 ml-1">{invoice.currency}</span>
              </div>
            </div>

            {invoice.status === 'paid' && (
              <div className="flex items-center gap-2 bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-xl px-3 py-2.5 text-xs text-[#5B2EE0]">
                <CheckCircle2 className="w-4 h-4" /> Paid{invoice.paid_at ? ` on ${new Date(invoice.paid_at).toLocaleDateString()}` : ''}
              </div>
            )}

            <button onClick={handlePrint}
              className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2B66E0] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_10px_24px_-10px_rgba(109,61,245,0.6)] transition-all">
              <Printer className="w-4 h-4" /> Printer / Save as PDF
            </button>
            <p className="text-center text-[10px] text-slate-400">This invoice is a record of your purchase. No payment is due.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentInvoiceDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white" />}>
      <InvoiceDetail />
    </Suspense>
  )
}