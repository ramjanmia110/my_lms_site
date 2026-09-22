'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface GlassTabsProps {
  tabs: { value: string; label: string; count?: number }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function GlassTabs({ tabs, value, onChange, className }: GlassTabsProps) {
  return (
    <div className={cn('flex items-center gap-1 bg-black/20 border border-white/[0.06] rounded-xl p-1 w-fit', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
            value === tab.value
              ? 'text-white'
              : 'text-slate-400 hover:text-white'
          )}
        >
          {value === tab.value && (
            <motion.div
              layoutId="glassTab"
              className="absolute inset-0 bg-white/10 border border-white/[0.06] rounded-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                value === tab.value ? 'bg-[#FF8A36]/20 text-[#FF8A36]' : 'bg-white/10 text-slate-400'
              )}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
