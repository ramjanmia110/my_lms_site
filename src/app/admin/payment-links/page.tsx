'use client'

import { useEffect, useState } from 'react'
import { Link2, Copy, Trash2, Plus, RefreshCw, ExternalLink } from 'lucide-react'
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
  { label: 'All' }, { label: 'Active', value: 'active' }, { label: 'Used', value: 'used' },
  { label: 'Expired', value: 'expired' }, { label: 'Disabled', value: 'disabled' },
]

export default function AdminPaymentLinksPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<Row[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', use_limit: '1', expires_at: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.paymentLinks.list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load payment links.'))
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
      await financeAPI.paymentLinks.create({
        title: form.title || undefined,
        amount: Number(form.amount),
        use_limit: Number(form.use_limit),
        expires_at: form.expires_at || undefined,
      })
      toast.success('Payment link created.')
      setShowCreate(false)
      setForm({ title: '', amount: '', use_limit: '1', expires_at: '' })
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not create link.')
    } finally { setSaving(false) }
  }

  const disable = async (l: Row) => {
    if (!window.confirm(`Disable payment link ${l.link_number}?`)) return
    try {
      const res = await financeAPI.paymentLinks.destroy(l.id)
      toast.success(res.data?.message || 'Link disabled.')
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not disable.')
    }
  }

  const copy = (l: Row) => {
    const url = `${window.location.origin}/pay/${l.token}`
    navigator.clipboard?.writeText(url).then(() => toast.success('Link copied to clipboard.')).catch(() => toast.error('Could not copy.'))
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Payment Links"
        subtitle="Create and share one-time payment links for customers"
        actions={
          <div className="flex items-center gap-2">
            <RefreshBtn onClick={refresh} loading={loading} />
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-3.5 py-2.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Link
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
          <EmptyBlock message="No payment links yet" hint="Create a link to send a customer a direct payment URL." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Link</Th>
                  <Th>Amount</Th>
                  <Th>Uses</Th>
                  <Th>Status</Th>
                  <Th>Expires</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((l: Row) => (
                  <tr key={l.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-semibold text-[#0F1B3D] flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5 text-[#6D3DF5]" />{l.title || l.link_number}</div>
                      <div className="text-[10px] text-[#A9B3C8] mt-0.5">{l.link_number}</div>
                    </Td>
                    <Td className="font-semibold tabular-nums text-[#0F1B3D]">{sym}{fmtAmount(l.amount)}</Td>
                    <Td className="tabular-nums text-[#536078]">{l.times_used} / {l.use_limit}</Td>
                    <Td><StatusBadge status={l.status} /></Td>
                    <Td className="text-[11px] text-[#536078]">{l.expires_at ? formatDate(l.expires_at) : 'Never'}</Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(l.created_at)}</Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => copy(l)} title="Copy URL"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3478F6] bg-[#EEF4FF] border border-[#3478F6]/30 rounded-lg px-2 py-1 hover:bg-[#DDE9FF]">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <a href={`/pay/${l.token}`} target="_blank" rel="noreferrer" title="Open"
                          className="inline-flex items-center text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-lg px-2 py-1 hover:bg-[#F8FAFC]">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {l.status === 'active' && (
                          <button onClick={() => disable(l)} title="Disable"
                            className="inline-flex items-center text-[11px] font-semibold text-[#E11D48] bg-rose-50 border border-rose-500/20 rounded-lg px-2 py-1 hover:bg-rose-100">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
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
              <h3 className="text-sm font-semibold text-[#0F1B3D]">New Payment Link</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[#F3EEFF] text-[#536078]"><RefreshCw className="w-4 h-4 rotate-45 hover:rotate-0 transition-transform" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Down payment" className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Amount ({sym}) *</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00" className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Use limit</label>
                  <input type="number" min="1" value={form.use_limit} onChange={(e) => setForm({ ...form, use_limit: e.target.value })}
                    className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Expires</label>
                  <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[#E9E7F5]">
              <button onClick={() => setShowCreate(false)} className="text-xs font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-4 py-2.5 hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={create} disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-4 py-2.5 disabled:opacity-50">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} {saving ? 'Creating…' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}
