'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import {
  Star, Users, BookOpen, Award, TrendingUp,
  Briefcase, Globe, Shield, GraduationCap,
  Download, Infinity as InfinityIcon, ShieldCheck,
  BadgeCheck, Heart, Zap, Flame, Target,
  Compass, Wallet, ClipboardCheck, Headphones,
  Medal, Link2, HeartHandshake,
  Building, Send, Lock, MailPlus,
  Facebook, Twitter, Instagram, Youtube,
  Sparkles, ChevronRight,
  Linkedin, IndianRupee,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function FooterLinksCol({ title, icon, accent, links }: {
  title: string
  icon: ReactNode
  accent: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h4 className={cn('flex items-center gap-2 text-[13px] font-bold mb-4', accent)}>{icon}{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="group flex items-center gap-1.5 text-[12.5px] text-[#8B94A8] hover:text-white transition-colors">
              <ChevronRight className="w-3 h-3 text-white/25 group-hover:text-[#A78BFA] transition-colors shrink-0" />
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CtaScene() {
  return (
    <svg viewBox="0 0 280 210" className="w-[260px] h-auto max-w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ctaBookPurple" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#A78BFA" /><stop offset="100%" stopColor="#7C3AED" /></linearGradient>
        <linearGradient id="ctaBookBlue" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60A5FA" /><stop offset="100%" stopColor="#2563EB" /></linearGradient>
        <linearGradient id="ctaBookGreen" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#34D399" /><stop offset="100%" stopColor="#059669" /></linearGradient>
        <linearGradient id="ctaCap" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F8FAFC" /><stop offset="100%" stopColor="#CBD5E1" /></linearGradient>
        <linearGradient id="ctaPot" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A78BFA" /><stop offset="100%" stopColor="#7C3AED" /></linearGradient>
        <g id="ctaSpark"><path d="M0 -7 C 1 -2 2 -0.8 7 0 C 2 0.8 1 2 0 7 C -1 2 -2 0.8 -7 0 C -2 -0.8 -1 -2 0 -7 Z" /></g>
      </defs>
      <ellipse cx="150" cy="192" rx="110" ry="9" fill="#6D3DF5" opacity="0.18" />
      <path d="M28 170 L58 170 L54 192 L32 192 Z" fill="url(#ctaPot)" />
      <rect x="24" y="164" width="38" height="7" rx="3.5" fill="#A78BFA" />
      <path d="M41 166 C 34 150 26 150 24 142 C 33 142 40 150 41 158 Z" fill="#34D399" />
      <path d="M43 166 C 48 148 56 146 60 138 C 60 148 52 156 44 160 Z" fill="#6EE7B7" />
      <path d="M42 166 C 40 152 36 148 34 140 C 42 142 46 152 46 162 Z" fill="#10B981" />
      <rect x="52" y="156" width="100" height="18" rx="5" fill="url(#ctaBookPurple)" />
      <rect x="58" y="140" width="88" height="16" rx="5" fill="url(#ctaBookBlue)" />
      <rect x="64" y="124" width="76" height="16" rx="5" fill="url(#ctaBookGreen)" />
      <rect x="58" y="160" width="4" height="10" rx="2" fill="#FFFFFF" opacity="0.35" />
      <rect x="64" y="144" width="4" height="8" rx="2" fill="#FFFFFF" opacity="0.35" />
      <ellipse cx="102" cy="112" rx="24" ry="5" fill="#0F172A" opacity="0.35" />
      <path d="M102 90 L128 100 L102 110 L76 100 Z" fill="url(#ctaCap)" />
      <path d="M102 90 L128 100 L102 110 L76 100 Z" fill="#FFFFFF" opacity="0.15" />
      <circle cx="102" cy="100" r="4.5" fill="#64748B" />
      <path d="M126 100 Q 134 100 134 108" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M133.5 108 Q 137 110 133.5 112 Q 130 110 133.5 108 Z" fill="#A78BFA" />
      <rect x="168" y="96" width="96" height="62" rx="7" fill="#1E293B" stroke="#475569" strokeWidth="2" />
      <rect x="172" y="100" width="88" height="54" rx="4" fill="#0F172A" />
      <rect x="162" y="158" width="108" height="9" rx="4.5" fill="#475569" />
      <rect x="184" y="167" width="46" height="6" rx="3" fill="#334155" />
      <path d="M180 140 L192 128 L202 133 L214 120 L224 126 L238 110" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M180 146 L190 138 L202 142 L212 132 L226 137 L244 122" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" strokeDasharray="4 4" />
      <circle cx="238" cy="110" r="4" fill="#34D399" />
      <path d="M232 104 L244 100 L240 112 Z" fill="#34D399" />
      <use href="#ctaSpark" transform="translate(30 120) scale(0.9)" fill="#60A5FA" />
      <use href="#ctaSpark" transform="translate(148 70) scale(0.7)" fill="#A78BFA" />
      <use href="#ctaSpark" transform="translate(252 78) scale(0.8)" fill="#34D399" />
      <circle cx="270" cy="130" r="3" fill="#60A5FA" opacity="0.8" />
      <circle cx="24" cy="96" r="3" fill="#A78BFA" opacity="0.8" />
    </svg>
  )
}

function SuccessScene() {
  return (
    <svg viewBox="0 0 280 225" className="w-[270px] h-auto max-w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="suGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FBBF24" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient>
        <linearGradient id="suGoldLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#FBBF24" /></linearGradient>
        <linearGradient id="suBase" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#6D3DF5" /></linearGradient>
        <g id="suSpark"><path d="M0 -7 C 1 -2 2 -0.8 7 0 C 2 0.8 1 2 0 7 C -1 2 -2 0.8 -7 0 C -2 -0.8 -1 -2 0 -7 Z" /></g>
      </defs>
      <ellipse cx="140" cy="206" rx="120" ry="9" fill="#000000" opacity="0.35" />
      <rect x="26" y="40" width="8" height="8" rx="2" fill="#A78BFA" transform="rotate(24 30 44)" />
      <rect x="240" y="36" width="8" height="8" rx="2" fill="#60A5FA" transform="rotate(-18 244 40)" />
      <rect x="252" y="110" width="7" height="7" rx="2" fill="#34D399" transform="rotate(40 255 113)" />
      <rect x="18" y="128" width="7" height="7" rx="2" fill="#FBBF24" transform="rotate(-30 21 131)" />
      <circle cx="258" cy="170" r="4" fill="#F472B6" opacity="0.9" />
      <circle cx="24" cy="180" r="4" fill="#60A5FA" opacity="0.9" />
      <circle cx="38" cy="70" r="3.5" fill="#FBBF24" opacity="0.9" />
      <circle cx="244" cy="60" r="3.5" fill="#A78BFA" opacity="0.9" />
      <path d="M112 102 Q82 96 84 122 Q86 142 115 142" stroke="url(#suGold)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M146 102 Q176 96 174 122 Q172 142 143 142" stroke="url(#suGold)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <rect x="109" y="84" width="40" height="10" rx="5" fill="url(#suGoldLight)" />
      <path d="M112 94 L146 94 L144 138 Q143 152 129 154 Q115 152 114 138 Z" fill="url(#suGold)" />
      <rect x="119" y="100" width="7" height="34" rx="3.5" fill="#FFFFFF" opacity="0.35" />
      <rect x="123" y="154" width="12" height="14" rx="3" fill="url(#suGold)" />
      <rect x="112" y="168" width="34" height="9" rx="4.5" fill="url(#suGoldLight)" />
      <circle cx="54" cy="128" r="13" fill="#F1C27D" />
      <path d="M41 126 a13 14 0 0 1 26 0 v-5 a13 14 0 0 0 -26 5 z" fill="#4A2E1B" />
      <path d="M42 152 L66 152 L63 196 L45 196 Z" fill="#6D3DF5" />
      <path d="M44 152 L34 132" stroke="#F1C27D" strokeWidth="5" strokeLinecap="round" />
      <path d="M64 152 L76 132" stroke="#F1C27D" strokeWidth="5" strokeLinecap="round" />
      <circle cx="34" cy="129" r="4" fill="#F1C27D" />
      <circle cx="76" cy="129" r="4" fill="#F1C27D" />
      <rect x="48" y="196" width="7" height="10" rx="2" fill="#1E293B" />
      <rect x="57" y="196" width="7" height="10" rx="2" fill="#1E293B" />
      <circle cx="226" cy="136" r="13" fill="#8D6E63" />
      <path d="M213 134 a13 14 0 0 1 26 0 v-5 a13 14 0 0 0 -26 5 z" fill="#1C1917" />
      <path d="M214 160 L238 160 L235 198 L217 198 Z" fill="#18A878" />
      <path d="M216 160 L206 140" stroke="#8D6E63" strokeWidth="5" strokeLinecap="round" />
      <path d="M236 160 L248 140" stroke="#8D6E63" strokeWidth="5" strokeLinecap="round" />
      <circle cx="206" cy="137" r="4" fill="#8D6E63" />
      <circle cx="248" cy="137" r="4" fill="#8D6E63" />
      <rect x="220" y="198" width="7" height="10" rx="2" fill="#1E293B" />
      <rect x="229" y="198" width="7" height="10" rx="2" fill="#1E293B" />
      <circle cx="129" cy="106" r="9" fill="#FFE0BD" />
      <path d="M120 104 a9 10 0 0 1 18 0 v-3 a9 10 0 0 0 -18 3 z" fill="#78350F" />
      <path d="M120 122 L138 122 L136 152 L122 152 Z" fill="#3478F6" />
      <path d="M121 122 L112 108" stroke="#FFE0BD" strokeWidth="4" strokeLinecap="round" />
      <path d="M137 122 L148 108" stroke="#FFE0BD" strokeWidth="4" strokeLinecap="round" />
      <circle cx="112" cy="105" r="3.5" fill="#FFE0BD" />
      <circle cx="148" cy="105" r="3.5" fill="#FFE0BD" />
      <use href="#suSpark" transform="translate(100 60) scale(1)" fill="#FBBF24" />
      <use href="#suSpark" transform="translate(178 66) scale(0.85)" fill="#A78BFA" />
      <use href="#suSpark" transform="translate(152 178) scale(0.8)" fill="#34D399" />
      <use href="#suSpark" transform="translate(66 88) scale(0.75)" fill="#60A5FA" />
    </svg>
  )
}

const footerCtaFeatures: { icon: LucideIcon; accent: string; title: string; desc: string }[] = [
  { icon: BookOpen, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', title: 'Learn', desc: 'Access premium courses and expert guidance.' },
  { icon: Wallet, accent: 'text-[#34D399] bg-[#34D399]/10 ring-[#34D399]/25', title: 'Earn', desc: 'Complete tasks, projects, and earn real income.' },
  { icon: Users, accent: 'text-[#60A5FA] bg-[#60A5FA]/10 ring-[#60A5FA]/25', title: 'Grow Together', desc: 'Join a supportive community and achieve more.' },
]

const footerQuickLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/#courses' },
  { label: 'Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Instructors', href: '/#instructors' },
  { label: 'Community', href: '/#community' },
  { label: 'Pricing', href: '/#pricing' },
]

const footerLearnerLinks: { label: string; href: string }[] = [
  { label: 'Browse Courses', href: '/#courses' },
  { label: 'Learning Paths', href: '/#how-it-works' },
  { label: 'Student Dashboard', href: '/login' },
  { label: 'Certificates', href: '/#pricing' },
  { label: 'Career Support', href: '/#how-it-works' },
  { label: 'FAQs', href: '/#faq' },
]

const footerEarnerLinks: { label: string; href: string }[] = [
  { label: 'How to Earn', href: '/#earn-while-you-learn' },
  { label: 'Available Jobs', href: '/#pricing' },
  { label: 'Freelance Projects', href: '/#pricing' },
  { label: 'Affiliate Program', href: '/#community' },
  { label: 'Payout Methods', href: '/#pricing' },
  { label: 'Earnings Calculator', href: '/#pricing' },
]

const footerCompanyLinks: { label: string; href: string }[] = [
  { label: 'About Us', href: '/#how-it-works' },
  { label: 'Our Mission', href: '/#how-it-works' },
  { label: 'Success Stories', href: '/#success-stories' },
  { label: 'Careers', href: '/#instructors' },
  { label: 'Press & Media', href: '/#community' },
  { label: 'Partners', href: '/#community' },
]

const footerSocials: { icon: LucideIcon; label: string }[] = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter / X' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Youtube, label: 'YouTube' },
]

const footerTrustBadges: { icon: LucideIcon; accent: string; title: string; desc: string }[] = [
  { icon: ShieldCheck, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', title: '100% Secure', desc: 'Your data is safe with us.' },
  { icon: Users, accent: 'text-[#60A5FA] bg-[#60A5FA]/10 ring-[#60A5FA]/25', title: 'Expert Instructors', desc: 'Learn from verified industry experts.' },
  { icon: InfinityIcon, accent: 'text-[#34D399] bg-[#34D399]/10 ring-[#34D399]/25', title: 'Lifetime Access', desc: 'Learn at your own pace, anytime.' },
  { icon: Headphones, accent: 'text-[#60A5FA] bg-[#60A5FA]/10 ring-[#60A5FA]/25', title: '24/7 Support', desc: "We're here to help you anytime." },
  { icon: Medal, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', title: 'Money Back Guarantee', desc: '7-day money back guarantee.' },
  { icon: Globe, accent: 'text-[#34D399] bg-[#34D399]/10 ring-[#34D399]/25', title: 'Global Community', desc: 'Join learners from 120+ countries.' },
]

const footerStats: { icon: LucideIcon; accent: string; value: string; label: string; stars?: boolean }[] = [
  { icon: BookOpen, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', value: '500+', label: 'Expert Courses' },
  { icon: Users, accent: 'text-[#60A5FA] bg-[#60A5FA]/10 ring-[#60A5FA]/25', value: '50K+', label: 'Active Learners' },
  { icon: Briefcase, accent: 'text-[#34D399] bg-[#34D399]/10 ring-[#34D399]/25', value: '10K+', label: 'Jobs & Projects' },
  { icon: IndianRupee, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', value: '₹10Cr+', label: 'Paid to Learners' },
  { icon: Star, accent: 'text-[#FBBF24] bg-[#FBBF24]/10 ring-[#FBBF24]/25', value: '4.8/5', label: 'Average Rating', stars: true },
]

export function LandingFooter() {
  return (
    <footer className="relative bg-[#0B1020] border-t border-white/5 overflow-hidden z-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#6D3DF5] via-[#3478F6] to-[#18A878]" />
      <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[#6D3DF5]/25 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#3478F6]/20 blur-3xl opacity-50" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-[#18A878]/15 blur-3xl opacity-50" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="max-w-none mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-20 relative">
        {/* CTA Banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#171E36] via-[#12182E] to-[#0E1428] border border-white/10 overflow-hidden shadow-lg shadow-slate-900/10">
          <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-[#6D3DF5]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 w-72 h-72 rounded-full bg-[#3478F6]/25 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 right-1/3 w-56 h-56 rounded-full bg-[#18A878]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="relative flex flex-col xl:flex-row gap-10 items-center px-7 py-10 lg:px-12 lg:py-12">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7">
                <div className="shrink-0"><CtaScene /></div>
                <div className="text-center sm:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/25 mb-4">
                    <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                    <span className="text-[10px] font-bold text-[#C4B5FD] uppercase tracking-wider">Learn. Earn. Grow.</span>
                  </span>
                  <h2 className="text-[26px] lg:text-[32px] font-extrabold text-white leading-tight">
                    Start Learning. Start Earning.
                  </h2>
                  <h3 className="text-[20px] lg:text-[24px] font-extrabold leading-snug mt-1.5 text-white capitalize">
                    Start Your <span className="relative inline-block text-[#C4B5FD]">Journey
                      <svg className="absolute left-0 -bottom-1.5 w-full h-2.5" viewBox="0 0 120 8" fill="none" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M2 6 C 30 1, 90 1, 118 6" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span> Today!
                  </h3>
                  <p className="text-[#9AA4B8] text-[13.5px] leading-relaxed mt-3 max-w-md">
                    Join thousands of learners who are building skills, earning income, and creating a better future.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                {footerCtaFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center ring-1 shrink-0', f.accent)}>
                      <f.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white leading-tight">{f.title}</p>
                      <p className="text-[11px] text-[#8B94A8] leading-snug mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-center xl:items-end gap-3 xl:pr-2">
              <Link href="/signup">
                <button className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] hover:from-[#7C3AED] hover:to-[#A78BFA] text-white text-[14px] font-bold px-7 py-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                  Join Now &ndash; It&apos;s Free!
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>
              <p className="text-[11px] text-[#8B94A8]">No hidden charges. Cancel anytime.</p>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-8 gap-y-10 mt-16">
          <div className="col-span-2 md:col-span-3 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-white">Learn</span><span className="text-[#A78BFA]">2Earn</span>
              </span>
            </Link>
            <p className="text-[#8B94A8] text-[13px] leading-relaxed">
              The all-in-one platform to learn new skills, earn income, and build the future you deserve.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {footerSocials.map((s) => (
                <button key={s.label} aria-label={s.label} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8B94A8] hover:text-white hover:bg-[#6D3DF5] hover:border-[#6D3DF5] transition-all duration-200">
                  <s.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          <FooterLinksCol title="Quick Links" icon={<Link2 className="w-3.5 h-3.5 text-[#A78BFA]" />} accent="text-[#A78BFA]" links={footerQuickLinks} />
          <FooterLinksCol title="For Learners" icon={<GraduationCap className="w-3.5 h-3.5 text-[#34D399]" />} accent="text-[#34D399]" links={footerLearnerLinks} />
          <FooterLinksCol title="For Earners" icon={<Wallet className="w-3.5 h-3.5 text-[#60A5FA]" />} accent="text-[#60A5FA]" links={footerEarnerLinks} />
          <FooterLinksCol title="Company" icon={<Building className="w-3.5 h-3.5 text-[#A78BFA]" />} accent="text-[#A78BFA]" links={footerCompanyLinks} />
          <div className="col-span-2 md:col-span-1">
            <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#34D399] mb-4">
              <MailPlus className="w-3.5 h-3.5 text-[#34D399]" /> Stay Updated
            </h4>
            <p className="text-[12px] text-[#8B94A8] leading-relaxed mb-3">Subscribe to get the latest courses, tips, and updates.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1.5 focus-within:border-[#6D3DF5]/60 transition-colors">
              <input type="email" placeholder="Your email address" className="flex-1 min-w-0 bg-transparent text-[12px] text-white placeholder:text-[#5B6478] px-2 outline-none" />
              <button type="submit" aria-label="Subscribe" className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] flex items-center justify-center text-white shadow-sm hover:from-[#7C3AED] hover:to-[#A78BFA] transition-all duration-200 shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="flex items-start gap-1.5 text-[10.5px] text-[#5B6478] leading-snug mt-3">
              <Lock className="w-3 h-3 shrink-0 mt-0.5" /> We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Legal bar */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-[#8B94A8]">&copy; {new Date().getFullYear()} Learn2Earn. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-[#8B94A8]">
              {['Terms of Use', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'].map((item) => (
                <button key={item} className="hover:text-white transition-colors">{item}</button>
              ))}
            </div>
            <p className="text-[12px] text-[#8B94A8]">Made with heart for learners worldwide.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
