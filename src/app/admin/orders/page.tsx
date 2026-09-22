'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Download } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount, downloadCsv } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, ViewLink, PillBtn, usePaginatedState, formatDate,
} from '@/components/finance/ui'

type Row = any

const GATEWAYS = ['stripe', 'sslcommerz', 'manual']

export default function AdminOrdersPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<Row[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.orders
      .list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  const applySearch = (q: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => nav.setParams({ ...nav.params, q: q || undefined }), 400)
  }

  const patch = (p: Record<string, any>) => {
    const next = { ...nav.params, ...p }
    Object.keys(next).forEach((k) => { if (next[k] === '' || next[k] === undefined) delete next[k] })
    nav.setParams(next)
  }

  const resetFilters = () => nav.setParams({})

  const exportCsv = () => {
    downloadCsv(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['Order', 'Customer', 'Email', 'Items', 'Gateway', 'Amount', 'Currency', 'Status', 'Payment', 'Refunded', 'Placed'],
        ...rows.map((o: Row) => [
          o.order_number, o.user?.name || '', o.user?.email || '',
          (o.items || []).map((i: any) => i.title).filter(Boolean).join('; '),
          o.gateway || '', fmtAmount(o.total), o.currency || '', o.status || '',
          o.payment_status || '', fmtAmount(o.refunded_amount), formatDate(o.created_at),
        ]),
      ]
    )
  }

  const paymentFilters: { label: string; value?: string }[] = [
    { label: 'All' },
    { label: 'Paid', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
  ]

  return (
    <FinanceShell>
      <PageHeader
        title="Orders"
        subtitle="Course checkout orders with customer, payment and fulfillment status"
        actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />}
      />

      <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
        {paymentFilters.map((f) => (
          <PillBtn key={f.label} active={nav.params.payment_status === f.value} onClick={() => patch({ payment_status: f.value })}>
            {f.label}
          </PillBtn>
        ))}
      </div>

      <Panel
        search
        onSearch={applySearch}
        extra={
          <>
            <select
              value={nav.params.status || ''}
              onChange={(e) => patch({ status: e.target.value || undefined })}
              className="bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]"
            >
              <option value="">Order status: all</option>
              {['pending', 'payment_processing', 'paid', 'failed', 'cancelled', 'expired', 'refunded', 'partially_refunded'].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              value={nav.params.gateway || ''}
              onChange={(e) => patch({ gateway: e.target.value || undefined })}
              className="bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]"
            >
              <option value="">Gateway: all</option>
              {GATEWAYS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <input
              value={nav.params.instructor || ''}
              onChange={(e) => patch({ instructor: e.target.value || undefined })}
              placeholder="Instructor…"
              className="w-32 bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] placeholder:text-[#A9B3C8] focus:outline-none focus:border-[#6D3DF5]"
            />
            <input
              type="date"
              value={nav.params.from_date || ''}
              onChange={(e) => patch({ from_date: e.target.value || undefined })}
              className="bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]"
            />
            <input
              type="date"
              value={nav.params.to_date || ''}
              onChange={(e) => patch({ to_date: e.target.value || undefined })}
              className="bg-white border border-[#E9E7F5] rounded-xl h-10 px-3 text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]"
            />
            {Object.keys(nav.params).length > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button
              onClick={exportCsv}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-3 py-2 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </>
        }
      >
        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} />
        ) : rows.length === 0 ? (
          <EmptyBlock message="No orders match this filter" hint="Try clearing filters or adjust your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Gateway</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Placed</Th>
                  <Th />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((o: Row) => (
                  <tr key={o.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-semibold text-[#0F1B3D]">{o.order_number}</div>
                      <div className="text-[10px] text-[#A9B3C8] mt-0.5">#{o.id}</div>
                    </Td>
                    <Td>
                      <div className="text-[#0F1B3D] font-medium">{o.user?.name || '—'}</div>
                      <div className="text-[10px] text-[#536078] mt-0.5">{o.user?.email}{o.user?.phone ? ' · ' + o.user.phone : ''}</div>
                    </Td>
                    <Td>
                      <div className="max-w-[220px] truncate text-[#536078]">
                        {(o.items || []).map((i: Row) => i.title).filter(Boolean).join(', ') || '—'}
                      </div>
                    </Td>
                    <Td className="capitalize text-[#536078]">{o.gateway || '—'}</Td>
                    <Td>
                      <div className="font-semibold text-[#0F1B3D] tabular-nums">{currencySymbol(o.currency)}{fmtAmount(o.total)}</div>
                      <div className="text-[10px] text-[#536078]">{o.currency}{o.refunded_amount > 0 ? ` · refunded ${fmtAmount(o.refunded_amount)}` : ''}</div>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={o.status} />
                        <StatusBadge status={o.payment_status} />
                      </div>
                    </Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(o.created_at)}</Td>
                    <Td>
                      <ViewLink href={`/admin/orders/${o.id}`}>View</ViewLink>
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