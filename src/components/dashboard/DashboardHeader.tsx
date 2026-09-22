'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, LogOut, ChevronDown, Settings, User, Loader2, Moon, Sun, CheckCheck, Mail } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { notificationsAPI, authAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { ProfileAvatar } from '@/components/ui/profile-avatar'

export function DashboardHeader() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setNotifLoading(true)
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsAPI.getAll(),
        notificationsAPI.getUnreadCount(),
      ])
      setNotifications(notifRes.data.notifications?.data || notifRes.data.notifications || [])
      setUnreadCount(countRes.data.count || 0)
    } catch { /* ignore */ } finally {
      setNotifLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications((prev: any[]) => prev.map((n: any) => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed to mark as read') }
  }

  const handleLogout = async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    logout()
    router.push('/login')
  }

  return (
    <header className="h-14 flex items-center justify-between px-5 gap-4 sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#E9E7F5]">
      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#536078]" />
          <input
            placeholder="Search courses, projects, people..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E9E7F5] rounded-xl text-xs text-[#0F1B3D] placeholder:text-[#A9B3C8] focus:outline-none focus:border-[#6D3DF5] focus:ring-1 focus:ring-[#6D3DF5]/20 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const q = (e.target as HTMLInputElement).value.trim()
                if (q) router.push(`/dashboard/courses?search=${encodeURIComponent(q)}`)
              }
            }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button className="bg-[#F8FAFC] border border-[#E9E7F5] text-[#536078] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] rounded-xl p-2.5 transition-all">
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="bg-[#F8FAFC] border border-[#E9E7F5] text-[#536078] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] rounded-xl p-2.5 transition-all relative"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6D3DF5] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E9E7F5] rounded-xl shadow-[0_16px_48px_-12px_rgba(15,27,61,0.18)] overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9E7F5]">
                <h3 className="text-xs font-semibold text-[#0F1B3D]">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[10px] text-[#6D3DF5] hover:text-[#5B2FE0]">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-[#536078]" /></div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-[#536078]">
                    <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-[#E9E7F5] hover:bg-[#F8FAFC] transition-colors cursor-pointer ${!notif.read_at ? 'bg-[#F3EEFF]/50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === 'message' ? 'bg-[#EEF4FF] text-[#3478F6]' :
                        notif.type === 'order' ? 'bg-[#ECFBF5] text-[#18A878]' :
                        notif.type === 'payment' ? 'bg-[#FEF5E7] text-[#F59E0B]' :
                        'bg-[#F3EEFF] text-[#6D3DF5]'
                      }`}>
                        {notif.type === 'message' ? <Mail className="w-3.5 h-3.5" /> :
                         notif.type === 'order' ? <CheckCheck className="w-3.5 h-3.5" /> :
                         <Bell className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#0F1B3D] truncate">{notif.title}</p>
                        <p className="text-[10px] text-[#536078] truncate">{notif.message}</p>
                        <p className="text-[10px] text-[#536078] mt-0.5">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notif.read_at && <span className="w-1.5 h-1.5 rounded-full bg-[#6D3DF5] shrink-0 mt-1.5" />}
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 10 && (
                <div className="px-4 py-2.5 border-t border-[#E9E7F5] text-center">
                  <button onClick={() => { setShowNotif(false); router.push('/dashboard/notifications') }} className="text-[10px] text-[#6D3DF5] hover:text-[#5B2FE0]">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2.5 border-l border-[#E9E7F5] hover:bg-[#F3EEFF]/60 rounded-lg py-1 pr-1.5 transition-colors"
          >
            <ProfileAvatar src={user?.avatar} name={user?.name || ''} size="xs" className="ring-1 ring-[#E9E7F5]" />
            <span className="text-xs text-[#0F1B3D] hidden sm:block">{user?.name}</span>
            <ChevronDown className="w-3 h-3 text-[#536078] hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-[#E9E7F5] rounded-xl shadow-[0_16px_48px_-12px_rgba(15,27,61,0.18)] overflow-hidden z-50">
              <div className="p-1.5">
                <button onClick={() => { setShowUserMenu(false); router.push('/dashboard/settings') }}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-[#F3EEFF] text-xs text-[#0F1B3D] hover:text-[#6D3DF5] transition-colors">
                  <User className="w-3.5 h-3.5 text-[#536078]" /> Profile Settings
                </button>
                <button onClick={() => { setShowUserMenu(false); router.push('/dashboard/settings') }}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-[#F3EEFF] text-xs text-[#0F1B3D] hover:text-[#6D3DF5] transition-colors">
                  <Settings className="w-3.5 h-3.5 text-[#536078]" /> Account Settings
                </button>
                <hr className="my-1 border-[#E9E7F5]" />
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-[#F3EEFF] text-xs text-[#6D3DF5] transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
