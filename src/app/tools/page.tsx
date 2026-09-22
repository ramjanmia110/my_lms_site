'use client'

import { useCallback, useEffect, useState, useMemo, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, ArrowRight, Eye, Play, Loader2, TrendingUp,
  Star, Zap, Clock, BadgeCheck, Database, SlidersHorizontal, X,
  ChevronLeft, ChevronRight, Compass, Sparkles, BookOpen, GraduationCap, Puzzle,
} from 'lucide-react'
import { PublicNavbar } from '@/components/public/PublicNavbar'
import { LandingFooter } from '@/components/public/LandingFooter'
import { toolsAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ToolItem {
  id: number; title: string; slug: string; description: string | null
  icon: string | null; cover_image: string | null; status: string; visibility: string
  views_count: number; usage_count: number; version: number
  published_at: string | null; created_at: string
  category: { id: number; name: string; slug: string; color?: string } | null
  tags: { id: number; name: string; slug: string }[]
}
interface Category { id: number; name: string; slug: string; color?: string; tools_count?: number }

function hashStr(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }

function pricingInfo(v: string) {
  switch (v) {
    case 'premium': return { label: 'Premium', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' }
    case 'login': return { label: 'Free Account', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' }
    case 'course': return { label: 'Course Only', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' }
    default: return { label: 'Free', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' }
  }
}

/* ═══════ Sidebar ═══════ */
function Sidebar({
  categories, category, selectCategory, total, discover, setDiscover, mobileOpen, setMobileOpen,
}: {
  categories: Category[]; category: string; selectCategory: (s: string) => void; total: number
  discover: string; setDiscover: (s: string) => void; mobileOpen: boolean; setMobileOpen: (b: boolean) => void
}) {
  const discoverLinks = [
    { id: 'top', label: 'Top Tools', sublabel: 'Most viewed & popular', icon: TrendingUp, gradient: 'from-[#7C3AED] to-[#A855F7]', activeColor: 'text-[#7C3AED]', activeBg: 'bg-[#F3EEFF]' },
    { id: 'new', label: 'New Additions', sublabel: 'Freshly published', icon: Clock, gradient: 'from-[#2563EB] to-[#60A5FA]', activeColor: 'text-[#2563EB]', activeBg: 'bg-blue-50' },
    { id: 'free', label: 'Free Tools', sublabel: 'No cost, fully free', icon: Zap, gradient: 'from-[#EA580C] to-[#FB923C]', activeColor: 'text-[#EA580C]', activeBg: 'bg-orange-50' },
  ]

  const content = (
    <div className="space-y-5">
      {/* Live Database — glowing 3D cylinder with particle texture */}
      <div className="rounded-2xl bg-gradient-to-br from-[#4C1D95] via-[#5B21B6] to-[#1D4ED8] p-5 text-white shadow-xl shadow-[#5B21B6]/30 relative overflow-hidden">
        {/* Dotted / star particle texture */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="db-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="white" /><circle cx="10" cy="8" r="0.5" fill="white" />
              <circle cx="4" cy="12" r="0.6" fill="white" /><circle cx="14" cy="4" r="0.7" fill="white" />
              <circle cx="8" cy="14" r="0.4" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#db-dots)" />
          </svg>
          <svg className="absolute top-4 left-6 opacity-25 w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z"/></svg>
          <svg className="absolute top-2 right-16 opacity-15 w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z"/></svg>
          <svg className="absolute bottom-6 left-10 opacity-10 w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z"/></svg>
        </div>
        {/* Soft gradient blobs */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/[0.07] blur-xl" />
        <div className="absolute bottom-0 left-0 w-28 h-20 rounded-full bg-[#60A5FA]/[0.1] blur-2xl" />

        <div className="relative flex items-start">
          {/* Left: label + stats */}
          <div className="flex-1 min-w-0 z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Database className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Live Database</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight drop-shadow-sm leading-none">{total}</p>
            <p className="text-[11px] text-white/55 mt-1.5 leading-snug">Tools available<br />right now</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/45">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto-updated
            </div>
          </div>

          {/* Right: large glowing 3D database cylinder */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 z-10">
            {/* Concentric ring glows */}
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute inset-1.5 rounded-full border border-white/[0.08]" />
            <div className="absolute inset-3 rounded-full border border-white/[0.1]" />
            {/* Soft circular glow */}
            <div className="absolute inset-4 rounded-full bg-white/[0.07] blur-md" />
            {/* The 3D cylinder icon */}
            <svg viewBox="0 0 80 80" fill="none" className="absolute inset-0 w-full h-full drop-shadow-lg">
              {/* Shadow */}
              <ellipse cx="40" cy="64" rx="22" ry="5" fill="black" opacity="0.2" />
              {/* Bottom ellipse */}
              <ellipse cx="40" cy="56" rx="20" ry="7" fill="#818CF8" opacity="0.5" />
              {/* Cylinder body */}
              <rect x="20" y="28" width="40" height="28" rx="0" fill="url(#cyl-body)" />
              {/* Middle ring lines */}
              <ellipse cx="40" cy="36" rx="20" ry="7" fill="none" stroke="white" strokeWidth="0.8" opacity="0.25" />
              <ellipse cx="40" cy="44" rx="20" ry="7" fill="none" stroke="white" strokeWidth="0.8" opacity="0.18" />
              {/* Top ellipse */}
              <ellipse cx="40" cy="28" rx="20" ry="7" fill="#A78BFA" opacity="0.85" />
              <ellipse cx="40" cy="28" rx="20" ry="7" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
              {/* Highlight */}
              <ellipse cx="34" cy="26.5" rx="10" ry="3" fill="white" opacity="0.2" />
              {/* Glow */}
              <ellipse cx="40" cy="40" rx="24" ry="24" fill="url(#cyl-glow)" opacity="0.35" />
              <defs>
                <linearGradient id="cyl-body" x1="20" y1="28" x2="60" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818CF8" /><stop offset="0.5" stopColor="#6D28D9" /><stop offset="1" stopColor="#4C1D95" />
                </linearGradient>
                <radialGradient id="cyl-glow" cx="0.5" cy="0.4" r="0.6">
                  <stop stopColor="#A78BFA" /><stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Discover — gradient icon tiles + subtitles + chevrons */}
      <div className="bg-gradient-to-br from-[#F0ECFF] to-[#E8F0FE] rounded-2xl p-4 border border-[#DDD6FE]/60 shadow-sm">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-3">Discover</h3>
        <div className="space-y-1">
          {discoverLinks.map((d) => (
            <button key={d.id} onClick={() => { setDiscover(d.id); setMobileOpen(false) }}
              className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group/row',
                discover === d.id ? `${d.activeBg} ${d.activeColor} font-semibold shadow-sm` : 'text-[#536078] hover:bg-white/80'
              )}>
              <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm', d.gradient)}>
                <d.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] block leading-tight">{d.label}</span>
                <span className="text-[10px] text-[#94A3B8] leading-tight">{d.sublabel}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover/row:text-[#7C3AED] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Categories — icon tiles + themed count badges */}
      <div className="bg-gradient-to-br from-[#E8F4FD] to-[#F0ECFF] rounded-2xl p-4 border border-[#BFDBFE]/50 shadow-sm">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-3">Categories</h3>
        <div className="space-y-0.5">
          <button onClick={() => { selectCategory(''); setMobileOpen(false) }}
            className={cn('w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-200',
              !category ? 'bg-[#F3EEFF] text-[#7C3AED] font-semibold' : 'text-[#536078] hover:bg-white/80'
            )}>
            <span className="flex items-center gap-2.5 text-[13px]">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3478F6] flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-white" />
              </span>
              All Categories
            </span>
            <span className={cn('text-[11px] px-2.5 py-0.5 rounded-full font-semibold',
              !category ? 'bg-gradient-to-r from-[#7C3AED] to-[#3478F6] text-white shadow-sm' : 'bg-white/60 text-[#94A3B8]'
            )}>{total}</span>
          </button>
          {categories.map((c) => {
            const slug = c.slug?.toLowerCase() || ''
            const name = c.name?.toLowerCase() || ''
            let iconCfg = { icon: BookOpen, bg: 'from-[#7C3AED] to-[#A78BFA]', pill: 'bg-[#F3EEFF] text-[#7C3AED]' }

            if (slug.includes('academic') || slug.includes('calculator') || name.includes('academic') || name.includes('calculator')) {
              iconCfg = { icon: BookOpen, bg: 'from-[#7C3AED] to-[#A78BFA]', pill: 'bg-[#F3EEFF] text-[#7C3AED]' }
            } else if (slug.includes('education') || slug.includes('tool') || name.includes('education') || name.includes('tool')) {
              iconCfg = { icon: GraduationCap, bg: 'from-[#059669] to-[#34D399]', pill: 'bg-[#ECFDF5] text-[#059669]' }
            } else if (slug.includes('puzzle') || slug.includes('game') || name.includes('puzzle') || name.includes('game')) {
              iconCfg = { icon: Puzzle, bg: 'from-[#EA580C] to-[#FB923C]', pill: 'bg-[#FFF7ED] text-[#EA580C]' }
            }

            const Icon = iconCfg.icon

            return (
              <button key={c.slug} onClick={() => { selectCategory(c.slug); setMobileOpen(false) }}
                className={cn('w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-200',
                  category === c.slug ? 'bg-[#F3EEFF] text-[#7C3AED] font-semibold' : 'text-[#536078] hover:bg-white/80'
                )}>
                <span className="flex items-center gap-2.5 text-[13px]">
                  <span className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm', iconCfg.bg)}>
                    <Icon className="w-4 h-4 text-white" />
                  </span>
                  {c.name}
                </span>
                <span className={cn('text-[11px] px-2.5 py-0.5 rounded-full font-semibold',
                  category === c.slug ? 'text-white shadow-sm' : iconCfg.pill
                )}
                  style={category === c.slug ? { background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` } : {}}
                >{c.tools_count ?? '—'}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 space-y-6">{content}</div>
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#F8F9FC] p-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-[#0F1B3D]">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  )
}

/* ═══════ Per-card accent themes ═══════ */
const ACCENT_THEMES = [
  { name:'purple', solid:'#7C3AED', light:'#F3EEFF', mid:'#DDD6FE', dark:'#5B21B6', gradient:'from-[#7C3AED] to-[#A78BFA]' },
  { name:'green',  solid:'#059669', light:'#ECFDF5', mid:'#A7F3D0', dark:'#047857', gradient:'from-[#059669] to-[#34D399]' },
  { name:'orange', solid:'#EA580C', light:'#FFF7ED', mid:'#FED7AA', dark:'#C2410C', gradient:'from-[#EA580C] to-[#FB923C]' },
  { name:'blue',   solid:'#2563EB', light:'#EFF6FF', mid:'#BFDBFE', dark:'#1D4ED8', gradient:'from-[#2563EB] to-[#60A5FA]' },
  { name:'pink',   solid:'#DB2777', light:'#FDF2F8', mid:'#FBCFE8', dark:'#BE185D', gradient:'from-[#DB2777] to-[#F472B6]' },
  { name:'indigo', solid:'#4F46E5', light:'#EEF2FF', mid:'#C7D2FE', dark:'#3730A3', gradient:'from-[#4F46E5] to-[#818CF8]' },
]

function getAccent(slug: string) {
  return ACCENT_THEMES[hashStr(slug) % ACCENT_THEMES.length]
}

/* ═══════ Illustrative SVG banners ═══════ */
function ToolBannerIllustration({ slug, accent }: { slug: string; accent: typeof ACCENT_THEMES[number] }) {
  const h = hashStr(slug)
  const variants = [
    // target + notebook
    <svg key="a" viewBox="0 0 200 120" fill="none" className="w-full h-full">
      <circle cx="150" cy="45" r="28" stroke="white" strokeWidth="2.5" opacity="0.5"/><circle cx="150" cy="45" r="18" stroke="white" strokeWidth="2" opacity="0.4"/><circle cx="150" cy="45" r="8" fill="white" opacity="0.6"/>
      <rect x="24" y="28" width="52" height="66" rx="6" fill="white" opacity="0.25"/><line x1="34" y1="42" x2="66" y2="42" stroke="white" strokeWidth="2" opacity="0.45"/><line x1="34" y1="52" x2="60" y2="52" stroke="white" strokeWidth="1.5" opacity="0.3"/><line x1="34" y1="60" x2="56" y2="60" stroke="white" strokeWidth="1.5" opacity="0.3"/><line x1="34" y1="68" x2="62" y2="68" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      <circle cx="34" cy="42" r="2" fill={accent.solid} opacity="0.7"/><circle cx="34" cy="52" r="2" fill={accent.solid} opacity="0.5"/><circle cx="34" cy="60" r="2" fill={accent.solid} opacity="0.4"/>
    </svg>,
    // calculator + plant
    <svg key="b" viewBox="0 0 200 120" fill="none" className="w-full h-full">
      <rect x="30" y="20" width="48" height="80" rx="8" fill="white" opacity="0.25"/><rect x="36" y="26" width="36" height="20" rx="4" fill={accent.solid} opacity="0.25"/>
      <circle cx="42" cy="58" r="4" fill="white" opacity="0.4"/><circle cx="54" cy="58" r="4" fill="white" opacity="0.4"/><circle cx="66" cy="58" r="4" fill="white" opacity="0.4"/>
      <circle cx="42" cy="72" r="4" fill="white" opacity="0.3"/><circle cx="54" cy="72" r="4" fill="white" opacity="0.3"/><circle cx="66" cy="72" r="4" fill="white" opacity="0.3"/>
      <circle cx="42" cy="86" r="4" fill="white" opacity="0.25"/><circle cx="54" cy="86" r="4" fill="white" opacity="0.25"/>
      <line x1="140" y1="95" x2="140" y2="50" stroke="white" strokeWidth="3" opacity="0.4"/><path d="M125 55 Q140 30 155 55" fill="white" opacity="0.25"/><path d="M130 65 Q140 45 150 65" fill={accent.solid} opacity="0.2"/>
    </svg>,
    // certificate + plant
    <svg key="c" viewBox="0 0 200 120" fill="none" className="w-full h-full">
      <rect x="24" y="22" width="68" height="52" rx="6" fill="white" opacity="0.25" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
      <line x1="36" y1="40" x2="80" y2="40" stroke={accent.solid} strokeWidth="2" opacity="0.35"/><line x1="36" y1="50" x2="72" y2="50" stroke="white" strokeWidth="1.5" opacity="0.3"/><line x1="36" y1="58" x2="68" y2="58" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      <circle cx="58" cy="62" r="10" fill="none" stroke={accent.solid} strokeWidth="1.5" opacity="0.3"/><path d="M54 62 L57 65 L63 59" stroke={accent.solid} strokeWidth="1.5" opacity="0.35"/>
      <line x1="148" y1="100" x2="148" y2="55" stroke="white" strokeWidth="2.5" opacity="0.35"/><ellipse cx="148" cy="48" rx="14" ry="12" fill="white" opacity="0.2"/><ellipse cx="140" cy="52" rx="10" ry="9" fill={accent.solid} opacity="0.15"/>
    </svg>,
    // clock + calendar
    <svg key="d" viewBox="0 0 200 120" fill="none" className="w-full h-full">
      <circle cx="60" cy="55" r="30" stroke="white" strokeWidth="2.5" opacity="0.4"/><circle cx="60" cy="55" r="3" fill="white" opacity="0.6"/>
      <line x1="60" y1="55" x2="60" y2="38" stroke="white" strokeWidth="2" opacity="0.5"/><line x1="60" y1="55" x2="73" y2="55" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      <rect x="120" y="25" width="52" height="56" rx="6" fill="white" opacity="0.2"/><rect x="120" y="25" width="52" height="16" rx="6" fill={accent.solid} opacity="0.25"/>
      <line x1="130" y1="50" x2="138" y2="50" stroke="white" strokeWidth="1.5" opacity="0.3"/><line x1="144" y1="50" x2="152" y2="50" stroke="white" strokeWidth="1.5" opacity="0.3"/>
      <line x1="130" y1="60" x2="138" y2="60" stroke="white" strokeWidth="1.5" opacity="0.25"/><line x1="144" y1="60" x2="152" y2="60" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      <line x1="130" y1="70" x2="138" y2="70" stroke="white" strokeWidth="1.5" opacity="0.2"/>
    </svg>,
    // trophy + grade paper
    <svg key="e" viewBox="0 0 200 120" fill="none" className="w-full h-full">
      <path d="M50 30 L70 30 L68 55 Q60 70 52 55 Z" fill="white" opacity="0.3"/><path d="M38 35 Q28 35 30 50 Q32 60 42 58" stroke="white" strokeWidth="2" opacity="0.3"/><path d="M82 35 Q92 35 90 50 Q88 60 78 58" stroke="white" strokeWidth="2" opacity="0.3"/>
      <rect x="52" y="68" width="16" height="6" rx="2" fill="white" opacity="0.25"/><rect x="46" y="74" width="28" height="4" rx="2" fill="white" opacity="0.2"/>
      <path d="M130 25 L170 25 L170 90 L130 90 Z" fill="white" opacity="0.2" stroke="white" strokeWidth="1" strokeOpacity="0.3"/>
      <line x1="140" y1="38" x2="160" y2="38" stroke={accent.solid} strokeWidth="2" opacity="0.35"/><line x1="140" y1="48" x2="156" y2="48" stroke="white" strokeWidth="1.5" opacity="0.3"/><line x1="140" y1="56" x2="152" y2="56" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      <text x="158" y="82" fill={accent.solid} fontSize="14" fontWeight="bold" opacity="0.4">A+</text>
    </svg>,
    // open book + lightbulb
    <svg key="f" viewBox="0 0 200 120" fill="none" className="w-full h-full">
      <path d="M100 35 Q70 30 40 40 L40 85 Q70 75 100 80 Z" fill="white" opacity="0.2" stroke="white" strokeWidth="1.5" strokeOpacity="0.35"/>
      <path d="M100 35 Q130 30 160 40 L160 85 Q130 75 100 80 Z" fill="white" opacity="0.25" stroke="white" strokeWidth="1.5" strokeOpacity="0.35"/>
      <line x1="100" y1="35" x2="100" y2="80" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      <line x1="50" y1="50" x2="90" y2="47" stroke={accent.solid} strokeWidth="1.5" opacity="0.25"/><line x1="50" y1="60" x2="85" y2="57" stroke="white" strokeWidth="1" opacity="0.2"/><line x1="50" y1="68" x2="80" y2="66" stroke="white" strokeWidth="1" opacity="0.18"/>
      <circle cx="150" cy="35" r="16" fill={accent.solid} opacity="0.15" stroke="white" strokeWidth="1.5" strokeOpacity="0.3"/>
      <path d="M150 51 L150 60" stroke="white" strokeWidth="2" opacity="0.3"/><path d="M146 60 L154 60" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      <line x1="150" y1="15" x2="150" y2="10" stroke={accent.solid} strokeWidth="1.5" opacity="0.3"/><line x1="165" y1="28" x2="170" y2="25" stroke={accent.solid} strokeWidth="1.5" opacity="0.25"/><line x1="135" y1="28" x2="130" y2="25" stroke={accent.solid} strokeWidth="1.5" opacity="0.25"/>
    </svg>,
  ]
  return variants[h % variants.length]
}

/* ═══════ Tool Card — monochromatic per-card design ═══════ */
function DirectoryCard({ tool }: { tool: ToolItem }) {
  const accent = getAccent(tool.slug || tool.title)
  const p = pricingInfo(tool.visibility)

  return (
    <Link href={`/tools/${tool.slug}`}
      className="group relative bg-white rounded-2xl border border-[#E4E8F0]/80 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
      style={{ borderColor: undefined, ['--card-accent' as string]: accent.solid }}>

      {/* Banner — uploaded cover image OR illustrative SVG + soft gradient */}
      <div className="relative h-28 sm:h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent.light} 0%, ${accent.mid}40 50%, ${accent.light} 100%)` }}>
        {tool.cover_image ? (
          <img src={tool.cover_image} alt={tool.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 px-2 py-2"><ToolBannerIllustration slug={tool.slug} accent={accent} /></div>
        )}

        {/* Icon tile — small rounded square overlapping banner */}
        <div className="absolute -bottom-5 left-4 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border-[3px] border-white shadow-lg z-10"
          style={{ backgroundColor: accent.solid }}>
          {tool.icon ? (
            <img src={tool.icon} alt="" className="w-7 h-7 sm:w-8 sm:h-8 object-contain brightness-0 invert" />
          ) : (
            <span className="text-xl font-black text-white">{tool.title?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>

        {/* Pricing pill — top-right */}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm"
          style={{ background: `${p.bg}ee`, color: p.color, border: `1px solid ${p.border}` }}>
          <Star className="w-3 h-3" />
          {p.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 pt-6 sm:pt-7 flex flex-col flex-1">
        {/* Title + checkmark in accent color */}
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-[14px] font-bold text-[#0F1B3D] group-hover:transition-colors leading-snug line-clamp-1"
            style={{ ['--tw-text-opacity' as string]: 1 }}>
            <span className="group-hover:text-[#0F1B3D] transition-colors">{tool.title}</span>
          </h3>
          <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: accent.solid }} />
        </div>

        <p className="text-[12px] text-[#536078] leading-relaxed line-clamp-2 mb-3">
          {tool.description || 'A free interactive tool built to help you learn, experiment, and build real projects.'}
        </p>

        {/* Footer — stats + solid accent "Try Now" button */}
        <div className="mt-auto pt-3 border-t border-[#E4E8F0]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-[10px] font-medium border border-[#E2E8F0]/80">
              <Eye className="w-3 h-3" />
              {tool.views_count?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-[10px] font-medium border border-[#E2E8F0]/80">
              <Play className="w-3 h-3" />
              {tool.usage_count?.toLocaleString() || 0}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-[11px] font-bold shadow-md transition-all duration-300"
            style={{ backgroundColor: accent.solid, boxShadow: `0 4px 14px ${accent.solid}30` }}>
            Try Now
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ═══════ Skeleton ═══════ */
function CardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-[#F8F7FF] to-[#F4F8FF] rounded-2xl border border-[#E4E8F0]/80 overflow-hidden animate-pulse flex flex-col">
      <div className="h-28 sm:h-32 bg-gradient-to-br from-violet-50 to-blue-50 relative">
        <div className="absolute -bottom-5 left-4 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-slate-200 border-2 border-white shadow-xl" />
        <div className="absolute top-3 right-3 w-14 h-6 rounded-full bg-slate-200" />
      </div>
      <div className="p-4 pt-6 sm:pt-7 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="w-4 h-4 rounded bg-slate-200 shrink-0" />
        </div>
        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
        <div className="space-y-1.5"><div className="h-3 bg-slate-100 rounded w-full" /><div className="h-3 bg-slate-100 rounded w-4/5" /></div>
        <div className="flex gap-1.5"><div className="h-6 bg-slate-100 rounded-full w-16" /><div className="h-6 bg-slate-100 rounded-full w-12" /></div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex gap-2">
            <div className="h-6 bg-slate-100 rounded-full w-12" />
            <div className="h-6 bg-slate-100 rounded-full w-10" />
          </div>
          <div className="h-7 w-20 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ═══════ Page ═══════ */
export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#FAFBFD] to-[#F4F0FF] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" /></div>
    }><ToolsContent /></Suspense>
  )
}

function ToolsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tools, setTools] = useState<ToolItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [tag, setTag] = useState('')
  const [discover, setDiscover] = useState('top')
  const [mobileOpen, setMobileOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const fetchTools = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page, per_page: 6 }
      if (debouncedSearch) params.search = debouncedSearch
      if (category) params.category = category
      if (tag) params.tag = tag
      if (discover === 'free') params.visibility = 'public'
      const res = await toolsAPI.getPublic(params)
      const d = res.data?.data
      setTools(Array.isArray(d?.data) ? d.data : [])
      setPage(d?.current_page || 1)
      setLastPage(d?.last_page || 1)
      setTotal(d?.total || 0)
    } catch { setTools([]) }
    finally { setLoading(false) }
  }, [page, debouncedSearch, category, tag, discover])

  useEffect(() => { fetchTools() }, [fetchTools])

  useEffect(() => {
    toolsAPI.getPublicCategories().then((res) => {
      setCategories(Array.isArray(res.data?.data) ? res.data.data : [])
    }).catch(() => setCategories([]))
  }, [])

  const sortedTools = useMemo(() => {
    const list = [...tools]
    if (discover === 'top') list.sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    else if (discover === 'new') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return list
  }, [tools, discover])

  const handleSearchInput = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }

  const handleSearchEnter = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setDebouncedSearch(search)
    setPage(1)
  }

  const selectCategory = (slug: string) => { setCategory(category === slug ? '' : slug); setTag(''); setPage(1) }
  const clearAll = () => { setSearch(''); setDebouncedSearch(''); setCategory(''); setTag(''); setDiscover('top'); setPage(1) }
  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFBFD] to-[#F4F0FF] font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 -right-32 w-[640px] h-[640px] rounded-full bg-[#6D3DF5]/[0.06] blur-3xl" />
        <div className="absolute -bottom-44 -left-32 w-[560px] h-[560px] rounded-full bg-[#3478F6]/[0.06] blur-3xl" />
      </div>

      <PublicNavbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6 sm:gap-8">
          <Sidebar categories={categories} category={category} selectCategory={selectCategory}
            total={total} discover={discover} setDiscover={setDiscover}
            mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          <div className="flex-1 min-w-0">
            {/* Hero + Search */}
            <div className="relative rounded-2xl overflow-hidden border border-[#E9E7F5] mb-5 sm:mb-6"
              style={{ background: 'linear-gradient(135deg, #F5F0FF 0%, #F0F4FF 35%, #FFF0F6 65%, #FFF8F0 100%)' }}>

              {/* Decorative blobs */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-[#F87171]/15 blur-3xl" />
                <div className="absolute -bottom-4 left-20 w-28 h-28 rounded-full bg-[#A78BFA]/20 blur-2xl" />
                <div className="absolute -bottom-6 right-10 w-36 h-36 rounded-full bg-[#F472B6]/15 blur-3xl" />
                <div className="absolute -bottom-2 right-40 w-24 h-24 rounded-full bg-[#FB923C]/15 blur-2xl" />
              </div>

              {/* Dotted grid pattern — top-right */}
              <div className="pointer-events-none absolute top-3 right-16 sm:right-24 opacity-[0.15]" aria-hidden="true">
                <svg width="80" height="60" viewBox="0 0 80 60">
                  {[0,1,2,3,4].map(r => [0,1,2,3].map(c => (
                    <circle key={`${r}-${c}`} cx={c * 20 + 10} cy={r * 15 + 8} r="1.5" fill="#6D3DF5" />
                  )))}
                </svg>
              </div>

              {/* Sparkle icons — top-left */}
              <div className="pointer-events-none absolute top-4 left-6 sm:left-10 opacity-20" aria-hidden="true">
                <Sparkles className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <div className="pointer-events-none absolute top-8 left-24 sm:left-32 opacity-15" aria-hidden="true">
                <Sparkles className="w-3 h-3 text-[#F472B6]" />
              </div>

              <div className="relative px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                <button onClick={() => setMobileOpen(true)}
                  className="lg:hidden absolute top-3 right-3 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/70 text-[#536078] text-[11px] font-semibold hover:bg-white transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                </button>
                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      {/* Gradient icon tile */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#A855F7] to-[#EC4899] flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                        <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-lg sm:text-xl lg:text-[26px] font-extrabold leading-tight tracking-tight text-[#0F1B3D]">
                          Find the{' '}
                          <span className="bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] bg-clip-text text-transparent">Right Tools</span>
                        </h1>
                        <p className="mt-1 sm:mt-1.5 text-[#536078] text-[12px] sm:text-[13px] leading-relaxed">Browse curated tools, calculators, and resources to learn faster and build smarter.</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-[340px] shrink-0">
                    <div className="relative group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#7C3AED] transition-colors" />
                      <input value={search} onChange={(e) => handleSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchEnter()}
                        placeholder="Search tools..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FFFFFF]/80 backdrop-blur-sm border border-[#E4E8F0] text-[#0F1B3D] text-[13px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400/40 shadow-sm transition-all" />
                      {search && (
                        <button onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1) }}
                          className="absolute right-10 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#7C3AED]"><X className="w-3.5 h-3.5" /></button>
                      )}
                      <button onClick={handleSearchEnter}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97706]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[13px] sm:text-[15px] font-bold text-[#0F1B3D] truncate">
                  {category ? categories.find(c => c.slug === category)?.name || 'Tools' : discover === 'free' ? 'Free Tools' : discover === 'new' ? 'Latest Tools' : 'Featured Placements'}
                </h2>
                <p className="text-[10px] sm:text-[11px] text-[#94A3B8]">{total} tool{total !== 1 ? 's' : ''} available</p>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : sortedTools.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-gradient-to-br from-[#F8F7FF] to-[#F4F8FF] rounded-2xl border border-[#E4E8F0]/80">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F3EEFF] border border-[#DDD6FE]/60 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Search className="w-6 h-6 sm:w-7 sm:h-7 text-[#6D3DF5]/30" />
                </div>
                <p className="text-sm font-semibold text-[#0F1B3D]">No tools found</p>
                <p className="text-xs text-[#94A3B8] mt-1">{search || category ? 'Try different keywords or clear filters.' : 'Tools will appear here once published.'}</p>
                {(search || category) && (
                  <button onClick={clearAll} className="mt-4 h-9 px-5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold hover:shadow-lg hover:shadow-[#6D3DF5]/25 transition-all">Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {sortedTools.map((tool) => <DirectoryCard key={tool.id} tool={tool} />)}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => goToPage(page - 1)}
                      className="h-9 w-9 rounded-xl border border-[#E4E8F0]/80 bg-gradient-to-br from-[#F8F7FF] to-[#F4F8FF] flex items-center justify-center text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 2)
                      .reduce<(number | string)[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) => typeof p === 'string' ? (
                        <span key={`dots-${i}`} className="text-xs text-slate-400 px-1">...</span>
                      ) : (
                        <button key={p} onClick={() => goToPage(p)}
                          className={cn('h-9 w-9 rounded-xl text-xs font-semibold transition-colors',
                            page === p ? 'bg-[#6D3DF5] text-white shadow-md shadow-[#6D3DF5]/25' : 'border border-[#E4E8F0]/80 bg-gradient-to-br from-[#F8F7FF] to-[#F4F8FF] text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5]'
                          )}>{p}</button>
                      ))
                    }
                    <button disabled={page >= lastPage} onClick={() => goToPage(page + 1)}
                      className="h-9 w-9 rounded-xl border border-[#E4E8F0]/80 bg-gradient-to-br from-[#F8F7FF] to-[#F4F8FF] flex items-center justify-center text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="ml-2 text-[11px] text-[#94A3B8]">{total.toLocaleString()} tool{total !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
