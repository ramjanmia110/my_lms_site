'use client'

import { useEffect, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BadgeCheck,
  BookOpen,
  Gift,
  GraduationCap,
  KeyRound,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

type Variant = 'login' | 'signup'

type Feature = {
  icon: ComponentType<{ className?: string }>
  color: string
  iconColor: string
  label: string
  desc: string
}

const variantContent: Record<
  Variant,
  { bgPhotoUrl: string; heading: ReactNode; subtext: string; features: Feature[]; bottomFeatures: string[] }
> = {
  login: {
    bgPhotoUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=60&w=1600',
    heading: <>Welcome <span className="text-[#E07B22]">Back</span></>,
    subtext: 'Sign in to continue your learning journey.',
    features: [
      { icon: ShieldCheck, color: '#E07B22', iconColor: '#FFFFFF', label: 'Secure Sign In', desc: 'Safe and secure access to your account.' },
      { icon: MousePointerClick, color: '#F7E7CE', iconColor: '#1F4D3A', label: 'Social Login', desc: 'Sign in quickly with Google or GitHub.' },
      { icon: KeyRound, color: '#A9CBB3', iconColor: '#153B2E', label: 'Easy Password Recovery', desc: 'Reset your password securely anytime.' },
    ],
    bottomFeatures: [
      '256-bit SSL Encrypted Sign In',
      'One-Click Social Login',
      'Instant Password Recovery',
      'Sign In from Any Device',
    ],
  },
  signup: {
    bgPhotoUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=60&w=1600',
    heading: <>Start <span className="text-[#E07B22]">Learning.</span> Start Growing.</>,
    subtext: 'Create your free account and unlock a smarter way to learn, grow your skills, and achieve your goals.',
    features: [
      { icon: Gift, color: '#E07B22', iconColor: '#FFFFFF', label: 'Free & Easy to Join', desc: 'Create your account in minutes with no hidden fees.' },
      { icon: BookOpen, color: '#F7E7CE', iconColor: '#1F4D3A', label: 'Learn at Your Pace', desc: 'Access courses, lessons, and learning resources anytime.' },
      { icon: BadgeCheck, color: '#A9CBB3', iconColor: '#153B2E', label: 'Earn & Showcase', desc: 'Complete courses, earn verified certificates, and build your profile.' },
    ],
    bottomFeatures: [
      'Sign Up in Under a Minute',
      '100% Free — No Hidden Fees',
      'No Credit Card Required',
      'Earn Verified Certificates',
    ],
  },
}

/** Floating low-poly 3D-ish shapes */
function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* sphere */}
      <div className="auth-shape auth-shape-1 absolute left-[8%] top-[14%] h-14 w-14 rounded-full border border-[#F4D7B5]/50 bg-[#E07B22]/35 shadow-[0_0_40px_-6px_rgba(224,123,34,0.65)]" />
      {/* diamond */}
      <div className="auth-shape auth-shape-2 absolute right-[10%] top-[18%] h-12 w-12 rotate-45 rounded-xl border border-white/40 bg-[#F7E7CE]/30 shadow-[0_0_36px_-8px_rgba(247,231,206,0.55)]" />
      {/* low-poly triangle */}
      <div className="auth-shape auth-shape-3 absolute left-[14%] bottom-[30%] h-0 w-0 border-b-[44px] border-l-[26px] border-r-[26px] border-b-[#E9A968]/45 border-l-transparent border-r-transparent drop-shadow-[0_0_24px_rgba(233,169,104,0.45)]" />
      {/* cube-ish */}
      <div className="auth-shape auth-shape-4 absolute right-[16%] bottom-[36%] h-11 w-11 rotate-[30deg] rounded-xl border border-white/40 bg-[#E07B22]/30 shadow-[0_0_32px_-6px_rgba(224,123,34,0.6)]">
        <div className="absolute inset-1.5 rounded-lg bg-white/20" />
      </div>
      {/* tiny sphere */}
      <div className="auth-shape auth-shape-5 absolute right-[26%] top-[8%] h-8 w-8 rounded-full border border-white/50 bg-[#F7E7CE]/40 shadow-[0_0_28px_-4px_rgba(247,231,206,0.7)]" />
      {/* tiny diamond */}
      <div className="auth-shape auth-shape-6 absolute left-[24%] top-[6%] h-7 w-7 rotate-12 rounded-md border border-white/50 bg-[#E07B22]/25 shadow-[0_0_24px_-4px_rgba(224,123,34,0.55)]" />
    </div>
  )
}

/** Graduation cap + open book on a glowing pedestal */
function Centerpiece() {
  return (
    <div className="relative mx-auto mb-8 flex items-end justify-center [perspective:1100px] xl:mb-9">
      {/* glowing platform ring */}
      <div className="auth-badge-glow absolute bottom-0 left-1/2 h-8 w-40 -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#E07B22]/65 via-[#F7E7CE]/70 to-[#E07B22]/65 blur-xl sm:w-52 xl:w-56" />
      <div className="absolute bottom-0 left-1/2 h-3 w-32 -translate-x-1/2 rounded-[50%] border border-white/60 bg-white/40 blur-[2px] sm:w-44 xl:w-48" />
      {/* open book */}
      <div className="auth-icon-bob relative z-10 -mr-1.5 mb-1 flex h-[60px] w-[60px] items-center justify-center rounded-3xl border border-white/40 bg-[#E07B22] shadow-[0_28px_60px_-16px_rgba(224,123,34,0.8)] backdrop-blur-md [transform:rotateY(8deg)] sm:h-[84px] sm:w-[84px] md:h-[72px] md:w-[72px] xl:h-[84px] xl:w-[84px]">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 to-transparent opacity-70" />
        <BookOpen className="relative h-6 w-6 text-white sm:h-9 sm:w-9 md:h-8 md:w-8 xl:h-9 xl:w-9" />
      </div>
      {/* graduation cap */}
      <div className="auth-icon-bob-delay relative z-10 ml-3 mb-2.5 flex h-[72px] w-[72px] items-center justify-center rounded-3xl border border-white/40 bg-[#173D2F] shadow-[0_28px_60px_-16px_rgba(15,46,36,0.95)] backdrop-blur-md [transform:rotateY(-8deg)] sm:mb-3 sm:ml-4 sm:h-[104px] sm:w-[104px] md:h-[88px] md:w-[88px] xl:h-[104px] xl:w-[104px]">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 to-transparent opacity-70" />
        <GraduationCap className="relative h-7 w-7 text-white sm:h-10 sm:w-10 md:h-9 md:w-9 xl:h-10 xl:w-10" />
      </div>
    </div>
  )
}

/** Rotates through variant-specific sign-in / sign-up features */
function AuthFeatureSwiper({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 2600)
    return () => clearInterval(id)
  }, [items.length, prefersReducedMotion])

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -14 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center gap-2.5"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E07B22] shadow-[0_6px_14px_-4px_rgba(224,123,34,0.7)]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-[13px] font-semibold text-white">{items[index]}</span>
        </motion.div>
      </AnimatePresence>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {items.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function AuthSplitLayout({
  variant,
  children,
}: {
  variant: Variant
  children: ReactNode
}) {
  const data = variantContent[variant]
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="auth-shell font-mona relative w-full md:grid md:min-h-screen md:grid-cols-2 md:items-stretch">
      {/* ===== LEFT — branding / marketing panel ===== */}
      <div className="relative flex min-h-[540px] w-full flex-col overflow-hidden md:h-full md:min-h-screen">
        {/* soft green gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F4D3A] via-[#173D2F] to-[#0F2E24]" />
        {/* blurred mountain/sky photo behind frosted panels */}
        <Image src={data.bgPhotoUrl} alt="" fill priority className="scale-110 object-cover opacity-20 blur-2xl" sizes="50vw" />
        {/* readability veil */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F4D3A]/50 via-[#173D2F]/35 to-[#0F2E24]/70" />

        <FloatingShapes />

        {/* content */}
        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-between px-6 py-10 sm:px-10 md:px-8 md:py-14 xl:px-12">
          <div className="w-full max-w-[460px]">
            <Centerpiece />

            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-[24px] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[26px] md:text-[24px] xl:text-[30px]"
            >
              {data.heading}
            </motion.h1>
            <p className="mx-auto mt-4 max-w-[420px] text-center text-[13.5px] font-medium leading-relaxed text-white/80 sm:text-[14.5px]">{data.subtext}</p>

            {/* frosted glass feature cards */}
            <ul className="mt-7 space-y-3 sm:mt-8 sm:space-y-3.5">
              {data.features.map((f, index) => {
                const Icon = f.icon
                return (
                  <motion.li
                    key={f.label}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.5,
                      delay: prefersReducedMotion ? 0 : 0.25 + index * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex w-full items-center gap-3.5 rounded-2xl border border-white/25 border-t-white/40 bg-white/15 p-3.5 pr-4 shadow-[0_18px_40px_-14px_rgba(6,25,19,0.55)] backdrop-blur-md transition-colors hover:bg-white/20 sm:gap-4 sm:p-4 sm:pr-5"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_8px_18px_-4px_var(--shadow)] sm:h-11 sm:w-11"
                      style={{ backgroundColor: f.color, color: f.iconColor, '--shadow': `${f.color}99` } as CSSProperties}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold leading-snug text-white sm:text-[15px]">{f.label}</p>
                      <p className="mt-0.5 text-[12px] leading-snug text-white/75 sm:text-[12.5px]">{f.desc}</p>
                    </div>
                  </motion.li>
                )
              })}
            </ul>
          </div>

          {/* animated bottom panel */}
          <div className="mt-10 w-full max-w-[460px]">
            <div className="rounded-2xl border border-white/25 border-t-white/40 bg-white/10 px-5 py-4 shadow-[0_18px_40px_-14px_rgba(6,25,19,0.55)] backdrop-blur-md">
              <p className="mb-3 text-center text-[10.5px] font-bold uppercase tracking-widest text-white/60">
                {variant === 'login' ? 'Sign-In Features' : 'Sign-Up Features'}
              </p>
              <AuthFeatureSwiper items={data.bottomFeatures} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT — form side ===== */}
      <div className="relative flex min-h-[100vh] w-full items-center justify-center bg-white px-4 py-10 sm:px-6 md:h-full md:py-12">
        {/* soft glows behind the card */}
        <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#E07B22]/8 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#A9CBB3]/20 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col items-center">
          {/* frosted glass auth card */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 42 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[470px] rounded-[24px] border border-[#E7E0D7] bg-white p-6 shadow-[0_36px_90px_-26px_rgba(15,46,36,0.25),0_14px_40px_-18px_rgba(224,123,34,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-10"
          >
            {/* top hairline highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E07B22]/35 to-transparent" />
            {/* soft inner glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#E07B22]/8 blur-3xl" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={variant}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }}
                className="relative"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}