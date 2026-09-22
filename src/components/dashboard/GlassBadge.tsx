import { cn } from '@/lib/utils'

interface GlassBadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: React.ReactNode
  className?: string
}

const badgeStyles = {
  success: 'bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]',
  warning: 'bg-[#FF8A36]/10 border border-[#FF8A36]/20 text-[#FF8A36]',
  danger: 'bg-red-500/10 border border-red-500/20 text-red-400',
  info: 'bg-blue-500/10 border border-blue-500/20 text-blue-400',
  neutral: 'bg-white/5 border border-white/10 text-slate-400',
}

export function GlassBadge({ variant = 'neutral', children, className }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0',
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

interface GlassProgressProps {
  value: number
  className?: string
  barClassName?: string
}

export function GlassProgress({ value, className, barClassName }: GlassProgressProps) {
  return (
    <div className={cn('w-full h-1.5 bg-black/40 rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-[#FF8A36] to-[#FFA364] transition-all duration-500',
          barClassName
        )}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}

interface GlassAvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GlassAvatar({ src, name, size = 'sm', className }: GlassAvatarProps) {
  const sizeClasses = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' }
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div
      className={cn(
        'rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 ring-1 ring-white/[0.08] overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-slate-300">{initials}</span>
      )}
    </div>
  )
}
