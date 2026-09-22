'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useSidebarStore } from '@/store/useSidebarStore'
import { useAuth } from '@/hooks/useAuth'
import { DashboardContext, type DashboardTab } from '@/contexts/dashboard-context'

/** Shared shell for the FINANCE & COMMERCE admin pages.
 *  Mounts the standard dashboard Sidebar + header so every /admin page is a
 *  first-class nav citizen with a working sidebar, menu and header. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isOpen } = useSidebarStore()
  const { user, isLoading, isAuthenticated } = useAuth(false)
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname + window.location.search))
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#6D3DF5]" />
      </div>
    )
  }

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="min-h-screen dashboard-root" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#F3EEFF] blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-[#EEF4FF] blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[360px] h-[360px] rounded-full bg-[#ECFBF5] blur-3xl" />
        </div>
        <Sidebar />
        <div className="relative z-10 transition-all duration-300" style={{ marginLeft: isOpen ? 256 : 80 }}>
          <DashboardHeader />
          <main className="p-5 lg:p-6">{children}</main>
        </div>
      </div>
    </DashboardContext.Provider>
  )
}
