'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useSidebarStore } from '@/store/useSidebarStore'
import { useAuth } from '@/hooks/useAuth'
import { coursesAPI } from '@/lib/api'
import { Loader2, Lock, ArrowRight } from 'lucide-react'
import { DashboardContext, useDashboard, type DashboardTab } from '@/contexts/dashboard-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isOpen } = useSidebarStore()
  const { user, isLoading, isAuthenticated } = useAuth(true)
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard')
  const [enrollmentChecked, setEnrollmentChecked] = useState(false)
  const [noAccess, setNoAccess] = useState(false)

  useEffect(() => {
    if (isLoading) return
    // Only redirect away when the session is genuinely gone (interceptor wiped
    // the token after a rejected refresh). A transient me() error must not
    // bounce an authenticated user to /login.
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.push('/login')
      return
    }
    if (!user) return
    if (user.role !== 'student') { setEnrollmentChecked(true); return }

    let alive = true
    coursesAPI
      .getEnrolled()
      .then((r) => {
        const raw = r.data?.data ?? r.data
        const count = Array.isArray(raw) ? raw.length : Number(raw?.total ?? 0)
        if (alive && count === 0) setNoAccess(true)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setEnrollmentChecked(true)
      })
    return () => {
      alive = false
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || (!enrollmentChecked && user?.role === 'student')) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#6D3DF5]" />
      </div>
    )
  }

  if (noAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-[#F5F1FF] border border-[#E5E0F4] flex items-center justify-center mx-auto mb-6 shadow-[0_16px_40px_-16px_rgba(109,61,245,0.4)]">
            <Lock className="w-9 h-9 text-[#6D3DF5]" />
          </div>
          <h1 className="text-xl font-bold text-[#0F1B3D] mb-2">Your dashboard is locked</h1>
          <p className="text-sm text-[#536078] mb-6">
            The dashboard opens once you enroll in a course. Pick a course, complete the secure checkout steps, and your learning hub will be unlocked.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-[0_10px_24px_-10px_rgba(109,61,245,0.6)]"
          >
            Browse courses &amp; enroll
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="min-h-screen dashboard-root" style={{ backgroundColor: '#F8FAFC' }}>
        {/* Ultra-thin grid overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(15,27,61,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15,27,61,0.035) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 12% 12%, rgba(109,61,245,0.08), transparent 46%), radial-gradient(circle at 88% 20%, rgba(52,120,246,0.07), transparent 44%), radial-gradient(circle at 80% 90%, rgba(24,168,120,0.07), transparent 46%)' }} />
        <Sidebar />
        <div className="relative z-10 transition-all duration-300" style={{ marginLeft: isOpen ? 256 : 80 }}>
          <DashboardHeader />
          <main className="p-5 lg:p-6">{children}</main>
        </div>
      </div>
    </DashboardContext.Provider>
  )
}
