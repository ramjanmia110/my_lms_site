'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, BookOpen, Users, ClipboardList, FolderKanban,
  ShoppingBag, Brain, LogOut, GraduationCap, ChevronLeft, Briefcase, MessageSquare,
  Shield, CalendarDays, FileCheck, Wallet, UserRoundCheck,
  CalendarRange, ScrollText, Megaphone, Sparkles,
  ChevronDown, Layers, Wrench, PenSquare, FileEdit, LayoutGrid, Tag,
  GitBranch, BarChart3, FileText, CalendarClock,
  CreditCard, Repeat, Undo2, Ticket, Scale, Banknote,
  Webhook, Settings, Landmark, ShieldAlert, Link2, Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import { useSidebarStore } from '@/store/useSidebarStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useDashboard } from '@/contexts/dashboard-context'
import { authAPI, messagesAPI } from '@/lib/api'
import { Learn2EarnLogo } from '@/components/ui/logo'
import { useState as useReactState } from 'react'

const mainItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, tab: 'dashboard' as const },
  { label: 'Courses', icon: <BookOpen className="w-4 h-4" />, tab: 'courses' as const },
  { label: 'Classes', icon: <GraduationCap className="w-4 h-4" />, tab: 'classes' as const },
  { label: 'Students', icon: <Users className="w-4 h-4" />, tab: 'students' as const },
  { label: 'Assignments', icon: <ClipboardList className="w-4 h-4" />, tab: 'assignments' as const },
  { label: 'Projects', icon: <FolderKanban className="w-4 h-4" />, tab: 'projects' as const },
  { label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" />, tab: 'marketplace' as const },
  { label: 'Jobs', icon: <Briefcase className="w-4 h-4" />, tab: 'jobs' as const },
]

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  badge?: number
  className?: string
}

function NavLink({ href, icon, label, badge, className }: NavLinkProps) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')
  const { isOpen } = useSidebarStore()
  return (
    <Link
      href={href}
      title={!isOpen ? label : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group',
        !isOpen && 'justify-center px-2',
        active
          ? 'text-[#4A22BC] bg-white font-semibold shadow-md'
          : 'text-white/70 hover:text-white hover:bg-white/10',
        className,
      )}
    >
      <span className={cn('shrink-0 transition-colors', active ? 'text-[#4A22BC]' : 'text-white/70 group-hover:text-white')}>
        {icon}
      </span>
      {isOpen && <span className="truncate">{label}</span>}
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-[#FFD166] text-[#3A1A92] text-[9px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

interface CollapsibleSectionProps {
  label: string
  open: boolean
  onToggle: () => void
  links: { href: string; label: string; icon: React.ReactNode }[]
}

function CollapsibleSection({ label, open, onToggle, links }: CollapsibleSectionProps) {
  const { isOpen } = useSidebarStore()
  return (
    <div className="space-y-0.5 mb-3">
      <button
        onClick={onToggle}
        title={!isOpen ? label : undefined}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-semibold text-white/50 uppercase tracking-widest hover:text-white transition-colors',
          !isOpen && 'justify-center px-2'
        )}
      >
        {isOpen && <span>{label}</span>}
        <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'ml-auto', !isOpen && 'mx-auto', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pt-1">
              {links.map(link => (
                <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggle } = useSidebarStore()
  const { user, logout } = useAuthStore()
  const { activeTab, setActiveTab } = useDashboard()
  const isDashboardRoot = pathname === '/dashboard'
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [managementOpen, setManagementOpen] = useReactState(true)
  const [financeOpen, setFinanceOpen] = useReactState(true)
  const [financeAdvancedOpen, setFinanceAdvancedOpen] = useReactState(false)
  const [toolsOpen, setToolsOpen] = useReactState(true)
  const [blogOpen, setBlogOpen] = useReactState(true)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await messagesAPI.getConversations()
        if (res.data?.status === 'success') {
          const convs: any[] = res.data.conversations || []
          setUnreadMessages(convs.reduce((sum, c) => sum + (c.unread_count || 0), 0))
        }
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    logout()
    router.push('/login')
  }

  const isActive = (tab: string) => {
    if (tab === 'classes' && pathname.startsWith('/dashboard/classes')) return true
    if (tab === 'students' && pathname.startsWith('/dashboard/students')) return true
    if (isDashboardRoot) return activeTab === tab
    return false
  }

  const handleNav = (tab: string) => {
    if (tab === 'classes') {
      router.push('/dashboard/classes')
      return
    }
    if (tab === 'students') {
      router.push('/dashboard/students')
      return
    }
    if (pathname !== '/dashboard') {
      router.push('/dashboard')
    }
    setActiveTab(tab as any)
  }

  const managementLinks = [
    { href: '/dashboard/teachers', label: 'Teachers', icon: <Shield className="w-4 h-4" /> },
    { href: '/dashboard/modules', label: 'Modules', icon: <Layers className="w-4 h-4" /> },
    { href: '/dashboard/examinations', label: 'Examinations', icon: <FileCheck className="w-4 h-4" /> },
    { href: '/dashboard/fees', label: 'Fees Collection', icon: <Wallet className="w-4 h-4" /> },
    { href: '/dashboard/attendance', label: 'Attendance', icon: <UserRoundCheck className="w-4 h-4" /> },
    { href: '/dashboard/leaves', label: 'Leaves', icon: <CalendarRange className="w-4 h-4" /> },
    { href: '/dashboard/certificate', label: 'Certificate', icon: <ScrollText className="w-4 h-4" /> },
    { href: '/dashboard/notice-board', label: 'Notice Board', icon: <Megaphone className="w-4 h-4" /> },
    { href: '/dashboard/events', label: 'Events', icon: <Sparkles className="w-4 h-4" /> },
  ]

  const financeLinks = [
    { href: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/admin/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { href: '/admin/orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { href: '/admin/transactions', label: 'Transactions', icon: <Repeat className="w-4 h-4" /> },
    { href: '/admin/refunds', label: 'Refunds', icon: <Undo2 className="w-4 h-4" /> },
    { href: '/admin/invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
    { href: '/admin/gateways', label: 'Payment Gateways', icon: <CreditCard className="w-4 h-4" /> },
    { href: '/admin/earnings', label: 'Instructor Earnings', icon: <Wallet className="w-4 h-4" /> },
    { href: '/admin/payouts', label: 'Payouts', icon: <Banknote className="w-4 h-4" /> },
    { href: '/admin/disputes', label: 'Disputes', icon: <ShieldAlert className="w-4 h-4" /> },
  ]

  const salesLinks = [
    { href: '/admin/coupons', label: 'Coupons', icon: <Ticket className="w-4 h-4" /> },
    { href: '/admin/payment-links', label: 'Payment Links', icon: <Link2 className="w-4 h-4" /> },
  ]

  const analyticsLinks = [
    { href: '/admin/revenue', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ]

  const advancedLinks = [
    { href: '/admin/webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
    { href: '/admin/reconciliation', label: 'Reconciliation', icon: <Scale className="w-4 h-4" /> },
    { href: '/admin/settlements', label: 'Settlements', icon: <Landmark className="w-4 h-4" /> },
    { href: '/admin/logs', label: 'Logs & Audit', icon: <ScrollText className="w-4 h-4" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  const notificationItem = { href: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> }

  const toolsLinks = [
    { href: '/dashboard/tools', label: 'All Tools', icon: <Wrench className="w-4 h-4" /> },
    { href: '/dashboard/tools/new', label: 'New Tool', icon: <PenSquare className="w-4 h-4" /> },
    { href: '/dashboard/tools/drafts', label: 'Drafts', icon: <FileEdit className="w-4 h-4" /> },
    { href: '/dashboard/tools/published', label: 'Published', icon: <FileCheck className="w-4 h-4" /> },
    { href: '/dashboard/tools/categories', label: 'Categories', icon: <LayoutGrid className="w-4 h-4" /> },
    { href: '/dashboard/tools/tags', label: 'Tags', icon: <Tag className="w-4 h-4" /> },
    { href: '/dashboard/tools/versions', label: 'Versions', icon: <GitBranch className="w-4 h-4" /> },
    { href: '/dashboard/tools/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ]

  const blogLinks = [
    { href: '/dashboard/blog', label: 'All Posts', icon: <FileText className="w-4 h-4" /> },
    { href: '/dashboard/blog/new', label: 'New Post', icon: <PenSquare className="w-4 h-4" /> },
    { href: '/dashboard/blog/drafts', label: 'Drafts', icon: <FileEdit className="w-4 h-4" /> },
    { href: '/dashboard/blog/scheduled', label: 'Scheduled', icon: <CalendarClock className="w-4 h-4" /> },
    { href: '/dashboard/blog/published', label: 'Published', icon: <FileCheck className="w-4 h-4" /> },
    { href: '/dashboard/blog/categories', label: 'Categories', icon: <LayoutGrid className="w-4 h-4" /> },
    { href: '/dashboard/blog/tags', label: 'Tags', icon: <Tag className="w-4 h-4" /> },
    { href: '/dashboard/blog/authors', label: 'Authors', icon: <Users className="w-4 h-4" /> },
    { href: '/dashboard/blog/revisions', label: 'Revisions', icon: <GitBranch className="w-4 h-4" /> },
    { href: '/dashboard/blog/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ]

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        initial={{ width: isOpen ? 256 : 80 }}
        animate={{ width: isOpen ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full z-40 flex flex-col backdrop-blur-md border-r border-[#2F1380] shadow-[8px_0_32px_-16px_rgba(35,12,92,0.6)]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% -12%, rgba(255,255,255,0.12), transparent 40%),
            radial-gradient(circle at 95% 100%, rgba(0,0,0,0.18), transparent 45%),
            linear-gradient(180deg, #5B2FE0 0%, #4A22BC 38%, #37198F 72%, #2A1070 100%)
          `,
        }}
      >
        {/* Branding */}
        <div className="flex items-center h-14 px-4 border-b border-white/10">
          <button onClick={() => { setActiveTab('dashboard'); if (pathname !== '/dashboard') router.push('/dashboard') }} className="flex items-center min-w-0">
            <Learn2EarnLogo variant="white" size={isOpen ? 'sm' : 'xs'} />
          </button>
          <button
            onClick={toggle}
            className="ml-auto shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform', !isOpen && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
          {/* Top fade overlay */}
          <div className="sticky top-0 h-1 bg-gradient-to-b from-[#5B2FE0]/90 to-transparent pointer-events-none z-10" />
          {/* Main items */}
          <div className="space-y-0.5 mb-3">
            {isOpen && (
              <p className="px-4 pb-1 text-[9px] font-semibold text-white/50 uppercase tracking-widest">Main</p>
            )}
            {mainItems.map((item) => {
              const active = isActive(item.tab)
              return (
                <button
                  key={item.tab}
                  onClick={() => handleNav(item.tab)}
                  title={!isOpen ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group text-left',
                    !isOpen && 'justify-center px-2',
                    active
                      ? 'text-[#4A22BC] bg-white font-semibold shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <span className={cn('shrink-0 transition-colors', active ? 'text-[#4A22BC]' : 'text-white/70 group-hover:text-white')}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="truncate">{item.label}</span>}
                </button>
              )
            })}
          </div>

          {/* Management */}
          <div className="space-y-0.5 mb-3">
            <button
              onClick={() => setManagementOpen(!managementOpen)}
              title={!isOpen ? 'Management' : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-semibold text-white/50 uppercase tracking-widest hover:text-white transition-colors',
                !isOpen && 'justify-center px-2'
              )}
            >
              {isOpen && <span>Management</span>}
              <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'ml-auto', !isOpen && 'mx-auto', managementOpen && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {managementOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 pt-1">
                    {managementLinks.map(link => (
                      <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Finance & Commerce */}
          <div className="space-y-0.5 mb-3">
            <button
              onClick={() => setFinanceOpen(!financeOpen)}
              title={!isOpen ? 'Finance & Commerce' : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-semibold text-white/50 uppercase tracking-widest hover:text-white transition-colors',
                !isOpen && 'justify-center px-2'
              )}
            >
              {isOpen && <span>Finance &amp; Commerce</span>}
              <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'ml-auto', !isOpen && 'mx-auto', financeOpen && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {financeOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 pt-1">
                    {isOpen && (
                      <p className="px-4 pb-1 pt-2 text-[9px] font-semibold text-white/45 uppercase tracking-widest">Finance &amp; Commerce</p>
                    )}
                    {financeLinks.map(link => (
                      <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label} />
                    ))}

                    {isOpen && (
                      <p className="px-4 pb-1 pt-3 text-[9px] font-semibold text-white/45 uppercase tracking-widest">Sales &amp; Promotion</p>
                    )}
                    {salesLinks.map(link => (
                      <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label} />
                    ))}

                    {isOpen && (
                      <p className="px-4 pb-1 pt-3 text-[9px] font-semibold text-white/45 uppercase tracking-widest">Analytics</p>
                    )}
                    {analyticsLinks.map(link => (
                      <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label} />
                    ))}

                    {/* Advanced Finance (collapsible) */}
                    <div className="space-y-0.5 pt-2">
                      <button
                        onClick={() => setFinanceAdvancedOpen(!financeAdvancedOpen)}
                        title={!isOpen ? 'Advanced Finance' : undefined}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[9px] font-semibold text-white/45 uppercase tracking-widest hover:text-white transition-colors',
                          !isOpen && 'justify-center px-2'
                        )}
                      >
                        {isOpen && <span>Advanced Finance</span>}
                        <ChevronDown
                          className={cn('w-3 h-3 transition-transform', isOpen && 'ml-auto', !isOpen && 'mx-auto', financeAdvancedOpen && 'rotate-180')}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {financeAdvancedOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-0.5 pt-1">
                              {advancedLinks.map(link => (
                                <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="my-3 border-t border-white/10" />
                    {isOpen && (
                      <p className="px-4 pb-1 pt-1 text-[9px] font-semibold text-white/45 uppercase tracking-widest">Alerts</p>
                    )}
                    <NavLink href={notificationItem.href} icon={notificationItem.icon} label={notificationItem.label} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tools */}
          <CollapsibleSection
            label="Tools"
            open={toolsOpen}
            onToggle={() => setToolsOpen(!toolsOpen)}
            links={toolsLinks}
          />

          {/* Blog */}
          <CollapsibleSection
            label="Blog"
            open={blogOpen}
            onToggle={() => setBlogOpen(!blogOpen)}
            links={blogLinks}
          />

          {/* Separator */}
          <div className="my-3 border-t border-white/10" />

          {/* AI Studio */}
          <div className="space-y-0.5">
            {isOpen && (
              <p className="px-4 pb-1 text-[9px] font-semibold text-white/50 uppercase tracking-widest">Tools</p>
            )}
            <Link
              href="/dashboard/ai-studio"
              title={!isOpen ? 'AI Studio' : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group',
                !isOpen && 'justify-center px-2',
                pathname.startsWith('/dashboard/ai-studio')
                  ? 'text-[#4A22BC] bg-white font-semibold shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <span className="shrink-0 text-white/70 group-hover:text-white">
                <Brain className="w-4 h-4" />
              </span>
              {isOpen && <span>AI Studio</span>}
            </Link>
            {/* Messages */}
            <Link
              href="/dashboard/messages"
              title={!isOpen ? 'Messages' : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative',
                !isOpen && 'justify-center px-2',
                pathname === '/dashboard/messages'
                  ? 'text-[#4A22BC] bg-white font-semibold shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <span className="shrink-0 text-white/70 group-hover:text-white">
                <MessageSquare className="w-4 h-4" />
              </span>
              {isOpen && <span>Messages</span>}
              {unreadMessages > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-[#FFD166] text-[#3A1A92] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>
          </div>
          {/* Bottom fade overlay */}
          <div className="sticky bottom-0 h-1 bg-gradient-to-t from-[#2A1070]/90 to-transparent pointer-events-none z-10" />
        </nav>

        {/* Profile Anchor */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <ProfileAvatar src={user?.avatar} name={user?.name || ''} size="sm" className="ring-1 ring-white/20" />
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-white/60 truncate capitalize">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={handleLogout}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-[#FFD166] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
