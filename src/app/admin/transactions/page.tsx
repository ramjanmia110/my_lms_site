'use client'

import { useEffect, useRef, useState } from 'react'
import { Repeat, X, Download } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount, downloadCsv } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, PillBtn, usePaginatedState, formatDate,
} from '@/components/finance/ui'

export default function AdminTransactionsPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<any[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.transactions
      .list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load transactions.'))
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

  const filterGroup = (key: string, opts: { label: string; value?: string }[]) => (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((f) => (
        <PillBtn key={f.label} active={(nav.params[key] || '') === (f.value || '')} onClick={() => patch({ [key]: f.value })}>
          {f.label}
        </PillBtn>
      ))}
    </div>
  )

  const responseFilters = [
    { label: 'Any response' },
    { label: 'Success', value: 'success' },
    { label: 'Failed', value: 'failed' },
    { label: 'Mismatch', value: 'mismatch' },
    { label: 'Unknown', value: 'unknown' },
  ]
  const verifyFilters = [
    { label: 'Any verification' },
    { label: 'Verified', value: 'verified' },
    { label: 'Partial', value: 'verified_partial' },
    { label: 'Unverified', value: 'unverified' },
    { label: 'Pending', value: 'pending' },
    { label: 'Declined', value: 'declined' },
  ]

  const exportCsv = () => {
    downloadCsv(
      `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['Transaction', 'Gateway', 'Direction', 'Order', 'Amount', 'Currency', 'Response', 'Verification', 'Gateway Txn ID', 'Date'],
        ...rows.map((t: any) => [
          t.txn_number || ('#' + t.id), t.gateway || '', t.direction || '',
          t.order?.order_number || '', fmtAmount(t.amount), t.currency || '',
          t.response_status || '', t.verification_status || '', t.gateway_transaction_id || '',
          formatDate(t.created_at),
        ]),
      ]
    )
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Transactions"
        subtitle="Gateway request/response records with verification status"
        actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />}
      />

      <div className="space-y-3 mt-4">
        {filterGroup('response_status', responseFilters)}
        {filterGroup('verification_status', verifyFilters)}
      </div>

      <div className="mt-4">
        <Panel
          search
          onSearch={applySearch}
          extra={
            <>
              {Object.keys(nav.params).length > 0 && (
                <button
                  onClick={() => nav.setParams({})}
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
            <EmptyBlock message="No transactions match this filter" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="border-b border-[#E9E7F5]">
                    <Th>Transaction</Th>
                    <Th>Gateway</Th>
                    <Th>Direction</Th>
                    <Th>Order</Th>
                    <Th>Amount</Th>
                    <Th>Response</Th>
                    <Th>Verification</Th>
                    <Th>Gateway Txn ID</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E7F5]">
                  {rows.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <Td>
                        <div className="font-semibold text-[#0F1B3D]">{t.txn_number || ('#' + t.id)}</div>
                        <div className="text-[10px] text-[#536078] mt-0.5 flex items-center gap-1">
                          <Repeat className="w-2.5 h-2.5" /> {t.payment_method || '—'}
                        </div>
                      </Td>
                      <Td className="capitalize">{t.gateway || '—'}</Td>
                      <Td className="capitalize text-[#536078]">{t.direction || '—'}</Td>
                      <Td>
                        {t.order ? (
                          <a href={`/admin/orders/${t.order.id}`} className="text-[#6D3DF5] hover:text-[#5B2EE0] font-semibold">{t.order.order_number}</a>
                        ) : (
                          <span className="text-[#A9B3C8]">—</span>
                        )}
                      </Td>
                      <Td className="font-semibold tabular-nums text-[#0F1B3D]">{currencySymbol(t.currency)}{fmtAmount(t.amount)}</Td>
                      <Td><StatusBadge status={t.response_status} /></Td>
                      <Td><StatusBadge status={t.verification_status} /></Td>
                      <Td className="text-[#536078] truncate max-w-[140px]">{t.gateway_transaction_id || '—'}</Td>
                      <Td className="text-[11px] text-[#536078]">{formatDate(t.created_at)}</Td>
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
    </FinanceShell>
  )
}