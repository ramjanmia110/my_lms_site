'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Users, Clock, Star, PlayCircle, Award, Download, Infinity as InfinityIcon,
  ShieldCheck, BookOpen, Code2, CalendarClock, ArrowRight, ArrowLeft, Lock, Check, GraduationCap,
  Video, FileText, BadgeCheck, Globe, Layers, LifeBuoy, TrendingUp, Pause,
  Maximize, Volume2, VolumeX, SkipBack, SkipForward, X, Play, GalleryThumbnails,
} from 'lucide-react'
import { coursesAPI } from '@/lib/api'
import { cn, getImageUrl } from '@/lib/utils'
import { savePendingEnrollment, saveCourseSnapshot } from '@/lib/pending-enrollment'
import { findCatalogBySlug, findCatalogByTitle } from '@/lib/course-catalog'

const SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹' }

const levelMeta: Record<string, { label: string; cls: string }> = {
  beginner: { label: 'Beginner', cls: 'bg-[#ECFBF5] text-[#0F9D6B] border-[#18A878]/20' },
  intermediate: { label: 'Intermediate', cls: 'bg-[#EEF4FF] text-[#3478F6] border-[#3478F6]/20' },
  advanced: { label: 'Advanced', cls: 'bg-[#F3EEFF] text-[#6D3DF5] border-[#6D3DF5]/25' },
  all: { label: 'All Levels', cls: 'bg-[#FFF4E6] text-[#EA8A00] border-amber-200' },
}

const DEFAULT_INSTRUCTOR_AVATAR = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop'

interface Lesson { id: number; title: string; type?: string; duration?: string; video_url?: string }
interface CourseModule { id: number; title: string; description?: string; order?: number; lessons?: Lesson[] }
interface Project { id: number; title: string; description?: string; technologies?: string; difficulty?: string }
interface LiveClass { id: number; title: string; date?: string; thumbnail?: string; duration?: string }

interface CourseData {
  id: number
  title: string
  slug: string
  thumbnail?: string | null
  gallery_images?: string[] | null
  description?: string
  category?: string
  price?: number
  level?: string
  duration?: string
  students_count?: number
  rating?: number
  status?: string
  instructor?: { id: number; name: string; avatar?: string | null }
  modules?: CourseModule[]
  lessons?: Lesson[]
  courseProjects?: Project[]
  liveClasses?: LiveClass[]
  course_projects?: Project[]
  live_classes?: LiveClass[]
}

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = String(params?.slug || '')
  const videoRef = useRef<HTMLVideoElement>(null)

  const [course, setCourse] = useState<CourseData | null>(null)
  const [related, setRelated] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openModule, setOpenModule] = useState<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!showVideo || !videoRef.current) return
    const v = videoRef.current
    setIsPlaying(true)
    v.play().catch(() => setIsPlaying(false))
  }, [showVideo])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError('')
    ;(async () => {
      try {
        const res = await coursesAPI.getPublic(slug)
        if (cancelled) return
        const data = res.data?.data
        if (data) {
          if (data.course_projects && !data.courseProjects) data.courseProjects = data.course_projects
          if (data.live_classes && !data.liveClasses) data.liveClasses = data.live_classes
        }
        setCourse(data)
        if (data?.id) {
          try {
            const listRes = await coursesAPI.listPublic({ per_page: 4 })
            const all = Array.isArray(listRes.data?.data?.data)
              ? listRes.data.data.data
              : Array.isArray(listRes.data?.data) ? listRes.data.data : []
            setRelated(all.filter((c: CourseData) => c.slug !== slug && c.id !== data.id).slice(0, 3))
          } catch { /* related courses optional */ }
        }
      } catch {
        if (!cancelled) setError('We could not find this course.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [slug])

  const currency = 'BDT'
  const symbol = SYMBOL[currency] || '৳'
  const catalogMatch = findCatalogBySlug(slug) ?? findCatalogByTitle(course?.title)
  const price = Number(course?.price || 0) || catalogMatch?.price || 0
  const displayPrice = price ? price.toLocaleString() : null
  const courseImage = getImageUrl(course?.thumbnail) || ''

  const previewVideoUrl = useMemo(() => {
    const lessonsList: Lesson[] = [
      ...(course?.lessons || []),
      ...(course?.modules || []).flatMap((m) => m.lessons || []),
    ]
    return lessonsList.find((l) => l.video_url)?.video_url || ''
  }, [course])

  const lessonCount = useMemo(
    () => (course?.modules || []).reduce((n, m) => n + (m.lessons?.length || 0), 0),
    [course]
  )

  const galleryImages = useMemo(() => {
    const extra = Array.isArray(course?.gallery_images)
      ? course.gallery_images.map(getImageUrl).filter(Boolean)
      : []
    const all = [courseImage, ...extra].filter(Boolean)
    return Array.from(new Set(all)).slice(0, 6)
  }, [course, courseImage])

  const handleEnroll = () => {
    if (!course) return
    saveCourseSnapshot({ id: course.id, title: course.title, price })
    savePendingEnrollment({ id: course.id, title: course.title })
    router.push(`/payment/${course.id}`)
  }

  const handleDownloadSyllabus = () => {
    if (!course) return
    const fileTitle = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const modulesText = (course.modules || []).map((m, idx) =>
      `${idx + 1}. ${m.title} — ${m.lessons?.length || 0} lessons\n` +
      (m.lessons || []).map((l) => `   • ${l.title}${l.duration ? ` (${l.duration})` : ''}`).join('\n')
    ).join('\n\n') || 'Full curriculum is available after enrollment.'
    const content =
      `LEARN2EARN — COURSE SYLLABUS\n` +
      `===========================\n\n` +
      `Course: ${course.title}\n` +
      `Instructor: ${course.instructor?.name || 'Expert Instructor'}\n` +
      `Duration: ${course.duration || 'Self-paced'}\n` +
      `Price: ${displayPrice ? `${symbol}${displayPrice}` : 'Free'}\n\n` +
      `— Curriculum —\n\n` +
      modulesText
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileTitle}-syllabus.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) { videoRef.current.pause() } else { videoRef.current.play() }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVideoEnd = () => setIsPlaying(false)

  /* -------- states -------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#6D3DF5] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#536078]">Loading course...</span>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-md bg-white border border-[#E9E7F5] rounded-2xl p-8 text-center shadow-[0_20px_60px_-15px_rgba(109,61,245,0.15)]">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F3EEFF] flex items-center justify-center mb-4">
            <LifeBuoy className="w-7 h-7 text-[#6D3DF5]" />
          </div>
          <h1 className="text-lg font-bold text-[#0F1B3D] mb-1">Course not found</h1>
          <p className="text-sm text-[#536078] mb-6">This course may no longer be available or the link is incorrect.</p>
          <Link href="/#courses" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-sm font-semibold rounded-xl px-5 py-2.5 shadow-[0_8px_20px_-6px_rgba(109,61,245,0.5)]">
            <ArrowLeft className="w-4 h-4" /> Browse all courses
          </Link>
        </div>
      </div>
    )
  }

  const level = levelMeta[course.level || 'all'] || levelMeta.all
  const rating = Number(course.rating || 0)
  const students = course.students_count || 0

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Background washes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#FFFFFF_0%,#F7F5FF_35%,#EFF4FF_68%,#F1FBF7_100%)]" />
        <div className="absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full bg-[#7C5CFC]/[0.08] blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[560px] h-[560px] rounded-full bg-[#2DD4BF]/[0.07] blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b border-[#E9E7F5]/70 backdrop-blur bg-white/70 sticky top-0">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/learn2earn-logo.png" alt="Learn2Earn" width={500} height={158} className="h-9 w-auto object-contain" priority />
          </Link>
          <Link href="/#courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6D3DF5] hover:text-[#5B2EE0]">
            <ArrowLeft className="w-4 h-4" /> Browse courses
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-5 py-8">
        {/* Hero */}
        <section className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="min-w-0">
            {/* Breadcrumb + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {course.category && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F3EEFF] text-[#6D3DF5] border border-[#6D3DF5]/20">
                  <Layers className="w-3 h-3" /> {course.category}
                </span>
              )}
              <span className={cn('inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border', level.cls)}>
                {level.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#536078] px-2 py-1">
                <Globe className="w-3 h-3 text-[#3478F6]" /> English
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1B3D] tracking-tight leading-tight mb-3">
              {course.title}
            </h1>
            <p className="text-base text-[#536078] leading-relaxed max-w-2xl mb-6">
              {course.description}
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: Award, text: 'Certificate of completion' },
                { icon: InfinityIcon, text: 'Lifetime access' },
                { icon: Download, text: 'Downloadable resources' },
                { icon: ShieldCheck, text: '7-day money-back guarantee' },
              ].map((b) => (
                <span key={b.text} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F1B3D] bg-white border border-[#E9E7F5] rounded-lg px-3 py-2 shadow-sm">
                  <b.icon className="w-3.5 h-3.5 text-[#18A878]" /> {b.text}
                </span>
              ))}
            </div>

            {/* ===== Course Preview (single small video thumbnail) ===== */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2.5">
                <PlayCircle className="w-4 h-4 text-[#6D3DF5]" />
                <h3 className="text-sm font-bold text-[#0F1B3D]">Course Preview</h3>
                {previewVideoUrl && (
                  <span className="text-[10px] font-medium text-[#18A878] bg-[#ECFBF5] rounded-full px-2 py-0.5">Playable</span>
                )}
              </div>
              <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden bg-[#0F1B3D] shadow-[0_20px_50px_-20px_rgba(76,43,212,0.5)]">
                {showVideo ? (
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={videoRef}
                      src={previewVideoUrl}
                      className="w-full h-full object-contain"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={handleVideoEnd}
                      muted={isMuted}
                      playsInline
                      controls={false}
                    />
                    {/* Custom controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-8 pb-3">
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="text-white hover:text-[#A78BFA] transition-colors">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10) }} className="text-white/70 hover:text-white transition-colors">
                          <SkipBack className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10) }} className="text-white/70 hover:text-white transition-colors">
                          <SkipForward className="w-4 h-4" />
                        </button>
                        <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <div className="flex-1" />
                        <span className="text-[11px] font-medium text-white/70">Preview</span>
                        <button onClick={() => { setIsPlaying(false); setShowVideo(false) }} className="text-white/70 hover:text-white transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Play/pause overlay on click */}
                    <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center" aria-label="Play/Pause">
                      <AnimatePresence>
                        {!isPlaying && (
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => previewVideoUrl && setShowVideo(true)}
                    className={cn('relative aspect-video w-full group text-left', previewVideoUrl ? 'cursor-pointer' : 'cursor-default')}
                  >
                    {courseImage ? (
                      <Image src={courseImage} alt={course.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 448px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2A1A6B] to-[#7C3AED]">
                        <BookOpen className="w-12 h-12 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                    {previewVideoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                          <PlayCircle className="w-7 h-7 text-white" />
                        </motion.div>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 bg-black/50 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      <Clock className="w-3 h-3" /> {course.duration || 'Self-paced'}
                    </span>
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 bg-[#6D3DF5]/90 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {previewVideoUrl ? <PlayCircle className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />} {previewVideoUrl ? 'Preview Course' : 'Course Overview'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* ===== Related Images (4+ small) ===== */}
            {galleryImages.length >= 4 && (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2 mb-2.5">
                  <GalleryThumbnails className="w-4 h-4 text-[#6D3DF5]" />
                  <h3 className="text-sm font-bold text-[#0F1B3D]">Related Images</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                  {galleryImages.slice(0, 4).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxSrc(src)}
                      title={`${course.title} — image ${i + 1}`}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-[#E9E7F5] hover:ring-[#6D3DF5]/50 hover:scale-[1.04] transition-all"
                    >
                      <Image src={src} alt={`${course.title} image ${i + 1}`} fill className="object-cover" sizes="(max-width:768px) 25vw, 96px" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ===== Instructor ===== */}
            <div className="flex items-center gap-4 bg-white border border-[#E9E7F5] rounded-2xl p-5 shadow-sm mb-8">
              <div className="w-14 h-14 relative rounded-full bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                <Image
                  src={getImageUrl(course.instructor?.avatar) || DEFAULT_INSTRUCTOR_AVATAR}
                  alt={course.instructor?.name || 'Instructor'}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-[#0F1B3D]">
                  {course.instructor?.name || 'Expert Instructor'}
                  <BadgeCheck className="w-4 h-4 text-[#3478F6]" />
                </p>
                <p className="text-xs text-[#536078] mt-0.5">Course instructor · Verified expert</p>
              </div>
            </div>
          </div>

          {/* ===== Sticky enroll card ===== */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(109,61,245,0.18)]">
              {/* Price header */}
              <div className="bg-gradient-to-r from-[#F3EEFF] to-[#EEF4FF] p-6 border-b border-[#E9E7F5]">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-[#0F1B3D] tracking-tight">
                    {displayPrice ? `${symbol}${displayPrice}` : 'Free'}
                  </span>
                  {displayPrice && (
                    <span className="text-sm font-semibold text-[#18A878]">BDT one-time</span>
                  )}
                </div>
                <p className="text-xs text-[#536078]">30-day money-back guarantee</p>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {[
                    { icon: BookOpen, label: `${lessonCount || course.courseProjects?.length || 0} lessons & modules` },
                    { icon: Users, label: `${students >= 1000 ? (students / 1000).toFixed(1) + 'k' : students} enrolled` },
                    { icon: CalendarClock, label: 'Start instantly · Lifetime access' },
                    { icon: Star, label: `${rating ? rating.toFixed(1) : 'New'} rating` },
                    { icon: Award, label: 'Certificate of completion' },
                    { icon: Download, label: 'Downloadable resources' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5 text-sm text-[#536078]">
                      <span className="w-6 h-6 rounded-md bg-[#F3EEFF] flex items-center justify-center shrink-0">
                        <s.icon className="w-3.5 h-3.5 text-[#6D3DF5]" />
                      </span>
                      {s.label}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] text-white text-sm font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-[0_12px_24px_-8px_rgba(109,61,245,0.6)] active:scale-[.98]"
                >
                  Enroll Now <ArrowRight className="w-4 h-4" />
                </button>

                <button onClick={handleDownloadSyllabus} className="w-full mt-3 border border-[#E9E7F5] text-[#536078] hover:text-[#0F1B3D] hover:border-[#6D3DF5]/30 text-sm font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all">
                  <Download className="w-4 h-4" /> Download Syllabus
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#A9B3C8]">
                  <Lock className="w-3.5 h-3.5 text-[#18A878]" />
                  Secure checkout · SSL encrypted
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== What you'll get ===== */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-[#0F1B3D] mb-5">What you&apos;ll get</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: PlayCircle, t: 'Structured lessons', d: 'Bite-sized lessons organized into clear modules.' },
              { icon: Award, t: 'Certificate', d: 'Receive a shareable credential on completion.' },
              { icon: Code2, t: 'Hands-on projects', d: 'Apply skills to real, portfolio-ready projects.' },
              { icon: TrendingUp, t: 'Progress tracking', d: 'Quizzes & milestones keep you on track.' },
            ].map((f) => (
              <div key={f.t} className="bg-white border border-[#E9E7F5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5" />
                </span>
                <p className="text-sm font-semibold text-[#0F1B3D] mb-1">{f.t}</p>
                <p className="text-xs text-[#536078] leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Curriculum ===== */}
        {course.modules && course.modules.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#0F1B3D]">Course curriculum</h2>
              <span className="text-xs text-[#536078] bg-white border border-[#E9E7F5] rounded-lg px-3 py-1.5">{course.modules.length} modules · {lessonCount} lessons</span>
            </div>
            <div className="space-y-3">
              {course.modules.map((m, idx) => {
                const isOpen = openModule === m.id
                return (
                  <motion.div key={m.id} layout className="bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setOpenModule(isOpen ? null : m.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#0F1B3D]">{m.title}</p>
                          <p className="text-xs text-[#536078] mt-0.5">{m.lessons?.length || 0} lessons</p>
                        </div>
                      </div>
                      <ChevronDown className={cn('w-5 h-5 text-[#536078] transition-transform duration-300', isOpen && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="border-t border-[#E9E7F5]">
                          <div className="p-4 space-y-2">
                            {m.description && <p className="text-xs text-[#536078] mb-2">{m.description}</p>}
                            {m.lessons?.map((l) => (
                              <div key={l.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                                <span className="w-7 h-7 rounded-md bg-[#ECFBF5] text-[#0F9D6B] flex items-center justify-center shrink-0">
                                  {l.type === 'video' || l.video_url ? <PlayCircle className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                </span>
                                <span className="text-sm text-[#0F1B3D] flex-1">{l.title}</span>
                                {l.duration && <span className="text-xs text-[#A9B3C8] whitespace-nowrap">{l.duration}</span>}
                              </div>
                            ))}
                            {(!m.lessons || m.lessons.length === 0) && (
                              <p className="text-xs text-[#A9B3C8]">Lessons are being added to this module.</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* ===== Projects ===== */}
        {course.courseProjects && course.courseProjects.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#0F1B3D] mb-5">Hands-on projects</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {course.courseProjects.map((p) => (
                <div key={p.id} className="bg-white border border-[#E9E7F5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#3478F6] flex items-center justify-center shrink-0">
                      <Code2 className="w-4 h-4" />
                    </span>
                    <p className="text-sm font-semibold text-[#0F1B3D]">{p.title}</p>
                  </div>
                  <p className="text-xs text-[#536078] leading-relaxed">{p.description}</p>
                  {p.technologies && (
                    <p className="text-[11px] font-medium text-[#3478F6] mt-2">{p.technologies}</p>
                  )}
                  {p.difficulty && (
                    <span className="mt-3 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#3478F6] border border-[#3478F6]/20 capitalize">
                      {p.difficulty}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== Live classes ===== */}
        {course.liveClasses && course.liveClasses.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#0F1B3D] mb-5 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#6D3DF5]" /> Live sessions
            </h2>
            <div className="space-y-3">
              {course.liveClasses.map((lc) => (
                <div key={lc.id} className="bg-white border border-[#E9E7F5] rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <span className="w-11 h-11 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center shrink-0">
                    <CalendarClock className="w-5 h-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0F1B3D]">{lc.title}</p>
                    {lc.date && <p className="text-xs text-[#536078] mt-0.5">{lc.date}</p>}
                  </div>
                  {lc.duration && <span className="text-xs text-[#A9B3C8]">{lc.duration}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== FAQ ===== */}
        <section className="mt-12 bg-white border border-[#E9E7F5] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#0F1B3D] mb-5">Frequently asked questions</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {[
              { q: 'How do I access the course after enrolling?', a: 'You get instant access in your dashboard right after a successful checkout.' },
              { q: 'Is there a guarantee?', a: 'Yes — a 30-day money-back guarantee on every enrollment.' },
              { q: 'Do I get a certificate?', a: 'Yes, a shareable certificate of completion when you finish the course.' },
              { q: 'How long do I have access?', a: 'Lifetime access — learn at your own pace, forever.' },
              { q: 'Are there any prerequisites?', a: 'Most courses are beginner-friendly. Check the level badge for details.' },
              { q: 'Can I get a refund?', a: 'Yes, within 30 days if you\'re not satisfied — no questions asked.' },
            ].map((f) => (
              <div key={f.q}>
                <p className="text-sm font-semibold text-[#0F1B3D] mb-1.5 flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-[#6D3DF5] mt-0.5 shrink-0" /> {f.q}
                </p>
                <p className="text-xs text-[#536078] leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Related courses ===== */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#0F1B3D] mb-5">You may also like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((c) => {
                const rc = findCatalogByTitle(c.title)
                const rcPrice = rc?.price ?? Number(c.price || 0)
                const rcImage = getImageUrl(c.thumbnail)
                return (
                  <Link key={c.id} href={`/course/${c.slug}`} className="group bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_16px_40px_-15px_rgba(109,61,245,0.3)] hover:border-[#6D3DF5]/30 transition-all">
                    <div className="relative h-36 bg-gradient-to-br from-[#2A1A6B] to-[#7C3AED] overflow-hidden">
                      {rcImage ? (
                        <Image src={rcImage} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:1024px) 50vw, 33vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">View Course</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-[#0F1B3D] group-hover:text-[#6D3DF5] line-clamp-1 transition-colors">{c.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-[#0F1B3D]">
                          {rcPrice ? `${symbol}${rcPrice.toLocaleString()}` : 'Free'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6D3DF5]">
                          View <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ===== CTA ===== */}
        <section className="mt-12 bg-gradient-to-br from-[#2A1A6B] via-[#4C2BD4] to-[#7C3AED] rounded-3xl p-8 sm:p-10 text-center shadow-[0_30px_70px_-20px_rgba(76,43,212,0.6)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15), transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.12), transparent 40%)' }} />
          <div className="relative">
            <Check className="w-10 h-10 text-[#2DD4BF] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to start learning?</h2>
            <p className="text-white/80 text-sm sm:text-base mb-6 max-w-md mx-auto">
              {displayPrice ? `Enroll today for ${symbol}${displayPrice} and get lifetime access.` : 'Enroll now — it\u2019s completely free.'}
            </p>
            <button
              onClick={handleEnroll}
              className="inline-flex items-center gap-2 bg-white text-[#4C2BD4] text-sm font-bold rounded-xl px-6 py-3 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.4)] hover:bg-[#F3EEFF] transition-colors"
            >
              Enroll Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* ===== Gallery Lightbox ===== */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full rounded-2xl overflow-hidden bg-[#0F1B3D]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video">
                <Image src={lightboxSrc} alt={`${course?.title || 'Course'} gallery image`} fill className="object-contain bg-black" sizes="(max-width:768px) 100vw, 768px" />
              </div>
              <button
                onClick={() => setLightboxSrc(null)}
                aria-label="Close"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
