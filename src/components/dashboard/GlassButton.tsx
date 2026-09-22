import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary: 'bg-[#FF8A36] hover:bg-[#E07328] text-white',
      secondary: 'bg-white/[0.04] border border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.08]',
      ghost: 'text-slate-400 hover:text-white hover:bg-white/[0.04]',
      danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
    }

    const sizes = {
      sm: 'text-[10px] px-2.5 py-1.5',
      md: 'text-xs px-4 py-2',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
GlassButton.displayName = 'GlassButton'
