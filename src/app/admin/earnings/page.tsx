'use client'

import { useEffect, useState } from 'react'
import { Wallet, Repeat, TrendingUp, DollarSign, GraduationCap, Undo2, Users, Download } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount, downloadCsv } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, StatTile, usePaginatedState, formatDate,
} from '@/components/finance/ui'

type Row = any

export default function AdminEarningsPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<Row[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [summary, setSummary] = useState<Row>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([
      financeAPI.earnings.list({ per_page: 15, ...nav.query }),
      financeAPI.earnings.summary(),
    ])
      .then(([res, sum]: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
        setSummary(sum.data?.data || {})
      })
      .catch(() => setError('Could not load earnings.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  const patch = (p: Record<string, any>) => {
    const next = { ...nav.params, ...p }
    Object.keys(next).forEach((k) => { if (next[k] === '' || next[k] === undefined) delete next[k] })
    nav.setParams(next)
  }

  const statuses = ['All', 'pending', 'paid', 'refunded'].map((s) => s === 'All' ? { label: 'All' } : { label: s, value: s })

  const sym = currencySymbol('BDT')

  const exportCsv = () => {
    downloadCsv(
      `earnings-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['Instructor', 'Email', 'Course', 'Order', 'Gross', 'Platform Fee', 'Gateway Fee', 'Refunded', 'Net', 'Status', 'Recorded'],
        ...rows.map((e: Row) => [
          e.user?.name || '', e.user?.email || '', e.course?.title || e.order?.order_number || '',
          e.order_number || '', fmtAmount(e.gross_amount), fmtAmount(e.platform_fee),
          fmtAmount(e.gateway_fee), fmtAmount(e.refunded_amount), fmtAmount(e.net_amount),
          e.status || '', formatDate(e.created_at),
        ]),
      ]
    )
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Instructor Earnings"
        subtitle="Per-order revenue split ledger: gross, platform fee, gateway fee, refunds and net"
        actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        <StatTile label="Gross" value={`${sym}${fmtAmount(summary.gross)}`} icon={<TrendingUp className="w-4 h-4" />} tone="indigo" />
        <StatTile label="Platform Fee" value={`${sym}${fmtAmount(summary.platform_fee)}`} icon={<DollarSign className="w-4 h-4" />} tone="sky" />
        <StatTile label="Gateway Fee" value={`${sym}${fmtAmount(summary.gateway_fee)}`} icon={<Repeat className="w-4 h-4" />} tone="emerald" />
        <StatTile label="Refunded" value={`${sym}${fmtAmount(summary.refunded)}`} icon={<Undo2 className="w-4 h-4" />} tone="amber" />
        <StatTile label="Net Earnings" value={`${sym}${fmtAmount(summary.net)}`} icon={<Wallet className="w-4 h-4" />} tone="emerald" />
        <StatTile label="Available" value={`${sym}${fmtAmount(summary.available)}`} icon={<Users className="w-4 h-4" />} tone="sky" />
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
        {statuses.map((f: any) => (
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

      <Panel search={false} extra={
        <>
          <span className="text-[11px] text-[#536078]">{meta.total || 0} earnings · {summary.instructors || 0} instructors</span>
          <button
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </>
      }>
        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} />
        ) : rows.length === 0 ? (
          <EmptyBlock message="No earnings recorded yet" hint="Earnings appear automatically after a paid course enrollment is fulfilled." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Instructor</Th>
                  <Th>Course</Th>
                  <Th>Order</Th>
                  <Th>Gross</Th>
                  <Th>Platform</Th>
                  <Th>Gateway</Th>
                  <Th>Net</Th>
                  <Th>Status</Th>
                  <Th>Recorded</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((e: Row) => (
                  <tr key={e.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-medium text-[#0F1B3D] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center"><GraduationCap className="w-3.5 h-3.5" /></span>
                        {e.user?.name || '—'}
                      </div>
                      <div className="text-[10px] text-[#536078] mt-0.5">{e.user?.email}</div>
                    </Td>
                    <Td className="max-w-[200px]"><span className="truncate text-[#536078]">{e.course?.title || e.order?.order_number || '—'}</span></Td>
                    <Td>
                      <a href={`/admin/orders/${e.course_order_id}`} className="text-[#6D3DF5] hover:text-[#5B2EE0] font-semibold">{e.order_number || '—'}</a>
                    </Td>
                    <Td className="font-semibold tabular-nums text-[#0F1B3D]">{sym}{fmtAmount(e.gross_amount)}</Td>
                    <Td className="tabular-nums text-[#536078]">{sym}{fmtAmount(e.platform_fee)}</Td>
                    <Td className="tabular-nums text-[#536078]">{sym}{fmtAmount(e.gateway_fee)}</Td>
                    <Td className="font-semibold tabular-nums text-[#18A878]">{sym}{fmtAmount(e.net_amount)}</Td>
                    <Td><StatusBadge status={e.status} /></Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(e.created_at)}</Td>
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
    </FinanceShell>
  )
}
