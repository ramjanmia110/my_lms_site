'use client'

import { useState, useEffect } from 'react'
import { cn, getImageUrl } from '@/lib/utils'

interface ProfileAvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ringClassName?: string
}

const sizeMap = {
  xs: 'w-6 h-6 text-[8px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-20 h-20 text-xl',
}

const gradients = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
  'from-teal-500 to-emerald-600',
  'from-fuchsia-500 to-pink-600',
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function ProfileAvatar({ src, name, size = 'md', className, ringClassName }: ProfileAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const resolvedSrc = src ? getImageUrl(src) : ''
  const gradient = gradients[hashName(name || '') % gradients.length]

  useEffect(() => {
    setImgFailed(false)
  }, [resolvedSrc])

  const showImage = resolvedSrc && !imgFailed

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden shrink-0 flex items-center justify-center',
        sizeMap[size],
        !showImage && `bg-gradient-to-br ${gradient}`,
        ringClassName,
        className,
      )}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={name || ''}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="font-semibold text-white select-none leading-none">
          {getInitials(name)}
        </span>
      )}
    </div>
  )
}
