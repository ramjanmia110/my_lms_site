'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'default' | 'white' | 'dark'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showText?: boolean
  animated?: boolean
  className?: string
}

const sizes = {
  xs: 'h-3 w-auto',
  sm: 'h-7 w-auto',
  md: 'h-9 w-auto',
  lg: 'h-11 w-auto',
}

export function Learn2EarnLogo({ variant = 'default', size = 'md', animated = false, className }: LogoProps) {
  const image = (
    <Image
      src="/learn2earn-logo.png"
      alt="Learn2Earn"
      width={500}
      height={158}
      className={cn(sizes[size], 'object-contain drop-shadow-sm', className)}
    />
  )

  const logo = variant === 'white' ? (
    <span className={cn('inline-flex items-center justify-center rounded-lg bg-white shadow-md', size === 'xs' ? 'px-1.5 py-1' : 'px-2 py-1.5', className)}>
      {image}
    </span>
  ) : (
    image
  )

  if (animated) {
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <motion.div whileHover={{ rotate: 2, scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
          {logo}
        </motion.div>
      </motion.div>
    )
  }

  return logo
}