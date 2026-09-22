'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, ArrowLeft, Check, Lock, ShieldCheck, Sparkles, Trophy, BookOpen,
  Wallet, FileText, ChevronDown, ChevronUp, Crown, CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const PLANS = {
  free: {
    name: 'Free',
    tagline: 'Explore and get started',
    price: { monthly: 0, annual: 0 },
    billedYearly: 0,
    features: ['Access to 3 free courses', 'Community forum access', 'Basic certificate', 'Limited freelance marketplace browsing'],
    icon: BookOpen,
    accent: 'bg-[#F3EEFF]',
    iconCls: 'bg-[#F3EEFF] text-[#6D3DF5]',
  },
  pro: {
    name: 'Pro',
    tagline: 'For serious learners ready to earn',
    price: { monthly: 990, annual: 792 },
    billedYearly: 9504,
    features: ['Full access to all 25+ courses', 'Verified certificates', 'Freelance marketplace access', '15% referral commission', 'Priority job placement support', 'Weekly skill challenges entry'],
    icon: Trophy,
    accent: 'bg-[#6D3DF5]',
    iconCls: 'bg-[#6D3DF5] text-white',
  },
  premium: {
    name: 'Premium',
    tagline: 'Maximum earning potential',
    price: { monthly: 1990, annual: 1592 },
    billedYearly: 19104,
    features: ['Everything in Pro', '1-on-1 mentor sessions', '25% referral commission', 'Guaranteed job interview assistance', 'Early access to new courses', 'Dedicated earnings manager'],
    icon: Crown,
    accent: 'bg-[#3478F6]',
    iconCls: 'bg-[#3478F6] text-white',
  },
} as const

type PlanKey = keyof typeof PLANS
type Billing = 'monthly' | 'annual'

function PlanCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading } = useAuth()

  const planParam = searchParams.get('plan')
  const billingParam = searchParams.get('billing')
  const planKey: PlanKey = planParam && planParam in PLANS ? (planParam as PlanKey) : 'pro'
  const billing: Billing = billingParam === 'annual' ? 'annual' : 'monthly'
  const plan = PLANS[planKey]

  const [step, setStep] = useState<'review' | 'gateway' | 'success'>('review')
  const [termChecked, setTermChecked] = useState(false)
  const [paying, setPaying] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const symbol = '৳'
  const monthlyPrice = plan.price[billing]
  const displayPrice = monthlyPrice ? `${symbol}${monthlyPrice.toLocaleString()}` : `${symbol}0`

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/payment/plan?plan=${planKey}&billing=${billing}`)}`)
    }
  }, [isLoading, isAuthenticated, planKey, billing, router])

  useEffect(() => {
    if (step !== 'gateway') return
    if (countdown <= 0) {
      setStep('success')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 800)
    return () => clearTimeout(t)
  }, [step, countdown])

  const handlePay = () => {
    if (!termChecked) return
    if (monthlyPrice > 0) {
      setPaying(true)
      setStep('gateway')
      setCountdown(4)
    } else {
      setStep('success')
    }
  }

  const handleGoDashboard = () => {
    try {
      localStorage.setItem(
        'l2e_active_plan',
        JSON.stringify({ plan: planKey, planName: plan.name, billing, activatedAt: new Date().toISOString() })
      )
    } catch { /* ignore */ }
    router.push('/dashboard')
  }

  /* ---------- states ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#6D3DF5] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#536078]">Checking your session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#6D3DF5] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#536078]">Redirecting to sign in...</span>
        </div>
      </div>
    )
  }

  /* ---------- success ---------- */
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#FFFFFF_0%,#F7F5FF_35%,#EFF4FF_68%,#F1FBF7_100%)]" />
          <div className="absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full bg-[#7C5CFC]/[0.08] blur-3xl" />
          <div className="absolute bottom-0 -left-40 w-[560px] h-[560px] rounded-full bg-[#2DD4BF]/[0.07] blur-3xl" />
        </div>
        <div className="relative w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-[#ECFBF5] border border-[#18A878]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_16px_40px_-16px_rgba(24,168,120,0.5)]">
            <CheckCircle className="w-10 h-10 text-[#18A878]" />
          </div>
          <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 text-white', plan.accent)}>
            <Check className="w-3 h-3" strokeWidth={3} /> Plan Activated
          </span>
          <h1 className="text-2xl font-extrabold text-[#0F1B3D] mb-2">
            Payment successful!
          </h1>
          <p className="text-sm text-[#536078] mb-6 leading-relaxed">
            Your <span className="font-bold text-[#0F1B3D]">{plan.name}</span> plan is now active.
            Welcome to your upgraded Learn2Earn experience.
          </p>
          <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 mb-6 text-left shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#536078]">{plan.name} · {billing}</span>
              <span className="font-bold text-[#0F1B3D]">{displayPrice}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-[#536078]">Billed {billing}</span>
              <span className="font-bold text-[#18A878]">{monthlyPrice ? `${symbol}${(billing === 'annual' ? plan.billedYearly : monthlyPrice).toLocaleString()}` : 'Free'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoDashboard}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-[0_10px_24px_-10px_rgba(109,61,245,0.6)]"
            >
              Go to Dashboard <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
            <Link href="/" className="w-full inline-flex items-center justify-center gap-2 bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold transition-all">
              Continue Exploring
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const PlanIcon = plan.icon

  return (
    <div className="min-h-screen bg-[#FFFFFF] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#FFFFFF_0%,#FAF8FF_30%,#F4F7FF_64%,#F4FCF9_100%)]" />
        <div className="absolute left-[-10%] top-[-8%] h-[24rem] w-[24rem] rounded-full bg-[#F3EEFF] blur-[120px]" />
        <div className="absolute right-[-8%] top-[16%] h-96 w-96 rounded-full bg-[#EEF4FF] blur-[110px]" />
        <div className="absolute left-[26%] bottom-[-12%] h-80 w-80 rounded-full bg-[#ECFBF5] blur-[110px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6 lg:py-10">
        <div className="flex items-center justify-between mb-6">
          <Link href="/#pricing" className="inline-flex items-center gap-1.5 text-sm text-[#536078] hover:text-[#0F1B3D] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to plans
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#18A878] font-semibold bg-[#ECFBF5] border border-[#18A878]/25 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3" /> Secure Checkout
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ===== LEFT — Payment ===== */}
          <div className="lg:col-span-7 h-full">
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white p-6 sm:p-7 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.25)]">
              <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#F3EEFF] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4B5FD]/70 to-transparent" />

              <div className="relative flex flex-1 flex-col">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-[0_10px_24px_-10px_rgba(109,61,245,0.7)]">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <h1 className="text-lg font-bold text-[#0F1B3D] leading-tight">Secure Payment</h1>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#536078]">
                      Complete your <span className="font-bold text-[#0F1B3D]">{plan.name}</span> plan activation.
                    </p>
                  </div>
                </div>

                {/* Selected payer */}
                <div className="mt-7 flex items-center gap-3 rounded-2xl border border-[#E9E7F5] bg-[#F9F7FF] p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] text-white text-sm font-bold">
                    {(user?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0F1B3D] truncate">{user?.name || 'Student'}</p>
                    <p className="text-xs text-[#536078] truncate">{user?.email || '—'}</p>
                  </div>
                </div>

                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#536078]">Payment Method</p>
                <div className="mt-3 flex items-center gap-3.5 rounded-2xl border border-[#6D3DF5] bg-[#F3EEFF] p-4">
                  <span className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-[#D9E2F0] bg-white px-2.5 shadow-[0_8px_18px_-8px_rgba(27,43,91,0.35)]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00B36B] shadow-[0_4px_10px_-3px_rgba(0,179,107,0.6)]">
                      <Lock className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="text-[11px] font-extrabold leading-none tracking-tight text-[#1B2B5B]">
                      ssl<span className="text-[#3D5A9B]">commerz</span>
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0F1B3D]">SSLCommerz</p>
                    <p className="text-[11px] text-[#536078]">256-bit SSL encryption · bKash, Nagad, cards &amp; more</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFBF5] border border-[#18A878]/25 px-2 py-0.5 text-[9px] font-semibold text-[#18A878]">
                    <CheckCircle className="h-2.5 w-2.5" /> Recommended
                  </span>
                </div>

                {/* Terms */}
                <label className="mt-6 flex items-start gap-3 cursor-pointer select-none group">
                  <span
                    role="checkbox"
                    aria-checked={termChecked}
                    tabIndex={0}
                    onClick={() => setTermChecked(!termChecked)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTermChecked(!termChecked) } }}
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 group-hover:shadow-[0_0_0_4px_rgba(109,61,245,0.12)]',
                      termChecked
                        ? 'border-[#6D3DF5] bg-[#6D3DF5] shadow-[0_4px_14px_-2px_rgba(109,61,245,0.55)]'
                        : 'border-[#C3BDDC] bg-white'
                    )}
                  >
                    {termChecked && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                  </span>
                  <span className="text-[11px] leading-relaxed text-[#536078]">
                    I confirm this plan subscription and agree to the{' '}
                    <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-[#6D3DF5] hover:underline">Terms</a> and{' '}
                    <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-[#6D3DF5] hover:underline">Refund Policy</a>.
                  </span>
                </label>

                {/* CTA */}
                <button onClick={handlePay} disabled={!termChecked || paying} className="mt-7">
                  <span className="flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] py-4 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(109,61,245,0.6)] transition-all hover:shadow-[0_20px_50px_-12px_rgba(109,61,245,0.75)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100">
                    {paying ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to SSLCommerz...</>
                    ) : (
                      <>
                        {monthlyPrice ? `Pay ${symbol}${(billing === 'annual' ? plan.billedYearly : monthlyPrice).toLocaleString()} via SSLCommerz` : 'Activate Free Plan'} <ArrowLeft className="h-4 w-4 rotate-180" />
                      </>
                    )}
                  </span>
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[#A9B3C8]">
                  <Sparkles className="w-3 h-3" /> Amount calculated server-side • No charge for Free plan
                </p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT — Plan Summary ===== */}
          <div className="lg:col-span-5 h-full">
            <div className="lg:sticky lg:top-6 relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.25)]">
              <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-[#F3EEFF] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4B5FD]/70 to-transparent" />

              <div className="relative flex flex-1 flex-col">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D3DF5]">
                  <FileText className="h-4 w-4" /> Order Summary
                </span>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E9E7F5] bg-[#F9F7FF] p-3.5">
                  <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', plan.iconCls)}>
                    <PlanIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0F1B3D]">{plan.name} Plan</p>
                    <p className="text-[11px] text-[#536078]">{plan.tagline}</p>
                  </div>
                </div>

                <div className="mt-4 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#536078]">Plan Price ({billing})</span>
                    <span className="font-semibold text-[#0F1B3D]">
                      {monthlyPrice ? `${symbol}${monthlyPrice.toLocaleString()}${billing === 'monthly' ? '/mo' : '/mo'}` : 'Free'}
                    </span>
                  </div>
                  {billing === 'annual' && monthlyPrice > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#536078]">Billed yearly</span>
                      <span className="font-bold text-[#18A878]">{symbol}{plan.billedYearly.toLocaleString()}/yr</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-[#E9E7F5] pt-3">
                    <span className="font-bold text-[#0F1B3D]">Total</span>
                    <span className="text-2xl font-extrabold tracking-tight text-[#6D3DF5]">
                      {monthlyPrice ? `${symbol}${(billing === 'annual' ? plan.billedYearly : monthlyPrice).toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-[12.5px] text-[#536078]">
                      <CheckCircle className="h-4 w-4 text-[#18A878] shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#18A878]/20 bg-[#ECFBF5] px-4 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#18A878] to-[#0E8A5F] shadow-[0_8px_18px_-6px_rgba(24,168,120,0.6)]">
                      <Lock className="h-4 w-4 text-white" />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-[#0F1B3D]">Secured by SSLCommerz</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[#536078]">Your payment is 100% secure.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SSLCommerz gateway overlay ===== */}
      {step === 'gateway' && (
        <div className="fixed inset-0 z-50 bg-[#0F1B3D]/95 flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00B36B] to-[#007A47] shadow-[0_16px_40px_-12px_rgba(0,179,107,0.7)]">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <p className="text-white font-bold text-lg mb-1">
              ssl<span className="text-[#7CFFC9]">commerz</span>
            </p>
            <p className="text-white/70 text-sm mb-6">Secure gateway · SSL 256-bit encrypted</p>
            <div className="flex items-center justify-center gap-3 text-white/90 mb-6">
              <span className="text-2xl font-extrabold">{displayPrice}</span>
              <span className="text-sm text-white/60">·</span>
              <span className="text-sm">{plan.name} Plan</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-white/90 text-sm">Processing payment</span>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-[#00B36B] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="mt-8 text-white/50 text-xs">
              Redirecting to SSLCommerz in <span className="font-bold text-white">{countdown}</span>...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#6D3DF5] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#536078]">Loading plan checkout...</span>
        </div>
      </div>
    }>
      <PlanCheckoutPage />
    </Suspense>
  )
}