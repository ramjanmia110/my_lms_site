'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { notificationsAPI, messagesAPI } from '@/lib/api'
import {
  LayoutDashboard, Clock, Radio, FileText, XCircle,
  History, Bell, MessageCircle, Settings,
  GraduationCap, ChevronLeft, ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/classes', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/classes/upcoming', label: 'Upcoming', icon: Clock },
  { href: '/dashboard/classes/live', label: 'Live Now', icon: Radio, pulse: true },
  { href: '/dashboard/classes/completed', label: 'Completed', icon: FileText },
  { href: '/dashboard/classes/cancelled', label: 'Cancelled', icon: XCircle },
  { href: '/dashboard/classes/timeline', label: 'Timeline', icon: History },
  { href: '#notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications', fallback: '/dashboard/notifications' },
  { href: '#messages', label: 'Messages', icon: MessageCircle, badgeKey: 'messages', fallback: '/dashboard/messages' },
  { href: '/dashboard/classes/settings', label: 'Settings', icon: Settings },
]

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [badges, setBadges] = useState({ notifications: 0, messages: 0 })

  useEffect(() => {
    Promise.all([
      notificationsAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } })),
      messagesAPI.getConversations().catch(() => ({ data: { data: [] } })),
    ]).then(([nRes, mRes]) => {
      const nCount = nRes.data?.data?.count ?? nRes.data?.data ?? 0
      const convos = Array.isArray(mRes.data?.data) ? mRes.data.data : []
      const mCount = convos.filter((c: any) => c.unread_count > 0).length
      setBadges({ notifications: Number(nCount) || 0, messages: mCount || 0 })
    })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const active = el.querySelector('[data-active="true"]') as HTMLElement | null
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [pathname])

  const scrollByItem = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const gap = 4
    const itemWidth = el.children[0]?.getBoundingClientRect().width ?? 120
    el.scrollBy({ left: dir === 'left' ? -(itemWidth + gap) : itemWidth + gap, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F3EEFF] to-[#E8E5F5] flex items-center justify-center border border-[#572ECE]/20 shadow-sm">
            <GraduationCap size={16} className="text-[#572ECE]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F1B3D] tracking-tight">Live Classes</h1>
            <p className="text-xs text-[#536078]">Manage your live learning sessions</p>
          </div>
        </div>
      </div>

      {/* Premium Glassmorphism Navigation */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#F5F0FF]/80 via-white/70 to-[#EEF5FF]/80 backdrop-blur-xl border border-white/70 shadow-[0_8px_40px_-12px_rgba(15,27,61,0.14),0_0_0_1px_rgba(255,255,255,0.5),inset_0_1px_0_rgba(255,255,255,0.9)] group"
        onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
      >
        {/* Vibrant gradient glow orbs */}
        <div className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[#6D3DF5]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-[#3478F6]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#572ECE]/12 blur-3xl" />
        {/* Inner edge highlight */}
        <div className="pointer-events-none absolute inset-[1px] rounded-[27px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />

        <div className="relative px-1.5 py-2 overflow-hidden">
          {/* Fade-edge masks for horizontal scroll */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/70 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/70 to-transparent z-10" />

          {/* Left arrow */}
          <button onClick={() => scrollByItem('left')}
            className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm border border-[#E9E7F5] flex items-center justify-center text-[#536078] hover:text-[#6D3DF5] hover:bg-white transition-all duration-200 shadow-sm ${hovering ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronLeft size={12} strokeWidth={2.5} />
          </button>

          {/* Right arrow */}
          <button onClick={() => scrollByItem('right')}
            className={`absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm border border-[#E9E7F5] flex items-center justify-center text-[#536078] hover:text-[#6D3DF5] hover:bg-white transition-all duration-200 shadow-sm ${hovering ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronRight size={12} strokeWidth={2.5} />
          </button>

          <div ref={scrollRef} className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-p-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-1 mx-auto snap-x snap-mandatory">
            {NAV_ITEMS.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <a
                  key={item.label}
                  href={item.href}
                  data-active={active || undefined}
                  onClick={item.fallback ? (e) => { e.preventDefault(); router.push(item.fallback!) } : undefined}
                  className={cn(
                    'group/tab relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 snap-start select-none',
                    active
                      ? 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white font-bold shadow-[0_4px_20px_-4px_rgba(109,61,245,0.55),0_0_0_1px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
                      : 'text-[#536078] hover:bg-white/80 hover:text-[#0F1B3D] hover:scale-[1.03] hover:shadow-sm',
                  )}
                >
                  {item.pulse && active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
                      <span className="absolute inset-0 rounded-full bg-red-500" />
                    </span>
                  )}
                  <Icon size={14} strokeWidth={2} className={cn('shrink-0 transition-transform duration-200 group-hover/tab:scale-110 group-hover/tab:-rotate-6', active ? 'text-white' : 'text-[#8A93AE] group-hover/tab:text-[#6D3DF5]')} />
                  <span className={active ? 'text-white' : 'text-[#536078] group-hover/tab:text-[#0F1B3D]'}>{item.label}</span>
                  {item.badgeKey && badges[item.badgeKey as keyof typeof badges] > 0 && (
                    <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-amber-500 text-[9px] font-bold text-white leading-none shadow-[0_1px_4px_-1px_rgba(245,158,11,0.5)]">
                      {badges[item.badgeKey as keyof typeof badges]}
                    </span>
                  )}
                </a>
              )
            })}
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
        {children}
      </motion.div>
    </div>
  )
}
