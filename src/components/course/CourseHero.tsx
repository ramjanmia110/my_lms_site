import Link from 'next/link'
import { ChevronRight, FolderOpen, Home, User, Users } from 'lucide-react'
import { Container } from '@/components/ui/container'
import type { CourseDetails } from '@/lib/course-details-data'
import { Stars } from './Stars'

export function CourseHero({ course }: { course: CourseDetails }) {
  return (
    <section className="bg-[#1F4D3A] pt-[100px] lg:pt-[124px]">
      <Container size="xl" className="pb-10 pt-7 lg:pb-12 lg:pt-9">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-[13px] text-white/70">
          <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-white/35" />
          <span>Course Details V1</span>
          <ChevronRight className="h-3.5 w-3.5 text-white/35" />
          <span className="font-medium text-white">{course.title}</span>
        </nav>

        {/* Category badge */}
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
          <FolderOpen className="h-3.5 w-3.5 text-[#F8B681]" />
          {course.category}
        </span>

        {/* Title */}
        <h1 className="max-w-4xl text-[20px] font-semibold leading-snug tracking-tight text-white sm:text-[23px] lg:text-[26px]">
          {course.title}
        </h1>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-white/75">
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4 text-[#F8B681]" />
            <span>
              By <span className="font-semibold text-white">{course.instructor.name}</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Stars rating={course.rating} />
            <span className="font-semibold text-white">{course.rating.toFixed(1)}</span>
            <span className="text-white/55">({course.reviewCount} Reviews)</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-[#F8B681]" />
            {course.students.toLocaleString()} students enrolled
          </span>
        </div>
      </Container>
    </section>
  )
}
