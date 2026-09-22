'use client'
import { X, Star, BookOpen } from 'lucide-react'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import type { Class } from '@/types'

interface BioModalProps { classItem: Class | null; onClose: () => void }

export function BioModal({ classItem: cls, onClose }: BioModalProps) {
  if (!cls) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-[#0d251c] border border-[#1f6f52] rounded-2xl p-6 w-[320px]">
        <div className="flex items-start justify-between">
          <ProfileAvatar src={cls.instructor?.avatar || null} name={cls.instructor?.name || 'Instructor'} size="lg" />
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer" style={{ color: '#8fae9f' }}>
            <X size={18} />
          </button>
        </div>
        <div className="text-lg font-bold text-white mt-3">{cls.instructor?.name || 'Instructor'}</div>
        <div className="text-xs mt-1" style={{ color: '#8fae9f' }}>
          {cls.category || 'Subject'} instructor
        </div>
        {cls.instructor?.bio && (
          <div className="text-sm mt-3 leading-relaxed" style={{ color: '#a9c9bb', lineHeight: 1.6 }}>
            {cls.instructor.bio}
          </div>
        )}
        {cls.rating !== undefined && cls.rating !== null && cls.rating > 0 && (
          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={14} color="#facc15" fill={i <= Math.round(cls.rating!) ? '#facc15' : 'none'} />
            ))}
            <span className="text-xs ml-1" style={{ color: '#facc15' }}>{cls.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: '#8fae9f' }}>
          <BookOpen size={12} /> {cls.category || 'Live'} instructor
        </div>
      </div>
    </div>
  )
}
