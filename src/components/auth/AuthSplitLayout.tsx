'use client'

import { useEffect, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
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

type Feature = { icon: ComponentType<{ className?: string }>; color: string; label: string; desc: string }

const variantContent: Record<
  Variant,
  { bgPhotoUrl: string; heading: ReactNode; subtext: string; features: Feature[]; bottomFeatures: string[] }
> = {
  login: {
    bgPhotoUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=60&w=1600',
    heading: <>Welcome Back</>,
    subtext: 'Sign in to continue your learning journey.',
    features: [
      { icon: ShieldCheck, color: '#34D399', label: 'Secure Sign In', desc: 'Safe and secure access to your account.' },
      { icon: MousePointerClick, color: '#A78BFA', label: 'Social Login', desc: 'Sign in quickly with Google or GitHub.' },
      { icon: KeyRound, color: '#60A5FA', label: 'Easy Password Recovery', desc: 'Reset your password securely anytime.' },
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
    heading: <>Start Learning. Start Growing.</>,
    subtext: 'Create your free account and unlock a smarter way to learn, grow your skills, and achieve your goals.',
    features: [
      { icon: Gift, color: '#A78BFA', label: 'Free & Easy to Join', desc: 'Create your account in minutes with no hidden fees.' },
      { icon: BookOpen, color: '#34D399', label: 'Learn at Your Pace', desc: 'Access courses, lessons, and learning resources anytime.' },
      { icon: BadgeCheck, color: '#60A5FA', label: 'Earn & Showcase', desc: 'Complete courses, earn verified certificates, and build your profile.' },
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
      <div className="animate-float absolute left-[8%] top-[14%] h-14 w-14 rounded-full border border-white/40 bg-gradient-to-br from-[#A78BFA]/70 to-[#7C3AED]/40 shadow-[0_0_40px_-6px_rgba(167,139,250,0.8)]" />
      {/* diamond */}
      <div className="animate-float-delay absolute right-[10%] top-[18%] h-12 w-12 rotate-45 rounded-xl border border-white/40 bg-gradient-to-tr from-[#7C3AED]/50 to-[#3B82F6]/50 shadow-[0_0_36px_-8px_rgba(124,58,237,0.8)]" />
      {/* low-poly triangle */}
      <div className="animate-float-rotate absolute left-[14%] bottom-[30%] h-0 w-0 border-b-[44px] border-l-[26px] border-r-[26px] border-b-[#3B82F6]/60 border-l-transparent border-r-transparent drop-shadow-[0_0_24px_rgba(59,130,246,0.7)]" />
      {/* cube-ish */}
      <div className="animate-float absolute right-[16%] bottom-[36%] h-11 w-11 rotate-[30deg] rounded-xl border border-white/40 bg-gradient-to-br from-[#7C3AED]/60 to-[#60A5FA]/40 shadow-[0_0_32px_-6px_rgba(109,40,217,0.8)]">
        <div className="absolute inset-1.5 rounded-lg bg-white/20" />
      </div>
      {/* tiny sphere */}
      <div className="animate-float-slow absolute right-[26%] top-[8%] h-8 w-8 rounded-full border border-white/50 bg-gradient-to-br from-[#93C5FD]/70 to-[#3B82F6]/40 shadow-[0_0_28px_-4px_rgba(147,197,253,0.9)]" />
      {/* tiny diamond */}
      <div className="animate-float absolute left-[24%] top-[6%] h-7 w-7 rotate-12 rounded-md border border-white/50 bg-gradient-to-br from-[#C4B5FD]/60 to-[#7C3AED]/30 shadow-[0_0_24px_-4px_rgba(196,181,253,0.9)]" />
    </div>
  )
}

/** Graduation cap + open book on a glowing pedestal */
function Centerpiece() {
  return (
    <div className="relative mx-auto mb-8 flex items-end justify-center [perspective:1100px] xl:mb-9">
      {/* glowing platform ring */}
      <div className="absolute bottom-0 left-1/2 h-8 w-40 -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#A78BFA]/60 via-[#60A5FA]/70 to-[#A78BFA]/60 blur-xl sm:w-52 xl:w-56" />
      <div className="absolute bottom-0 left-1/2 h-3 w-32 -translate-x-1/2 rounded-[50%] border border-white/60 bg-white/40 blur-[2px] sm:w-44 xl:w-48" />
      {/* open book */}
      <div className="animate-float relative z-10 -mr-1.5 mb-1 flex h-[60px] w-[60px] items-center justify-center rounded-3xl border border-white/40 bg-gradient-to-br from-[#7C3AED]/80 to-[#4C1D95]/90 shadow-[0_28px_60px_-16px_rgba(109,40,217,0.95)] backdrop-blur-md [transform:rotateY(8deg)] sm:h-[84px] sm:w-[84px] md:h-[72px] md:w-[72px] xl:h-[84px] xl:w-[84px]">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 to-transparent opacity-70" />
        <BookOpen className="relative h-6 w-6 text-white sm:h-9 sm:w-9 md:h-8 md:w-8 xl:h-9 xl:w-9" />
      </div>
      {/* graduation cap */}
      <div className="animate-float-delay relative z-10 ml-3 mb-2.5 flex h-[72px] w-[72px] items-center justify-center rounded-3xl border border-white/40 bg-gradient-to-br from-[#3B82F6]/85 to-[#1E40AF]/90 shadow-[0_28px_60px_-16px_rgba(37,99,235,0.95)] backdrop-blur-md [transform:rotateY(-8deg)] sm:mb-3 sm:ml-4 sm:h-[104px] sm:w-[104px] md:h-[88px] md:w-[88px] xl:h-[104px] xl:w-[104px]">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 to-transparent opacity-70" />
        <GraduationCap className="relative h-7 w-7 text-white sm:h-10 sm:w-10 md:h-9 md:w-9 xl:h-10 xl:w-10" />
      </div>
    </div>
  )
}

/** Rotates through variant-specific sign-in / sign-up features */
function AuthFeatureSwiper({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 2600)
    return () => clearInterval(id)
  }, [items.length])

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center gap-2.5"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A78BFA] to-[#60A5FA] shadow-[0_6px_14px_-4px_rgba(124,58,237,0.8)]">
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

  return (
    <div className="relative w-full md:grid md:min-h-screen md:grid-cols-2 md:items-stretch">
      {/* ===== LEFT — branding / marketing panel ===== */}
      <div className="relative flex min-h-[540px] w-full flex-col overflow-hidden md:h-full md:min-h-screen">
        {/* soft purple-to-blue gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#6D3DF5] to-[#3B82F6]" />
        {/* blurred mountain/sky photo behind frosted panels */}
        <Image src={data.bgPhotoUrl} alt="" fill priority className="scale-110 object-cover opacity-45 blur-2xl" sizes="50vw" />
        {/* readability veil */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/45 via-[#6D3DF5]/30 to-[#3B82F6]/55" />

        <FloatingShapes />

        {/* content */}
        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-between px-6 py-10 sm:px-10 md:px-8 md:py-14 xl:px-12">
          <div className="w-full max-w-[460px]">
            <Centerpiece />

            <h1 className="text-center text-[24px] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[26px] md:text-[24px] xl:text-[30px]">
              {data.heading}
            </h1>
            <p className="mx-auto mt-4 max-w-[420px] text-center text-[13.5px] font-medium leading-relaxed text-white/80 sm:text-[14.5px]">{data.subtext}</p>

            {/* frosted glass feature cards */}
            <ul className="mt-7 space-y-3 sm:mt-8 sm:space-y-3.5">
              {data.features.map((f) => {
                const Icon = f.icon
                return (
                  <li
                    key={f.label}
                    className="flex w-full items-center gap-3.5 rounded-2xl border border-white/25 border-t-white/40 bg-white/15 p-3.5 pr-4 shadow-[0_18px_40px_-14px_rgba(15,27,61,0.5)] backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white/20 sm:gap-4 sm:p-4 sm:pr-5"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_18px_-4px_var(--shadow)] sm:h-11 sm:w-11"
                      style={{ backgroundColor: f.color, '--shadow': `${f.color}88` } as CSSProperties}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold leading-snug text-white sm:text-[15px]">{f.label}</p>
                      <p className="mt-0.5 text-[12px] leading-snug text-white/75 sm:text-[12.5px]">{f.desc}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* animated bottom panel */}
          <div className="mt-10 w-full max-w-[460px]">
            <div className="rounded-2xl border border-white/25 border-t-white/40 bg-white/10 px-5 py-4 shadow-[0_18px_40px_-14px_rgba(15,27,61,0.5)] backdrop-blur-md">
              <p className="mb-3 text-center text-[10.5px] font-bold uppercase tracking-widest text-white/60">
                {variant === 'login' ? 'Sign-In Features' : 'Sign-Up Features'}
              </p>
              <AuthFeatureSwiper items={data.bottomFeatures} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT — form side ===== */}
      <div className="relative flex min-h-[100vh] w-full items-center justify-center bg-gradient-to-br from-[#EDE8FB] via-[#FAF8FF] to-[#E9F0FF] px-4 py-10 sm:px-6 md:h-full md:py-12">
        {/* soft glows behind the card */}
        <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#7C3AED]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col items-center">
          {/* frosted glass auth card */}
          <div className="relative w-full max-w-[470px] rounded-[24px] border border-white/70 bg-white/80 p-6 shadow-[0_36px_90px_-26px_rgba(15,27,61,0.35),0_14px_40px_-18px_rgba(109,61,245,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:p-10">
            {/* top hairline highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent" />
            {/* soft inner glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-[#7C3AED]/12 to-[#3B82F6]/8 blur-3xl" />
            <div className="relative">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}