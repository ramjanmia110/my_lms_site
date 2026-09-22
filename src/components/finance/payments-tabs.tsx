'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { financeAPI } from '@/lib/api'
import { statusBadgeClass } from '@/lib/payments'

/* ── shared helpers (kept local so tabs are self-contained) ── */

function Badge({ status }: { status: string }) {
  const cls = statusBadgeClass(status)
  return (
    <span className={`inline-block text-[10px] font-medium border rounded-full px-2 py-0.5 capitalize ${cls}`}>
      {String(status || '').replaceAll('_', ' ')}
    </span>
  )
}

function Panel({ children, search, onSearch, extra }: { children: ReactNode; search?: boolean; onSearch?: (v: string) => void; extra?: ReactNode }) {
  const [q, setQ] = useState('')
  return (
    <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {search && (
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C8]" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); onSearch?.(e.target.value) }}
              placeholder="Search..."
              className="w-full bg-[#F8FAFC] border border-[#E9E7F5] rounded-xl h-10 pl-9 pr-3 text-sm text-[#0F1B3D] placeholder:text-[#A9B3C8] focus:outline-none focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/20"
            />
          </div>
        )}
        <div className="ml-auto">{extra}</div>
      </div>
      {children}
    </div>
  )
}

function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E9E7F5]">
            {headers.map((h, i) => (
              <th key={h} className={`text-left text-[10px] text-[#536078] font-medium uppercase tracking-wider pb-2 pr-2 ${i >= headers.length - 2 ? 'text-center' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Loading() {
  return <div className="py-14 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#A9B3C8] mx-auto" /></div>
}

function Empty({ text }: { text: string }) {
  return <div className="py-14 text-center text-sm text-[#A9B3C8]">{text}</div>
}

/* ── Webhooks ── */

export function WebhooksTab() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<number | null>(null)
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await financeAPI.webhooks.list({ per_page: 50 })
      setRows(res.data?.data?.data || res.data?.data || [])
    } catch { setRows([]) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const retry = async (id: number) => {
    setBusy(id)
    try {
      await financeAPI.webhooks.retry(id)
      toast.success('Webhook queued for retry.')
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Retry failed')
    } finally { setBusy(null) }
  }

  return (
    <Panel>
      <Table headers={['Gateway', 'Event', 'Txn', 'Status', 'Attempts', 'Processed', 'Actions']}>
        {loading ? <tr><td colSpan={7}><Loading /></td></tr> : rows.length === 0 ? <tr><td colSpan={7}><Empty text="No webhook events yet." /></td></tr> : rows.map((e) => (
          <tr key={e.id} className="border-b border-[#E9E7F5] hover:bg-[#F8FAFC]">
            <td className="py-2.5 pr-2"><span className="text-[10px] text-[#536078] capitalize">{e.gateway}</span></td>
            <td className="py-2.5 pr-2"><span className="text-[10px] font-mono text-[#536078]">{e.event_type || e.event_id || '—'}</span></td>
            <td className="py-2.5 pr-2"><span className="text-[10px] font-mono text-[#A9B3C8]">{e.transaction_id || '—'}</span></td>
            <td className="py-2.5 pr-2 text-center"><Badge status={e.status} /></td>
            <td className="py-2.5 pr-2 text-center"><span className="text-[10px] text-[#536078]">{e.attempts || 0}</span></td>
            <td className="py-2.5 pr-2 text-center"><span className="text-[10px] text-[#A9B3C8]">{e.processed_at ? new Date(e.processed_at).toLocaleDateString() : '—'}</span></td>
            <td className="py-2.5 pr-2 text-center">
              {['failed', 'retrying'].includes(e.status) && (
                <button onClick={() => retry(e.id)} disabled={busy === e.id}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-lg px-2 py-1 hover:bg-[#F3EEFF] disabled:opacity-50">
                  {busy === e.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Retry
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

/* ── Logs & Audit ── */

export function LogsTab() {
  const [mode, setMode] = useState<'logs' | 'audit'>('logs')
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = mode === 'logs' ? await financeAPI.logs.list({ q, per_page: 50 }) : await financeAPI.logs.audit({ action: q, per_page: 50 })
      setRows(res.data?.data?.data || res.data?.data || [])
    } catch { setRows([]) } finally { setLoading(false) }
  }, [mode])
  useEffect(() => { load() }, [load])

  return (
    <Panel search onSearch={(q) => load(q)} extra={
      <div className="flex gap-1.5">
        <button onClick={() => setMode('logs')} className={mode === 'logs' ? 'text-[11px] font-semibold text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-lg px-3 py-1.5' : 'text-[11px] font-medium text-[#536078] bg-[#F8FAFC] border border-[#E9E7F5] rounded-lg px-3 py-1.5'}>Gateway Logs</button>
        <button onClick={() => setMode('audit')} className={mode === 'audit' ? 'text-[11px] font-semibold text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-lg px-3 py-1.5' : 'text-[11px] font-medium text-[#536078] bg-[#F8FAFC] border border-[#E9E7F5] rounded-lg px-3 py-1.5'}>Admin Audit</button>
      </div>
    }>
      {mode === 'logs' ? (
        <Table headers={['Gateway', 'Level', 'Message', 'User', 'Order', 'When']}>
          {loading ? <tr><td colSpan={6}><Loading /></td></tr> : rows.length === 0 ? <tr><td colSpan={6}><Empty text="No gateway logs yet." /></td></tr> : rows.map((l) => (
            <tr key={l.id} className="border-b border-[#E9E7F5] hover:bg-[#F8FAFC]">
              <td className="py-2.5 pr-2"><span className="text-[10px] text-[#536078] capitalize">{l.gateway || '—'}</span></td>
              <td className="py-2.5 pr-2 text-center"><span className={`text-[9px] font-semibold border rounded-full px-2 py-0.5 uppercase ${l.level === 'error' || l.level === 'critical' ? 'text-[#E11D48] border-[#E11D48]/30 bg-rose-50' : l.level === 'warning' ? 'text-[#B45309] border-[#B45309]/30 bg-[#FFF7E6]' : 'text-[#536078] border-[#E9E7F5] bg-[#F8FAFC]'}`}>{l.level}</span></td>
              <td className="py-2.5 pr-2"><p className="text-[11px] text-[#0F1B3D] max-w-[340px] truncate">{l.message || '—'}</p></td>
              <td className="py-2.5 pr-2"><p className="text-[10px] text-[#A9B3C8]">{l.user?.name || '—'}</p></td>
              <td className="py-2.5 pr-2"><span className="text-[10px] font-mono text-[#A9B3C8]">{l.order?.order_number || '—'}</span></td>
              <td className="py-2.5 pr-2 text-center"><span className="text-[10px] text-[#A9B3C8]">{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</span></td>
            </tr>
          ))}
        </Table>
      ) : (
        <Table headers={['Admin', 'Action', 'Entity', 'When']}>
          {loading ? <tr><td colSpan={4}><Loading /></td></tr> : rows.length === 0 ? <tr><td colSpan={4}><Empty text="No audit activity yet." /></td></tr> : rows.map((a) => (
            <tr key={a.id} className="border-b border-[#E9E7F5] hover:bg-[#F8FAFC]">
              <td className="py-2.5 pr-2"><p className="text-xs text-[#0F1B3D]">{a.user?.name || '—'}</p><p className="text-[9px] text-[#A9B3C8]">{a.user?.email}</p></td>
              <td className="py-2.5 pr-2"><Badge status={a.action} /></td>
              <td className="py-2.5 pr-2"><span className="text-[10px] text-[#536078]">{a.entity_type || '—'} {a.entity_id ? `#${a.entity_id}` : ''}</span></td>
              <td className="py-2.5 pr-2 text-center"><span className="text-[10px] text-[#A9B3C8]">{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</span></td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  )
}

/* ── Settings ── */

const SETTING_FIELDS: { key: string; label: string; type: 'select' | 'number' | 'text' | 'boolean'; options?: { value: string; label: string }[]; hint?: string }[] = [
  { key: 'mode', label: 'Payment Mode', type: 'select', options: [{ value: 'sandbox', label: 'Sandbox (test)' }, { value: 'live', label: 'Live' }], hint: 'Live mode requires real gateway credentials.' },
  { key: 'default_gateway', label: 'Default Gateway', type: 'text', hint: 'demo | stripe | sslcommerz' },
  { key: 'currency', label: 'Currency', type: 'text', hint: 'BDT, USD...' },
  { key: 'checkout.order_timeout_minutes', label: 'Order Timeout (minutes)', type: 'number' },
  { key: 'checkout.payment_timeout_minutes', label: 'Payment Timeout (minutes)', type: 'number' },
  { key: 'checkout.max_payment_attempts', label: 'Max Payment Attempts', type: 'number' },
  { key: 'notifications.in_app_enabled', label: 'In-app Notifications', type: 'boolean' },
  { key: 'notifications.email_enabled', label: 'Email Notifications', type: 'boolean' },
  { key: 'tax.enabled', label: 'Enable Tax', type: 'boolean' },
  { key: 'tax.rate', label: 'Tax Rate (%)', type: 'number' },
  { key: 'fees.enabled', label: 'Enable Gateway Fees', type: 'boolean' },
  { key: 'gateways.demo.enabled', label: 'Demo Gateway Enabled', type: 'boolean' },
  { key: 'gateways.stripe.enabled', label: 'Stripe Enabled', type: 'boolean' },
];

export function SettingsTab() {
  const [values, setValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    financeAPI.settings.get().then((res: any) => {
      const flat = res.data?.data || res.data || {}
      setValues(flat)
    }).catch(() => toast.error('Could not load settings')).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const payload = Object.fromEntries(Object.entries(values).filter(([k, v]) => SETTING_FIELDS.some((f) => f.key === k)))
      await financeAPI.settings.update(payload)
      toast.success('Settings saved.')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save settings.')
    } finally { setSaving(false) }
  }

  if (loading) return <Panel><Loading /></Panel>

  return (
    <Panel extra={
      <button onClick={save} disabled={saving}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-xl px-3 py-2 hover:bg-[#F3EEFF] disabled:opacity-50">
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} {saving ? 'Saving...' : 'Save Settings'}
      </button>
    }>
      <div className="grid sm:grid-cols-2 gap-3">
        {SETTING_FIELDS.map((f) => (
          <div key={f.key} className="border border-[#E9E7F5] rounded-xl p-3">
            <label className="block text-[11px] font-medium text-[#0F1B3D] mb-1.5">{f.label}</label>
            {f.type === 'boolean' ? (
              <select value={values?.[f.key] ? '1' : '0'} onChange={(e) => setValues({ ...values, [f.key]: e.target.value === '1' })}
                className="w-full bg-[#F8FAFC] border border-[#E9E7F5] rounded-lg h-9 px-2 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]">
                <option value="1">Enabled</option><option value="0">Disabled</option>
              </select>
            ) : f.type === 'select' ? (
              <select value={values?.[f.key] || ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E9E7F5] rounded-lg h-9 px-2 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]">
                {(f.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input type={f.type === 'number' ? 'number' : 'text'} value={values?.[f.key] ?? ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E9E7F5] rounded-lg h-9 px-2 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
            )}
            {f.hint && <p className="text-[10px] text-[#A9B3C8] mt-1">{f.hint}</p>}
          </div>
        ))}
      </div>
    </Panel>
  )
}
