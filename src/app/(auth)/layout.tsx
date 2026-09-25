'use client'

import { LayoutGroup, MotionConfig } from 'framer-motion'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="auth-routes">
        <div className="relative min-h-screen overflow-hidden bg-white font-mona">
          {children}
        </div>
      </LayoutGroup>
    </MotionConfig>
  )
}
