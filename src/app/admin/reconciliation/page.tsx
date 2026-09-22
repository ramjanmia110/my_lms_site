'use client'

import { useCallback, useEffect, useState } from 'react'
import { Scale, Play, X, ArrowUpRight } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, GradientBtn, usePaginatedState, formatDate,
} from '@/components/finance/ui'
import toast from 'react-hot-toast'

export default function AdminReconciliationPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<any[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)
  const [running, setRunning] = useState(false)
  const [gateway, setGateway] = useState('')
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.reconciliation
      .list({ per_page: 12, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load reconciliation runs.'))
      .finally(() => setLoading(false))
  }, [nav.query, loadKey])

  const runNow = async () => {
    setRunning(true)
    try {
      await financeAPI.reconciliation.run()
      toast.success('Reconciliation run completed.')
      setLoadKey((k) => k + 1)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not start reconciliation.')
    } finally {
      setRunning(false)
    }
  }

  const viewDetail = async (run: any) => {
    try {
      const res: any = await financeAPI.reconciliation.get(run.id)
      setDetail(res.data?.data || run)
    } catch {
      toast.error('Could not load run details.')
    }
  }

  const summaryKeys = ['compared', 'reconciled', 'mismatches', 'missing_in_local', 'missing_in_gateway', 'unexpected', 'errors', 'warnings']

  return (
    <FinanceShell>
      <PageHeader
        title="Reconciliation"
        subtitle="Compare local payment records against gateway transactions"
        actions={
          <>
            <RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />
            <GradientBtn onClick={runNow} disabled={running}><Play className="w-3.5 h-3.5" /> {running ? 'Running…' : 'Run Now'}</GradientBtn>
          </>
        }
      />

      <div className="mt-4 mb-4 bg-white border border-[#E9E7F5] rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <Scale className="w-4 h-4 text-[#6D3DF5]" />
        <p className="text-xs text-[#536078]">Run reconciliation for a specific gateway, or leave empty to reconcile all.</p>
        <select
          value={gateway}
          onChange={(e) => setGateway(e.target.value)}
          className="bg-white border border-[#E9E7F5] rounded-xl h-9 px-3 text-xs text-[#536078] focus:outline-none focus:border-[#6D3DF5]"
        >
          <option value="">All gateways</option>
          <option value="stripe">stripe</option>
          <option value="sslcommerz">sslcommerz</option>
        </select>
        <GradientBtn onClick={runNow} disabled={running}><Play className="w-3.5 h-3.5" /> {running ? 'Running…' : 'Run Now'}</GradientBtn>
      </div>

      <Panel>
        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} />
        ) : rows.length === 0 ? (
          <EmptyBlock message="No reconciliation runs yet" hint="Run your first reconciliation to compare local vs gateway records." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Run</Th>
                  <Th>Gateway</Th>
                  <Th>Status</Th>
                  <Th>Summary</Th>
                  <Th>Started</Th>
                  <Th>Finished</Th>
                  <Th />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td className="font-semibold text-[#0F1B3D]">#{r.id}</Td>
                    <Td className="capitalize text-[#536078]">{r.gateway || 'all'}</Td>
                    <Td><StatusBadge status={r.status} /></Td>
                    <Td>
                      <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                        {summaryKeys.filter((k) => (r.summary || {})[k] !== undefined).map((k) => (
                          <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#E9E7F5] text-[10px] text-[#536078]">
                            {k.replace(/_/g, ' ')}: <b className={(r.summary || {})[k] > 0 && ['mismatches', 'missing_in_local', 'missing_in_gateway', 'unexpected', 'errors'].includes(k) ? 'text-[#B45309]' : 'text-[#18A878]'}>{(r.summary || {})[k]}</b>
                          </span>
                        ))}
                      </div>
                    </Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(r.started_at)}</Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(r.finished_at)}</Td>
                    <Td>
                      <button onClick={() => viewDetail(r)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6D3DF5] hover:text-[#5B2EE0]">
                        Detail <ArrowUpRight className="w-3 h-3" />
                      </button>
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

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="bg-white border border-[#E9E7F5] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E9E7F5]">
              <div>
                <h3 className="text-sm font-semibold text-[#0F1B3D]">Run #{detail.id}</h3>
                <p className="text-[11px] text-[#A9B3C8] mt-0.5">Gateway: {detail.gateway || 'all'} · {formatDate(detail.started_at)}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg text-[#536078] hover:bg-[#F3EEFF] hover:text-[#0F1B3D] border border-[#E9E7F5] bg-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {summaryKeys.filter((k) => (detail.summary || {})[k] !== undefined).map((k) => (
                  <div key={k} className="bg-[#F8FAFC] border border-[#E9E7F5] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-[#0F1B3D] tabular-nums">{(detail.summary || {})[k]}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#A9B3C8] mt-0.5">{k.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-semibold text-[#536078] mb-3">Issues ({detail.issues?.length || 0})</h4>
              {(detail.issues || []).length === 0 ? (
                <EmptyBlock message="No issues reported for this run." />
              ) : (
                <div className="space-y-2">
                  {(detail.issues || []).map((i: any) => (
                    <div key={i.id} className="bg-[#F8FAFC] border border-[#E9E7F5] rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={i.status} />
                          <span className="text-xs font-semibold text-[#0F1B3D] capitalize">{i.type?.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="text-[10px] text-[#A9B3C8]">order #{i.course_order_id} · payment #{i.payment_id ?? '—'}</span>
                      </div>
                      <p className="text-[11px] text-[#536078] mt-2">{i.description || '—'}</p>
                      {(i.expected !== null && i.expected !== undefined) && (
                        <p className="text-[11px] text-[#A9B3C8] mt-1">expected <span className="text-[#536078] tabular-nums">{i.expected}</span> · actual <span className="text-[#536078] tabular-nums">{i.actual}</span></p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}
