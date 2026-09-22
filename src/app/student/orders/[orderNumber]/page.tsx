'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, ArrowLeft, FileText, RefreshCw, AlertCircle,
  CheckCircle, Banknote, Tag, Timer, Undo2, ChevronRight
} from 'lucide-react'
import { paymentsAPI } from '@/lib/api'
import { currencySymbol, statusBadgeClass, isPayable, fmtAmount } from '@/lib/payments'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

interface PaymentSession {
  id: number
  status: string
  amount: number
  method?: string
  gateway?: string
  transaction_id?: string | null
}

function OrderDetail() {
  const params = useParams()
  const router = useRouter()
  const orderNumber = String(params.orderNumber)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?next=/student/orders')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!orderNumber || !isAuthenticated) return
    paymentsAPI.getOrder(orderNumber)
      .then((res) => setOrder(res.data?.data))
      .catch((err: any) => {
        if (err?.response?.status === 403) router.push('/student/orders')
        toast.error('Could not load order.')
      })
      .finally(() => setLoading(false))
  }, [orderNumber, isAuthenticated, router])

  const submitRefund = async () => {
    if (!order) return
    setSubmitting(true)
    try {
      const amount = refundAmount ? Number(refundAmount) : Math.min(Number(order.refunded_amount || 0) + Number(order.total || 0) || Number(order.total), Number(order.total || 0))
      await paymentsAPI.requestRefund({ order_number: order.order_number, amount, reason: refundReason })
      toast.success('Refund request submitted. An admin will review it.')
      setRefundOpen(false)
      setRefundReason('')
      setRefundAmount('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Could not submit refund request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-700">
        <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /><span className="text-sm text-white/60">Loading order...</span></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-700 p-4">
        <div className="text-center"><AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" /><h2 className="text-base font-semibold text-white mb-1">Order not found</h2><Link href="/student/orders" className="text-sm text-orange-400 hover:underline inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to orders</Link></div>
      </div>
    )
  }

  const symbol = currencySymbol(order.currency)
  const payable = isPayable(order.status)
  const courseId = order.items?.[0]?.course_id

  return (
    <div className="min-h-screen bg-brand-700 pb-16">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 pt-8">
        <Link href="/student/orders" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> My Orders
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white font-space-grotesk font-mono">{order.order_number}</h1>
            <p className="text-xs text-white/50 mt-0.5">Placed {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</p>
          </div>
          <span className={`text-xs font-medium border rounded-full px-3 py-1 capitalize ${statusBadgeClass(order.status)}`}>{order.status.replace('_', ' ')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order card */}
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              {order.items?.map((i: any) => (
                <div key={i.course_id} className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {i.thumbnail && <img src={i.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                    <span className="text-white truncate">{i.title}</span>
                  </div>
                  <span className="text-white/70 font-medium">{symbol}{fmtAmount(i.total)}</span>
                </div>
              ))}
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-brand-300">
                  <span>{order.coupon_code ? `Coupon (${order.coupon_code})` : 'Discount'}</span>
                  <span>-{symbol}{fmtAmount(order.discount)}</span>
                </div>
              )}
              {Number(order.tax) > 0 && (
                <div className="flex justify-between text-white/60"><span>Tax / VAT</span><span>{symbol}{fmtAmount(order.tax)}</span></div>
              )}
              {Number(order.fee) > 0 && (
                <div className="flex justify-between text-white/60"><span>Gateway fee</span><span>{symbol}{fmtAmount(order.fee)}</span></div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2.5 mt-2">
                <span className="font-semibold text-white">Total Paid</span>
                <span className="font-bold text-white">{symbol}{fmtAmount(order.total)}</span>
              </div>
              {Number(order.refunded_amount) > 0 && (
                <div className="flex justify-between text-orange-300 text-xs"><span>Refunded amount</span><span>{symbol}{fmtAmount(order.refunded_amount)}</span></div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {payable && courseId && (
                <Link href={`/payment/${courseId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 hover:bg-orange-500/20 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Pay Now
                </Link>
              )}
              {order.invoice && (
                <Link href={`/student/invoices/${order.invoice.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors">
                  <FileText className="w-3.5 h-3.5" /> View Invoice
                </Link>
              )}
              {order.status === 'paid' && Number(order.refunded_amount || 0) < Number(order.total || 0) && (
                <button onClick={() => setRefundOpen((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-xl px-3 py-2 hover:bg-brand-500/20 transition-colors">
                  <Undo2 className="w-3.5 h-3.5" /> Request Refund
                </button>
              )}
              {order.payment_status && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1.5 ${statusBadgeClass(order.payment_status)}`}>Payment: {order.payment_status}</span>
              )}
            </div>
          </div>

          {/* Payments / refund form */}
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur">
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Payment Sessions</h2>
              {order.payments?.length ? (
                <div className="space-y-2.5">
                  {order.payments.map((p: PaymentSession) => (
                    <div key={p.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-xs text-white font-medium capitalize">{p.method || p.gateway || 'payment'}</p>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">{p.transaction_id || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white font-semibold">{symbol}{fmtAmount(p.amount)}</p>
                        <span className={`inline-block text-[9px] font-medium border rounded-full px-2 py-0.5 mt-1 capitalize ${statusBadgeClass(p.status)}`}>{p.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">No payment sessions yet.</p>
              )}
            </div>

            {refundOpen && (
              <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-2xl p-5">
                <h2 className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-3">Request a Refund</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-wider">Amount (leave empty for full refund)</label>
                    <input value={refundAmount} onChange={(e) => setRefundAmount(e.target.value.replace(/[^\d.]/g, ''))} type="number" min="0"
                      placeholder={`Full refund ${symbol}${fmtAmount(order.total)}`}
                      className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-wider">Reason</label>
                    <textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={3} maxLength={2000}
                      placeholder="Why are you requesting a refund?"
                      className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-500/20 resize-none" />
                  </div>
                  <button onClick={submitRefund} disabled={submitting || !refundReason.trim()}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Request <ChevronRight className="w-4 h-4" /></>}
                  </button>
                  <p className="text-[10px] text-white/40">Refunds are reviewed against the refund policy before being issued to your original payment method.</p>
                </div>
              </div>
            )}

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-start gap-2.5">
              <Timer className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <p className="text-[11px] text-white/50 leading-relaxed">
                {order.expires_at ? <>Unpaid orders expire on <span className="text-white/70">{new Date(order.expires_at).toLocaleString()}</span>.</> : ''}
                {' '}Need help with this order? Contact support with your order number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentOrderDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-700" />}>
      <OrderDetail />
    </Suspense>
  )
}