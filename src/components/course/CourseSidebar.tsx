'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Award, BarChart3, Check, Clock, Facebook, Globe, Link2, Linkedin, MessageCircle,
  Play, ShoppingBag, Twitter, Video, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCoursePrice, type CourseDetails } from '@/lib/course-details-data'
import { savePendingEnrollment, saveCourseSnapshot } from '@/lib/pending-enrollment'
import { CourseImage } from './CourseImage'

const SHARE_NETWORKS = [
  { name: 'Facebook', icon: Facebook, build: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${url}` },
  { name: 'X', icon: Twitter, build: (url: string) => `https://twitter.com/intent/tweet?url=${url}` },
  { name: 'LinkedIn', icon: Linkedin, build: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
  { name: 'WhatsApp', icon: MessageCircle, build: (url: string) => `https://wa.me/?text=${url}` },
]

interface CourseSidebarProps {
  course: CourseDetails
  enrollId?: number
}

export function CourseSidebar({ course, enrollId }: CourseSidebarProps) {
  const router = useRouter()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const discount =
    course.oldPrice && course.oldPrice > course.price
      ? Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)
      : null

  const includes: { icon: typeof Video; label: string; value: string }[] = [
    { icon: Video, label: 'Lessons', value: `${course.lessonsCount} lessons` },
    { icon: Clock, label: 'Duration', value: course.duration },
    { icon: BarChart3, label: 'Skill Level', value: course.level },
    { icon: Globe, label: 'Language', value: course.language },
    { icon: Award, label: 'Certificate', value: course.certificate ? 'Yes' : 'No' },
  ]

  const handleBuyNow = () => {
    if (enrollId) {
      savePendingEnrollment({ id: enrollId, title: course.title })
      saveCourseSnapshot({ id: enrollId, title: course.title, price: course.price })
      router.push(`/student-information?courseId=${enrollId}`)
    } else {
      router.push('/#courses')
    }
  }

  const shareUrl = () => {
    if (typeof window === 'undefined') return ''
    return encodeURIComponent(window.location.href)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8E4DD] bg-white shadow-[0_10px_40px_-20px_rgba(31,77,58,0.25)]">
      {/* Thumbnail / video preview */}
      <div className="relative aspect-video w-full overflow-hidden">
        <CourseImage
          src={course.thumbnail}
          alt={course.title}
          sizes="(max-width: 1024px) 100vw, 380px"
          priority
          className="rounded-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {course.videoUrl && !previewOpen && (
          <button
            onClick={() => setPreviewOpen(true)}
            aria-label="Play course preview"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/70 bg-white/25 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/35">
              <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
            </span>
          </button>
        )}

        {previewOpen && course.videoUrl && (
          <div className="absolute inset-0 bg-black">
            <video
              src={course.videoUrl}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            <button
              onClick={() => setPreviewOpen(false)}
              aria-label="Close preview"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Instructor badge on image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-full bg-black/45 py-1.5 pl-1.5 pr-3.5 backdrop-blur-sm">
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/40">
            <CourseImage src={course.instructor.photo} alt={course.instructor.name} sizes="32px" />
          </div>
          <span className="text-xs font-semibold text-white">{course.instructor.name}</span>
        </div>

        {discount && (
          <span className="absolute right-3 top-3 rounded-full bg-[#E07B22] px-3 py-1 text-xs font-bold text-white">
            -{discount}% OFF
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[30px] font-bold leading-none text-[#1F4D3A]">
            {formatCoursePrice(course.price, course.currency)}
          </span>
          {course.oldPrice && course.oldPrice > course.price && (
            <span className="text-base text-[#9AA7A0] line-through">
              {formatCoursePrice(course.oldPrice, course.currency)}
            </span>
          )}
        </div>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#E07B22] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(224,123,34,0.6)] transition-colors hover:bg-[#C96A18]"
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
          Buy Now
        </button>

        {/* This course includes */}
        <div className="mt-6 border-t border-[#E8E4DD] pt-5">
          <h3 className="text-[15px] font-semibold text-[#1F4D3A]">This course includes</h3>
          <ul className="mt-3.5 space-y-2.5">
            {includes.map(item => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF8F4] text-[#1F4D3A]">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="text-[13px] text-[#5A6B63]">{item.label}</span>
                <span className="ml-auto text-[13px] font-semibold text-[#1F4D3A]">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Share */}
        <div className="mt-6 border-t border-[#E8E4DD] pt-5">
          <h3 className="text-[15px] font-semibold text-[#1F4D3A]">Share On</h3>
          <div className="mt-3.5 flex items-center gap-2.5">
            {SHARE_NETWORKS.map(net => (
              <a
                key={net.name}
                href={net.build(shareUrl())}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${net.name}`}
                title={`Share on ${net.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E4DD] bg-white text-[#5A6B63] transition-colors hover:border-[#1F4D3A] hover:bg-[#1F4D3A] hover:text-white"
              >
                <net.icon className="h-4 w-4" />
              </a>
            ))}
            <button
              onClick={handleCopy}
              aria-label="Copy course link"
              title="Copy link"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
                copied
                  ? 'border-[#18A878] bg-[#18A878] text-white'
                  : 'border-[#E8E4DD] bg-white text-[#5A6B63] hover:border-[#1F4D3A] hover:bg-[#1F4D3A] hover:text-white',
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
