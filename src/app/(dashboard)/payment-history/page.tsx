'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard, Check, X, Loader2, Clock, AlertCircle, ArrowRight, RotateCcw, Search, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { paymentAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface PaymentRecord {
  id: number; course_id: number; course_title: string; course_thumbnail?: string | null
  amount: number; currency: string; payment_method: string; transaction_id: string | null
  status: string; paid_at: string
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyTxnId, setVerifyTxnId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; payment?: any } | null>(null)

  useEffect(() => {
    paymentAPI.history()
      .then(res => setPayments(res.data.data || []))
      .catch(() => toast.error('Failed to load payment history'))
      .finally(() => setLoading(false))
  }, [])

  const handleVerify = async () => {
    if (!verifyTxnId.trim()) { toast.error('Enter a transaction ID'); return }
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await paymentAPI.verify(verifyTxnId.trim())
      setVerifyResult(res.data.data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      refunded: 'bg-red-500/10 text-red-400 border-red-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    return map[status] || 'bg-slate-500/10 text-slate-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Payment History</h1>
          <p className="text-sm text-slate-500 mt-1">View all your payments and transaction details</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">No payments yet</h3>
          <p className="text-sm text-slate-500 mb-4">Enroll in a course to make your first payment.</p>
          <Link href="/#courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
          >
            Browse Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5">
                  {p.course_thumbnail ? (
                    <img src={p.course_thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">{p.course_title || `Course #${p.course_id}`}</h3>
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', getStatusBadge(p.status))}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> {p.payment_method}
                    </span>
                    {p.transaction_id && (
                      <span className="font-mono">ID: {p.transaction_id}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(p.paid_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-white">${Number(p.amount).toFixed(2)}</p>
                  <p className="text-[10px] text-slate-600">{p.currency}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verify Transaction */}
      <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Verify a Transaction</h3>
        <div className="flex gap-2">
          <input value={verifyTxnId} onChange={e => setVerifyTxnId(e.target.value)}
            placeholder="Enter transaction ID to verify..."
            className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50"
          />
          <button onClick={handleVerify} disabled={verifying}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-60 flex items-center gap-1.5"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Verify
          </button>
        </div>
        {verifyResult && (
          <div className={cn(
            'mt-3 rounded-xl p-3 text-sm',
            verifyResult.verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          )}>
            {verifyResult.verified ? 'Payment verified successfully' : 'Payment not found or invalid'}
          </div>
        )}
      </div>
    </div>
  )
}
