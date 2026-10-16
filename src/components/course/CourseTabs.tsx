'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, Clock, PlayCircle, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CourseDetails } from '@/lib/course-details-data'
import { CourseImage } from './CourseImage'
import { Stars } from './Stars'

const TABS = ['Course Overview', 'Curriculum', 'Instructor', 'Reviews'] as const
type Tab = (typeof TABS)[number]

interface CourseTabsProps {
  course: CourseDetails
}

export function CourseTabs({ course }: CourseTabsProps) {
  const [active, setActive] = useState<Tab>('Course Overview')
  const [openSection, setOpenSection] = useState<number | null>(0)

  const totalLessons = course.curriculum.reduce((sum, s) => sum + s.lessons.length, 0)

  return (
    <div>
      {/* Tab headers */}
      <div className="flex flex-wrap gap-x-7 gap-y-1 border-b border-[#E8E4DD]" role="tablist" aria-label="Course sections">
        {TABS.map(tab => {
          const isActive = active === tab
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab)}
              className={cn(
                'relative -mb-px border-b-2 pb-3 pt-1 text-[14px] font-semibold transition-colors sm:text-[15px]',
                isActive
                  ? 'border-[#1F4D3A] text-[#1F4D3A]'
                  : 'border-transparent text-[#5A6B63] hover:text-[#1F4D3A]',
              )}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="pt-7">
        {active === 'Course Overview' && (
          <div>
            <div className="space-y-4">
              {course.overview.map((para, i) => (
                <p key={i} className="text-[14px] leading-[1.75] text-[#4B5563] sm:text-[15px]">
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-9">
              <h3 className="text-lg font-semibold text-[#1F4D3A] sm:text-xl">Key highlights</h3>
              <ul className="mt-4 space-y-2.5">
                {course.keyHighlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#4B5563]">
                    <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#18A878]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-9">
              <h3 className="text-lg font-semibold text-[#1F4D3A] sm:text-xl">What you will learn</h3>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {course.whatYouLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#4B5563]">
                    <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#18A878]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {active === 'Curriculum' && (
          <div>
            <p className="text-sm text-[#5A6B63]">
              <span className="font-semibold text-[#1F4D3A]">{course.curriculum.length}</span> sections •{' '}
              <span className="font-semibold text-[#1F4D3A]">{totalLessons}</span> lessons •{' '}
              <span className="font-semibold text-[#1F4D3A]">{course.duration}</span> total length
            </p>

            <div className="mt-5 space-y-3">
              {course.curriculum.map((section, i) => {
                const isOpen = openSection === i
                return (
                  <div key={i} className="overflow-hidden rounded-xl border border-[#E8E4DD] bg-white">
                    <button
                      onClick={() => setOpenSection(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 bg-[#FAF8F4] px-4 py-3.5 text-left transition-colors hover:bg-[#F1F5F0] sm:px-5"
                    >
                      <span className="text-[14px] font-semibold text-[#1F4D3A] sm:text-[15px]">
                        {String(i + 1).padStart(2, '0')}. {section.title}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="hidden text-xs text-[#9AA7A0] sm:inline">{section.lessons.length} lessons</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-[#5A6B63] transition-transform duration-200',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </span>
                    </button>
                    {isOpen && (
                      <ul className="divide-y divide-[#F0EBE2]">
                        {section.lessons.map((lesson, j) => (
                          <li key={j} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                            <span className="flex min-w-0 items-center gap-2.5">
                              <PlayCircle className="h-4 w-4 shrink-0 text-[#18A878]" />
                              <span className="truncate text-[13.5px] text-[#4B5563]">{lesson.title}</span>
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#9AA7A0]">
                              <Clock className="h-3.5 w-3.5" />
                              {lesson.duration}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {active === 'Instructor' && (
          <div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#E8E4DD] sm:h-28 sm:w-28">
                <CourseImage
                  src={course.instructor.photo}
                  alt={course.instructor.name}
                  sizes="112px"
                  className="rounded-2xl"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-[#1F4D3A]">{course.instructor.name}</h3>
                <p className="mt-1 text-sm font-medium text-[#E07B22]">{course.instructor.title}</p>
                <p className="mt-3 text-[14px] leading-[1.75] text-[#4B5563]">{course.instructor.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#F1F5F0] px-3 py-1 text-xs font-medium text-[#1F4D3A]">
                    {course.students.toLocaleString()} students
                  </span>
                  <span className="rounded-full bg-[#F1F5F0] px-3 py-1 text-xs font-medium text-[#1F4D3A]">
                    {course.rating.toFixed(1)} instructor rating
                  </span>
                  <span className="rounded-full bg-[#F1F5F0] px-3 py-1 text-xs font-medium text-[#1F4D3A]">
                    {course.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === 'Reviews' && (
          <div>
            <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-[#E8E4DD] bg-[#FAF8F4] px-6 py-5">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#1F4D3A]">{course.rating.toFixed(1)}</p>
                <Stars rating={course.rating} className="mt-1" size={16} />
                <p className="mt-1 text-xs text-[#9AA7A0]">{course.reviewCount} reviews</p>
              </div>
              <div className="h-12 w-px bg-[#E8E4DD]" />
              <p className="flex-1 text-sm leading-relaxed text-[#4B5563]">
                Students rate this course{' '}
                <span className="font-semibold text-[#1F4D3A]">
                  {course.rating >= 4.7 ? 'excellent' : course.rating >= 4.3 ? 'very good' : 'good'}
                </span>{' '}
                for its clear explanations, practical projects and career-ready skills.
              </p>
            </div>

            <ul className="mt-6 space-y-4">
              {course.reviews.map((review, i) => (
                <li key={i} className="rounded-2xl border border-[#E8E4DD] bg-white p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1F4D3A] text-sm font-bold text-white">
                      {review.avatar ? (
                        <div className="relative h-full w-full">
                          <CourseImage src={review.avatar} alt={review.name} sizes="44px" />
                        </div>
                      ) : (
                        review.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="text-sm font-semibold text-[#1F4D3A]">{review.name}</p>
                        <p className="text-xs text-[#9AA7A0]">{review.date}</p>
                      </div>
                      <Stars rating={review.rating} className="mt-1" />
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[#4B5563]">
                        <Quote className="mr-1 inline h-3.5 w-3.5 text-[#E07B22]" />
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
