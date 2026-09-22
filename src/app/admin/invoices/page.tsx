'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Printer, Download, X, ExternalLink } from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, Panel, RefreshBtn, StatusBadge, Td, Th, EmptyBlock, ErrorBlock,
  LoadingBlock, Pagination, PillBtn, GradientBtn, usePaginatedState, formatDate,
} from '@/components/finance/ui'
import toast from 'react-hot-toast'

export default function AdminInvoicesPage() {
  const nav = usePaginatedState()
  const [rows, setRows] = useState<any[]>([])
  const [meta, setMeta] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)
  const [viewing, setViewing] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.invoices
      .list({ per_page: 15, ...nav.query })
      .then((res: any) => {
        const d = res.data?.data || {}
        setRows(d.data || [])
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, from: d.from, to: d.to })
      })
      .catch(() => setError('Could not load invoices.'))
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

  const openView = async (row: any) => {
    try {
      setBusy(true)
      const res: any = await financeAPI.invoices.get(row.id)
      setViewing(res.data?.data || row)
    } catch {
      toast.error('Could not load invoice details.')
    } finally {
      setBusy(false)
    }
  }

  const getHtml = async (id: number): Promise<string> => {
    const res: any = await financeAPI.invoices.download(id)
    return res.data?.data?.html || ''
  }

  const printInvoice = async (id: number) => {
    try {
      setBusy(true)
      const html = await getHtml(id)
      const win = window.open('', '_blank', 'width=900,height=1000')
      if (!win) { toast.error('Popup blocked — allow popups to print.'); return }
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 600)
    } catch {
      toast.error('Could not generate the invoice for printing.')
    } finally {
      setBusy(false)
    }
  }

  const downloadInvoice = async (id: number, name: string) => {
    try {
      setBusy(true)
      const html = await getHtml(id)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not generate the invoice for download.')
    } finally {
      setBusy(false)
    }
  }

  const statusFilters = [
    { label: 'All' },
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Void', value: 'void' },
  ]

  return (
    <FinanceShell>
      <PageHeader
        title="Invoices"
        subtitle="Tax invoices for paid orders — view, print or download as HTML"
        actions={<RefreshBtn onClick={() => setLoadKey((k) => k + 1)} loading={loading} />}
      />

      <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
        {statusFilters.map((f) => (
          <PillBtn key={f.label} active={nav.params.status === f.value} onClick={() => patch({ status: f.value })}>
            {f.label}
          </PillBtn>
        ))}
      </div>

      <Panel search onSearch={applySearch}>
        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => setLoadKey((k) => k + 1)} />
        ) : rows.length === 0 ? (
          <EmptyBlock message="No invoices found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-[#E9E7F5]">
                  <Th>Invoice</Th>
                  <Th>Customer</Th>
                  <Th>Order</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Issued</Th>
                  <Th>Paid</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7F5]">
                {rows.map((i: any) => (
                  <tr key={i.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <Td>
                      <div className="font-semibold text-[#0F1B3D]">{i.invoice_number}</div>
                      <div className="text-[10px] text-[#A9B3C8] mt-0.5">#{i.id}</div>
                    </Td>
                    <Td>
                      <div className="text-[#0F1B3D] font-medium">{i.user?.name || '—'}</div>
                      <div className="text-[10px] text-[#536078] mt-0.5">{i.user?.email || i.billing_email || ''}</div>
                    </Td>
                    <Td className="font-mono text-[#536078]">{i.order_number || '—'}</Td>
                    <Td className="font-semibold tabular-nums text-[#0F1B3D]">
                      {currencySymbol(i.currency)}{fmtAmount(i.total)}
                    </Td>
                    <Td><StatusBadge status={i.status} /></Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(i.created_at)}</Td>
                    <Td className="text-[11px] text-[#536078]">{formatDate(i.paid_at)}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(i)} className="p-1.5 rounded-lg bg-white border border-[#E9E7F5] text-[#536078] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/40 transition-colors" title="View">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => printInvoice(i.id)} className="p-1.5 rounded-lg bg-white border border-[#E9E7F5] text-[#536078] hover:text-[#3478F6] hover:border-[#3478F6]/40 transition-colors" title="Print">
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => downloadInvoice(i.id, i.invoice_number)} className="p-1.5 rounded-lg bg-white border border-[#E9E7F5] text-[#536078] hover:text-[#18A878] hover:border-[#18A878]/40 transition-colors" title="Download">
                          <Download className="w-3.5 h-3.5" />
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

      {/* View modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setViewing(null)}>
          <div className="bg-white border border-[#E9E7F5] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E9E7F5]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6D3DF5]" />
                <h3 className="text-sm font-semibold text-[#0F1B3D]">{viewing.invoice_number}</h3>
              </div>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg hover:bg-[#F3EEFF] text-[#536078] hover:text-[#0F1B3D] transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <StatusBadge status={viewing.status} />
                <span className="text-[#536078]">Issued {formatDate(viewing.created_at)}</span>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] p-3 space-y-2">
                <div className="flex justify-between"><span className="text-[#536078]">Customer</span><span className="text-[#0F1B3D]">{viewing.user?.name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#536078]">Email</span><span className="text-[#0F1B3D]">{viewing.user?.email || viewing.billing_email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#536078]">Order</span><span className="font-mono text-[#0F1B3D]">{viewing.order_number || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#536078]">Payment method</span><span className="capitalize text-[#0F1B3D]">{viewing.payment_method || '—'}</span></div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] p-3 space-y-2">
                <div className="flex justify-between"><span className="text-[#536078]">Subtotal</span><span className="text-[#0F1B3D] tabular-nums">{currencySymbol(viewing.currency)}{fmtAmount(viewing.subtotal)}</span></div>
                {viewing.discount > 0 && <div className="flex justify-between"><span className="text-[#536078]">Discount</span><span className="text-[#18A878] tabular-nums">−{currencySymbol(viewing.currency)}{fmtAmount(viewing.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-[#536078]">Tax</span><span className="text-[#0F1B3D] tabular-nums">{currencySymbol(viewing.currency)}{fmtAmount(viewing.tax)}</span></div>
                <div className="flex justify-between"><span className="text-[#536078]">Fee</span><span className="text-[#0F1B3D] tabular-nums">{currencySymbol(viewing.currency)}{fmtAmount(viewing.fee)}</span></div>
                {viewing.coupon_code && <div className="flex justify-between"><span className="text-[#536078]">Coupon</span><span className="text-[#B45309]">{viewing.coupon_code}</span></div>}
                <div className="flex justify-between border-t border-[#E9E7F5] pt-2"><span className="font-semibold text-[#0F1B3D]">Total</span><span className="font-bold text-[#0F1B3D] tabular-nums">{currencySymbol(viewing.currency)}{fmtAmount(viewing.total)}</span></div>
              </div>
              <div className="flex gap-2">
                <GradientBtn onClick={() => printInvoice(viewing.id)} disabled={busy}>
                  <Printer className="w-3.5 h-3.5" /> Print
                </GradientBtn>
                <button
                  onClick={() => downloadInvoice(viewing.id, viewing.invoice_number)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#536078] bg-white border border-[#E9E7F5] rounded-xl px-4 py-2.5 hover:bg-[#F3EEFF] hover:border-[#6D3DF5]/30 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}