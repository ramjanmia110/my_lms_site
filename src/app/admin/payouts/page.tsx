'use client'

import { useEffect, useMemo, useState } from 'react'
import { Banknote, Check, X, Plus, RefreshCw, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount, downloadCsv } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, usePaginatedState, formatDate,
} from '@/components/finance/ui'

type Row = any

const STATUSES = [
  { label: 'All' }, { label: 'Requested', value: 'requested' }, { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' }, { label: 'Paid', value: 'paid' },
  { label: 'Failed', value: 'failed' }, { label: 'Cancelled', value: 'cancelled' },
]

export default function AdminPayoutsPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<Row[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)

  const [showCreate, setShowCreate] = useState(false)
  const [instructors, setInstructors] = useState<Row[]>([])
  const [form, setForm] = useState({ instructor_id: '', amount: '', payment_method: '', account_details: '' })
  const [saving, setSaving] = useState(false)
  const [acting, setActing] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.payouts.list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load payouts.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  useEffect(() => {
    if (showCreate) financeAPI.earnings.instructors().then((res: any) => setInstructors(res.data?.data || [])).catch(() => {})
  }, [showCreate])

  const patch = (p: Record<string, any>) => {
    const next = { ...nav.params, ...p }
    Object.keys(next).forEach((k) => { if (next[k] === '' || next[k] === undefined) delete next[k] })
    nav.setParams(next)
  }

  const selectedInstructor = useMemo(() => instructors.find((i) => String(i.id) === String(form.instructor_id)), [instructors, form.instructor_id])
  const maxAmount = selectedInstructor?.available_balance || 0
  const sym = currencySymbol('BDT')

  const refresh = () => setLoadKey((k) => k + 1)

  const exportCsv = () => {
    downloadCsv(
      `payouts-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['Payout', 'Instructor', 'Email', 'Amount', 'Method', 'Status', 'Requested', 'Processed', 'Reference'],
        ...rows.map((p: Row) => [
          p.payout_number, p.user?.name || '', p.user?.email || '', fmtAmount(p.amount),
          p.payment_method || '', p.status || '', formatDate(p.requested_at),
          formatDate(p.processed_at), p.reference || '',
        ]),
      ]
    )
  }

  const createPayout = async () => {
    if (!form.instructor_id) return toast.error('Select an instructor.')
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount.')
    setSaving(true)
    try {
      await financeAPI.payouts.create({
        instructor_id: Number(form.instructor_id),
        amount: Number(form.amount),
        payment_method: form.payment_method || undefined,
        account_details: form.account_details || undefined,
      })
      toast.success('Payout created.')
      setShowCreate(false)
      setForm({ instructor_id: '', amount: '', payment_method: '', account_details: '' })
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not create payout.')
    } finally {
      setSaving(false)
    }
  }

  const approve = async (p: Row) => {
    setActing(p.id)
    try {
      const res = await financeAPI.payouts.approve(p.id, 'manual')
      toast.success(res.data?.message || 'Payout approved.')
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not approve payout.')
    } finally { setActing(null) }
  }

  const reject = async (p: Row) => {
    if (!window.confirm(`Cancel payout ${p.payout_number}?`)) return
    setActing(p.id)
    try {
      const res = await financeAPI.payouts.reject(p.id, 'Cancelled by admin')
      toast.success(res.data?.message || 'Payout cancelled.')
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not cancel payout.')
    } finally { setActing(null) }
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Payouts"
        subtitle="Pay out instructor earnings and track the full lifecycle"
        actions={
          <div className="flex items-center gap-2">
            <RefreshBtn onClick={refresh} loading={loading} />
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-3.5 py-2.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Payout
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
          <ErrorBlock message={error} onRetry={refresh} />
        ) : rows.length === 0 ? (
          <EmptyBlock message="No payouts yet" hint="Create a payout from an instructor's available earnings balance." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Payout</Th>
                  <Th>Instructor</Th>
                  <Th>Amount</Th>
                  <Th>Method</Th>
                  <Th>Status</Th>
                  <Th>Requested</Th>
                  <Th>Processed</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((p: Row) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-semibold text-[#0F1B3D] flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 text-[#6D3DF5]" />{p.payout_number}</div>
                      <div className="text-[10px] text-[#A9B3C8] mt-0.5">#{p.id}</div>
                    </Td>
                    <Td>
                      <div className="font-medium text-[#0F1B3D]">{p.user?.name || '—'}</div>
                      <div className="text-[10px] text-[#536078] mt-0.5">{p.user?.email}</div>
                    </Td>
                    <Td className="font-semibold tabular-nums text-[#0F1B3D]">{sym}{fmtAmount(p.amount)}</Td>
                    <Td className="capitalize text-[#536078]">{p.payment_method || '—'}</Td>
                    <Td><StatusBadge status={p.status} /></Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(p.requested_at)}</Td>
                    <Td className="text-[11px] text-[#536078]">{p.processed_at ? formatDate(p.processed_at) : '—'}</Td>
                    <Td>
                      {p.status === 'requested' || p.status === 'pending' ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => approve(p)} disabled={acting === p.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18A878] bg-[#ECFBF5] border border-[#18A878]/30 rounded-lg px-2 py-1 hover:bg-[#D9F5E8] disabled:opacity-50">
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => reject(p)} disabled={acting === p.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E11D48] bg-rose-50 border border-rose-500/20 rounded-lg px-2 py-1 hover:bg-rose-100 disabled:opacity-50">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#A9B3C8]">{p.reference || p.status}</span>
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
              <div>
                <h3 className="text-sm font-semibold text-[#0F1B3D]">New Payout</h3>
                <p className="text-[11px] text-[#536078] mt-0.5">Pay out an instructor's available earnings</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[#F3EEFF] text-[#536078] hover:text-[#0F1B3D]"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Instructor *</label>
                <select value={form.instructor_id} onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
                  className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]">
                  <option value="">Select instructor…</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>{i.name} ({i.email}) — {sym}{fmtAmount(i.available_balance)}</option>
                  ))}
                </select>
                {selectedInstructor && (
                  <p className="text-[10px] text-[#536078] mt-1">Available balance: <span className="font-semibold text-[#18A878]">{sym}{fmtAmount(maxAmount)}</span></p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Amount ({sym}) *</label>
                <input type="number" step="0.01" min="0" max={maxAmount || undefined} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00" className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Payment Method</label>
                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]">
                  <option value="">Select method…</option>
                  {['bank', 'bkash', 'nagad', 'rocket', 'paypal', 'stripe', 'manual'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Account Details</label>
                <input value={form.account_details} onChange={(e) => setForm({ ...form, account_details: e.target.value })}
                  placeholder="Bank account / mobile number…" className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-[#E9E7F5]">
              <button onClick={() => setShowCreate(false)} className="inline-flex items-center text-xs font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-4 py-2.5 hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={createPayout} disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-4 py-2.5 disabled:opacity-50">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} {saving ? 'Creating…' : 'Create Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}
