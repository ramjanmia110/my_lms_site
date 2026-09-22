'use client'

import { Play, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBar, SectionCard, SectionHeader } from './shared'
import type { StudentCourse } from './types'

export function pickContinueCourse(courses: StudentCourse[], enrolledCourseId?: number | string): StudentCourse | null {
  const eligible = courses.filter((c) => !c.completed && c.progress > 0 && c.progress < 100)
  if (eligible.length === 0) return null
  return eligible.sort((a, b) => b.progress - a.progress)[0]
}

export function ContinueLearning({ courses, onContinue }: { courses: StudentCourse[]; onContinue?: (course: StudentCourse) => void }) {
  const course = pickContinueCourse(courses)
  if (!course) return null

  return (
    <SectionCard className="p-4">
      <SectionHeader icon={Play} title="Continue Learning" subtitle="Resume from your last lesson" />
      <div className="mt-4 rounded-xl overflow-hidden relative">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnail} alt={course.title} className="object-cover h-32 w-full" />
        ) : (
          <div className="h-32 w-full bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center">
            <Play className="w-8 h-8 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          <p className="text-[11px] text-white/90 font-medium mb-0.5">{course.current_lesson ?? 'Next up in your course'}</p>
          <p className="text-sm font-semibold text-white leading-tight">{course.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1">
              <ProgressBar value={course.progress} className="bg-white/25" />
            </div>
            <span className="text-[11px] font-bold text-white">{course.progress}%</span>
          </div>
        </div>
      </div>
      <Button
        className="mt-3 w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold hover:brightness-110"
        onClick={() => onContinue?.(course)}
      >
        Resume Learning <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </SectionCard>
  )
}