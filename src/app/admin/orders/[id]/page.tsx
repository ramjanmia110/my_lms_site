'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, Package, CreditCard, FileText, Undo2, GraduationCap, ListOrdered,
} from 'lucide-react'
import { financeAPI } from '@/lib/api'
import { currencySymbol, fmtAmount } from '@/lib/payments'
import { FinanceShell } from '@/components/finance/FinanceShell'
import {
  PageHeader, StatusBadge, Td, Th, EmptyBlock, ErrorBlock, LoadingBlock, formatDate,
} from '@/components/finance/ui'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.orders
      .get(id)
      .then((res: any) => setOrder(res.data?.data || null))
      .catch(() => setError('Could not load this order.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <FinanceShell>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536078] hover:text-[#0F1B3D] transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> All Orders
      </Link>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={() => window.location.reload()} />
      ) : !order ? (
        <ErrorBlock message="Order not found." />
      ) : (
        <>
          <PageHeader
            title={`Order ${order.order_number}`}
            subtitle={`Placed ${formatDate(order.created_at)}${order.currency ? ' · ' + order.currency : ''}`}
            actions={
              <div className="flex gap-2">
                <StatusBadge status={order.status} />
                <StatusBadge status={order.payment_status} />
                <StatusBadge status={order.fulfillment_status} />
              </div>
            }
          />

          <div className="grid lg:grid-cols-3 gap-4 mt-5">
            {/* Customer */}
            <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#6D3DF5]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0F1B3D]">Customer</h2>
              </div>
              <div className="space-y-2 text-xs">
                <div><p className="text-[#A9B3C8]">Name</p><p className="text-[#536078]">{order.user?.name || '—'}</p></div>
                <div><p className="text-[#A9B3C8]">Email</p><p className="text-[#536078]">{order.user?.email || '—'}</p></div>
                <div><p className="text-[#A9B3C8]">Phone</p><p className="text-[#536078]">{order.user?.phone || '—'}</p></div>
                <div><p className="text-[#A9B3C8]">Student ID</p><p className="text-[#536078]">{order.user?.student_id || '#L2E-' + String(order.user?.id || '').padStart(5, '0')}</p></div>
                <div><p className="text-[#A9B3C8]">Role</p><p className="capitalize text-[#536078]">{order.user?.role || '—'}</p></div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#ECFBF5] border border-[#18A878]/20 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-[#18A878]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0F1B3D]">Order Summary</h2>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[#A9B3C8]">Subtotal</span><span className="text-[#536078] tabular-nums">{currencySymbol(order.currency)}{fmtAmount(order.subtotal)}</span></div>
                {order.coupon_code && (
                  <div className="flex justify-between"><span className="text-[#A9B3C8]">Coupon {order.coupon_code}</span><span className="text-[#18A878] tabular-nums">−{currencySymbol(order.currency)}{fmtAmount(order.discount)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-[#A9B3C8]">Tax</span><span className="text-[#536078] tabular-nums">{currencySymbol(order.currency)}{fmtAmount(order.tax)}</span></div>
                <div className="flex justify-between"><span className="text-[#A9B3C8]">Processing fee</span><span className="text-[#536078] tabular-nums">{currencySymbol(order.currency)}{fmtAmount(order.fee)}</span></div>
                {order.gateway_fee > 0 && (
                  <div className="flex justify-between"><span className="text-[#A9B3C8]">Gateway fee</span><span className="text-[#536078] tabular-nums">{currencySymbol(order.currency)}{fmtAmount(order.gateway_fee)}</span></div>
                )}
                <div className="flex justify-between border-t border-[#E9E7F5] pt-2"><span className="font-semibold text-[#0F1B3D]">Total</span><span className="font-bold text-[#0F1B3D] tabular-nums">{currencySymbol(order.currency)}{fmtAmount(order.total)}</span></div>
                {order.refunded_amount > 0 && (
                  <div className="flex justify-between"><span className="text-[#A9B3C8]">Refunded</span><span className="text-[#6D3DF5] tabular-nums">−{currencySymbol(order.currency)}{fmtAmount(order.refunded_amount)}</span></div>
                )}
                {order.gateway && (
                  <div className="flex justify-between"><span className="text-[#A9B3C8]">Paid via</span><span className="capitalize text-[#536078]">{order.gateway} ({order.payment_method || '—'})</span></div>
                )}
                {order.paid_at && <div className="flex justify-between"><span className="text-[#A9B3C8]">Paid at</span><span className="text-[#536078]">{formatDate(order.paid_at)}</span></div>}
              </div>
            </div>

            {/* Invoice */}
            <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#FFF7E6] border border-[#B45309]/20 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-[#B45309]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0F1B3D]">Invoice</h2>
              </div>
              {order.invoice ? (
                <div className="space-y-2 text-xs">
                  <div><p className="text-[#A9B3C8]">Number</p><p className="text-[#536078]">{order.invoice.invoice_number}</p></div>
                  <div><p className="text-[#A9B3C8]">Status</p><StatusBadge status={order.invoice.status} /></div>
                  <div><p className="text-[#A9B3C8]">Created</p><p className="text-[#536078]">{formatDate(order.invoice.created_at)}</p></div>
                  <Link href="/admin/invoices" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6D3DF5] hover:text-[#5B2EE0] mt-1">
                    Open Invoices <ArrowLeft className="w-3 h-3 rotate-180" />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-[#A9B3C8]">No invoice generated for this order.</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/20 flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-[#6D3DF5]" />
              </div>
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-[#E9E7F5]">
                    <Th>Course</Th><Th>Instructor</Th><Th>Price</Th><Th>Discount</Th><Th>Qty</Th><Th>Total</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E7F5]">
                  {(order.items || []).map((i: any, idx: number) => (
                    <tr key={i.course_id || idx} className="hover:bg-[#F8FAFC]">
                      <Td>
                        <div className="font-semibold text-[#0F1B3D]">{i.title}</div>
                        <div className="text-[10px] text-[#A9B3C8]">{i.level || ''}{i.duration ? ' · ' + i.duration : ''}</div>
                      </Td>
                      <Td className="text-[#536078]">{i.instructor || '—'}</Td>
                      <Td className="tabular-nums">{currencySymbol(order.currency)}{fmtAmount(i.price)}</Td>
                      <Td className="tabular-nums text-[#18A878]">{i.discount > 0 ? '−' + currencySymbol(order.currency) + fmtAmount(i.discount) : '—'}</Td>
                      <Td className="tabular-nums">{i.quantity}</Td>
                      <Td className="font-semibold tabular-nums text-[#0F1B3D]">{currencySymbol(order.currency)}{fmtAmount(i.total)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/20 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-[#6D3DF5]" />
              </div>
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Payments</h2>
            </div>
            {(order.payments || []).length === 0 ? (
              <EmptyBlock message="No payment records for this order." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E9E7F5]">
                      <Th>Payment #</Th><Th>Gateway</Th><Th>Method</Th><Th>Transaction</Th><Th>Amount</Th><Th>Status</Th><Th>Verification</Th><Th>Date</Th><Th />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E7F5]">
                    {(order.payments || []).map((p: any) => (
                      <tr key={p.id} className="hover:bg-[#F8FAFC]">
                        <Td className="font-semibold text-[#0F1B3D]">#{p.id}</Td>
                        <Td className="capitalize">{p.gateway || '—'}</Td>
                        <Td className="capitalize">{p.payment_method || '—'}</Td>
                        <Td>
                          <div className="text-[#536078] truncate max-w-[160px]">{p.gateway_transaction_id || p.transaction_id || '—'}</div>
                        </Td>
                        <Td className="font-semibold tabular-nums text-[#0F1B3D]">{currencySymbol(p.currency)}{fmtAmount(p.amount)}</Td>
                        <Td><StatusBadge status={p.status} /></Td>
                        <Td><StatusBadge status={p.verification?.verification_status} /></Td>
                        <Td className="text-[11px] text-[#536078]">{formatDate(p.created_at)}</Td>
                        <Td>
                          <Link href={`/admin/payments/${p.id}`} className="text-[11px] font-semibold text-[#6D3DF5] hover:text-[#5B2EE0]">Detail</Link>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Refunds */}
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/20 flex items-center justify-center">
                <Undo2 className="w-3.5 h-3.5 text-[#6D3DF5]" />
              </div>
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Refunds</h2>
            </div>
            {(order.refunds || []).length === 0 ? (
              <EmptyBlock message="No refunds for this order." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E9E7F5]">
                      <Th>Refund #</Th><Th>Amount</Th><Th>Reason</Th><Th>Status</Th><Th>Requested</Th><Th>Processed</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E7F5]">
                    {(order.refunds || []).map((r: any) => (
                      <tr key={r.id} className="hover:bg-[#F8FAFC]">
                        <Td className="font-semibold text-[#0F1B3D]">{r.refund_number}</Td>
                        <Td className="tabular-nums">{currencySymbol(r.currency)}{fmtAmount(r.amount)}</Td>
                        <Td className="max-w-[260px]"><span className="line-clamp-2">{r.reason || '—'}</span></Td>
                        <Td><StatusBadge status={r.status} /></Td>
                        <Td className="text-[11px] text-[#536078]">{formatDate(r.requested_at)}</Td>
                        <Td className="text-[11px] text-[#536078]">{formatDate(r.processed_at)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Enrollments */}
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#ECFBF5] border border-[#18A878]/20 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-[#18A878]" />
              </div>
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Enrollments</h2>
            </div>
            {(order.enrollments || []).length === 0 ? (
              <EmptyBlock message="No enrollment records linked to this order yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E9E7F5]">
                      <Th>Course</Th><Th>Status</Th><Th>Payment</Th><Th>Enrolled</Th><Th>Access</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E7F5]">
                    {(order.enrollments || []).map((e: any) => (
                      <tr key={e.course_id} className="hover:bg-[#F8FAFC]">
                        <Td className="text-[#536078] max-w-[260px] truncate">{e.title}</Td>
                        <Td><StatusBadge status={e.status} /></Td>
                        <Td><StatusBadge status={e.payment_status} /></Td>
                        <Td className="text-[11px] text-[#536078]">{formatDate(e.enrolled_at)}</Td>
                        <Td className="text-[11px] text-[#536078]">{formatDate(e.access_start)} → {formatDate(e.access_end)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] border border-[#3478F6]/20 flex items-center justify-center">
                <ListOrdered className="w-3.5 h-3.5 text-[#3478F6]" />
              </div>
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Timeline</h2>
            </div>
            {(order.timeline || []).length === 0 ? (
              <EmptyBlock message="No lifecycle events recorded." />
            ) : (
              <div className="space-y-0 relative before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-[#E9E7F5] pl-6">
                {(order.timeline || []).map((t: any, idx: number) => (
                  <div key={idx} className="relative pb-4 last:pb-0">
                    <span className="absolute -left-6 top-1 w-[15px] h-[15px] rounded-full border-2 border-[#E9E7F5] bg-white" />
                    <p className="text-xs font-semibold text-[#0F1B3D]">{t.label}</p>
                    {t.detail && <p className="text-[11px] text-[#536078] mt-0.5">{t.detail}</p>}
                    <p className="text-[10px] text-[#A9B3C8] mt-0.5">{formatDate(t.at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </FinanceShell>
  )
}
