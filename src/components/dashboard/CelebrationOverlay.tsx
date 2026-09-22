'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, GraduationCap, Sparkles, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CelebrationOverlayProps {
  courseTitle?: string
  onDismiss: () => void
}

interface ConfettiParticle {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  delay: number
}

const CONFETTI_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-pink-500', 'bg-sky-500', 'bg-rose-500', 'bg-teal-500',
]

export default function CelebrationOverlay({ courseTitle, onDismiss }: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(true)
  const [particles, setParticles] = useState<ConfettiParticle[]>([])

  useEffect(() => {
    const generated: ConfettiParticle[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotation: Math.random() * 360,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 4 + Math.random() * 6,
      delay: Math.random() * 0.8,
    }))
    setParticles(generated)

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleDismiss} />

          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className={cn('absolute rounded-sm', p.color)}
                style={{
                  left: `${p.x}%`,
                  width: p.size,
                  height: p.size * 1.5,
                }}
                initial={{ y: p.y, rotate: 0, opacity: 1 }}
                animate={{
                  y: '110vh',
                  rotate: p.rotation,
                  opacity: [1, 1, 0.8, 0],
                }}
                transition={{
                  duration: 2.5 + Math.random() * 2,
                  delay: p.delay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  repeat: Infinity,
                  repeatDelay: 3 + Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Celebration Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
            className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full p-8 text-center z-10"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 rounded-t-2xl" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.35 }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200">
                <Award className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome Aboard!</h2>
              <p className="text-sm text-slate-500 mb-1">
                You&apos;re now enrolled in
              </p>
              <p className="text-sm font-semibold text-indigo-700 mb-4">
                {courseTitle || 'your creative track'}
              </p>

              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 rounded-full px-3 py-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Enrolled</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 rounded-full px-3 py-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Active</span>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-indigo-200"
              >
                <GraduationCap className="w-4 h-4" /> Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
