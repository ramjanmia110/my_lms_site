import { Container } from '@/components/ui/container'
import { getRelatedCourses } from '@/lib/course-details-data'
import { CourseCard } from './CourseCard'

export function RelatedCourses({ currentSlug }: { currentSlug: string }) {
  const related = getRelatedCourses(currentSlug, 4)
  if (related.length === 0) return null

  return (
    <section className="border-t border-[#E8E4DD] bg-[#FAF8F4] py-12 sm:py-16">
      <Container size="xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E8E4DD] px-3.5 py-1.5 shadow-[0_4px_14px_-8px_rgba(31,77,58,0.25)] mb-3.5">
            <span className="w-2 h-2 rounded-full bg-[#E07B22]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1F4D3A] sm:text-[11px]">More Courses</span>
          </span>
          <h2 className="text-[24px] font-semibold tracking-tight text-[#1F4D3A] sm:text-[30px]">
            Courses you may like
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map(course => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </Container>
    </section>
  )
}
