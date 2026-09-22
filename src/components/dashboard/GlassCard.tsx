import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  gradient?: boolean
}

export function GlassCard({ className, hover = true, gradient = true, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        gradient
          ? 'bg-gradient-to-b from-[#0E2E1F] to-[#0A2418]'
          : 'bg-[#092B1B]/90',
        'border border-white/[0.07] rounded-xl shadow-lg',
        hover && 'transition-all duration-300 hover:border-[#FF8A36]/30 hover:bg-white/[0.02]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlassCardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between px-5 pt-5 pb-0', className)} {...props}>
      {children}
    </div>
  )
}

export function GlassCardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  )
}

export function GlassCardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[11px] text-slate-400 mt-0.5', className)} {...props}>
      {children}
    </p>
  )
}

export function GlassCardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}
