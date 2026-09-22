'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScrollToTopProps {
  className?: string
  threshold?: number
}

export function ScrollToTop({ className, threshold = 400 }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      const atFooter =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 450
      setVisible(window.scrollY > threshold && !atFooter)
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

  return (
    <div
      className={cn(
        'fixed bottom-6 inset-x-0 md:inset-x-auto md:right-8 z-[100]',
        'flex justify-center md:justify-end pointer-events-none',
        className
      )}
    >
      <AnimatePresence>
        {visible && (
          <motion.button
            key="scroll-to-top"
            type="button"
            aria-label="Scroll to top"
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.85 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="pointer-events-auto flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-[#6D3DF5] bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] text-white shadow-md shadow-[#6D3DF5]/30 transition-all duration-300 hover:from-[#7C3AED] hover:to-[#A78BFA] hover:shadow-lg hover:shadow-[#6D3DF5]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]/60 focus-visible:ring-offset-2"
          >
            <ChevronUp className="h-[22px] w-[22px] md:h-6 md:w-6" strokeWidth={2.2} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}