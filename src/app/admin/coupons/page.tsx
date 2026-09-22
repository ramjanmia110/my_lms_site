'use client'

import { useEffect, useState } from 'react'
import { Ticket, Plus, Pencil, Trash2 } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, GradientBtn, usePaginatedState, formatDate,
} from '@/components/finance/ui'
import toast from 'react-hot-toast'

const EMPTY_FORM: Record<string, any> = {
  code: '', type: 'percent', value: '', min_order_amount: '', max_discount_amount: '',
  usage_limit: '', per_user_limit: '', starts_at: '', expires_at: '',
  first_purchase_only: false, stackable: false, is_active: true, description: '',
  allowed_course_ids: '', allowed_categories: '',
}

function toPayload(form: Record<string, any>) {
  const p: Record<string, any> = {
    code: form.code.trim(),
    type: form.type,
    value: Number(form.value),
    min_order_amount: form.min_order_amount === '' ? null : Number(form.min_order_amount),
    max_discount_amount: form.max_discount_amount === '' ? null : Number(form.max_discount_amount),
    usage_limit: form.usage_limit === '' ? null : Number(form.usage_limit),
    per_user_limit: form.per_user_limit === '' ? null : Number(form.per_user_limit),
    starts_at: form.starts_at || null,
    expires_at: form.expires_at || null,
    first_purchase_only: !!form.first_purchase_only,
    stackable: !!form.stackable,
    is_active: !!form.is_active,
    description: form.description || null,
  }
  const courseIds = String(form.allowed_course_ids || '').split(',').map((s) => s.trim()).filter(Boolean)
  const cats = String(form.allowed_categories || '').split(',').map((s) => s.trim()).filter(Boolean)
  p.allowed_course_ids = courseIds.length ? courseIds.map(Number) : null
  p.allowed_categories = cats.length ? cats : null
  return p
}

function fromCoupon(c: any): Record<string, any> {
  return {
    code: c.code || '',
    type: c.type || 'percent',
    value: c.value ?? '',
    min_order_amount: c.min_order_amount ?? '',
    max_discount_amount: c.max_discount_amount ?? '',
    usage_limit: c.usage_limit ?? '',
    per_user_limit: c.per_user_limit ?? '',
    starts_at: c.starts_at ? c.starts_at.slice(0, 16) : '',
    expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
    first_purchase_only: !!c.first_purchase_only,
    stackable: !!c.stackable,
    is_active: c.is_active !== false,
    description: c.description || '',
    allowed_course_ids: (c.allowed_course_ids || []).join(', '),
    allowed_categories: (c.allowed_categories || []).join(', '),
  }
}

export default function AdminCouponsPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<any[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<Record<string, any>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.coupons
      .list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load coupons.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  const openNew = () => { setEditing({ id: null }); setForm(EMPTY_FORM) }
  const openEdit = (c: any) => { setEditing(c); setForm(fromCoupon(c)) }
  const closeModal = () => { setEditing(null); setForm(EMPTY_FORM) }

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required.'); return }
    setSaving(true)
    try {
      if (editing?.id) {
        await financeAPI.coupons.update(editing.id, toPayload(form))
        toast.success('Coupon updated.')
      } else {
        await financeAPI.coupons.create(toPayload(form))
        toast.success('Coupon created.')
      }
      closeModal()
      setLoadKey((k) => k + 1)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not save coupon.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (c: any) => {
    try {
      await financeAPI.coupons.update(c.id, { is_active: !c.is_active })
      setLoadKey((k) => k + 1)
    } catch {
      toast.error('Could not update coupon.')
    }
  }

  const remove = async (c: any) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return
    try {
      await financeAPI.coupons.delete(c.id)
      toast.success('Coupon deleted.')
      setLoadKey((k) => k + 1)
    } catch {
      toast.error('Could not delete coupon.')
    }
  }

  const field = 'p-2.5 bg-white border border-[#E9E7F5] rounded-xl text-xs text-[#0F1B3D] placeholder:text-[#A9B3C8] focus:outline-none focus:border-[#6D3DF5] w-full'

  return (
    <FinanceShell>
      <PageHeader
        title="Coupons"
        subtitle="Discount codes for checkout — create, edit, deactivate or delete"
        actions={
          <>
            <RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />
            <GradientBtn onClick={openNew}><Plus className="w-3.5 h-3.5" /> New Coupon</GradientBtn>
          </>
        }
      />

      <div className="mt-4">
        <Panel>
          {loading ? (
            <LoadingBlock rows={5} />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} />
          ) : rows.length === 0 ? (
            <EmptyBlock message="No coupons created yet" hint={"Create your first discount code with \"New Coupon\"."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead>
                  <tr className="border-b border-[#E9E7F5]">
                    <Th>Code</Th>
                    <Th>Type</Th>
                    <Th>Value</Th>
                    <Th>Usage</Th>
                    <Th>Valid</Th>
                    <Th>Status</Th>
                    <Th>Restrictions</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E7F5]">
                  {rows.map((c: any) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <Td>
                        <div className="flex items-center gap-2">
                          <Ticket className="w-3.5 h-3.5 text-[#6D3DF5]" />
                          <span className="font-mono font-semibold text-[#0F1B3D]">{c.code}</span>
                        </div>
                      </Td>
                      <Td className="capitalize text-[#536078]">{c.type}</Td>
                      <Td className="font-semibold tabular-nums text-[#0F1B3D]">
                        {c.type === 'percent' ? `${fmtAmount(c.value)}%` : currencySymbol('BDT') + fmtAmount(c.value)}
                      </Td>
                      <Td className="tabular-nums text-[#536078]">
                        {c.usage_count ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ''}
                      </Td>
                      <Td className="text-[11px] text-[#536078]">
                        {formatDate(c.starts_at)}<br />{formatDate(c.expires_at)}
                      </Td>
                      <Td>
                        <button onClick={() => toggleActive(c)} title="Toggle active">
                          <StatusBadge status={c.is_active === false ? 'inactive' : 'active'} />
                        </button>
                      </Td>
                      <Td className="text-[11px] text-[#A9B3C8]">
                        {[c.first_purchase_only && 'first purchase', c.stackable && 'stackable', c.min_order_amount != null && `min ${currencySymbol('BDT')}${fmtAmount(c.min_order_amount)}`].filter(Boolean).join(', ') || '—'}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-white border border-[#E9E7F5] text-[#536078] hover:text-[#6D3DF5] transition-colors" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => remove(c)} className="p-1.5 rounded-lg bg-white border border-[#E9E7F5] text-[#536078] hover:text-[#E11D48] transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
      </div>

      {/* Create/Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white border border-[#E9E7F5] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E9E7F5]">
              <h3 className="text-sm font-semibold text-[#0F1B3D]">{editing.id ? `Edit ${editing.code}` : 'New Coupon'}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-[#536078] hover:bg-[#F3EEFF] hover:text-[#0F1B3D] border border-[#E9E7F5] bg-white transition-colors">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Code *</label>
                  <input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="SUMMER30" className={field} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Type *</label>
                  <select value={form.type} onChange={(e) => set('type', e.target.value)} className={field}>
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Value *</label>
                  <input type="number" min="0" step="0.01" value={form.value} onChange={(e) => set('value', e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Min order amount</label>
                  <input type="number" min="0" step="0.01" value={form.min_order_amount} onChange={(e) => set('min_order_amount', e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Max discount amount</label>
                  <input type="number" min="0" step="0.01" value={form.max_discount_amount} onChange={(e) => set('max_discount_amount', e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Usage limit</label>
                  <input type="number" min="1" value={form.usage_limit} onChange={(e) => set('usage_limit', e.target.value)} className={field} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Starts at</label>
                  <input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Expires at</label>
                  <input type="datetime-local" value={form.expires_at} onChange={(e) => set('expires_at', e.target.value)} className={field} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Allowed course IDs (comma separated, empty = all)</label>
                <input value={form.allowed_course_ids} onChange={(e) => set('allowed_course_ids', e.target.value)} placeholder="12, 45, 88" className={field} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Allowed categories (comma separated, empty = all)</label>
                <input value={form.allowed_categories} onChange={(e) => set('allowed_categories', e.target.value)} placeholder="web development, design" className={field} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} className={field} />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs text-[#536078]">
                  <input type="checkbox" checked={!!form.first_purchase_only} onChange={(e) => set('first_purchase_only', e.target.checked)} className="accent-[#6D3DF5]" />
                  First purchase only
                </label>
                <label className="flex items-center gap-2 text-xs text-[#536078]">
                  <input type="checkbox" checked={!!form.stackable} onChange={(e) => set('stackable', e.target.checked)} className="accent-[#6D3DF5]" />
                  Stackable
                </label>
                <label className="flex items-center gap-2 text-xs text-[#536078]">
                  <input type="checkbox" checked={!!form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="accent-[#6D3DF5]" />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9E7F5]">
                <button onClick={closeModal} className="inline-flex items-center text-xs font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-4 py-2.5 hover:bg-[#F8FAFC] transition-colors">
                  Cancel
                </button>
                <GradientBtn onClick={save} disabled={saving}><Plus className="w-3.5 h-3.5" /> {saving ? 'Saving…' : editing.id ? 'Save Changes' : 'Create Coupon'}</GradientBtn>
              </div>
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}
