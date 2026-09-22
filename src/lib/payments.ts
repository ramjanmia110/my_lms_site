export type PStatus =
  | 'pending' | 'processing' | 'payment_processing' | 'paid' | 'completed'
  | 'failed' | 'cancelled' | 'expired' | 'refunded' | 'partially_refunded'
  | 'requested' | 'succeeded' | 'partially_refunded' | 'void'

export const CURRENCY_SYMBOL: Record<string, string> = { BDT: '৳', USD: '$', EUR: '€', GBP: '£', INR: '₹' }

export function currencySymbol(currency?: string | null): string {
  return CURRENCY_SYMBOL[currency || 'BDT'] || '৳'
}

const BADGE_CLASS: Record<string, string> = {
  completed: 'bg-[#ECFBF5] text-[#0B6E4F] border-[#18A878]/30',
  paid: 'bg-[#ECFBF5] text-[#0B6E4F] border-[#18A878]/30',
  succeeded: 'bg-[#ECFBF5] text-[#0B6E4F] border-[#18A878]/30',
  fulfilled: 'bg-[#ECFBF5] text-[#0B6E4F] border-[#18A878]/30',
  pending: 'bg-[#FFF7E6] text-[#B45309] border-amber-500/30',
  processing: 'bg-[#EEF4FF] text-[#2A63E0] border-[#3478F6]/30',
  payment_processing: 'bg-[#EEF4FF] text-[#2A63E0] border-[#3478F6]/30',
  requested: 'bg-[#EEF4FF] text-[#2A63E0] border-[#3478F6]/30',
  failed: 'bg-rose-50 text-[#B91C1C] border-rose-500/30',
  cancelled: 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5]',
  expired: 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5]',
  refunded: 'bg-[#F3EEFF] text-[#5B2EE0] border-[#6D3DF5]/30',
  partially_refunded: 'bg-[#F3EEFF] text-[#5B2EE0] border-[#6D3DF5]/30',
  void: 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5]',
  active: 'bg-[#ECFBF5] text-[#0B6E4F] border-[#18A878]/30',
  inactive: 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5]',
  verified: 'bg-[#ECFBF5] text-[#0B6E4F] border-[#18A878]/30',
  verified_partial: 'bg-[#FFF7E6] text-[#B45309] border-amber-500/30',
  unverified: 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5]',
  unknown: 'bg-[#EEF4FF] text-[#2A63E0] border-[#3478F6]/30',
  declined: 'bg-rose-50 text-[#B91C1C] border-rose-500/30',
  mismatch: 'bg-rose-50 text-[#B91C1C] border-rose-500/30',
  success: 'bg-[#ECFBF5] text-[#0B6E4F] border-[#18A878]/30',
  ran: 'bg-[#ECFBF5] text-[#0B6E4F] border-[#18A878]/30',
  running: 'bg-[#EEF4FF] text-[#2A63E0] border-[#3478F6]/30',
}

export function statusBadgeClass(status: string): string {
  return BADGE_CLASS[status] || 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5]'
}

export function isPayable(status?: string | null): boolean {
  return !!status && ['pending', 'payment_processing', 'failed', 'expired', 'cancelled'].includes(status)
}

export function fmtAmount(value: number | string | null | undefined): string {
  return Number(value || 0).toFixed(2)
}

/** Client-side CSV export (file name + 2D array of strings/numbers). */
export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]): void {
  const esc = (v: string | number | null | undefined) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}