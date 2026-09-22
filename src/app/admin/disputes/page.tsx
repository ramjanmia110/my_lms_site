'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, Check, X, Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, usePaginatedState, formatDate,
} from '@/components/finance/ui'

type Row = any

const STATUSES = [
  { label: 'All' }, { label: 'Opened', value: 'opened' }, { label: 'Reviewing', value: 'reviewing' },
  { label: 'Resolved', value: 'resolved' }, { label: 'Rejected', value: 'rejected' }, { label: 'Refunded', value: 'refunded' },
]

export default function AdminDisputesPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<Row[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ type: 'other', amount: '', reason: '', user_id: '' })
  const [saving, setSaving] = useState(false)
  const [deciding, setDeciding] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.disputes.list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load disputes.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  const patch = (p: Record<string, any>) => {
    const next = { ...nav.params, ...p }
    Object.keys(next).forEach((k) => { if (next[k] === '' || next[k] === undefined) delete next[k] })
    nav.setParams(next)
  }
  const refresh = () => setLoadKey((k) => k + 1)
  const sym = currencySymbol('BDT')

  const create = async () => {
    if (!form.amount || Number(form.amount) < 0) return toast.error('Enter a valid amount.')
    setSaving(true)
    try {
      await financeAPI.disputes.create({ type: form.type, amount: Number(form.amount), reason: form.reason || undefined })
      toast.success('Dispute opened.')
      setShowCreate(false)
      setForm({ type: 'other', amount: '', reason: '', user_id: '' })
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not open dispute.')
    } finally { setSaving(false) }
  }

  const decide = async (d: Row, decision: string) => {
    if (!window.confirm(`${decision === 'resolved' ? 'Accept (refund)' : 'Reject'} dispute ${d.dispute_number}?`)) return
    setDeciding(d.id)
    try {
      const res = await financeAPI.disputes.resolve(d.id, decision, `${decision === 'resolved' ? 'Resolved in customer favor' : 'Rejected by admin'}`)
      toast.success(res.data?.message || `Dispute ${decision}.`)
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update dispute.')
    } finally { setDeciding(null) }
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Disputes"
        subtitle="Track chargebacks and service disputes across payments"
        actions={
          <div className="flex items-center gap-2">
            <RefreshBtn onClick={refresh} loading={loading} />
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-3.5 py-2.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Open Dispute
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
        {STATUSES.map((f: any) => (
          <button key={f.label} onClick={() => patch({ status: f.value })}
            className={`inline-flex items-center text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${
              (nav.params.status || '') === (f.value || '')
                ? 'text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30'
                : 'text-[#536078] bg-[#F8FAFC] border border-[#E9E7F5] hover:bg-[#F3EEFF]'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <Panel>
        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : rows.length === 0 ? (
          <EmptyBlock message="No disputes" hint="Open a dispute to start tracking a chargeback or service issue." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Dispute</Th>
                  <Th>Customer</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Opened</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((d: Row) => (
                  <tr key={d.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-semibold text-[#0F1B3D] flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-[#E11D48]" />{d.dispute_number}</div>
                      <div className="text-[10px] text-[#A9B3C8] mt-0.5 max-w-[200px] truncate">{d.reason || '—'}</div>
                    </Td>
                    <Td>
                      <div className="font-medium text-[#0F1B3D]">{d.user?.name || '—'}</div>
                      <div className="text-[10px] text-[#536078] mt-0.5">{d.user?.email}</div>
                    </Td>
                    <Td className="capitalize text-[#536078]">{d.type?.replace('_', ' ')}</Td>
                    <Td className="font-semibold tabular-nums text-[#0F1B3D]">{sym}{fmtAmount(d.amount)}</Td>
                    <Td><StatusBadge status={d.status} /></Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(d.opened_at)}</Td>
                    <Td>
                      {['opened', 'reviewing'].includes(d.status) ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => decide(d, 'resolved')} disabled={deciding === d.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18A878] bg-[#ECFBF5] border border-[#18A878]/30 rounded-lg px-2 py-1 hover:bg-[#D9F5E8]">
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button onClick={() => decide(d, 'rejected')} disabled={deciding === d.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E11D48] bg-rose-50 border border-rose-500/20 rounded-lg px-2 py-1 hover:bg-rose-100">
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#A9B3C8]">{d.decider?.name || d.status}</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <Pagination page={meta.current_page || 1} lastPage={meta.last_page || 1} total={meta.total || 0} from={meta.from || 0} to={meta.to || 0} onChange={nav.setPage} />
        )}
      </Panel>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white border border-[#E9E7F5] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E9E7F5]">
              <h3 className="text-sm font-semibold text-[#0F1B3D]">Open Dispute</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[#F3EEFF] text-[#536078]"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]">
                  {['chargeback', 'service_dispute', 'refund_request', 'fraud', 'other'].map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Amount ({sym}) *</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00" className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Reason</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2}
                  className="w-full bg-white border border-[#E9E7F5] rounded-xl p-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[#E9E7F5]">
              <button onClick={() => setShowCreate(false)} className="text-xs font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-4 py-2.5 hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={create} disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-4 py-2.5 disabled:opacity-50">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} {saving ? 'Opening…' : 'Open Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}
