'use client'

import { cn } from '@/lib/utils'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const COLORS = [
  'from-[#6D3DF5] to-[#3478F6]',
  'from-[#18A878] to-[#3478F6]',
  'from-[#F59E0B] to-[#EF4444]',
  'from-[#EC4899] to-[#8B5CF6]',
  'from-[#06B6D4] to-[#3B82F6]',
  'from-[#10B981] to-[#059669]',
  'from-[#F97316] to-[#DC2626]',
  'from-[#8B5CF6] to-[#EC4899]',
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function AuthorAvatar({
  name,
  avatar,
  size = 'md',
  className,
}: {
  name: string
  avatar?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-lg',
  }

  if (avatar) {
    return (
      <div className={cn('rounded-full overflow-hidden shrink-0', sizeClasses[size], className)}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br',
        getColor(name),
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
