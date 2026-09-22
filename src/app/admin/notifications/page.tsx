'use client'

import { useEffect, useState } from 'react'
import { Bell, Send, Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { financeAPI } from '@/lib/api'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, usePaginatedState, formatDate,
} from '@/components/finance/ui'

type Row = any

export default function AdminNotificationsPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<Row[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)

  const [showSend, setShowSend] = useState(false)
  const [users, setUsers] = useState<Row[]>([])
  const [form, setForm] = useState({ user_id: '', type: 'custom', title: '', message: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.adminNotifications.list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
        setUnread(res.data?.unread || 0)
      })
      .catch(() => setError('Could not load notifications.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  useEffect(() => {
    if (showSend) financeAPI.adminNotifications.users().then((res: any) => setUsers(res.data?.data || [])).catch(() => {})
  }, [showSend])

  const refresh = () => setLoadKey((k) => k + 1)

  const send = async () => {
    if (!form.user_id) return toast.error('Select a recipient.')
    if (!form.title.trim()) return toast.error('Title is required.')
    setSaving(true)
    try {
      await financeAPI.adminNotifications.create({
        user_id: Number(form.user_id),
        type: form.type,
        title: form.title.trim(),
        message: form.message.trim(),
      })
      toast.success('Notification sent.')
      setShowSend(false)
      setForm({ user_id: '', type: 'custom', title: '', message: '' })
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not send notification.')
    } finally { setSaving(false) }
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Notifications"
        subtitle={`All user notifications · ${unread} unread`}
        actions={
          <div className="flex items-center gap-2">
            <RefreshBtn onClick={refresh} loading={loading} />
            <button onClick={() => setShowSend(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-3.5 py-2.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Send Notification
            </button>
          </div>
        }
      />

      <Panel>
        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : rows.length === 0 ? (
          <EmptyBlock message="No notifications yet" hint="Send a notification to a user from the finance hub." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Recipient</Th>
                  <Th>Type</Th>
                  <Th>Message</Th>
                  <Th>Status</Th>
                  <Th>Sent</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((n: Row) => (
                  <tr key={n.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-medium text-[#0F1B3D] flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${n.read_at ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'bg-[#EEF4FF] text-[#3478F6]'}`}>
                          <Bell className="w-3.5 h-3.5" />
                        </span>
                        {n.user?.name || '—'}
                      </div>
                      <div className="text-[10px] text-[#536078] mt-0.5">{n.user?.email}</div>
                    </Td>
                    <Td><span className="capitalize text-[11px] px-2 py-0.5 rounded-full bg-[#F8FAFC] border border-[#E9E7F5] text-[#536078]">{n.type?.replace('_', ' ')}</span></Td>
                    <Td>
                      <div className="font-medium text-[#0F1B3D] truncate max-w-[260px]">{n.title}</div>
                      <div className="text-[10px] text-[#536078] mt-0.5 truncate max-w-[260px]">{n.message}</div>
                    </Td>
                    <Td><span className={`text-[11px] font-semibold ${n.read_at ? 'text-[#A9B3C8]' : 'text-[#3478F6]'}`}>{n.read_at ? 'Read' : 'Unread'}</span></Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(n.created_at)}</Td>
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

      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowSend(false)}>
          <div className="bg-white border border-[#E9E7F5] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E9E7F5]">
              <h3 className="text-sm font-semibold text-[#0F1B3D]">Send Notification</h3>
              <button onClick={() => setShowSend(false)} className="p-1.5 rounded-lg hover:bg-[#F3EEFF] text-[#536078]"><Send className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Recipient *</label>
                <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]">
                  <option value="">Select user…</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]">
                    {['custom', 'payment', 'refund', 'payout', 'invoice', 'course'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#536078] mb-1">Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3}
                  className="w-full bg-white border border-[#E9E7F5] rounded-xl p-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[#E9E7F5]">
              <button onClick={() => setShowSend(false)} className="text-xs font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-4 py-2.5 hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={send} disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl px-4 py-2.5 disabled:opacity-50">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {saving ? 'Sending…' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}
