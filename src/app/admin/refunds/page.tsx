'use client'

import { useEffect, useState } from 'react'
import { Undo2, Check, X, Download } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount, downloadCsv } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, PillBtn, usePaginatedState, formatDate,
} from '@/components/finance/ui'
import toast from 'react-hot-toast'

export default function AdminRefundsPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<any[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.refunds
      .list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load refunds.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  const patch = (p: Record<string, any>) => {
    const next = { ...nav.params, ...p }
    Object.keys(next).forEach((k) => { if (next[k] === '' || next[k] === undefined) delete next[k] })
    nav.setParams(next)
  }

  const approve = async (r: any) => {
    if (!window.confirm(`Approve refund ${r.refund_number} for ${currencySymbol(r.currency)}${fmtAmount(r.amount)}?`)) return
    setBusyId(r.id)
    try {
      await financeAPI.refunds.approve(r.id)
      toast.success('Refund processed.')
      setLoadKey((k) => k + 1)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not approve refund.')
    } finally {
      setBusyId(null)
    }
  }

  const reject = async (r: any) => {
    const note = window.prompt(`Reason for rejecting ${r.refund_number} (optional):`)
    if (note === null) return
    setBusyId(r.id)
    try {
      await financeAPI.refunds.reject(r.id, note || undefined)
      toast.success('Refund rejected.')
      setLoadKey((k) => k + 1)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not reject refund.')
    } finally {
      setBusyId(null)
    }
  }

  const actionable = (s?: string) => !!s && ['requested', 'pending'].includes(s)

  const statusFilters = [
    { label: 'All' },
    { label: 'Requested', value: 'requested' },
    { label: 'Processing', value: 'processing' },
    { label: 'Succeeded', value: 'succeeded' },
    { label: 'Failed', value: 'failed' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  const exportCsv = () => {
    downloadCsv(
      `refunds-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['Refund', 'Customer', 'Email', 'Order', 'Amount', 'Currency', 'Reason', 'Status', 'Requested', 'Processed'],
        ...rows.map((r: any) => [
          r.refund_number, r.user?.name || '', r.user?.email || '', r.order_number || '',
          fmtAmount(r.amount), r.currency || '', r.reason || '', r.status || '',
          formatDate(r.requested?.at), formatDate(r.processed_at),
        ]),
      ]
    )
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Refunds"
        subtitle="Review and process course order refund requests"
        actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />}
      />

      <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
        {statusFilters.map((f) => (
          <PillBtn key={f.label} active={nav.params.status === f.value} onClick={() => patch({ status: f.value })}>
            {f.label}
          </PillBtn>
        ))}
      </div>

      <Panel extra={
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 disabled:opacity-40 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      }>
        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} />
        ) : rows.length === 0 ? (
          <EmptyBlock message="No refund records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Refund</Th>
                  <Th>Customer</Th>
                  <Th>Order</Th>
                  <Th>Amount</Th>
                  <Th>Reason</Th>
                  <Th>Status</Th>
                  <Th>Requested</Th>
                  <Th>Processed</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-semibold text-[#0F1B3D]">{r.refund_number}</div>
                      <div className="text-[10px] text-[#A9B3C8] mt-0.5">#{r.id}</div>
                    </Td>
                    <Td>
                      <div className="text-[#536078]">{r.user?.name || '—'}</div>
                      <div className="text-[10px] text-[#A9B3C8] mt-0.5">{r.user?.email || ''}</div>
                    </Td>
                    <Td className="font-mono text-[#536078]">{r.order_number || '—'}</Td>
                    <Td className="font-semibold tabular-nums text-[#0F1B3D]">
                      {currencySymbol(r.currency)}{fmtAmount(r.amount)}
                    </Td>
                    <Td className="max-w-[240px]"><span className="line-clamp-2 text-[#536078]">{r.reason || '—'}</span></Td>
                    <Td><StatusBadge status={r.status} /></Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(r.requested?.at)}</Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(r.processed_at)}</Td>
                    <Td>
                      {actionable(r.status) ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approve(r)}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18A878] bg-[#ECFBF5] border border-[#18A878]/30 rounded-lg px-2.5 py-1.5 hover:bg-[#ECFBF5] disabled:opacity-50 transition-colors"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => reject(r)}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E11D48] bg-rose-50 border border-[#E11D48]/30 rounded-lg px-2.5 py-1.5 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#536078]">{r.status === 'succeeded' ? 'Done' : 'Closed'}</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <Pagination
            page={meta.current_page || 1}
            lastPage={meta.last_page || 1}
            total={meta.total || 0}
            from={meta.from || 0}
            to={meta.to || 0}
            onChange={nav.setPage}
          />
        )}
      </Panel>
    </FinanceShell>
  )
}
