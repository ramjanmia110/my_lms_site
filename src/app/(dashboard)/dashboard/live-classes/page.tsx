'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LiveClassesRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/classes')
  }, [router])
  return (
    <div className="flex items-center justify-center min-h-[50vh]" style={{ color: '#8fae9f' }}>
      <p className="text-sm">Redirecting to classes...</p>
    </div>
  )
}
