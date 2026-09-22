'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Check, X, RefreshCw, Loader2, BookOpen, FileText, ShoppingBag,
  ArrowLeft, ArrowRight, ArrowUpRight, Play
} from 'lucide-react'
import { paymentsAPI } from '@/lib/api'
import { clearPendingEnrollment } from '@/lib/pending-enrollment'
import { cn } from '@/lib/utils'
import CheckoutStepper from '@/components/payment/CheckoutStepper'

export type PaymentStatusKind = 'success' | 'failed' | 'cancelled'

const SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹' }

interface OrderInfo {
  order_number: string
  currency: string
  total: number
  status: string
  payment_status?: string
  course_id?: number
  course_title?: string
  invoice_id?: number | null
  invoice_number?: string | null
  transaction_id?: string | null
  payment_method?: string | null
  created_at?: string | null
  order_id?: number | null
}

const KIND_CONFIG: Record<PaymentStatusKind, {
  iconBg: string
  iconColor: string
  tint: string
  border: string
}> = {
  success: { iconBg: 'from-[#18A878] to-[#0F9D6B]', iconColor: 'text-white', tint: 'bg-[#ECFBF5]', border: 'border-[#18A878]/25' },
  failed: { iconBg: 'from-[#E11D48] to-[#BE123C]', iconColor: 'text-white', tint: 'bg-red-50', border: 'border-red-100' },
  cancelled: { iconBg: 'from-amber-500 to-amber-600', iconColor: 'text-white', tint: 'bg-amber-50', border: 'border-amber-100' },
}

function StatusContent({ kind }: { kind: PaymentStatusKind }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || ''
  const [info, setInfo] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(!!orderNumber)

  useEffect(() => {
    if (!orderNumber) return
    ;(async () => {
      try {
        const res = await paymentsAPI.getOrder(orderNumber)
        const o = res.data?.data
        const courseId = o?.items?.[0]?.course_id
        const payment = o?.payments?.[0]
        setInfo({
          order_id: o?.id ?? null,
          order_number: o?.order_number,
          currency: o?.currency || 'BDT',
          total: Number(o?.total || 0),
          status: o?.status,
          payment_status: o?.payment_status,
          course_id: courseId,
          course_title: o?.items?.[0]?.title,
          invoice_id: o?.invoice?.id ?? null,
          invoice_number: o?.invoice?.invoice_number ?? null,
          transaction_id: payment?.transaction_id ?? null,
          payment_method: payment?.gateway ?? null,
          created_at: o?.created_at ?? null,
        })
        if (kind === 'success') clearPendingEnrollment()
      } catch {
        setInfo({ order_number: orderNumber, currency: 'BDT', total: 0, status: '' })
      } finally {
        setLoading(false)
      }
    })()
  }, [orderNumber, kind])

  const cfg = KIND_CONFIG[kind]
  const symbol = SYMBOL[info?.currency || 'BDT'] || '৳'
  const StepIcon = kind === 'success' ? Check : kind === 'failed' ? X : RefreshCw

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6D3DF5]" />
          <span className="text-sm text-[#536078] font-medium">Loading payment status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#FFFFFF_0%,#F7F5FF_40%,#EFF4FF_75%,#F1FBF7_100%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% -10%, rgba(109,61,245,0.10), transparent 45%)' }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-5 sm:p-6 mb-6 shadow-[0_10px_30px_-18px_rgba(15,27,61,0.25)]">
            <CheckoutStepper current={kind === 'success' ? 4 : 3} />
          </div>

          <div className="bg-white border border-[#E9E7F5] rounded-3xl p-8 shadow-[0_20px_60px_-20px_rgba(15,27,61,0.3)]">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-5">
                {kind === 'success' && <div className="absolute inset-0 rounded-full bg-[#18A878]/15 animate-ping [animation-duration:2.4s]" />}
                <div className={cn('relative w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto shadow-lg', cfg.iconBg)}>
                  <StepIcon className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-[#0F1B3D] mb-1.5">
                {kind === 'success' ? 'Payment Successful!' : kind === 'failed' ? 'Payment Failed' : 'Payment Cancelled'}
              </h1>
              <p className="text-sm text-[#536078] mb-1">
                {kind === 'success' ? 'Your course enrollment has been confirmed.' : kind === 'failed' ? 'Unfortunately, your payment could not be completed.' : 'Your order has not been completed.'}
              </p>
              {info?.course_title && (
                <p className="text-sm font-semibold text-[#6D3DF5] mb-5">{info.course_title}</p>
              )}
            </div>

            {kind === 'success' && info?.order_number && (
              <div className="rounded-2xl border border-[#E9E7F5] bg-[#F9F7FF]/50 p-5 mb-5">
                <p className="text-[10px] font-bold text-[#A9B3C8] uppercase tracking-wider mb-3">Transaction Summary</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Order ID', value: info.order_number },
                    { label: 'Transaction ID', value: info.transaction_id || '—' },
                    { label: 'Payment Method', value: info.payment_method || '—' },
                    { label: 'Amount Paid', value: `${symbol}${info.total.toFixed(2)}`, bold: true },
                    { label: 'Course', value: info.course_title || '—' },
                    { label: 'Date', value: info.created_at ? new Date(info.created_at).toLocaleString() : '—' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-[#536078]">{row.label}</span>
                      <span className={cn('text-right', row.bold ? 'text-[#0F1B3D] font-bold' : 'text-[#0F1B3D] font-medium')}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#536078]">Payment Status</span>
                    <span className="text-[11px] font-bold text-[#0F9D6B] bg-[#ECFBF5] border border-[#18A878]/25 rounded-full px-2.5 py-0.5">Paid</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#536078]">Enrollment Status</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#0F9D6B] bg-[#ECFBF5] border border-[#18A878]/25 rounded-full px-2.5 py-0.5">
                      <Check className="w-3 h-3" strokeWidth={3} /> Confirmed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {kind !== 'success' && info?.order_number && (
              <div className={cn('rounded-2xl border p-4 mb-5', cfg.border, cfg.tint)}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#536078]">Order</span>
                  <span className="text-[#0F1B3D] font-mono font-semibold">{info.order_number || '—'}</span>
                </div>
                {info.course_id && (
                  <p className="text-[11px] text-[#536078]">No funds were moved. You can retry with the same or a different method.</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {kind === 'success' ? (
                <>
                  <Link href={info?.course_id ? `/dashboard?enrolled=${info.course_id}` : '/dashboard/courses'}
                    className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_10px_24px_-10px_rgba(109,61,245,0.6)]">
                    <Play className="w-4 h-4" /> Start Learning <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/dashboard/courses"
                    className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                    <BookOpen className="w-4 h-4" /> Go to My Courses
                  </Link>
                  {info?.invoice_id && (
                    <Link href={`/student/invoices/${info.invoice_id}`}
                      className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                      <FileText className="w-4 h-4" /> View Invoice {info.invoice_number ? `• ${info.invoice_number}` : ''}
                    </Link>
                  )}
                  <Link href="/student/orders"
                    className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                    <ShoppingBag className="w-4 h-4" /> View My Orders
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push(info?.course_id ? `/payment/${info.course_id}` : '/student/orders')}
                    className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_10px_24px_-10px_rgba(109,61,245,0.6)]">
                    <RefreshCw className="w-4 h-4" /> {kind === 'failed' ? 'Try Again' : 'Return to Payment'}
                  </button>
                  {kind === 'failed' && (
                    <button
                      onClick={() => router.push(info?.course_id ? `/payment/${info.course_id}?step=payment` : '/student/orders')}
                      className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold transition-all">
                      Choose Another Payment Method
                    </button>
                  )}
                  <Link href="/dashboard/courses"
                    className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                    <ArrowUpRight className="w-4 h-4" /> Back to Course
                  </Link>
                </>
              )}
              <Link href="/dashboard"
                className="text-xs text-[#A9B3C8] hover:text-[#536078] inline-flex items-center justify-center gap-1 mt-1">
                <ArrowLeft className="w-3 h-3" /> Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentStatusView({ kind }: { kind: PaymentStatusKind }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" />}>
      <StatusContent kind={kind} />
    </Suspense>
  )
}