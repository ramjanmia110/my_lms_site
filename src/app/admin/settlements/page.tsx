'use client'

import { useEffect, useState } from 'react'
import { Landmark, Check, X, Plus, RefreshCw } from 'lucide-react'
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
  { label: 'All' }, { label: 'Draft', value: 'draft' }, { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' }, { label: 'Settled', value: 'settled' },
  { label: 'Failed', value: 'failed' }, { label: 'Cancelled', value: 'cancelled' },
]

export default function AdminSettlementsPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<Row[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ type: 'platform', amount: '', period_start: '', period_end: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.settlements.list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load settlements.'))
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
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount.')
    setSaving(true)
    try {
      await financeAPI.settlements.create({
        type: form.type,
        amount: Number(form.amount),
        period_start: form.period_start || undefined,
        period_end: form.period_end || undefined,
        notes: form.notes || undefined,
      })
      toast.success('Settlement drafted.')
      setShowCreate(false)
      setForm({ type: 'platform', amount: '', period_start: '', period_end: '', notes: '' })
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not create settlement.')
    } finally { setSaving(false) }
  }

  const settle = async (s: Row) => {
    if (!window.confirm(`Mark ${s.settlement_number} as settled?`)) return
    try {
      const res = await financeAPI.settlements.settle(s.id, 'manual')
      toast.success(res.data?.message || 'Settlement settled.')
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not settle.')
    }
  }

  const cancel = async (s: Row) => {
    if (!window.confirm(`Cancel settlement ${s.settlement_number}?`)) return
    try {
      const res = await financeAPI.settlements.destroy(s.id)
      toast.success(res.data?.message || 'Settlement cancelled.')
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not cancel.')
    }
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Settlements"
        subtitle="Batch settlement of platform funds and instructor earnings"
        actions={
          <div className="flex items-center gap-2">
            <RefreshBtn onClick={refresh} loading={loading} />
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-3.5 py-2.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Settlement
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
          <EmptyBlock message="No settlements yet" hint="Create a settlement batch for platform funds or instructor earnings." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Settlement</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Period</Th>
                  <Th>Status</Th>
                  <Th>Processed</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((s: Row) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-semibold text-[#0F1B3D] flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-[#6D3DF5]" />{s.settlement_number}</div>
                      <div className="text-[10px] text-[#A9B3C8] mt-0.5">{s.reference || '—'}</div>
                    </Td>
                    <Td className="capitalize text-[#536078]">{s.type?.replace('_', ' ')}</Td>
                    <Td className="font-semibold tabular-nums text-[#0F1B3D]">{sym}{fmtAmount(s.amount)}</Td>
                    <Td className="text-[11px] text-[#536078]">{s.period_start ? `${formatDate(s.period_start)} → ${formatDate(s.period_end)}` : '—'}</Td>
                    <Td><StatusBadge status={s.status} /></Td>
                    <Td className="text-[11px] text-[#536078]">{s.processed_at ? formatDate(s.processed_at) : '—'}</Td>
                    <Td>
                      {s.status === 'draft' || s.status === 'pending' ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => settle(s)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18A878] bg-[#ECFBF5] border border-[#18A878]/30 rounded-lg px-2 py-1 hover:bg-[#D9F5E8]">
                            <Check className="w-3 h-3" /> Settle
                          </button>
                          <button onClick={() => cancel(s)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E11D48] bg-rose-50 border border-rose-500/20 rounded-lg px-2 py-1 hover:bg-rose-100">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#A9B3C8]">{s.processor?.name || s.status}</span>
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
              <h3 className="text-sm font-semibold text-[#0F1B3D]">New Settlement</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[#F3EEFF] text-[#536078]"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]">
                  <option value="platform">Platform funds</option>
                  <option value="instructor_earnings">Instructor earnings</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Amount ({sym}) *</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00" className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Period start</label>
                  <input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })}
                    className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Period end</label>
                  <input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })}
                    className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full bg-white border border-[#E9E7F5] rounded-xl p-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[#E9E7F5]">
              <button onClick={() => setShowCreate(false)} className="text-xs font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-4 py-2.5 hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={create} disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-4 py-2.5 disabled:opacity-50">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} {saving ? 'Creating…' : 'Create Settlement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}
