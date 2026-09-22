'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, RefreshCw, AlertCircle, Lock, ShieldCheck, ArrowLeft, FileText } from 'lucide-react'
import { paymentsAPI } from '@/lib/api'
import { clearPendingEnrollment } from '@/lib/pending-enrollment'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import CheckoutStepper from '@/components/payment/CheckoutStepper'

const STATUS_FLOW = [
  { key: 'initializing', label: 'Initializing payment', desc: 'Securing your order details' },
  { key: 'redirecting', label: 'Redirecting to gateway', desc: 'Connecting to the payment network' },
  { key: 'processing', label: 'Processing payment', desc: 'Confirming your transaction with the gateway' },
  { key: 'verifying', label: 'Verifying payment', desc: 'Cross-checking the transaction securely' },
  { key: 'finalizing', label: 'Finalizing enrollment', desc: 'Activating your course access' },
]

function ProcessingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || ''
  const [attempt, setAttempt] = useState(0)
  const [gaveUp, setGaveUp] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const doneRef = useRef(false)

  const activeStage = attempt <= 0 ? 'initializing' : attempt <= 1 ? 'processing' : attempt > 4 ? 'finalizing' : 'verifying'

  useEffect(() => {
    if (!orderNumber || doneRef.current) return
    ;(async () => {
      let orderId: number | null = null
      try {
        const res = await paymentsAPI.getOrder(orderNumber)
        orderId = res.data?.data?.id
        if (!orderId) throw new Error('Order not found')
      } catch (err: any) {
        if (err?.response?.status === 401) {
          toast.error('Session expired. Please log in and check your orders.')
          router.push('/login')
          return
        }
        setErrorMsg(err?.message || 'Could not locate your order.')
        return
      }

      const MAX_POLLS = 24
      for (let i = 1; i <= MAX_POLLS; i += 1) {
        setAttempt(i)
        try {
          const res = await paymentsAPI.checkOrder(orderId as number)
          const data = res.data?.data || {}
          const outcome = data.outcome || ''
          const paymentStatus = data.payment_status || ''
          const orderStatus = data.order_status || ''

          const terminal = ['completed', 'paid', 'fulfilled', 'successful'].includes(String(paymentStatus)) ||
            ['paid', 'completed', 'fulfilled'].includes(String(orderStatus)) ||
            ['fulfilled', 'already_processed', 'success'].includes(String(outcome))

          if (terminal) {
            clearPendingEnrollment()
            doneRef.current = true
            router.replace(`/payment/success?order=${encodeURIComponent(orderNumber)}`)
            return
          }

          const dead = ['failed', 'cancelled', 'expired'].includes(String(outcome)) ||
            ['failed', 'cancelled', 'expired'].includes(String(paymentStatus)) ||
            ['failed', 'cancelled', 'expired'].includes(String(orderStatus))

          if (dead) {
            doneRef.current = true
            router.replace(`/payment/${outcome}?order=${encodeURIComponent(orderNumber)}`)
            return
          }
        } catch (err: any) {
          if (err?.response?.status === 422 || err?.response?.status === 404) {
            doneRef.current = true
            router.replace(`/payment/failed?order=${encodeURIComponent(orderNumber)}`)
            return
          }
        }
        await new Promise((r) => setTimeout(r, 2500))
      }

      doneRef.current = true
      setGaveUp(true)
    })()
  }, [orderNumber, router])

  if (gaveUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% -10%, rgba(109,61,245,0.08), transparent 45%)' }} />
        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-base font-bold text-[#0F1B3D] mb-1">Payment is still processing</h2>
          <p className="text-sm text-[#536078] mb-5">
            Your order <span className="text-[#0F1B3D] font-medium">{orderNumber}</span> is being confirmed. Check your orders page in a moment.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.replace(`/payment/processing?order=${encodeURIComponent(orderNumber)}`)}
              className="w-full bg-[#6D3DF5] hover:bg-[#5B2EE0] text-white rounded-xl py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all">
              <RefreshCw className="w-4 h-4" /> Check again
            </button>
            <button onClick={() => router.push('/student/orders')}
              className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold transition-all">
              My Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#FFFFFF_0%,#F7F5FF_40%,#EFF4FF_75%,#F1FBF7_100%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% -10%, rgba(109,61,245,0.10), transparent 45%)' }} />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="bg-white border border-[#E9E7F5] rounded-2xl p-5 sm:p-6 mb-6 shadow-[0_10px_30px_-18px_rgba(15,27,61,0.25)]">
          <CheckoutStepper current={3} />
        </div>

        <div className="bg-white border border-[#E9E7F5] rounded-3xl p-8 shadow-[0_20px_60px_-20px_rgba(15,27,61,0.3)] text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-[#6D3DF5]/10 animate-ping [animation-duration:2.2s]" />
            <div className="absolute inset-2 rounded-full bg-[#F3EEFF] animate-spin [animation-duration:3s] border-2 border-dashed border-[#6D3DF5]/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center shadow-lg shadow-[#6D3DF5]/40">
                <Lock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-[#0F1B3D] mb-2">Processing Your Payment</h1>
          <p className="text-sm text-[#536078]">
            Please don't close this window or go back. This may take a few moments.
          </p>

          <div className="mt-6 space-y-2 text-left">
            {STATUS_FLOW.map((s, i) => {
              const isCurrent = s.key === activeStage
              const isDone = STATUS_FLOW.findIndex((x) => x.key === activeStage) > i
              return (
                <div key={s.key} className={cn('flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all', isCurrent ? 'bg-[#F3EEFF] border border-[#6D3DF5]/25' : 'opacity-40')}>
                  <span className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0', isDone ? 'bg-[#6D3DF5] text-white' : isCurrent ? 'bg-[#6D3DF5]/15 text-[#6D3DF5]' : 'bg-[#E9E7F5] text-[#A9B3C8]')}>
                    {isDone ? <span className="text-[10px] font-bold">✓</span> : isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-semibold', isCurrent ? 'text-[#0F1B3D]' : isDone ? 'text-[#18A878]' : 'text-[#536078]')}>{s.label}</p>
                    {isCurrent && <p className="text-[11px] text-[#536078]">{s.desc}</p>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#A9B3C8]">
            <ShieldCheck className="w-3 h-3 text-[#18A878]" /> Encrypted & secure • Order {orderNumber || '—'} • Check {Math.max(attempt, 0)}
          </div>
          {errorMsg && <p className="mt-4 text-xs text-[#E11D48] bg-red-50 border border-red-100 rounded-lg px-4 py-2">{errorMsg}</p>}
        </div>
      </div>
    </div>
  )
}

export default function PaymentProcessing() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" />}>
      <ProcessingContent />
    </Suspense>
  )
}