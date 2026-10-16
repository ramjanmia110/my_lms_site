import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingSiteFooter } from '@/components/landing/LandingSiteFooter'

export default function CourseNotFound() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-mona)' }}>
      <LandingHeader />
      <main className="pt-[100px] lg:pt-[124px]">
        <Container size="xl" className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF8F4] text-[#E07B22]">
            <SearchX className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-[26px] font-semibold text-[#1F4D3A] sm:text-[30px]">Course not found</h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#5A6B63]">
            The course you are looking for doesn&apos;t exist or may have been moved. Browse our catalogue to find
            something you will love.
          </p>
          <Link
            href="/#courses"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#E07B22] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C96A18]"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse all courses
          </Link>
        </Container>
      </main>
      <LandingSiteFooter />
    </div>
  )
}
