import Link from 'next/link'
import { ArrowRight, BookOpen, User, Users } from 'lucide-react'
import { formatCoursePrice, type CourseDetails } from '@/lib/course-details-data'
import { CourseImage } from './CourseImage'
import { Stars } from './Stars'

const categoryGradient: Record<string, string> = {
  'Design & Media': 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]',
  'Development & Tech': 'from-[#1E293B] via-[#263449] to-[#33425C]',
  'AI & Data Science': 'from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB]',
  'Business & Marketing': 'from-[#E07B22] via-[#EA8F3D] to-[#F59E0B]',
  'Personal Growth': 'from-[#059669] via-[#10B981] to-[#34D399]',
  'Career Development': 'from-[#0F766E] via-[#14B8A6] to-[#2DD4BF]',
  'Language & Communication': 'from-[#D97706] via-[#F59E0B] to-[#FBBF24]',
}
const defaultGradient = 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]'

export function CourseCard({ course }: { course: CourseDetails }) {
  const gradient = categoryGradient[course.category] || defaultGradient

  return (
    <Link
      href={`/course/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8E4DD] bg-white transition-all hover:-translate-y-1 hover:border-[#1F4D3A]/25 hover:shadow-[0_16px_40px_-18px_rgba(31,77,58,0.35)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <CourseImage
          src={course.thumbnail}
          alt={course.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-multiply opacity-25`} />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1F4D3A] backdrop-blur-sm">
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Stars rating={course.rating} />
          <span className="text-xs font-semibold text-[#1F4D3A]">{course.rating.toFixed(1)}</span>
        </div>

        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#5A6B63]">
          <User className="h-3.5 w-3.5 text-[#E07B22]" />
          {course.instructor.name}
        </p>

        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-[#1F4D3A] transition-colors group-hover:text-[#E07B22]">
          {course.title}
        </h3>

        <div className="mb-4 mt-3 flex items-center gap-4 text-xs text-[#5A6B63]">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessonsCount} Lessons
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {course.students.toLocaleString()} Students
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-[#F0EBE2] pt-3.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1F4D3A]">
              {formatCoursePrice(course.price, course.currency)}
            </span>
            {course.oldPrice && course.oldPrice > course.price && (
              <span className="text-xs text-[#9AA7A0] line-through">
                {formatCoursePrice(course.oldPrice, course.currency)}
              </span>
            )}
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E07B22] text-white transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
