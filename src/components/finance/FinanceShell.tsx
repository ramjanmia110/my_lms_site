'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/** Content gate for FINANCE & COMMERCE admin pages.
 *  The sidebar/header/background shell is provided by /admin/layout.tsx; this
 *  component only gates the inner content: unauthenticated → loading spinner +
 *  redirect to login; authenticated non-admin → 403 "Access denied". */
export function FinanceShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname + window.location.search))
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
      </div>
    )
  }

  if (user?.role !== 'admin') {
    const who = user ? `${user.email} (role: ${user.role})` : 'unknown account'
    return (
      <div className="flex items-center justify-center py-24 p-4">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-[#E11D48] mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#0F1B3D] mb-1">Access denied</h2>
          <p className="text-xs text-[#536078]">You do not have permission to access this page.</p>
          <p className="text-[11px] text-[#A9B3C8] mt-3">Signed in as {who}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
