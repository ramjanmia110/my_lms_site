'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScrollToTopProps {
  className?: string
  threshold?: number
}

const SIZE = 48
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ScrollToTop({ className, threshold = 200 }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
      setVisible(window.scrollY > threshold)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const dash = progress * CIRCUMFERENCE

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[100] pointer-events-none',
        className
      )}
    >
      <AnimatePresence>
        {visible && (
          <motion.button
            key="scroll-to-top"
            type="button"
            aria-label="Scroll to top"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={scrollToTop}
            className="group pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#1A453B]/10 shadow-md shadow-[#1A453B]/10 transition-shadow hover:shadow-lg hover:shadow-[#E07B22]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07B22]/50 focus-visible:ring-offset-2"
          >
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              fill="none"
            >
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="#F8E1CC"
                strokeWidth={STROKE}
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="#E07B22"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE - dash}
                className="transition-[stroke-dashoffset] duration-100 ease-linear"
              />
            </svg>
            <ArrowUp className="h-[22px] w-[22px] text-[#E07B22] transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.6} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}