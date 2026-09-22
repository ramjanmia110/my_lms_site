'use client'

import { Sparkles, Star, ArrowRight, Users } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import { SectionCard, SectionHeader, EmptyState } from './shared'
import type { Recommendation } from './types'

export function RecommendedCourses({
  recommendations,
  onOpen,
}: {
  recommendations: Recommendation[]
  onOpen?: (r: Recommendation) => void
}) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <SectionCard className="p-4">
      <SectionHeader icon={Sparkles} title="Recommended For You" subtitle="Courses matched to your skills & interests" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {recommendations.slice(0, 3).map((r) => (
          <div
            key={r.id}
            onClick={() => onOpen?.(r)}
            className="group rounded-xl border border-[#E9E7F5] bg-white overflow-hidden hover:border-[#6D3DF5]/40 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <div className="h-24 relative bg-gradient-to-br from-[#6D3DF5] to-[#3478F6]">
              {r.slug ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getImageUrl(r.slug + '.png')} alt={r.title} className="object-cover w-full h-full" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span className="text-[10px] font-bold text-white">{r.rating ?? 0}</span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-[#0F1B3D] leading-snug line-clamp-2">{r.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-[#536078]">
                  <Users className="w-3 h-3" /> {r.students_count ?? 0}
                </span>
                {r.level && (
                  <span className="text-[9px] font-semibold text-[#6D3DF5] bg-[#F3EEFF] border border-[#6D3DF5]/15 rounded-full px-2 py-0.5">{r.level}</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[9px] text-[#536078] truncate flex-1 mr-2">{r.reasons?.[0] ?? 'Popular among students'}</span>
                <button className="flex items-center gap-1 text-[10px] font-bold text-[#6D3DF5] group-hover:gap-1.5 transition-all shrink-0">
                  View <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}