import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-black/25 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500',
            'focus:outline-none focus:border-[#FF8A36] focus:ring-1 focus:ring-[#FF8A36] transition-all',
            icon ? 'pl-10 pr-4 py-2' : 'px-4 py-2',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
GlassInput.displayName = 'GlassInput'

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export function GlassSelect({ className, options, ...props }: GlassSelectProps) {
  return (
    <select
      className={cn(
        'w-full bg-black/25 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500',
        'focus:outline-none focus:border-[#FF8A36] focus:ring-1 focus:ring-[#FF8A36] transition-all',
        'px-4 py-2 appearance-none cursor-pointer',
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#0E2E1F] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  )
}
