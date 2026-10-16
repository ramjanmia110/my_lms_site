import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarsProps {
  rating: number
  className?: string
  size?: number
}

export function Stars({ rating, className, size = 14 }: StarsProps) {
  const rounded = Math.round(rating * 2) / 2
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          width={size}
          height={size}
          className={
            i <= rounded
              ? 'fill-[#E07B22] text-[#E07B22]'
              : i - 0.5 === rounded
                ? 'fill-[#E07B22]/50 text-[#E07B22]'
                : 'fill-[#E5E7EB] text-[#E5E7EB]'
          }
        />
      ))}
    </span>
  )
}
