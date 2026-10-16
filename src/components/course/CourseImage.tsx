'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseImageProps {
  src?: string | null
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

export function CourseImage({ src, alt, className, sizes = '(max-width: 768px) 100vw, 50vw', priority }: CourseImageProps) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return (
    <>
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', className)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1F4D3A] via-[#2d6a50] to-[#1F4D3A] text-white/40',
            className,
          )}
          aria-hidden="true"
        >
          <ImageIcon className="h-10 w-10" />
        </div>
      )}
    </>
  )
}
