'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CreditCard, RefreshCw, Loader2, Download, Undo2, TrendingUp } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount, downloadCsv, statusBadgeClass } from '@/lib/payments'
import { cn } from '@/lib/utils'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, PillBtn, usePaginatedState, formatDate, StatTile,
} from '@/components/finance/ui'
import toast from 'react-hot-toast'

type Row = any

const STATUSES = ['completed', 'paid', 'pending', 'processing', 'payment_processing', 'failed', 'cancelled', 'expired', 'refunded', 'partially_refunded']
const GATEWAYS = ['demo', 'stripe', 'sslcommerz', 'manual', 'bkash', 'nagad']

export default function AdminPaymentsPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<Row[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState<number | null>(null)
  const [loadKey, setLoadKey] = useState(0)
  const [summary, setSummary] = useState<any>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const status = nav.params.status as string | undefined
  const gateway = nav.params.gateway as string | undefined

  const applySearch = (q: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      nav.setParams({ ...nav.params, q: q || undefined })
    }, 350)
  }

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.payments
      .list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load payments.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  useEffect(() => {
    financeAPI.reports
      .summary({})
      .then((res: any) => setSummary(res.data?.data || null))
      .catch(() => setSummary(null))
  }, [loadKey])

  const verify = async (id: number) => {
    setVerifying(id)
    try {
      const res = await financeAPI.payments.verify(id)
      toast.success(`Verified → ${res.data?.data?.payment_status || res.data?.data?.outcome || 'ok'}`)
      setLoadKey((k) => k + 1)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Verify failed')
    } finally { setVerifying(null) }
  }

  const exportCsv = () => {
    downloadCsv(
      `payments-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['ID', 'User', 'Email', 'Order', 'Amount', 'Currency', 'Gateway', 'Transaction', 'Status', 'Paid At'],
        ...rows.map((p) => [
          p.id, p.user?.name || '', p.user?.email || '', p.order_number || '',
          fmtAmount(p.amount), p.currency, p.gateway || '', p.transaction_id || '', p.status,
          p.paid_at ? formatDate(p.paid_at) : '',
        ]),
      ]
    )
  }

  const sym = currencySymbol('BDT')
  const cur = summary?.by_currency?.[0]

  return (
    <FinanceShell>
      <PageHeader
        title="Payments"
        subtitle="All gateway payment records — filter, verify and export"
        actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 mb-4">
        <StatTile label="Total revenue (30d)" value={`৳${fmtAmount(summary?.gross_revenue)}`} icon={<TrendingUp className="w-4 h-4" />} tone="indigo" />
        <StatTile label="Net revenue (30d)" value={`৳${fmtAmount(summary?.net_revenue)}`} icon={<CreditCard className="w-4 h-4" />} tone="sky" />
        <StatTile label="Refunds (30d)" value={`৳${fmtAmount(summary?.refunds)}`} icon={<Undo2 className="w-4 h-4" />} tone="rose" />
        <StatTile label="Orders paid" value={summary?.orders_paid ?? 0} icon={<CreditCard className="w-4 h-4" />} tone="emerald" />
      </div>

      <Panel
        search
        onSearch={applySearch}
        extra={
          <>
            <div className="flex gap-1.5 flex-wrap">
              <PillBtn active={!status} onClick={() => nav.setParams({ ...nav.params, status: undefined })}>All</PillBtn>
              {STATUSES.map((s) => (
                <PillBtn key={s} active={status === s} onClick={() => nav.setParams({ ...nav.params, status: s })}>{s.replace(/_/g, ' ')}</PillBtn>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <select
                value={gateway || ''}
                onChange={(e) => nav.setParams({ ...nav.params, gateway: e.target.value || undefined })}
                className="bg-white border border-[#E9E7F5] rounded-xl h-9 px-2 text-[11px] text-[#536078] focus:outline-none focus:border-[#6D3DF5]"
              >
                <option value="">All gateways</option>
                {GATEWAYS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <button onClick={exportCsv} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr>
                <Th>ID</Th><Th>User</Th><Th>Order</Th><Th className="text-center">Amount</Th>
                <Th className="text-center">Gateway</Th><Th>Transaction</Th><Th className="text-center">Status</Th>
                <Th className="text-center">Created</Th><Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}><LoadingBlock /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9}><EmptyBlock message="No payments found." hint="Adjust filters or verify a payment to see records here." /></td></tr>
              ) : rows.map((p) => (
                <tr key={p.id} className="border-b border-[#E9E7F5] hover:bg-[#F8FAFC] transition-colors">
                  <Td className="font-medium text-[#0F1B3D]">#{p.id}</Td>
                  <Td>
                    <p className="text-xs text-[#0F1B3D] font-medium">{p.user?.name || '—'}</p>
                    <p className="text-[10px] text-[#A9B3C8]">{p.user?.email}</p>
                  </Td>
                  <Td><span className="text-[10px] font-mono text-[#6D3DF5]">{p.order_number || '—'}</span></Td>
                  <Td className="text-center font-semibold text-[#0F1B3D] tabular-nums">{currencySymbol(p.currency)}{fmtAmount(p.amount)}</Td>
                  <Td className="text-center"><span className="text-[10px] text-[#536078] capitalize">{p.gateway || '—'}</span></Td>
                  <Td><span className="text-[10px] font-mono text-[#A9B3C8]">{p.transaction_id || '—'}</span></Td>
                  <Td className="text-center"><StatusBadge status={p.status} /></Td>
                  <Td className="text-center text-[10px] text-[#536078] whitespace-nowrap">{formatDate(p.created_at)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {['pending', 'processing', 'payment_processing'].includes(p.status) && (
                        <button onClick={() => verify(p.id)} disabled={verifying === p.id}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/30 rounded-lg px-2 py-1 hover:bg-[#EEE3FF] disabled:opacity-50">
                          {verifying === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Verify
                        </button>
                      )}
                      <Link href={`/admin/payments/${p.id}`} className={cn('text-[10px] font-semibold text-[#536078] bg-[#F8FAFC] border border-[#E9E7F5] rounded-lg px-2 py-1 hover:bg-[#F3EEFF]')}>View</Link>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length > 0 && (
          <Pagination page={meta.current_page} lastPage={meta.last_page} total={meta.total} from={meta.from} to={meta.to} onChange={nav.setPage} />
        )}
      </Panel>
    </FinanceShell>
  )
}
