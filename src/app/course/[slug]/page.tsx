import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/container'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingSiteFooter } from '@/components/landing/LandingSiteFooter'
import { CourseHero } from '@/components/course/CourseHero'
import { CourseTabs } from '@/components/course/CourseTabs'
import { CourseSidebar } from '@/components/course/CourseSidebar'
import { RelatedCourses } from '@/components/course/RelatedCourses'
import {
  buildCourseFromApi,
  getAllCourseSlugs,
  getCourseBySlug,
  getCourseByTitle,
  type ApiCourseInput,
} from '@/lib/course-details-data'
import { findCatalogBySlug } from '@/lib/course-catalog'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllCourseSlugs().map(slug => ({ slug }))
}

export const dynamicParams = true

async function fetchApiCourse(slug: string): Promise<ApiCourseInput | null> {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) return null
  try {
    const res = await fetch(`${base}/courses/slug/${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return (json?.data ?? json ?? null) as ApiCourseInput | null
  } catch {
    return null
  }
}

async function resolveCourse(slug: string) {
  const local = getCourseBySlug(slug)
  if (local) {
    return { course: local, enrollId: findCatalogBySlug(local.slug)?.id }
  }

  const api = await fetchApiCourse(slug)
  if (api) {
    const course = getCourseByTitle(api.title) || buildCourseFromApi(api)
    return { course, enrollId: api.id ?? findCatalogBySlug(course.slug)?.id }
  }

  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await resolveCourse(params.slug)
  if (!resolved) return { title: 'Course not found' }
  const { course } = resolved

  return {
    title: `${course.title} | Courses`,
    description: course.overview[0]?.slice(0, 160),
    openGraph: {
      title: course.title,
      description: course.overview[0]?.slice(0, 160),
      images: course.thumbnail ? [{ url: course.thumbnail }] : undefined,
      type: 'article',
    },
  }
}

export default async function CourseDetailsPage({ params }: PageProps) {
  const resolved = await resolveCourse(params.slug)
  if (!resolved) notFound()
  const { course, enrollId } = resolved

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-mona)' }}>
      <LandingHeader />

      <main>
        <CourseHero course={course} />

        <Container size="xl" className="py-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Main content */}
            <div className="min-w-0">
              <CourseTabs course={course} />
            </div>

            {/* Sticky sidebar */}
            <aside className="w-full self-start lg:sticky lg:top-28">
              <CourseSidebar course={course} enrollId={enrollId} />
            </aside>
          </div>
        </Container>

        <RelatedCourses currentSlug={course.slug} />
      </main>

      <LandingSiteFooter />
      <ScrollToTop />
    </div>
  )
}
