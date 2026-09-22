'use client'

import {
  Star, Clock, Layers, Tag, Check, Loader2, Shield, Lock, BookOpen,
  User, BadgeCheck, Sparkles, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OrderCourse {
  id: number
  title: string
  thumbnail?: string | null
  slug?: string
  category?: string
  level?: string
  duration?: string
  rating?: number
  students_count?: number
  instructor?: { id: number; name: string } | null
}

export interface OrderPricing {
  list_total: number
  discount: number
  coupon_code?: string | null
  coupon_label?: string | null
  subtotal: number
  tax: number
  fee: number
  total: number
}

interface Props {
  course: OrderCourse
  pricing: OrderPricing
  symbol: string
  showCoupon?: boolean
  couponInput?: string
  couponBusy?: boolean
  appliedCoupon?: string | null
  onCouponChange?: (v: string) => void
  onApplyCoupon?: () => void
  onRemoveCoupon?: () => void
  compact?: boolean
}

function Row({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[#536078]">{label}</span>
      <span className={cn('text-sm font-medium', tone === 'green' ? 'text-[#18A878] font-semibold' : 'text-[#0F1B3D]')}>{value}</span>
    </div>
  )
}

export default function CheckoutOrderSummary({
  course, pricing, symbol, showCoupon = true,
  couponInput = '', couponBusy = false, appliedCoupon = null,
  onCouponChange, onApplyCoupon, onRemoveCoupon,
  compact = false,
}: Props) {
  const discount = Number(pricing.discount || 0)
  const tax = Number(pricing.tax || 0)
  const fee = Number(pricing.fee || 0)
  const initial = (course.instructor?.name || '?').split(' ').map((p) => p[0]?.toUpperCase()).join('').slice(0, 2)

  return (
    <div className="bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden shadow-[0_12px_40px_-20px_rgba(15,27,61,0.25)]">
      <div className="px-5 py-4 border-b border-[#E9E7F5] bg-[#F9F7FF]/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-[#6D3DF5]" /> Order Summary
        </span>
        {!compact && <span className="text-[10px] text-[#A9B3C8]">Server-priced securely</span>}
      </div>

      {/* Course card */}
      <div className="p-5 border-b border-[#E9E7F5]">
        <div className="flex gap-3">
          <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-[#F3EEFF] flex items-center justify-center">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-6 h-6 text-[#6D3DF5]/70" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#0F1B3D] leading-snug line-clamp-2">{course.title}</p>
            {course.instructor?.name && (
              <p className="flex items-center gap-1.5 mt-1 text-xs text-[#536078]">
                <span className="w-4 h-4 rounded-full bg-[#6D3DF5]/10 text-[#6D3DF5] text-[8px] font-bold flex items-center justify-center shrink-0">
                  {initial}
                </span>
                <span className="truncate">{course.instructor.name}</span>
                <BadgeCheck className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-[#536078]">
              {course.level && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#F3EEFF] text-[#6D3DF5] font-medium capitalize">{course.level}</span>
              )}
              {course.duration && (
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
              )}
              {typeof course.rating === 'number' && (
                <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {course.rating.toFixed(1)}</span>
              )}
              {typeof course.students_count === 'number' && (
                <span className="inline-flex items-center gap-1"><Layers className="w-3 h-3" /> {course.students_count.toLocaleString()} students</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-2.5">
        <Row label="Course Price" value={`${symbol}${Number(pricing.subtotal).toFixed(2)}`} />
        {discount > 0 && (
          <Row label={pricing.coupon_label || 'Coupon discount'} value={`-${symbol}${discount.toFixed(2)}`} tone="green" />
        )}
        {tax > 0 && <Row label="Tax / VAT" value={`${symbol}${tax.toFixed(2)}`} />}
        {fee > 0 && <Row label="Gateway Fee" value={`${symbol}${fee.toFixed(2)}`} />}

        <div className="flex items-center justify-between pt-3 border-t border-[#E9E7F5]">
          <span className="text-sm font-semibold text-[#0F1B3D]">Total</span>
          <div className="text-right">
            <span className="text-xl font-extrabold text-[#0F1B3D] tracking-tight">{symbol}{Number(pricing.total).toFixed(2)}</span>
          </div>
        </div>

        {appliedCoupon && discount > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-[#18A878] font-medium bg-[#ECFBF5] border border-[#18A878]/20 rounded-lg px-3 py-2">
            <Sparkles className="w-3.5 h-3.5" /> You're saving {symbol}{discount.toFixed(2)} with {appliedCoupon}
          </p>
        )}

        {!compact && showCoupon && (
          appliedCoupon ? (
            <div className="flex items-center justify-between bg-[#ECFBF5] border border-[#18A878]/20 rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F9D6B]">
                <Check className="w-4 h-4" /> {appliedCoupon}
              </div>
              <button onClick={onRemoveCoupon} className="text-xs text-[#536078] hover:text-[#E11D48] font-medium inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Remove
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => onCouponChange?.(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && onApplyCoupon?.()}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-[#E9E7F5] bg-white text-[#0F1B3D] uppercase placeholder-[#A9B3C8] focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all min-w-0"
                />
                <button
                  onClick={onApplyCoupon}
                  disabled={couponBusy || !couponInput.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                >
                  {couponBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Apply
                </button>
              </div>
            </div>
          )
        )}

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#A9B3C8]">
          <Shield className="w-3 h-3" /> Amounts calculated server-side
        </div>
      </div>

      <div className="px-5 py-3 bg-[#F9F7FF]/60 border-t border-[#E9E7F5] flex items-center justify-center gap-1.5 text-[10px] text-[#536078]">
        <Lock className="w-3 h-3 text-[#18A878]" /> 256-bit SSL encrypted • Your payment is securely processed
      </div>
    </div>
  )
}