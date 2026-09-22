'use client'

import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Loader2, User, ShoppingBag, CreditCard, Clock, ShieldCheck } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, StatusBadge, LoadingBlock, ErrorBlock, RefreshBtn, formatDate,
} from '@/components/finance/ui'
import toast from 'react-hot-toast'

export default function AdminPaymentDetailPage() {
  const { id } = useParams()
  const [p, setP] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [loadKey, setLoadKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.payments
      .get(Number(id))
      .then((res: any) => setP(res.data?.data || null))
      .catch((err: any) => {
        if (err?.response?.status === 404) notFound()
        else setError('Could not load payment details.')
      })
      .finally(() => setLoading(false))
  }, [id, loadKey])

  const verify = async () => {
    if (!p) return
    setVerifying(true)
    try {
      const res = await financeAPI.payments.verify(p.id)
      toast.success(`Verified → ${res.data?.data?.payment_status || res.data?.data?.outcome || 'ok'}`)
      setLoadKey((k) => k + 1)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Verify failed')
    } finally { setVerifying(false) }
  }

  if (loading) return <FinanceShell><div className="py-20"><LoadingBlock /></div></FinanceShell>
  if (error) return <FinanceShell><div className="py-10"><ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} /></div></FinanceShell>
  if (!p) return <FinanceShell><div className="py-10"><ErrorBlock message="Payment not found." /></div></FinanceShell>

  const sym = currencySymbol(p.currency || 'BDT')
  const canVerify = ['pending', 'processing', 'payment_processing'].includes(p.status)

  const rows: [string, React.ReactNode][] = [
    ['Payment ID', <span key="id" className="font-mono">#{p.id}</span>],
    ['Status', <span key="s" className="inline-flex"><StatusBadge status={p.status} /></span>],
    ['Amount', <span key="a" className="font-semibold text-[#0F1B3D] tabular-nums">{sym}{fmtAmount(p.amount)}</span>],
    ['Currency', p.currency],
    ['Gateway', <span key="g" className="capitalize">{p.gateway || '—'}</span>],
    ['Payment method', <span key="m" className="capitalize">{p.payment_method?.replace(/_/g, ' ') || '—'}</span>],
    ['Transaction ID', <span key="t" className="font-mono">{p.transaction_id || '—'}</span>],
    ['Session ID', <span key="sess" className="font-mono">{p.payment_session_id || '—'}</span>],
    ['Attempts', String(p.attempts_count ?? 0)],
    ['Created', formatDate(p.created_at)],
    ['Paid at', formatDate(p.paid_at)],
    ['Expires at', formatDate(p.expires_at)],
    ['Failure reason', p.failure_reason || '—'],
  ]

  return (
    <FinanceShell>
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/payments" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Payments
        </Link>
        <PageHeader title={`Payment #${p.id}`} subtitle="Full gateway payment record" actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Panel>
          <h2 className="text-sm font-semibold text-[#0F1B3D] mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#6D3DF5]" /> Payment details</h2>
          <dl className="space-y-2">
            {rows.map(([k, v]) => (
              <div key={String(k)} className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E9E7F5]/60 last:border-0">
                <dt className="text-[11px] text-[#536078]">{k}</dt>
                <dd className="text-xs text-[#0F1B3D] text-right max-w-[60%]">{v}</dd>
              </div>
            ))}
          </dl>
          {canVerify && (
            <button onClick={verify} disabled={verifying}
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] rounded-xl px-4 py-2.5 disabled:opacity-50 transition-colors">
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Run gateway verification
            </button>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <h2 className="text-sm font-semibold text-[#0F1B3D] mb-3 flex items-center gap-2"><User className="w-4 h-4 text-[#6D3DF5]" /> Customer</h2>
            <p className="text-sm font-semibold text-[#0F1B3D]">{p.user?.name || '—'}</p>
            <p className="text-xs text-[#536078] mt-0.5">{p.user?.email}</p>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold text-[#0F1B3D] mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-[#6D3DF5]" /> Order</h2>
            <p className="text-xs text-[#536078]">Order number</p>
            <p className="text-sm font-semibold text-[#0F1B3D] mt-0.5 font-mono">{p.order_number || '—'}</p>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold text-[#0F1B3D] mb-3 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-[#6D3DF5]" /> Refunds</h2>
            {p.refunds?.length ? (
              <div className="space-y-2">
                {p.refunds.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2">
                    <span className="text-xs text-[#536078]">#{r.id}</span>
                    <span className="inline-flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="text-xs font-semibold text-[#0F1B3D] tabular-nums">{sym}{fmtAmount(r.amount)}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#A9B3C8] flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> No refunds recorded.</p>
            )}
          </Panel>
        </div>
      </div>
    </FinanceShell>
  )
}
