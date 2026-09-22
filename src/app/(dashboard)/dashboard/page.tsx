'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Users, DollarSign, Briefcase, ShoppingCart, Bell, GraduationCap,
  ArrowUpRight, TrendingUp, Clock, CheckCircle, Loader2, CreditCard, Award,
  Search, Grid3X3, List, Zap, Play, RefreshCcw, User as UserIcon,
  Star, Sparkles, Plus, X, Upload, FileText, Download, Eye, Calendar,
  ChevronDown, MoreHorizontal, Edit3, Trash2, Filter, Globe, MessageSquare,
  Mail, CheckCheck, Moon, Sun, Settings, LogOut, UserPlus, Video,
  MapPin, Phone, Copy, ExternalLink, Clock4, Ban, Check,
  ChevronRight, Layout, Layers, BarChart3, Target,
  ChevronLeft, Maximize2, Minimize2, Paperclip, Link, Image,
  GripVertical, Wallet, ShoppingBag, Tag, Percent,
  Heart, Share2, AlertCircle, ThumbsUp, Send,
  FolderKanban, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/contexts/dashboard-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import api, { coursesAPI, classesAPI, studentsAPI, enrollmentAPI, analyticsAPI, notificationsAPI, projectsAPI, dashboardAPI, servicesAPI, jobsAPI, walletAPI, messagesAPI } from '@/lib/api'
import { FinanceOverviewSection } from '@/components/finance/DashboardFinance'
import { StudentHomeDashboard } from '@/components/dashboard/student'
import toast from 'react-hot-toast'

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

type DashboardTab = 'dashboard' | 'courses' | 'classes' | 'students' | 'assignments' | 'projects' | 'marketplace' | 'jobs'

interface CatalogueCourse {
  id: number; title: string; category: string; level: 'Beginner' | 'Intermediate' | 'Advanced'
  isEnrolled: boolean; progress: number; price: number; image: string
  students: number; duration: string; lessons: number; instructor: string; tags: string[]
  rating: number; meeting_url?: string
}

interface LiveClass {
  id: number; title: string; instructor: string; date: string; time: string
  duration: string; students: number; status: 'upcoming' | 'live' | 'past'
  thumbnail: string; description: string; meeting_url?: string
  available_seats?: number; instructor_bio?: string; instructor_avatar?: string
  agenda?: string; category?: string
}

interface Peer {
  id: number; name: string; avatar: string; role: string; enrolledCourses: number
  progress: number; status: 'active' | 'at-risk' | 'inactive'; track: string
  email: string; joined: string
  is_online?: boolean; student_id?: string | null; mentor?: string | null
}

interface Assignment {
  id: number; title: string; course: string; dueDate: string; status: 'active' | 'submitted' | 'graded'
  grade?: number; totalPoints: number; description: string; attachments: number
}

interface Project {
  id: number; title: string; description: string; status: 'open' | 'in-progress' | 'completed'
  budget: number; spent: number; tasks: number; completedTasks: number; deadline: string
  client: string; skills: string[]
}

interface Gig {
  id: number; title: string; creator: string; price: number; category: string
  sales: number; rating: number; image: string; tech: string[]
}

interface Job {
  id: number; title: string; company: string; location: string; salary: string
  type: string; description: string; skills: string[]; posted_at: string
}

interface RecentActivityItem {
  id: number; action: string; description: string; time: string; icon: string
}

/* ═══════════════════════════════════════════════
   MOCK DATA — kept for type references; initialized as empty for dynamic API data
   ═══════════════════════════════════════════════ */

const defaultCatalogue: CatalogueCourse[] = []
const defaultClasses: LiveClass[] = []
const defaultAssignments: Assignment[] = []
const defaultProjects: Project[] = []
const defaultGigs: Gig[] = []

/* ═══════════════════════════════════════════════
   THEME HELPERS
   ═══════════════════════════════════════════════ */

const levelGrad: Record<string, string> = { Beginner: 'from-[#18A878] to-[#3478F6]', Intermediate: 'from-[#6D3DF5] to-[#3478F6]', Advanced: 'from-[#6D3DF5] to-[#3478F6]' }
const levelBadge: Record<string, string> = {
  Beginner: 'bg-[#ECFBF5] border-[#18A878]/30 text-[#18A878]',
  Intermediate: 'bg-[#EEF4FF] border-[#3478F6]/30 text-[#3478F6]',
  Advanced: 'bg-[#F3EEFF] border-[#6D3DF5]/30 text-[#6D3DF5]',
}
const catGrad: Record<string, string> = { 'Development & Tech': 'from-[#18A878] to-[#3478F6]', 'Design & Media': 'from-[#18A878] to-[#6D3DF5]', 'Business & Marketing': 'from-[#6D3DF5] to-[#3478F6]' }

function glassCard(cls = '') { return cn('bg-white border border-[#E9E7F5] rounded-xl shadow-sm', cls) }

/* ═══════════════════════════════════════════════
   ────────────────  DASHBOARD HOME  ────────────────
   ═══════════════════════════════════════════════ */

function DashboardHome({ catalogue, dashboardStats, activeEnrollments, recentActivity = [], walletSummary = { balance: 0, earnings: 0, pending: 0 }, onTabSwitch, onRefresh, onDeleteActivity, peers = [], assignments = [], projects = [], gigs = [] }: { catalogue: CatalogueCourse[]; dashboardStats: { totalCourses: number; enrolledTracks: number; completedCourses: number; activeCohortMembers: number }; activeEnrollments: CatalogueCourse[]; recentActivity?: RecentActivityItem[]; walletSummary?: { balance: number; earnings: number; pending: number }; onTabSwitch: (t: DashboardTab) => void; onRefresh?: () => void; onDeleteActivity?: (id: number) => void; peers?: Peer[]; assignments?: Assignment[]; projects?: Project[]; gigs?: Gig[] }) {
  const { user } = useAuth()
  const router = useRouter()
  const greeting = (() => { const h = new Date().getHours(); if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening' })()
  const [notifs, setNotifs] = useState<any[]>([])
  const [showAllNotifs, setShowAllNotifs] = useState(false)

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationsAPI.getAll()
        const raw = res.data?.notifications?.data || res.data?.notifications || res.data?.data?.data || res.data?.data || res.data || []
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.slice(0, 5).map((n: any, i: number) => ({
            id: n.id || i + 100,
            title: n.title || 'Notification',
            message: n.message || n.body || '',
            time: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now',
            read: Boolean(n.read_at),
            icon: [CheckCircle, Video, CreditCard, TrendingUp, UserPlus][i % 5],
            color: ['text-[#6D3DF5]', 'text-[#3478F6]', 'text-[#18A878]', 'text-[#6D3DF5]', 'text-[#18A878]'][i % 5],
          }))
          setNotifs(mapped)
        }
      } catch {
        // keep existing notifs
      }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifs.filter(n => !n.read).length
  const displayedNotifs = showAllNotifs ? notifs : notifs.slice(0, 3)

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n))
  const dismissNotif = (id: number) => setNotifs(prev => prev.filter(n => n.id !== id))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-[#0F1B3D]">My Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-semibold text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Live
            </span>
          </div>
          <p className="text-xs text-[#536078]">{greeting}, {user?.name?.split(' ')[0] || 'Student'}! Here&apos;s your learning overview.</p>
        </div>
        <Badge variant="outline" className="gap-1.5 border-[#6D3DF5]/20 text-[#6D3DF5] text-[10px]">
          <Sparkles className="w-3 h-3" />{catalogue.length} Available
        </Badge>
        <button onClick={onRefresh} className="ml-2 p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF4FF] border border-[#E9E7F5] text-[#536078] hover:text-[#6D3DF5] transition-all" title="Refresh dashboard">
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => {
          const rows = [['Section', 'Item', 'Value']]
          catalogue.forEach((c: CatalogueCourse) => rows.push(['Course', c.title, `${c.price}`]))
          peers.forEach((p: Peer) => rows.push(['Peer', p.name, p.track]))
          assignments.forEach((a: Assignment) => rows.push(['Assignment', a.title, a.status]))
          projects.forEach((p: Project) => rows.push(['Project', p.title, p.status]))
          gigs.forEach((g: Gig) => rows.push(['Gig', g.title, `${g.price}`]))
          const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = 'dashboard-export.csv'; a.click()
          URL.revokeObjectURL(url)
        }} className="ml-2 p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF4FF] border border-[#E9E7F5] text-[#536078] hover:text-[#6D3DF5] transition-all" title="Export dashboard data">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses Available', value: `${Math.max(37, Number(dashboardStats.totalCourses) || catalogue.length || 0)}+`, icon: BookOpen, c: 'text-[#3478F6]', bg: 'bg-[#EEF4FF]' },
          { label: 'Enrolled Tracks', value: dashboardStats.enrolledTracks || activeEnrollments.length, icon: GraduationCap, c: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]' },
          { label: 'Completed Courses', value: dashboardStats.completedCourses, icon: Award, c: 'text-[#18A878]', bg: 'bg-[#ECFBF5]' },
          { label: 'Expert Mentors', value: `${Math.max(37, Number(dashboardStats.activeCohortMembers) || peers.length || 0)}+`, icon: Users, c: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]' },
        ].map(m => {
          const Ic = m.icon
          return (
            <div key={m.label} className="bg-white border border-[#E9E7F5] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#6D3DF5]/30 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', m.bg)}><Ic className={cn('w-5 h-5', m.c)} /></div>
                <div className="text-2xl font-bold text-[#0F1B3D] tabular-nums">{m.value}</div>
                <div className="text-xs text-[#536078] mt-1 font-medium">{m.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Finance Overview + Recent Orders (admin only) */}
      <FinanceOverviewSection />

      {/* Two-column: Enrolled Courses + Notifications */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Enrolled Courses Quick View */}
        <div className={glassCard('p-4')}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Active Enrollments</h2>
              <p className="text-[11px] text-[#536078] mt-0.5">Pick up where you left off</p>
            </div>
            <button onClick={() => onTabSwitch('courses')} className="text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium inline-flex items-center gap-1 transition-colors">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {activeEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F8FAFC] flex items-center justify-center mb-3"><BookOpen className="w-5 h-5 text-[#6D3DF5]" /></div>
              <p className="text-xs font-medium text-[#536078]">No active enrollments</p>
              <p className="text-[10px] text-[#536078] mt-1">Browse courses and enroll to get started.</p>
              <button onClick={() => onTabSwitch('courses')} className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold hover:brightness-110 transition-colors">
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeEnrollments.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#F3EEFF]/60 via-[#EEF4FF]/25 to-transparent border border-[#6D3DF5]/10 hover:border-[#6D3DF5]/40 hover:from-[#F3EEFF] hover:via-[#EEF4FF]/50 shadow-sm shadow-[#6D3DF5]/5 transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center shrink-0 shadow-md shadow-[#6D3DF5]/20">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F1B3D] drop-shadow-md truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden shadow-inner">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] shadow-lg shadow-[#6D3DF5]/30 transition-all duration-500" style={{ width: `${c.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-[#6D3DF5] tabular-nums drop-shadow-md">{c.progress}%</span>
                    </div>
                  </div>
                  <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#6D3DF5] to-[#3478F6] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Feed */}
        <div className={glassCard('p-4')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6D3DF5]" />
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Notifications</h2>
              {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-[#6D3DF5] text-white text-[9px] font-bold">{unreadCount}</span>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium">Mark all read</button>
            )}
          </div>
          <div className="space-y-1">
            {displayedNotifs.map(n => {
              const Ic = n.icon
              return (
                <motion.div key={n.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className={cn('flex items-start gap-3 p-2.5 rounded-lg transition-all group', n.read ? 'hover:bg-[#F8FAFC]' : 'bg-[#F8FAFC]')}>
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', n.read ? 'bg-[#F8FAFC]' : 'bg-[#EEF4FF]')}>
                    <Ic className={cn('w-3.5 h-3.5', n.read ? 'text-[#7A86A3]' : n.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-xs truncate', n.read ? 'text-[#7A86A3]' : 'font-medium text-[#0F1B3D]')}>{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#6D3DF5] shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#7A86A3] truncate">{n.message}</p>
                    <p className="text-[10px] text-[#7A86A3]/60 mt-0.5">{n.time}</p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => markRead(n.id)} className="p-1 rounded hover:bg-[#EEF4FF] text-[#7A86A3] hover:text-[#0F1B3D] transition-colors" title={n.read ? 'Mark unread' : 'Mark read'}>
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => dismissNotif(n.id)} className="p-1 rounded hover:bg-[#EEF4FF] text-[#7A86A3] hover:text-red-500 transition-colors" title="Dismiss">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
          {notifs.length > 3 && (
            <button onClick={() => setShowAllNotifs(!showAllNotifs)} className="w-full mt-2 pt-2 border-t border-[#E9E7F5] text-[10px] text-[#536078] hover:text-[#0F1B3D] text-center transition-colors">
              {showAllNotifs ? 'Show less' : `View all ${notifs.length} notifications`}
            </button>
          )}
        </div>
      </div>

      {/* Second row: Recent Activity + Wallet */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className={glassCard('p-4')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6D3DF5]" />
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Recent Activity</h2>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F3EEFF] flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-[#6D3DF5]" /></div>
              <p className="text-xs font-medium text-[#536078] drop-shadow-md">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((a, idx) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-[#F3EEFF]/60 via-[#EEF4FF]/25 to-transparent border border-[#6D3DF5]/10 hover:border-[#6D3DF5]/40 hover:from-[#F3EEFF] hover:via-[#EEF4FF]/50 shadow-sm shadow-[#6D3DF5]/5 transition-all duration-300 group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center shrink-0 shadow-md shadow-[#6D3DF5]/20">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F1B3D] drop-shadow-md">{a.action}</p>
                    <p className="text-[10px] text-[#536078] truncate drop-shadow-md mt-0.5">{a.description}</p>
                    <p className="text-[10px] text-[#6D3DF5]/70 mt-1 drop-shadow-md flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#6D3DF5]" />{a.time}
                    </p>
                  </div>
                  <button onClick={() => onDeleteActivity?.(a.id)} className="shrink-0 p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-red-500/20 border border-[#E9E7F5] hover:border-red-500/30 text-[#7A86A3] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200" title="Delete activity">
                    <X className="w-3 h-3" />
                  </button>
                  <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#6D3DF5] to-[#3478F6] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wallet & Earnings */}
        <div className={glassCard('p-4')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#6D3DF5]" />
              <h2 className="text-sm font-semibold text-[#0F1B3D]">Wallet & Earnings</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-b from-[#F3EEFF] to-[#EEF4FF] border border-[#6D3DF5]/15 text-center shadow-sm shadow-[#6D3DF5]/5">
              <p className="text-[18px] font-bold text-[#0F1B3D] tabular-nums">${(walletSummary.balance / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-[#536078] mt-0.5">Balance</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-b from-[#F3EEFF] to-[#EEF4FF] border border-[#6D3DF5]/15 text-center shadow-sm shadow-[#6D3DF5]/5">
              <p className="text-[18px] font-bold text-[#0F1B3D] tabular-nums">${(walletSummary.earnings / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-[#536078] mt-0.5">Earnings</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-b from-[#F3EEFF] to-[#EEF4FF] border border-[#6D3DF5]/15 text-center shadow-sm shadow-[#6D3DF5]/5">
              <p className="text-[18px] font-bold text-[#0F1B3D] tabular-nums">${(walletSummary.pending / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-[#536078] mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Third row: Fellow Students */}
      <div className={glassCard('p-4')}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6D3DF5]" />
            <h2 className="text-sm font-semibold text-[#0F1B3D]">Fellow Students</h2>
            <span className="px-1.5 py-0.5 rounded-full bg-[#F3EEFF] border border-[#6D3DF5]/20 text-[9px] font-bold text-[#6D3DF5]">{peers.length} enrolled</span>
          </div>
          <button onClick={() => router.push('/dashboard/students')} className="text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium inline-flex items-center gap-1 transition-colors">
            View all students <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        {peers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3EEFF] flex items-center justify-center mb-3"><Users className="w-5 h-5 text-[#6D3DF5]" /></div>
            <p className="text-xs font-medium text-[#536078] drop-shadow-md">Loading your cohort…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {peers.slice(0, 12).map(p => (
              <button key={p.id} onClick={() => router.push(`/dashboard/students/${p.id}`)}
                className="group relative overflow-hidden rounded-xl border border-[#E9E7F5] bg-white p-3 text-left hover:border-[#6D3DF5]/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6D3DF5]/10 transition-all duration-300">
                <div className="relative w-12 h-12 mx-auto mb-2">
                  <ProfileAvatar src={p.avatar} name={p.name} size="md" className="ring-1 ring-[#E9E7F5]" />
                  <span className={cn('absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white', p.is_online ? 'bg-[#18A878]' : 'bg-[#C3CAD9]')} />
                </div>
                <p className="text-[11px] font-semibold text-[#0F1B3D] truncate text-center group-hover:text-[#6D3DF5] transition-colors">{p.name}</p>
                <p className="text-[9px] text-[#536078] truncate text-center mt-0.5">{p.track}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] text-[#7A86A3]">Progress</span>
                    <span className="text-[9px] font-bold text-[#6D3DF5] tabular-nums">{p.progress}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-[#E9E7F5] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] transition-all duration-700" style={{ width: `${Math.min(100, p.progress)}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   ────────────────  COURSES VIEW  ────────────────
   ═══════════════════════════════════════════════ */

function CoursesView({ catalogue, onRefresh }: { catalogue: CatalogueCourse[]; onRefresh?: () => void }) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const toggleFav = (id: number) => setFavorites(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set())
  const [enrolling, setEnrolling] = useState<number | null>(null)
  const [loadingEnrolled, setLoadingEnrolled] = useState(true)
  const [meetingDialog, setMeetingDialog] = useState<{ open: boolean; course: CatalogueCourse | null; link: string }>({ open: false, course: null, link: '' })
  const [storedLinks, setStoredLinks] = useState<Record<number, string>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('course_meeting_links') : null
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  const fetchEnrolled = useCallback(async () => {
    setLoadingEnrolled(true)
    try {
      const res = await coursesAPI.getEnrolled()
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      const ids = (Array.isArray(raw) ? raw : []).map((e: any) => e.course_id || e.id || e.course?.id).filter(Boolean)
      setEnrolledIds(new Set(ids))
    } catch {
      setEnrolledIds(new Set())
    } finally {
      setLoadingEnrolled(false)
    }
  }, [])

  useEffect(() => { fetchEnrolled() }, [fetchEnrolled])

  const enrolledCount = enrolledIds.size
  const isEnrolled = (id: number) => enrolledIds.has(id)
  const filtered = useMemo(() => {
    let r = activeTab === 'enrolled' ? catalogue.filter(c => enrolledIds.has(c.id) || c.isEnrolled) : catalogue.filter(c => !enrolledIds.has(c.id) && !c.isEnrolled)
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q))) }
    if (levelFilter !== 'All') r = r.filter(c => c.level === levelFilter)
    return r
  }, [catalogue, activeTab, search, levelFilter, enrolledIds])

  // Enroll → payment page; Classroom → show meeting link dialog
  async function handleEnroll(c: CatalogueCourse) {
    const enrolled = enrolledIds.has(c.id) || c.isEnrolled
    if (enrolled) {
      const saved = storedLinks[c.id]
      setMeetingDialog({ open: true, course: c, link: saved || c.meeting_url || '' })
    } else {
      router.push(`/payment/${c.id}?title=${encodeURIComponent(c.title)}&price=${c.price}`)
    }
  }

  const joinMeeting = () => {
    const { course, link } = meetingDialog
    if (!course || !link.trim()) {
      toast.error('Please enter a meeting link')
      return
    }
    const url = link.trim().startsWith('http') ? link.trim() : `https://${link.trim()}`
    const updated = { ...storedLinks, [course.id]: url }
    setStoredLinks(updated)
    try { localStorage.setItem('course_meeting_links', JSON.stringify(updated)) } catch {}
    window.open(url, '_blank')
    toast.success('Welcome to class! Joining your virtual classroom.')
    if (user) {
      notificationsAPI.create({
        user_id: user.id,
        type: 'classroom',
        title: 'Classroom Joined',
        message: `You joined the virtual classroom for "${course.title}"`,
      }).catch(() => {})
    }
    setMeetingDialog({ open: false, course: null, link: '' })
  }

  const resetFilters = () => { setSearch(''); setLevelFilter('All'); setActiveTab('all') }

  const renderCard = (c: CatalogueCourse) => {
    const enrolled = enrolledIds.has(c.id) || c.isEnrolled
    const cg = catGrad[c.category] || 'from-slate-500 to-gray-500'
    return viewMode === 'list' ? (
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E9E7F5] hover:border-[#6D3DF5]/50 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-[#6D3DF5]/10 transition-all duration-500 cursor-pointer">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', cg)} />
          <img src={c.image} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-medium text-[#536078]">{c.category}</span>
            <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full border font-semibold', levelBadge[c.level])}>{c.level}</span>
          </div>
          <h3 className="text-xs font-semibold text-[#0F1B3D] truncate group-hover:text-[#6D3DF5] transition-colors">{c.title}</h3>
          <div className="flex items-center gap-2 text-[10px] text-[#536078] mt-0.5"><span>{c.instructor}</span><span>{c.duration}</span><span>{c.lessons} lessons</span></div>
        </div>
        <div className="hidden sm:block w-20 text-right">
          {enrolled ? (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#6D3DF5]">{c.progress}%</span>
              <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden w-full"><div className="h-full rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] transition-all duration-700" style={{ width: `${c.progress}%` }} /></div>
            </div>
          ) : (
            <span className="text-sm font-bold text-[#0F1B3D]">${Math.round(c.price).toLocaleString()}</span>
          )}
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleEnroll(c) }} disabled={enrolling === c.id}
          className={cn('relative text-[10px] font-bold transition-all duration-300 px-3 py-1.5 rounded-lg shrink-0',
            enrolled
              ? 'bg-[#F3EEFF] border border-[#6D3DF5]/20 text-[#6D3DF5] hover:bg-[#6D3DF5]/10'
              : 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/30 hover:shadow-[#6D3DF5]/50 hover:brightness-110')}>
          {enrolling === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : enrolled ? <><Play className="w-3 h-3 inline-block mr-1" /> Classroom</> : <><Zap className="w-3 h-3 inline-block mr-1" /> Enroll</>}
        </button>
      </motion.div>
    ) : (
      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        className="group relative overflow-hidden rounded-xl border border-[#E9E7F5] bg-white shadow-lg shadow-black/5 hover:border-[#6D3DF5]/50 hover:shadow-xl hover:shadow-[#6D3DF5]/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6D3DF5] via-[#3478F6] to-[#6D3DF5] shadow-sm shadow-[#6D3DF5]/50 z-20" />
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#F3EEFF] rounded-full blur-2xl group-hover:bg-[#EEF4FF] transition-all duration-700" />
        <div className="relative h-28 overflow-hidden bg-black/60">
          <img src={c.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <div className={cn('w-4 h-4 rounded bg-gradient-to-br flex items-center justify-center shrink-0 ring-1 ring-white/10', cg)}><Layers className="w-2 h-2 text-white" /></div>
            <span className="text-[10px] font-semibold text-white">{c.category}</span>
          </div>
          <div className="absolute top-2 right-2 z-20">
            <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full border font-semibold backdrop-blur-sm', levelBadge[c.level])}>{c.level}</span>
          </div>
          {enrolled && (
            <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded-full bg-[#ECFBF5] border border-[#18A878]/30 text-[9px] font-bold text-[#18A878] uppercase tracking-wider backdrop-blur-sm">Enrolled</div>
          )}
          <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm ring-1 ring-white/10">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[9px] font-bold text-white">{c.rating}</span>
          </div>
        </div>
        <div className="p-3 space-y-2 relative">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xs font-bold text-[#0F1B3D] leading-snug line-clamp-1 group-hover:text-[#6D3DF5] transition-colors flex-1 drop-shadow-sm">{c.title}</h3>
            <button onClick={(e) => { e.stopPropagation(); toggleFav(c.id) }}
              className="p-1 rounded-md hover:bg-[#EEF4FF] transition-all shrink-0 mt-0.5"><Star className={cn('w-3 h-3 transition-colors', favorites.has(c.id) ? 'text-amber-400 fill-amber-400' : 'text-[#7A86A3] hover:text-amber-500')} /></button>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#536078]">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#6D3DF5]/20 to-[#3478F6]/20 flex items-center justify-center"><UserIcon className="w-2.5 h-2.5 text-[#6D3DF5]" /></div>
            <span className="truncate">{c.instructor}</span>
            <span className="text-[#C3CAD9]">·</span>
            <Users className="w-3 h-3 text-[#6D3DF5]/70" />
            <span>{c.students.toLocaleString()}</span>
            <span className="text-[#C3CAD9]">·</span>
            <Clock className="w-3 h-3 text-[#6D3DF5]/70" />
            <span>{c.duration}</span>
          </div>
          {enrolled && (
            <div className="p-2 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/10">
              <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-[#536078] font-medium">Progress</span><span className="text-[11px] font-bold text-[#6D3DF5] tabular-nums drop-shadow-sm">{c.progress}%</span></div>
              <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] shadow-sm shadow-[#6D3DF5]/30 transition-all duration-1000" style={{ width: `${c.progress}%` }} /></div>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-[#6D3DF5]/10">
            <div>{enrolled ? (
              <div className="flex items-center gap-1 text-[10px] text-[#536078]"><BookOpen className="w-3 h-3 text-[#6D3DF5]/70" /><span>{c.lessons} lessons</span></div>
            ) : (
              <div className="flex items-baseline gap-1">            <span className="text-sm font-bold text-[#0F1B3D] drop-shadow-sm">${Math.round(c.price).toLocaleString()}</span>
            <span className="text-[10px] text-[#7A86A3] line-through">${Math.round(c.price * 1.8).toLocaleString()}</span></div>
            )}</div>
            <button onClick={(e) => { e.stopPropagation(); handleEnroll(c) }} disabled={enrolling === c.id}
              className={cn('relative text-[10px] font-bold transition-all duration-300 px-3 py-1.5 rounded-lg overflow-hidden group/btn',
                enrolled
                  ? 'bg-[#F3EEFF] border border-[#6D3DF5]/20 text-[#6D3DF5] hover:bg-[#6D3DF5]/10'
                  : 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/30 hover:shadow-[#6D3DF5]/50 hover:brightness-110')}>
              {enrolling === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : enrolled ? <><Play className="w-3 h-3 inline-block mr-1" /> Classroom</> : <><Zap className="w-3 h-3 inline-block mr-1" /> Enroll</>}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F1B3D]">Courses</h1>
          <p className="text-xs text-[#536078] mt-0.5">Browse, enroll, and track your learning progress.</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-0.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
            {(['all', 'enrolled'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize',
                  activeTab === tab ? 'bg-[#6D3DF5] text-white shadow-lg shadow-[#6D3DF5]/20' : 'text-[#536078] hover:text-[#0F1B3D')}>
                {tab === 'all' ? 'All Courses' : 'Enrolled'}{tab === 'enrolled' && enrolledCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{enrolledCount}</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
            <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded-md transition-all', viewMode === 'grid' ? 'bg-[#6D3DF5] text-white' : 'text-[#536078] hover:text-[#0F1B3D')}><Grid3X3 className="w-3.5 h-3.5" /></button>
            <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded-md transition-all', viewMode === 'list' ? 'bg-[#6D3DF5] text-white' : 'text-[#536078] hover:text-[#0F1B3D')}><List className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536078] pointer-events-none" />
            <Input placeholder="Search courses by title, category, or tag..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] placeholder:text-[#A6AFBF] focus:border-[#6D3DF5]/50 focus-visible:ring-[#6D3DF5] focus-visible:ring-offset-0" />
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                className={cn('px-3 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize whitespace-nowrap',
                  levelFilter === l ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-[#536078] hover:text-[#0F1B3D')}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? filtered.map(c => <div key={c.id}>{renderCard(c)}</div>) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E9E7F5] flex items-center justify-center mb-4"><Search className="w-7 h-7 text-[#7A86A3]" /></div>
                <h3 className="text-sm font-semibold text-[#0F1B3D]/70 mb-1">No courses found</h3>
                <p className="text-xs text-[#536078] max-w-xs mb-6">Try adjusting your search or filter criteria.</p>
                <button onClick={resetFilters} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/20 text-[#6D3DF5] text-xs font-semibold hover:bg-[#6D3DF5]/10 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? filtered.map(c => <div key={c.id}>{renderCard(c)}</div>) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E9E7F5] flex items-center justify-center mb-4"><Search className="w-7 h-7 text-[#7A86A3]" /></div>
                <h3 className="text-sm font-semibold text-[#0F1B3D]/70 mb-1">No courses found</h3>
                <p className="text-xs text-[#536078] max-w-xs mb-6">Try adjusting your search or filter criteria.</p>
                <button onClick={resetFilters} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/20 text-[#6D3DF5] text-xs font-semibold hover:bg-[#6D3DF5]/10 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Meeting link dialog */}
      <Dialog open={meetingDialog.open} onOpenChange={(open) => { if (!open) setMeetingDialog(prev => ({ ...prev, open: false, link: '' })) }}>
        <DialogContent className="bg-white border border-[#E9E7F5] text-[#0F1B3D] max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] flex items-center gap-2">
              <Video className="w-4 h-4 text-[#6D3DF5]" />
              Join Virtual Classroom
            </DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Enter your Zoom or Google Meet link to join <span className="text-[#6D3DF5] font-semibold">{meetingDialog.course?.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#536078] flex items-center gap-1.5"><Link className="w-3 h-3 text-[#6D3DF5]" /> Meeting Link</label>
              <Input
                value={meetingDialog.link}
                onChange={e => setMeetingDialog(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                className="bg-[#F8FAFC] border border-[#6D3DF5]/20 text-[#0F1B3D] placeholder:text-[#A6AFBF] text-xs focus-visible:ring-[#6D3DF5] focus-visible:ring-offset-0"
                onKeyDown={e => { if (e.key === 'Enter') joinMeeting() }}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#7A86A3] bg-[#F8FAFC] rounded-lg p-2 border border-[#E9E7F5]">
              <Globe className="w-3 h-3 text-[#6D3DF5]/70 shrink-0" />
              <span>Paste the full meeting URL. You only need to enter it once — it will be saved for next time.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setMeetingDialog({ open: false, course: null, link: '' })} className="text-[#536078] hover:text-[#0F1B3D] text-xs">Cancel</Button>
            <Button size="sm" onClick={joinMeeting} className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs shadow-lg shadow-[#6D3DF5]/30 hover:brightness-110">
              <ExternalLink className="w-3 h-3 mr-1.5" /> Join Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   ────────────────  CLASSES VIEW  ────────────────
   ═══════════════════════════════════════════════ */

function ClassesView() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'past'>('all')
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)
  const [detailModal, setDetailModal] = useState<LiveClass | null>(null)
  const [detailData, setDetailData] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [joining, setJoining] = useState<number | null>(null)
  const [reminding, setReminding] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showMyClasses, setShowMyClasses] = useState(false)
  const [myClassIds, setMyClassIds] = useState<Set<number>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', date: '', time: '', description: '', meeting_url: '', duration: '', category: '', max_students: 50 })
  const [creating, setCreating] = useState(false)
  const [nowTime, setNowTime] = useState(Date.now())
  const { user } = useAuth()
  const isAdminOrInstructor = user && ['admin', 'instructor'].includes(user.role)

  useEffect(() => { const t = setInterval(() => setNowTime(Date.now()), 60000); return () => clearInterval(t) }, [])

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filter !== 'all') params.status = filter
      if (search.trim()) params.search = search
      if (dateFilter) params.date = dateFilter
      if (categoryFilter) params.category = categoryFilter
      const res = await classesAPI.getAll(params)
      const raw = res.data?.data?.data ?? res.data?.data ?? []
      const mapped: LiveClass[] = raw.map((c: any) => ({
        id: c.id, title: c.title,
        instructor: c.instructor?.name || c.instructor || 'Unknown',
        instructor_bio: c.instructor?.bio || '',
        instructor_avatar: c.instructor?.avatar || '',
        date: c.date, time: c.time, duration: c.duration || '—',
        students: c.students_count ?? 0,
        available_seats: c.available_seats ?? 0,
        status: c.status || 'upcoming',
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
        description: c.description || '',
        agenda: c.agenda || c.description || '',
        meeting_url: c.meeting_url,
        category: c.category || '',
      }))
      setClasses(mapped)
    } catch { setClasses([]) } finally { setLoading(false) }
  }, [filter, search, dateFilter, categoryFilter])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  useEffect(() => {
    if (showMyClasses) {
      classesAPI.myClasses().then(res => {
        const raw = res.data?.data ?? []
        const ids = new Set(Array.isArray(raw) ? raw.map((c: any) => c.id) : [])
        setMyClassIds(ids)
      }).catch(() => {})
    }
  }, [showMyClasses])

  const handleJoin = async (cls: LiveClass) => {
    if (joining) return
    setJoining(cls.id)
    try {
      const res = await classesAPI.join(cls.id)
      const meetingUrl = res.data?.data?.meeting_url ?? cls.meeting_url
      if (meetingUrl) window.open(meetingUrl, '_blank')
      else toast.error('No meeting link available.')
    } catch { toast.error('Failed to join class.') } finally { setJoining(null) }
  }

  const handleRemind = async (cls: LiveClass) => {
    setReminding(cls.id)
    try {
      const res = await classesAPI.remind(cls.id)
      toast.success(res.data?.message || 'Reminder set!')
    } catch { toast.error('Failed to set reminder.') } finally { setReminding(null) }
  }

  const handleCreate = async () => {
    if (!createForm.title || !createForm.date || !createForm.time) {
      toast.error('Title, date, and time are required.')
      return
    }
    setCreating(true)
    try {
      await classesAPI.create(createForm)
      toast.success('Class created successfully!')
      setShowCreateModal(false)
      setCreateForm({ title: '', date: '', time: '', description: '', meeting_url: '', duration: '', category: '', max_students: 50 })
      fetchClasses()
    } catch { toast.error('Failed to create class.') } finally { setCreating(false) }
  }

  const openDetail = async (cls: LiveClass) => {
    setDetailModal(cls)
    setLoadingDetail(true)
    setDetailData(null)
    try {
      const res = await classesAPI.getOne(cls.id)
      setDetailData(res.data?.data || null)
    } catch { setDetailData(null) } finally { setLoadingDetail(false) }
  }

  const getCountdown = (date: string, time: string) => {
    const clsTime = new Date(`${date}T${time}`).getTime()
    const diff = clsTime - nowTime
    if (diff <= 0) return null
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  // Derive unique categories and instructors from loaded classes
  const categories = Array.from(new Set(classes.map(c => c.category).filter(Boolean)))

  const displayClasses = showMyClasses ? classes.filter(c => myClassIds.has(c.id)) : classes
  const stats = {
    total: classes.length,
    live: classes.filter(c => c.status === 'live').length,
    upcoming: classes.filter(c => c.status === 'upcoming').length,
    past: classes.filter(c => c.status === 'past').length,
  }

  const parseSection = (text: string, heading: string) => {
    const rx = new RegExp(`##\\s*${heading}[\\s\\S]*?(?=\\n##|$)`, 'i')
    const match = text.match(rx)
    if (!match) return null
    return match[0].replace(/##\s*${heading}\s*/i, '').trim().split('\n').filter(Boolean)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F1B3D]">Live Classes</h1>
          <p className="text-xs text-[#536078] mt-0.5">Join interactive masterclasses with expert instructors.</p>
        </div>
        {isAdminOrInstructor && (
          <Button onClick={() => setShowCreateModal(true)} className="h-9 gap-2 text-xs rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/30">
            <Plus className="w-3.5 h-3.5" /> Create Class
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white border border-[#E9E7F5] text-center">
          <div className="text-lg font-bold text-[#0F1B3D]">{stats.total}</div>
          <div className="text-[10px] text-[#536078]">Total</div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#6D3DF5]/20 text-center">
          <div className="text-lg font-bold text-[#18A878]">{stats.upcoming}</div>
          <div className="text-[10px] text-[#536078]">Upcoming</div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-red-500/20 text-center">
          <div className="text-lg font-bold text-red-500">{stats.live}</div>
          <div className="text-[10px] text-[#536078]">Live Now</div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E9E7F5] text-center">
          <div className="text-lg font-bold text-[#536078]">{stats.past}</div>
          <div className="text-[10px] text-[#536078]">Past</div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-0.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
            {(['all', 'upcoming', 'live', 'past'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-3 py-1.5 text-[10px] font-medium rounded-md transition-all capitalize',
                  filter === f ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-[#536078] hover:text-[#0F1B3D')}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <button onClick={() => setShowMyClasses(!showMyClasses)}
            className={cn('px-3 py-1.5 text-[10px] font-medium rounded-md border transition-all',
              showMyClasses ? 'bg-[#ECFBF5] border-[#18A878]/30 text-[#18A878]' : 'bg-[#F8FAFC] border-[#E9E7F5] text-[#536078] hover:text-[#0F1B3D')}>
            <UserIcon className="w-3 h-3 inline-block mr-1" /> My Classes
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#536078]" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or instructor..."
              className="pl-8 h-8 w-40 text-[10px] rounded-lg bg-[#F8FAFC] border-[#E9E7F5]" />
          </div>
          {categories.length > 0 && (
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="h-8 text-[10px] rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] text-[#536078] px-2 focus:outline-none focus:ring-1 focus:ring-[#6D3DF5]">
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          )}
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="h-8 w-32 text-[10px] rounded-lg bg-[#F8FAFC] border-[#E9E7F5] text-[#536078] [color-scheme:light]" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#E9E7F5] bg-[#F8FAFC] overflow-hidden animate-pulse">
              <div className="h-32 bg-[#F8FAFC]" />
              <div className="p-4 space-y-2"><div className="h-4 w-3/4 bg-[#F8FAFC] rounded" /><div className="h-3 w-full bg-[#F8FAFC] rounded" /><div className="h-3 w-1/2 bg-[#F8FAFC] rounded" /></div>
            </div>
          ))}
        </div>
      ) : displayClasses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-[#F8FAFC] border border-[#E9E7F5] flex items-center justify-center mx-auto mb-4"><Video className="w-7 h-7 text-[#536078]" /></div>
          <p className="text-sm text-[#536078] mb-1">{showMyClasses ? "You haven't joined any classes yet." : 'No classes found.'}</p>
          <p className="text-[10px] text-[#7A86A3]">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayClasses.map((cls, i) => (
            <motion.div key={cls.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group relative overflow-hidden rounded-2xl border border-[#E9E7F5] bg-white hover:border-[#6D3DF5]/40 hover:shadow-xl hover:shadow-[#6D3DF5]/5 hover:-translate-y-0.5 transition-all duration-500 cursor-pointer"
              onClick={() => openDetail(cls)}>
              <div className="relative h-32 overflow-hidden">
                <img src={cls.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {cls.status === 'live' ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-bold text-red-500 uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Live</span>
                  ) : cls.status === 'upcoming' ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFBF5] border border-[#18A878]/30 text-[10px] font-bold text-[#18A878] uppercase tracking-wider backdrop-blur-sm"><Clock className="w-3 h-3" />Upcoming</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-medium text-[#536078] uppercase tracking-wider backdrop-blur-sm">Past</span>
                  )}
                  {myClassIds.has(cls.id) && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-medium text-blue-300 backdrop-blur-sm">Joined</span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/80"><Calendar className="w-3 h-3" /><span>{cls.date} at {cls.time?.slice(0, 5)}</span></div>
                  {cls.status === 'upcoming' && getCountdown(cls.date, cls.time) && (
                    <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-bold text-[#18A878] border border-[#18A878]/30"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{getCountdown(cls.date, cls.time)}</div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-[#0F1B3D] leading-snug group-hover:text-[#6D3DF5] transition-colors line-clamp-1 flex-1">{cls.title}</h3>
                  {cls.category && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#F3EEFF] border border-[#6D3DF5]/20 text-[#6D3DF5]/80 uppercase tracking-wider font-semibold shrink-0">{cls.category}</span>}
                </div>
                <p className="text-[10px] text-[#536078] mb-2 line-clamp-1">{cls.description?.replace(/##.*$/gm, '').trim() || 'No description'}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#536078] mb-3">
                  <UserIcon className="w-3 h-3 shrink-0" /><span className="truncate">{cls.instructor}</span>
                  <span className="text-[#C3CAD9]">|</span>
                  <Users className="w-3 h-3 shrink-0" /><span>{cls.students}</span>
                  {cls.status === 'upcoming' && (
                    <><span className="text-[#C3CAD9]">|</span><span className="text-[#6D3DF5] font-medium">{cls.available_seats} seats</span></>
                  )}
                  <span className="text-[#C3CAD9]">|</span>
                  <Clock className="w-3 h-3 shrink-0" /><span>{cls.duration}</span>
                </div>
                <Button onClick={(e) => { e.stopPropagation(); handleJoin(cls) }}
                  className={cn('w-full text-xs font-semibold transition-all',
                    cls.status === 'live' ? 'bg-red-500 hover:bg-red-600 text-white gap-2' :
                    cls.status === 'upcoming' ? 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 text-white gap-2' :
                    'bg-[#F8FAFC] hover:bg-[#EEF4FF] text-[#6D3DF5] gap-2 border border-[#E9E7F5]')}
                  disabled={joining === cls.id}>
                  {joining === cls.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                   cls.status === 'live' ? <><Video className="w-3.5 h-3.5" /> Join Live</> :
                   cls.status === 'upcoming' ? <><Bell className="w-3.5 h-3.5" /> Set Reminder</> :
                   <><Play className="w-3.5 h-3.5" /> Watch Recording</>}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => { setDetailModal(null); setDetailData(null) }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl border border-[#E9E7F5] bg-white overflow-hidden my-8 shadow-xl"
              onClick={e => e.stopPropagation()}>
              {/* Hero */}
              <div className="relative h-40 bg-black flex items-center justify-center">
                <img src={detailModal.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#6D3DF5]/15 to-transparent" />
                <div className="relative text-center z-10">
                  <div className="w-12 h-12 rounded-full bg-[#ECFBF5] border border-[#18A878]/30 flex items-center justify-center mx-auto mb-2">
                    <Video className="w-5 h-5 text-[#6D3DF5]" />
                  </div>
                  <p className="text-base font-bold text-[#0F1B3D]">{detailModal.title}</p>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-[#536078] mt-1">
                    <UserIcon className="w-3 h-3" /> {detailModal.instructor}
                    <span className="text-[#C3CAD9]">·</span>
                    {detailModal.date} at {detailModal.time?.slice(0, 5)}
                    <span className="text-[#C3CAD9]">·</span>
                    {detailModal.duration}
                  </div>
                </div>
                <button onClick={() => { setDetailModal(null); setDetailData(null) }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Status + Seats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {detailModal.status === 'live' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-bold text-red-500 uppercase"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Live</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-medium text-[#536078] uppercase">{detailModal.status}</span>
                    )}
                    {detailModal.category && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F3EEFF] border border-[#6D3DF5]/20 text-[#6D3DF5]/80">{detailModal.category}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#536078]">
                    <span><Users className="w-3 h-3 inline mr-1" />{detailModal.students} attending</span>
                    {detailModal.status === 'upcoming' && <span className="text-[#6D3DF5] font-medium">{detailModal.available_seats} seats left</span>}
                  </div>
                </div>

                {/* Instructor Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]">
                  <ProfileAvatar src={detailModal.instructor_avatar} name={detailModal.instructor || ''} size="md" className="ring-2 ring-[#6D3DF5]/20" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F1B3D]">{detailModal.instructor}</p>
                    <p className="text-[9px] text-[#536078] line-clamp-1">{detailModal.instructor_bio || 'Instructor'}</p>
                  </div>
                </div>

                {/* Agenda / Description */}
                {detailModal.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#0F1B3D] flex items-center gap-1.5 mb-2"><BookOpen className="w-3.5 h-3.5 text-[#6D3DF5]" /> Agenda &amp; Materials</h4>
                    <div className="text-[10px] text-[#536078] leading-relaxed space-y-1 bg-[#F8FAFC] rounded-xl p-3 border border-[#E9E7F5]">
                      {detailModal.description.split('\n').map((line: string, i: number) => {
                        if (line.startsWith('## ')) return <p key={i} className="text-xs font-bold text-[#6D3DF5] mt-2 first:mt-0">{line.replace('## ', '')}</p>
                        if (line.startsWith('- ')) return <li key={i} className="list-none flex items-start gap-1.5 text-[#536078]"><span className="text-[#6D3DF5] mt-0.5">•</span><span>{line.replace('- ', '')}</span></li>
                        if (line.match(/^\d+\./)) return <li key={i} className="list-none flex items-start gap-1.5 text-[#536078]"><span className="text-[#6D3DF5] font-medium shrink-0">{line.match(/^\d+\./)?.[0]}</span><span>{line.replace(/^\d+\.\s*/, '')}</span></li>
                        return line.trim() ? <p key={i} className="text-[#536078]">{line}</p> : null
                      })}
                    </div>
                  </div>
                )}

                {/* Attendance List (for past/live classes with data) */}
                {detailData?.attendance?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#0F1B3D] flex items-center gap-1.5 mb-2"><Users className="w-3.5 h-3.5 text-[#6D3DF5]" /> Attendance ({detailData.attendance.length})</h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {detailData.attendance.map((a: any) => (
                        <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6D3DF5]/20 to-[#3478F6]/20 flex items-center justify-center text-[8px] font-bold text-[#6D3DF5]">
                            {a.user?.name?.[0] || '?'}
                          </div>
                          <span className="text-[10px] text-[#536078] flex-1">{a.user?.name || 'Unknown'}</span>
                          <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full', a.present ? 'text-[#18A878] bg-[#ECFBF5]' : 'text-red-500 bg-red-50')}>
                            {a.present ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleJoin(detailModal)} disabled={joining === detailModal.id}
                    className="flex-1 bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white gap-2 shadow-lg shadow-[#6D3DF5]/20 text-xs">
                    {joining === detailModal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {detailModal.status === 'live' ? 'Join Stream' : detailModal.status === 'upcoming' ? 'Set Reminder' : 'Watch Recording'}
                  </Button>
                  {detailModal.status === 'upcoming' && (
                    <Button onClick={() => handleRemind(detailModal)} disabled={reminding === detailModal.id}
                      variant="outline" className="border-[#6D3DF5]/30 text-[#6D3DF5] hover:bg-[#F3EEFF] gap-2 text-xs">
                      {reminding === detailModal.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                      Remind Me
                    </Button>
                  )}
                  <Button onClick={() => { if (detailModal.meeting_url) { navigator.clipboard.writeText(detailModal.meeting_url); toast.success('Link copied!') } else toast.error('No link available') }}
                    variant="outline" className="border-[#E9E7F5] text-[#536078] hover:text-[#0F1B3D] gap-2 text-xs">
                    <Copy className="w-4 h-4" /> Copy Link
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Class Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-white border border-[#E9E7F5] text-[#0F1B3D] max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] flex items-center gap-2 text-sm"><Video className="w-4 h-4 text-[#6D3DF5]" /> Create New Class</DialogTitle>
            <DialogDescription className="text-[10px] text-[#536078]">Schedule a new live class for students.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#536078]">Title *</label>
              <Input value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Advanced React Patterns" className="h-8 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] placeholder:text-[#A6AFBF] focus-visible:ring-[#6D3DF5]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[#536078]">Date *</label>
                <Input type="date" value={createForm.date} onChange={e => setCreateForm(p => ({ ...p, date: e.target.value }))}
                  className="h-8 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] [color-scheme:light] focus-visible:ring-[#6D3DF5]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[#536078]">Time *</label>
                <Input type="time" value={createForm.time} onChange={e => setCreateForm(p => ({ ...p, time: e.target.value }))}
                  className="h-8 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] [color-scheme:light] focus-visible:ring-[#6D3DF5]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[#536078]">Duration</label>
                <Input value={createForm.duration} onChange={e => setCreateForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="e.g. 1h 30m" className="h-8 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] placeholder:text-[#A6AFBF] focus-visible:ring-[#6D3DF5]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[#536078]">Category</label>
                <Input value={createForm.category} onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Web Development" className="h-8 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] placeholder:text-[#A6AFBF] focus-visible:ring-[#6D3DF5]" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#536078]">Meeting Link</label>
              <Input value={createForm.meeting_url} onChange={e => setCreateForm(p => ({ ...p, meeting_url: e.target.value }))}
                placeholder="https://zoom.us/j/..." className="h-8 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] placeholder:text-[#A6AFBF] focus-visible:ring-[#6D3DF5]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#536078]">Description &amp; Agenda</label>
              <textarea value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                rows={4} placeholder="Use ## Agenda and ## Materials headings to organize your class content..."
                className="w-full rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] text-[#0F1B3D] placeholder:text-[#A6AFBF] text-xs p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#6D3DF5]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#536078]">Max Students</label>
              <Input type="number" min={1} max={1000} value={createForm.max_students}
                onChange={e => setCreateForm(p => ({ ...p, max_students: Number(e.target.value) }))}
                className="h-8 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] focus-visible:ring-[#6D3DF5]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)} className="text-[#536078] hover:text-[#0F1B3D] text-xs">Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={creating}
              className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs shadow-lg shadow-[#6D3DF5]/30 hover:brightness-110">
              {creating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />} Create Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}


/* ═══════════════════════════════════════════════
   ────────────────  ASSIGNMENTS VIEW  ────────────────
   ═══════════════════════════════════════════════ */

function AssignmentsView({ assignments: initial }: { assignments: Assignment[] }) {
  const [assignments, setAssignments] = useState(initial)
  const [filter, setFilter] = useState<'all' | 'active' | 'submitted' | 'graded'>('all')
  const [uploading, setUploading] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [selected, setSelected] = useState<Assignment | null>(null)

  const stats = useMemo(() => ({
    active: assignments.filter(a => a.status === 'active').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
  }), [assignments])

  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter)

  const handleUpload = (id: number) => {
    setUploading(id)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + Math.random() * 15
        if (next >= 100) {
          clearInterval(interval)
          setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'submitted' as const } : a))
          setTimeout(() => { setUploading(null); setUploadProgress(0) }, 500)
          return 100
        }
        return next
      })
    }, 300)
  }

  const statusIcon: Record<string, LucideIcon> = { active: Clock, submitted: Check, graded: Award }
const statusColor: Record<string, string> = { active: 'text-[#18A878]', submitted: 'text-[#3478F6]', graded: 'text-[#6D3DF5]' }
const statusBg: Record<string, string> = { active: 'bg-[#ECFBF5] border-[#18A878]/25', submitted: 'bg-[#EEF4FF] border-[#3478F6]/25', graded: 'bg-[#F3EEFF] border-[#6D3DF5]/25' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F1B3D]">Assignments</h1>
          <p className="text-xs text-[#536078] mt-0.5">Track and submit your coursework deliverables.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: stats.active, icon: Clock, c: 'text-[#18A878]', bg: 'bg-[#ECFBF5] border-[#18A878]/25' },
          { label: 'Submitted', value: stats.submitted, icon: Check, c: 'text-[#3478F6]', bg: 'bg-[#EEF4FF] border-[#3478F6]/25' },
          { label: 'Graded', value: stats.graded, icon: Award, c: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF] border-[#6D3DF5]/25' },
        ].map(s => {
          const Ic = s.icon
          return (
            <div key={s.label} className="bg-white border border-[#E9E7F5] rounded-xl p-4 flex items-center justify-between hover:border-[#6D3DF5]/40 transition-all">
              <div><div className="text-2xl font-bold text-[#0F1B3D]">{s.value}</div><div className="text-[11px] text-[#536078] mt-0.5">{s.label}</div></div>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', s.bg)}><Ic className={cn('w-4 h-4', s.c)} /></div>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] w-fit">
        {(['all', 'active', 'submitted', 'graded'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize',
              filter === f ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-[#536078] hover:text-[#0F1B3D')}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Assignment List */}
      <div className="space-y-3">
        {filtered.map(a => {
          const SI = statusIcon[a.status] || Clock
          return (
            <motion.div key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={cn('rounded-xl border p-4 transition-all duration-300 cursor-pointer',
                'bg-white border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:bg-[#F8FAFC]')}
              onClick={() => setSelected(a)}>
              <div className="flex items-start gap-4">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', statusBg[a.status])}>
                  <SI className={cn('w-5 h-5', statusColor[a.status])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-[#0F1B3D] truncate">{a.title}</h3>
                    {a.status === 'graded' && a.grade !== undefined && (
                      <Badge className="bg-[#F3EEFF] border-[#6D3DF5]/20 text-[#6D3DF5] text-[10px]">{a.grade}/{a.totalPoints}</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-[#536078] mb-1">{a.course} · Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <p className="text-[10px] text-[#7A86A3] line-clamp-1">{a.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {a.status === 'active' && (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUpload(a.id) }}
                        disabled={uploading === a.id}
                        className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 text-white text-[10px] h-7 px-3 gap-1">
                        {uploading === a.id ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</> : <><Upload className="w-3 h-3" /> Submit</>}
                      </Button>
                    )}
                    {a.attachments > 0 && <span className="text-[10px] text-[#7A86A3] flex items-center gap-1"><Paperclip className="w-3 h-3" />{a.attachments} files</span>}
                  </div>
                  {/* Upload Progress */}
                  {uploading === a.id && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] mb-1"><span className="text-[#6D3DF5]">Uploading...</span><span className="text-[#536078]">{Math.round(uploadProgress)}%</span></div>
                      <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-[#7A86A3] shrink-0 mt-2" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Assignment Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-[#E9E7F5] bg-white overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0F1B3D]">{selected.title}</h3>
                    <p className="text-xs text-[#536078] mt-0.5">{selected.course}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-[#F8FAFC] flex items-center justify-center hover:bg-[#EEF4FF]"><X className="w-3.5 h-3.5 text-[#536078]" /></button>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] mb-4">
                  <p className="text-xs text-[#536078] leading-relaxed">{selected.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]"><p className="text-[10px] text-[#536078]">Status</p><p className={cn('text-xs font-medium mt-0.5 capitalize', statusColor[selected.status])}>{selected.status}</p></div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]"><p className="text-[10px] text-[#536078]">Due Date</p><p className="text-xs font-medium text-[#0F1B3D] mt-0.5">{new Date(selected.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]"><p className="text-[10px] text-[#536078]">Total Points</p><p className="text-xs font-medium text-[#0F1B3D] mt-0.5">{selected.totalPoints}</p></div>
                  {selected.grade !== undefined && (
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]"><p className="text-[10px] text-[#536078]">Grade</p><p className="text-xs font-medium text-[#6D3DF5] mt-0.5">{selected.grade}/{selected.totalPoints}</p></div>
                  )}
                </div>
                {selected.status === 'active' && (
                  <Button onClick={() => { handleUpload(selected.id); setSelected(null) }}
                    disabled={uploading === selected.id}
                    className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 text-white gap-2">
                    {uploading === selected.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Submission</>}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   ────────────────  PROJECTS VIEW  ────────────────
   ═══════════════════════════════════════════════ */

function ProjectsView({ projects, onUpdateProjects }: { projects: Project[]; onUpdateProjects: (u: (p: Project[]) => Project[]) => void }) {
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '', budget: '', deadline: '', client: '', skills: '' })

  const stats = useMemo(() => ({
    total: projects.length,
    open: projects.filter(p => p.status === 'open').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    totalSpent: projects.reduce((s, p) => s + p.spent, 0),
  }), [projects])

  const handleCreate = () => {
    if (!createForm.title.trim()) return
    const newProject: Project = {
      id: Date.now(),
      title: createForm.title,
      description: createForm.description,
      status: 'open',
      budget: Number(createForm.budget) || 0,
      spent: 0,
      tasks: 0,
      completedTasks: 0,
      deadline: createForm.deadline || 'TBD',
      client: createForm.client || 'Internal',
      skills: createForm.skills.split(',').map(s => s.trim()).filter(Boolean),
    }
    onUpdateProjects(prev => [...prev, newProject])
    setCreateForm({ title: '', description: '', budget: '', deadline: '', client: '', skills: '' })
    setShowCreate(false)
  }

  const columns = [
    { key: 'open' as const, label: 'Open', icon: FileText, color: 'text-[#18A878]', bg: 'bg-[#ECFBF5] border-[#18A878]/25' },
    { key: 'in-progress' as const, label: 'In Progress', icon: Play, color: 'text-[#3478F6]', bg: 'bg-[#EEF4FF] border-[#3478F6]/25' },
    { key: 'completed' as const, label: 'Completed', icon: CheckCircle, color: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF] border-[#6D3DF5]/25' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F1B3D]">Projects</h1>
          <p className="text-xs text-[#536078] mt-0.5">Manage development projects and track budgets.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 text-white gap-2 text-xs">
          <Plus className="w-3.5 h-3.5" /> Create Project
        </Button>
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Projects', value: stats.total, icon: FolderKanban, c: 'text-[#6D3DF5]' },
          { label: 'Open', value: stats.open, icon: FileText, c: 'text-[#18A878]' },
          { label: 'In Progress', value: stats.inProgress, icon: Play, c: 'text-[#3478F6]' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, c: 'text-[#6D3DF5]' },
          { label: 'Total Budget', value: `${(stats.totalBudget / 1000).toFixed(0)}K`, icon: Wallet, c: 'text-[#18A878]' },
        ].map(s => {
          const Ic = s.icon
          return (
            <div key={s.label} className="bg-white border border-[#E9E7F5] rounded-xl p-4 hover:border-[#6D3DF5]/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#536078]">{s.label}</span>
                <Ic className={cn('w-4 h-4', s.c)} />
              </div>
              <div className="text-lg font-bold text-[#0F1B3D] tabular-nums">{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-4">
        {columns.map(col => {
          const Ic = col.icon
          const items = projects.filter(p => p.status === col.key)
          return (
            <div key={col.key} className="rounded-xl border border-[#E9E7F5] bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', col.bg)}><Ic className={cn('w-3.5 h-3.5', col.color)} /></div>
                  <h3 className="text-sm font-semibold text-[#0F1B3D]">{col.label}</h3>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold', col.bg)}>{items.length}</span>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {items.map(p => (
                  <div key={p.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:bg-[#F8FAFC] transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-xs font-semibold text-[#0F1B3D] group-hover:text-[#6D3DF5] transition-colors">{p.title}</h4>
                      <span className="text-[9px] text-[#7A86A3]">${p.budget.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-[#7A86A3] line-clamp-1 mb-2">{p.description}</p>
                    <div className="flex items-center justify-between text-[9px] text-[#7A86A3]">
                      <span>{p.completedTasks}/{p.tasks} tasks</span>
                      <span>{p.client}</span>
                    </div>
                    {p.tasks > 0 && (
                      <div className="mt-2 h-1 rounded-full bg-[#E9E7F5] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6]" style={{ width: `${(p.completedTasks / p.tasks) * 100}%` }} />
                      </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-[11px] text-[#7A86A3]">No {col.label.toLowerCase()} projects</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-[#E9E7F5] bg-white overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-[#0F1B3D]">Create New Project</h2>
                  <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-full bg-[#F8FAFC] flex items-center justify-center hover:bg-[#EEF4FF]"><X className="w-3.5 h-3.5 text-[#536078]" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#536078] mb-1 block">Project Title *</label>
                    <Input value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Mobile App MVP" className="bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] text-xs placeholder:text-[#A6AFBF] focus:border-[#6D3DF5]/50" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#536078] mb-1 block">Description</label>
                    <Textarea value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief project overview..." rows={2} className="bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] text-xs placeholder:text-[#A6AFBF] focus:border-[#6D3DF5]/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#536078] mb-1 block">Budget ($)</label>
                      <Input type="number" value={createForm.budget} onChange={e => setCreateForm(p => ({ ...p, budget: e.target.value }))} placeholder="e.g., 50000" className="bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] text-xs placeholder:text-[#A6AFBF] focus:border-[#6D3DF5]/50" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#536078] mb-1 block">Deadline</label>
                      <Input type="date" value={createForm.deadline} onChange={e => setCreateForm(p => ({ ...p, deadline: e.target.value }))} className="bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] text-xs focus:border-[#6D3DF5]/50 [color-scheme:light]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#536078] mb-1 block">Client</label>
                      <Input value={createForm.client} onChange={e => setCreateForm(p => ({ ...p, client: e.target.value }))} placeholder="e.g., Product Team" className="bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] text-xs placeholder:text-[#A6AFBF] focus:border-[#6D3DF5]/50" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#536078] mb-1 block">Skills (comma-separated)</label>
                      <Input value={createForm.skills} onChange={e => setCreateForm(p => ({ ...p, skills: e.target.value }))} placeholder="e.g., React, Node.js" className="bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] text-xs placeholder:text-[#A6AFBF] focus:border-[#6D3DF5]/50" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleCreate} className="flex-1 bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 text-white gap-2">
                      <Plus className="w-4 h-4" /> Create Project
                    </Button>
                    <Button onClick={() => setShowCreate(false)} variant="outline" className="border-[#E9E7F5] text-[#536078] hover:text-[#0F1B3D]">Cancel</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   ────────────────  MARKETPLACE VIEW  ────────────────
   ═══════════════════════════════════════════════ */

function MarketplaceView({ gigs }: { gigs: Gig[] }) {
  const [filter, setFilter] = useState<'all' | 'my'>('all')
  const [category, setCategory] = useState('All')
  const [checkout, setCheckout] = useState<Gig | null>(null)
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN')
  const [favGigs, setFavGigs] = useState<Set<number>>(new Set())
  const toggleFavGig = (id: number) => setFavGigs(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const categories = ['All', ...Array.from(new Set(gigs.map(g => g.category)))]
  const filtered = filter === 'all' ? (category === 'All' ? gigs : gigs.filter(g => g.category === category)) : gigs

  const rate = currency === 'NGN' ? 1550 : 1
  const symbol = currency === 'NGN' ? '₦' : '$'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F1B3D]">Marketplace</h1>
          <p className="text-xs text-[#536078] mt-0.5">Digital assets, source code, and consulting services.</p>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 p-0.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
          {(['all', 'my'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize',
                filter === f ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-[#536078] hover:text-[#0F1B3D')}>
              {f === 'all' ? 'Services' : 'My Gigs'}
            </button>
          ))}
        </div>
        {filter === 'all' && (
          <div className="flex gap-1 p-0.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={cn('px-3 py-1.5 text-[11px] font-medium rounded-md transition-all',
                  category === c ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-[#536078] hover:text-[#0F1B3D')}>{c}</button>
            ))}
          </div>
        )}
      </div>

      {/* Gig Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((g, i) => (
          <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="group relative overflow-hidden rounded-xl border border-[#E9E7F5] bg-white hover:border-[#6D3DF5]/40 hover:shadow-xl hover:shadow-[#6D3DF5]/5 hover:-translate-y-0.5 transition-all duration-500 cursor-pointer">
            <div className="relative h-32 overflow-hidden">
              <img src={g.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[9px] font-semibold text-white border border-white/20">{g.category}</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-1 text-[10px] text-white/80"><Star className="w-3 h-3 text-amber-400" /><span>{g.rating}</span><span className="text-white/50">({g.sales})</span></div>
                <button onClick={(e) => { e.stopPropagation(); toggleFavGig(g.id) }} className="p-1 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"><Heart className={cn('w-3 h-3 transition-colors', favGigs.has(g.id) ? 'fill-amber-400 text-amber-400' : 'text-white/70 hover:text-amber-500')} /></button>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-xs font-semibold text-[#0F1B3D] leading-snug mb-1 group-hover:text-[#6D3DF5] transition-colors line-clamp-1">{g.title}</h3>
              <p className="text-[10px] text-[#536078] mb-2">by {g.creator}</p>
              <div className="flex flex-wrap gap-1 mb-2">{g.tech.map(t => <span key={t} className="px-1.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E9E7F5] text-[8px] font-medium text-[#7A86A3]">{t}</span>)}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0F1B3D]">{symbol}{(g.price * rate).toLocaleString()}</span>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); setCheckout(g) }}
                  className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 text-white text-[10px] h-7 px-3 gap-1">
                  <ShoppingBag className="w-3 h-3" /> Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Checkout Slide-over */}
      <AnimatePresence>
        {checkout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setCheckout(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-[#E9E7F5] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold text-[#0F1B3D]">Checkout</h2>
                  <button onClick={() => setCheckout(null)} className="w-7 h-7 rounded-full bg-[#F8FAFC] flex items-center justify-center hover:bg-[#EEF4FF]"><X className="w-3.5 h-3.5 text-[#536078]" /></button>
                </div>

                {/* Item Preview */}
                <div className="flex gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] mb-5">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <img src={checkout.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F1B3D]">{checkout.title}</h3>
                    <p className="text-[10px] text-[#536078]">by {checkout.creator}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px]"><Star className="w-3 h-3 text-amber-400" /><span className="text-[#0F1B3D]">{checkout.rating}</span><span className="text-[#7A86A3]">({checkout.sales} sold)</span></div>
                  </div>
                </div>

                {/* Currency Selector */}
                <div className="flex gap-2 p-1 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] w-fit mb-4">
                  {(['NGN', 'USD'] as const).map(c => (
                    <button key={c} onClick={() => setCurrency(c)}
                      className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all',
                        currency === c ? 'bg-[#6D3DF5] text-white' : 'text-[#536078] hover:text-[#0F1B3D')}>
                      {c === 'NGN' ? '₦ NGN' : '$ USD'}
                    </button>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between text-xs"><span className="text-[#536078]">Item price</span><span className="text-[#0F1B3D]">{symbol}{(checkout.price * rate).toLocaleString()}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-[#536078]">Platform fee (5%)</span><span className="text-[#0F1B3D]">{symbol}{(checkout.price * rate * 0.05).toLocaleString()}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-[#536078]">Tax (7.5%)</span><span className="text-[#0F1B3D]">{symbol}{(checkout.price * rate * 0.075).toLocaleString()}</span></div>
                  <hr className="border-[#E9E7F5]" />
                  <div className="flex items-center justify-between text-sm font-bold"><span className="text-[#0F1B3D]">Total</span><span className="text-[#6D3DF5]">{symbol}{(checkout.price * rate * 1.125).toLocaleString()}</span></div>
                </div>

                <Button className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 text-white gap-2 mb-2">
                  <ShoppingBag className="w-4 h-4" /> Complete Purchase
                </Button>
                <p className="text-[10px] text-[#7A86A3] text-center">Secure checkout powered by Learn2Earn Pay</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   ────────────────  JOBS VIEW  ────────────────
   ═══════════════════════════════════════════════ */

function JobsView({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  const types = ['All', ...Array.from(new Set(jobs.map(j => j.type)))]
  const filtered = useMemo(() => {
    let r = typeFilter === 'All' ? jobs : jobs.filter(j => j.type === typeFilter)
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.skills.some(s => s.toLowerCase().includes(q))) }
    return r
  }, [jobs, search, typeFilter])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F1B3D]">Job Listings</h1>
          <p className="text-xs text-[#536078] mt-0.5">Find your next opportunity.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E9E7F5] rounded-2xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536078] pointer-events-none" />
          <Input placeholder="Search jobs by title, company, or skills..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-[#F8FAFC] border-[#E9E7F5] text-[#0F1B3D] placeholder:text-[#A6AFBF] focus:border-[#6D3DF5]/50" />
        </div>
        {types.length > 1 && (
          <div className="flex gap-1 p-0.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] flex-wrap">
            {types.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn('px-3 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize',
                  typeFilter === t ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-[#536078] hover:text-[#0F1B3D')}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E9E7F5] flex items-center justify-center mb-4"><Briefcase className="w-7 h-7 text-[#7A86A3]" /></div>
          <h3 className="text-sm font-semibold text-[#0F1B3D]/70 mb-1">No jobs found</h3>
          <p className="text-xs text-[#536078]">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((j, i) => (
            <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:bg-[#F8FAFC] transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] flex items-center justify-center shrink-0 ring-1 ring-[#E9E7F5]">
                <Briefcase className="w-5 h-5 text-[#536078]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#0F1B3D] group-hover:text-[#6D3DF5] transition-colors">{j.title}</h3>
                <p className="text-xs text-[#536078] mt-0.5">{j.company} · {j.location}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#F3EEFF] border border-[#6D3DF5]/20 text-[10px] font-medium text-[#6D3DF5]">{j.type}</span>
                  {j.salary && <span className="text-[10px] font-medium text-[#18A878]">{j.salary}</span>}
                  {j.posted_at && <span className="text-[10px] text-[#7A86A3]">{j.posted_at}</span>}
                </div>
                {j.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {j.skills.slice(0, 4).map(s => <span key={s} className="px-1.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E9E7F5] text-[9px] font-medium text-[#7A86A3]">{s}</span>)}
                  </div>
                )}
              </div>
              <Button size="sm" className="shrink-0 bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 text-white text-[11px] font-semibold">
                Apply
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   ────────────  MAIN DASHBOARD PAGE  ────────────
   ═══════════════════════════════════════════════ */

export default function DashboardPage() {
  const { activeTab, setActiveTab } = useDashboard()
  const { user } = useAuth()
  
  // ---- State ----
  const [catalogue, setCatalogue] = useState<CatalogueCourse[]>([])
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [peers, setPeers] = useState<Peer[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [gigs, setGigs] = useState<Gig[]>([])
  const [activeEnrollments, setActiveEnrollments] = useState<CatalogueCourse[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [walletSummary, setWalletSummary] = useState({ balance: 0, earnings: 0, pending: 0 })

  const [dashboardStats, setDashboardStats] = useState({ totalCourses: 0, enrolledTracks: 0, completedCourses: 0, activeCohortMembers: 0 })
  
  const [loadingCatalogue, setLoadingCatalogue] = useState(true)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingPeers, setLoadingPeers] = useState(true)
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingGigs, setLoadingGigs] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingEnrollments, setLoadingEnrollments] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingWallet, setLoadingWallet] = useState(true)
  
  const [error, setError] = useState<string | null>(null)
  
  // ---- Fetch Functions ----
  const fetchCatalogue = useCallback(async () => {
    setLoadingCatalogue(true)
    try {
      const [coursesRes, enrolledRes] = await Promise.all([
        coursesAPI.getAll({ per_page: 50 }),
        coursesAPI.getEnrolled().catch(() => ({ data: { data: [] } })),
      ])
      const raw = coursesRes.data?.data?.data || coursesRes.data?.data || coursesRes.data || []
      const enrolledRaw = enrolledRes.data?.data?.data || enrolledRes.data?.data || enrolledRes.data || []
      const enrolledIds = new Set((Array.isArray(enrolledRaw) ? enrolledRaw : []).map((e: any) => e.course_id || e.id || e.course?.id).filter(Boolean))
      const list = (Array.isArray(raw) ? raw : []).map((item: any) => ({
        id: item.id,
        title: item.title || '',
        category: item.category || 'Development & Tech',
        level: item.level === 'beginner' ? 'Beginner' as const : item.level === 'advanced' ? 'Advanced' as const : 'Intermediate' as const,
        isEnrolled: enrolledIds.has(item.id),
        progress: 0,
        price: Number(item.price) || 0,
        image: item.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop',
        students: item.students_count || 0,
        duration: item.duration || '0h',
        lessons: item.lessons?.length || 0,
        instructor: item.instructor?.name || 'Instructor',
        tags: item.tags || [],
        rating: Number(item.rating) || 4.5,
        meeting_url: item.meeting_url || undefined,
      }))
      setCatalogue(list)
    } catch {
      setCatalogue(defaultCatalogue)
    } finally {
      setLoadingCatalogue(false)
    }
  }, [])
  
  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true)
    try {
      const res = await classesAPI.getAll()
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      const list = (Array.isArray(raw) ? raw : []).map((item: any) => ({
        id: item.id,
        title: item.title || '',
        instructor: item.instructor?.name || 'Instructor',
        date: item.date || '',
        time: item.time || '',
        duration: item.duration || '60 min',
        students: item.attendance_count || 0,
        status: item.status || 'upcoming',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop',
        description: item.description || '',
        meeting_url: item.meeting_url || '',
      }))
      setClasses(list)
    } catch {
      setClasses(defaultClasses)
    } finally {
      setLoadingClasses(false)
    }
  }, [])

  const fetchPeers = useCallback(async () => {
    setLoadingPeers(true)
    try {
      const res = await studentsAPI.getAll({ per_page: 200 })
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      const list = (Array.isArray(raw) ? raw : []).map((item: any, idx: number) => ({
        id: item.id || idx,
        name: item.name || 'Unknown',
        avatar: item.avatar || '',
        role: item.role || 'Student',
        enrolledCourses: item.enrolled_courses || 0,
        progress: item.average_progress || 0,
        status: item.status === 'active' ? 'active' as const : item.status === 'at-risk' ? 'at-risk' as const : 'inactive' as const,
        track: item.learning_track || item.bio || 'General',
        email: item.email || '',
        joined: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown',
        is_online: Boolean(item.is_online),
        student_id: item.student_id || null,
        mentor: item.mentor || null,
      }))
      setPeers(list)
    } catch {
      setPeers([])
    } finally {
      setLoadingPeers(false)
    }
  }, [])

  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true)
    try {
      const res = await api.get('/assignments')
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      const list = (Array.isArray(raw) ? raw : []).map((item: any) => ({
        id: item.id,
        title: item.title || '',
        course: item.course?.title || item.course_title || '',
        dueDate: item.due_date || '',
        status: (item.status === 'graded' ? 'graded'
          : item.status === 'submitted' || item.status === 'in_review' || item.status === 'pending' ? 'submitted'
          : Number(item.submissions_count) > 0 ? 'submitted'
          : 'active') as 'active' | 'submitted' | 'graded',
        grade: item.average_grade || undefined,
        totalPoints: item.total_points || item.max_score || 100,
        description: item.description || '',
        attachments: item.submissions_count || 0,
      }))
      setAssignments(list)
    } catch {
      setAssignments(defaultAssignments)
    } finally {
      setLoadingAssignments(false)
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true)
    try {
      const res = await projectsAPI.getAll()
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      const list = (Array.isArray(raw) ? raw : []).map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        status: item.status === 'completed' ? 'completed' as const : item.status === 'in-progress' || item.status === 'in_progress' ? 'in-progress' as const : item.status === 'cancelled' ? 'completed' as const : 'open' as const,
        budget: Number(item.budget) || 0,
        spent: Number(item.spent) || 0,
        tasks: item.tasks_count || 0,
        completedTasks: item.completed_tasks || 0,
        deadline: item.deadline || '',
        client: item.client?.name || item.client || 'Client',
        skills: Array.isArray(item.skills) ? item.skills : [],
      }))
      setProjects(list)
    } catch {
      setProjects(defaultProjects)
    } finally {
      setLoadingProjects(false)
    }
  }, [])

  const fetchGigs = useCallback(async () => {
    setLoadingGigs(true)
    try {
      const res = await servicesAPI.getAll()
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      const list = (Array.isArray(raw) ? raw : []).map((item: any) => ({
        id: item.id,
        title: item.title || '',
        creator: item.seller?.name || item.user?.name || 'Creator',
        price: Number(item.starting_price) || 0,
        category: item.category || 'General',
        sales: item.sales_count || 0,
        rating: item.average_rating || 0,
        image: (item.images && item.images.length > 0) ? item.images[0] : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop',
        tech: Array.isArray(item.skills) ? item.skills : [],
      }))
      setGigs(list)
    } catch {
      setGigs(defaultGigs)
    } finally {
      setLoadingGigs(false)
    }
  }, [])

  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await dashboardAPI.getStats()
      const d = res.data?.data || res.data || {}
      setDashboardStats({
        totalCourses: Number(d.total_courses) || 0,
        enrolledTracks: Number(d.enrolled_tracks) || 0,
        completedCourses: Number(d.completed_courses) || 0,
        activeCohortMembers: Number(d.active_cohort_members) || 0,
      })
    } catch {
      setDashboardStats({ totalCourses: catalogue.length, enrolledTracks: 0, completedCourses: 0, activeCohortMembers: peers.length })
    } finally {
      setLoadingStats(false)
    }
  }, [catalogue.length, peers.length])

  useEffect(() => {
    setDashboardStats(prev => ({
      ...prev,
      totalCourses: prev.totalCourses || catalogue.length,
      enrolledTracks: prev.enrolledTracks || activeEnrollments.length,
      activeCohortMembers: prev.activeCohortMembers || peers.length,
    }))
  }, [catalogue.length, activeEnrollments.length, peers.length])

  const fetchActiveEnrollments = useCallback(async () => {
    setLoadingEnrollments(true)
    try {
      const res = await enrollmentAPI.getActive()
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      const list = (Array.isArray(raw) ? raw : []).map((item: any) => ({
        id: item.course?.id || item.id,
        title: item.course?.title || item.title || '',
        category: item.course?.category || item.category || 'Development & Tech',
        level: (item.course?.level || item.level || 'intermediate') === 'beginner' ? 'Beginner' as const : (item.course?.level || item.level || 'intermediate') === 'advanced' ? 'Advanced' as const : 'Intermediate' as const,
        isEnrolled: true,
        progress: Number(item.progress) || 0,
        price: Number(item.course?.price || item.price) || 0,
        image: (item.course?.thumbnail || item.thumbnail) || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop',
        students: item.course?.students_count || item.students_count || 0,
        duration: item.course?.duration || item.duration || '0h',
        lessons: item.course?.lessons?.length || item.lessons_count || 0,
        instructor: item.course?.instructor?.name || item.instructor_name || 'Instructor',
        tags: item.course?.tags || item.tags || [],
        rating: Number(item.course?.rating || item.rating) || 4.5,
        meeting_url: item.course?.meeting_url || item.meeting_url || undefined,
      }))
      setActiveEnrollments(list)
    } catch {
      setActiveEnrollments([])
    } finally {
      setLoadingEnrollments(false)
    }
  }, [])

  const fetchRecentActivity = useCallback(async () => {
    setLoadingActivity(true)
    try {
      const res = await dashboardAPI.getRecentActivity()
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      setRecentActivity(Array.isArray(raw) ? raw.slice(0, 5).map((item: any, i: number) => ({
        id: item.id || i + 1,
        action: item.action || item.title || 'Activity',
        description: item.description || item.message || '',
        time: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now',
        icon: item.icon || ['CheckCircle', 'BookOpen', 'Award', 'Users', 'Star'][i % 5],
      })) : [])
    } catch {
      setRecentActivity([])
    } finally {
      setLoadingActivity(false)
    }
  }, [])

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true)
    try {
      const res = await jobsAPI.getAll()
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      setJobs(Array.isArray(raw) ? raw.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        company: item.company || item.employer || '',
        location: item.location || 'Remote',
        salary: item.salary || item.salary_range || '',
        type: item.type || item.job_type || 'Full-time',
        description: item.description || '',
        skills: typeof item.skills === 'string' ? (() => { try { return JSON.parse(item.skills) } catch { return [] } })() : (item.skills || []),
        posted_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      })) : [])
    } catch {
      setJobs([])
    } finally {
      setLoadingJobs(false)
    }
  }, [])

  const fetchWallet = useCallback(async () => {
    setLoadingWallet(true)
    try {
      const res = await walletAPI.getWallet()
      const d = res.data?.data || res.data || {}
      setWalletSummary({
        balance: Number(d.balance) || 0,
        earnings: Number(d.total_earnings) || Number(d.earnings) || 0,
        pending: Number(d.pending_earnings) || Number(d.pending) || 0,
      })
    } catch {
      setWalletSummary({ balance: 0, earnings: 0, pending: 0 })
    } finally {
      setLoadingWallet(false)
    }
  }, [])

  // ---- Fetch on mount ----
  useEffect(() => {
    fetchCatalogue()
    fetchClasses()
    fetchPeers()
    fetchAssignments()
    fetchProjects()
    fetchGigs()
    fetchDashboardStats()
    fetchActiveEnrollments()
    fetchRecentActivity()
    fetchJobs()
    fetchWallet()
  }, [fetchCatalogue, fetchClasses, fetchPeers, fetchAssignments, fetchProjects, fetchGigs, fetchDashboardStats, fetchActiveEnrollments, fetchRecentActivity, fetchJobs, fetchWallet])

  // Computed
  const isAnyLoading = loadingCatalogue || loadingClasses || loadingPeers || loadingAssignments || loadingProjects || loadingGigs || loadingStats || loadingEnrollments || loadingActivity || loadingJobs || loadingWallet

  // Refresh all
  const refreshAll = () => {
    fetchCatalogue()
    fetchClasses()
    fetchPeers()
    fetchAssignments()
    fetchProjects()
    fetchGigs()
    fetchDashboardStats()
    fetchActiveEnrollments()
    fetchRecentActivity()
    fetchJobs()
    fetchWallet()
    toast.success('Dashboard refreshed')
  }

  const deleteActivity = (id: number) => {
    setRecentActivity(prev => prev.filter(a => a.id !== id))
  }

  const renderView = () => {
    if (user?.role === 'student' && activeTab === 'dashboard') {
      return <StudentHomeDashboard userId={Number(user.id)} name={user.name} />
    }
    if (isAnyLoading) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-[#E9E7F5] rounded-xl p-5 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-[#E9E7F5] animate-pulse mb-3" />
                <div className="h-7 w-16 bg-[#EEF1F8] rounded animate-pulse mb-1.5" />
                <div className="h-3 w-28 bg-[#EEF1F8] rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="p-4 bg-white border border-[#E9E7F5] rounded-xl">
              <div className="h-4 w-32 bg-[#EEF1F8] rounded animate-pulse mb-4" />
              {[1,2,3].map(i => <div key={i} className="h-12 bg-[#EEF1F8] rounded animate-pulse mb-2" />)}
            </div>
            <div className="p-4 bg-white border border-[#E9E7F5] rounded-xl">
              <div className="h-4 w-32 bg-[#EEF1F8] rounded animate-pulse mb-4" />
              {[1,2,3].map(i => <div key={i} className="h-12 bg-[#EEF1F8] rounded animate-pulse mb-2" />)}
            </div>
          </div>
        </motion.div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome catalogue={catalogue} dashboardStats={dashboardStats} activeEnrollments={activeEnrollments} recentActivity={recentActivity} walletSummary={walletSummary} peers={peers} assignments={assignments} projects={projects} gigs={gigs} onTabSwitch={setActiveTab} onRefresh={refreshAll} onDeleteActivity={deleteActivity} />
      case 'courses':
        return <CoursesView catalogue={catalogue} onRefresh={refreshAll} />
      case 'classes':
        return <ClassesView />
      case 'students':
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users className="w-12 h-12 text-[#536078]/40 mb-4" />
            <h3 className="text-lg font-semibold text-[#0F1B3D] mb-1">Students Dashboard</h3>
            <p className="text-sm text-[#536078] mb-5 max-w-sm">Open the full student management page with progress rings, analytics, bulk actions and insights.</p>
            <button onClick={() => { window.location.href = '/dashboard/students' }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold hover:brightness-110 transition-colors shadow-lg shadow-[#6D3DF5]/20">Open Students Page</button>
          </div>
        )
      case 'assignments':
        return <AssignmentsView assignments={assignments} />
      case 'projects':
        return <ProjectsView projects={projects} onUpdateProjects={setProjects} />
      case 'marketplace':
        return <MarketplaceView gigs={gigs} />
      case 'jobs':
        return <JobsView jobs={jobs} />
      default:
        return <DashboardHome catalogue={catalogue} dashboardStats={dashboardStats} activeEnrollments={activeEnrollments} recentActivity={recentActivity} walletSummary={walletSummary} peers={peers} assignments={assignments} projects={projects} gigs={gigs} onTabSwitch={setActiveTab} onRefresh={refreshAll} onDeleteActivity={deleteActivity} />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  )
}
