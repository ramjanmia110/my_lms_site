'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, useInView, animate, AnimatePresence } from 'framer-motion'
import {
  Search, GraduationCap, Star, Twitter, Linkedin, ArrowRight,
  Award, ShieldCheck, Users, Sparkles, Headphones, BadgeCheck, Mail,
  TrendingUp, Handshake, BarChart3, Globe2,
} from 'lucide-react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingSiteFooter } from '@/components/landing/LandingSiteFooter'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { cn } from '@/lib/utils'

/* â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
   ALL INSTRUCTORS page Â· REFERENCE 2
   Cream #F8F5F2 Â· Dark green #1A453B Â· Orange #D87827
â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€” */
const instructorList = [
  { id: 1, name: 'Arjun Mehta', title: 'UI/UX Design Expert', category: 'Design', rating: '4.9', courses: '2 Courses', students: '25,000+', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=480&h=600&fit=crop&crop=face' },
  { id: 2, name: 'Neha Kapoor', title: 'Digital Marketing Expert', category: 'Marketing', rating: '4.8', courses: '3 Courses', students: '20,000+', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=480&h=600&fit=crop&crop=face' },
  { id: 3, name: 'Rohit Verma', title: 'Full Stack Developer', category: 'Development', rating: '4.9', courses: '2 Courses', students: '30,000+', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=600&fit=crop&crop=face' },
  { id: 4, name: 'Ananya Sharma', title: 'Data Science Expert', category: 'Data', rating: '4.8', courses: '2 Courses', students: '18,000+', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=480&h=600&fit=crop&crop=face' },
  { id: 5, name: 'Vikram Singh', title: 'AI & ML Expert', category: 'Development', rating: '4.9', courses: '1 Courses', students: '22,000+', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=480&h=600&fit=crop&crop=face' },
  { id: 6, name: 'Sneha Iyer', title: 'Product Management Expert', category: 'Business', rating: '4.8', courses: '3 Courses', students: '15,000+', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=480&h=600&fit=crop&crop=face' },
  { id: 7, name: 'Karan Malhotra', title: 'Mobile Dev Expert', category: 'Development', rating: '4.8', courses: '2 Courses', students: '17,000+', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=480&h=600&fit=crop&crop=face' },
  { id: 8, name: 'Priyanka Rao', title: 'Graphic Design Expert', category: 'Design', rating: '4.7', courses: '2 Courses', students: '12,000+', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=480&h=600&fit=crop&crop=face' },
  { id: 9, name: 'Aditya Kulkarni', title: 'Backend Engineering Expert', category: 'Development', rating: '4.8', courses: '1 Courses', students: '19,000+', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=480&h=600&fit=crop&crop=face' },
  { id: 10, name: 'Ishita Banerjee', title: 'Content Strategy Expert', category: 'Marketing', rating: '4.7', courses: '2 Courses', students: '11,000+', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=480&h=600&fit=crop&crop=face' },
  { id: 11, name: 'Rohan Deshmukh', title: 'Cloud & DevOps Expert', category: 'Development', rating: '4.8', courses: '3 Courses', students: '14,000+', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=480&h=600&fit=crop&crop=face' },
  { id: 12, name: 'Tanvi Joshi', title: 'Data Analytics Expert', category: 'Data', rating: '4.8', courses: '2 Courses', students: '13,000+', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=480&h=600&fit=crop&crop=face' },
  { id: 13, name: 'Sameer Khan', title: 'Cyber Security Expert', category: 'Development', rating: '4.9', courses: '1 Courses', students: '16,000+', image: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=480&h=600&fit=crop&crop=face' },
  { id: 14, name: 'Divya Nair', title: 'HR & Leadership Expert', category: 'Business', rating: '4.7', courses: '2 Courses', students: '10,000+', image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=480&h=600&fit=crop&crop=face' },
  { id: 15, name: 'Manish Gupta', title: 'Business Strategy Expert', category: 'Business', rating: '4.8', courses: '3 Courses', students: '18,000+', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=480&h=600&fit=crop&crop=face' },
  { id: 16, name: 'Kavita Menon', title: 'Content Creator Coach', category: 'Marketing', rating: '4.8', courses: '2 Courses', students: '14,000+', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&h=600&fit=crop&crop=face' },
]

const categories = ['All', 'Design', 'Development', 'Business', 'Marketing', 'Data']
const instructorsPageContainer = 'mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8'

const badgeItems = [
  { icon: Award, label: 'Industry-recognized certification' },
  { icon: ShieldCheck, label: 'Verified expert profiles' },
  { icon: Users, label: 'Trusted by 500,000+ learners' },
]

const founderFeatures = [
  {
    icon: TrendingUp,
    title: '10+ Years Experience',
    description: 'Leading teams and scaling startups.',
    background: 'bg-[#E8F3EA]',
    iconBackground: 'bg-[#1F4D3A]',
  },
  {
    icon: Users,
    title: '500+ Students Mentored',
    description: 'Helping talent turn skills into income.',
    background: 'bg-[#FCEFDD]',
    iconBackground: 'bg-[#E07B22]',
  },
  {
    icon: Handshake,
    title: 'Industry Partnerships',
    description: 'Connected with top companies for real opportunities.',
    background: 'bg-[#E4EEFB]',
    iconBackground: 'bg-[#3679C8]',
  },
]

const founderCardVariants = {
  hidden: { opacity: 0, x: 64 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
      delayChildren: 0.14,
      staggerChildren: 0.1,
    },
  },
}

const founderPhotoVariants = {
  hidden: { scale: 1.05 },
  visible: {
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const founderHeadingVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
}

const founderUnderlineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const founderFeatureListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
}

const founderFeatureVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: 'easeOut' as const },
  },
}

const founderIconVariants = {
  hidden: { opacity: 0, scale: 0.55, y: 8, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 360, damping: 17 },
  },
}

function FounderCountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  prefersReducedMotion,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  prefersReducedMotion: boolean | null
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    if (!isInView) return

    const controls = animate(0, value, {
      duration: 1.35,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayValue(latest),
    })

    return () => controls.stop()
  }, [isInView, prefersReducedMotion, value])

  const formatNumber = (number: number) => number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} aria-label={`${prefix}${formatNumber(value)}${suffix}`}>
      <span aria-hidden="true" className="tabular-nums">
        {prefix}{formatNumber(displayValue)}{suffix}
      </span>
    </span>
  )
}

export default function InstructorsPage() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [reduceMotion])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return instructorList.filter((s) => {
      const inCat = activeCategory === 'All' || s.category === activeCategory
      const inSearch = !q || s.name.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
      return inCat && inSearch
    })
  }, [activeCategory, search])

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setEmail('')
      router.push('/register')
    }, 900)
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] font-sans">
      <LandingHeader />

      <main>
        {/* â€”â€”â€”â€”â€” HERO â€”â€”â€”â€”â€” */}
        <section className="relative overflow-hidden bg-[#F8F5F2]">
          <div className={cn('relative pb-16 pt-[116px] lg:pb-20 lg:pt-[140px] xl:grid xl:grid-cols-[minmax(0,1fr)_600px] xl:items-center xl:gap-16', instructorsPageContainer)}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="flex flex-col items-start text-left"
            >
              <motion.p
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="text-[12px] font-medium text-[#1A453B]/60"
              >
                <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2">
                  <Link
                    href="/"
                    prefetch
                    className="text-[#1A453B]/50 transition-colors hover:text-[#D87827]"
                  >
                    Home
                  </Link>
                  <span aria-hidden="true" className="text-[#1A453B]/40">/</span>
                  <span aria-current="page" className="text-[#D87827]">Instructors</span>
                </nav>
              </motion.p>
              <motion.span
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white border border-[#1A453B]/15 px-4 py-1.5 text-[12px] font-semibold text-[#1A453B] shadow-sm"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#D87827]" />
                Our Instructors
              </motion.span>
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="mt-5 max-w-3xl text-[32px] sm:text-[34px] font-mona font-semibold leading-[1.12] tracking-tight text-[#1F4D3A]"
              >
                Meet our world-class
                <span className="block">
                  expert{' '}
                  <span className="relative inline-block font-serif italic font-normal text-[#E07B22] [font-size:1.15em] tracking-[-0.01em] align-baseline">
                    instructors
                  </span>
                </span>
              </motion.h1>
              <motion.p
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#536078]"
              >
                Learn directly from industry leaders who have shaped products, teams and careers at the world&apos;s most loved companies.
              </motion.p>

              {/* Search */}
              <motion.form
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                onSubmit={(e) => e.preventDefault()}
                className="mt-9 w-full max-w-md"
              >
                <div className="flex items-center gap-3 rounded-[14px] bg-white py-2 pl-4 pr-2 shadow-lg shadow-[#1A453B]/10">
                  <Search className="w-4.5 h-4.5 text-[#1A453B]/40" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or subject"
                    className="w-full bg-transparent text-[14px] text-[#1A453B] placeholder:text-[#1A453B]/35 outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Search instructors"
                    className="inline-flex items-center gap-2 rounded-[10px] bg-[#D87827] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#c96a1f]"
                  >
                    Search
                  </button>
                </div>
              </motion.form>

              {/* Category pills */}
              <div className="mt-6 flex w-full max-w-[560px] flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-300',
                      activeCategory === cat
                        ? 'bg-[#1A453B] text-white shadow-md'
                        : 'bg-white border border-[#1A453B]/10 text-[#1A453B]/70 hover:bg-white hover:text-[#1A453B] hover:shadow-sm'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.article
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{ once: true, amount: 0.15 }}
              variants={founderCardVariants}
              className="mt-12 grid overflow-hidden rounded-[20px] border border-[#E8E4DD] bg-[#FAFAF7] shadow-[0_18px_50px_-24px_rgba(31,77,58,0.28)] md:grid-cols-[45%_55%] xl:mt-0"
              style={{ fontFamily: '"Mona Sans", sans-serif' }}
              aria-label="CEO and founder profile"
            >
              <motion.div
                variants={founderPhotoVariants}
                className="relative min-h-[360px] overflow-hidden bg-[#E8E4DD] md:min-h-full md:rounded-l-[20px]"
              >
                <Image
                  src="https://plain-apac-prod-public.komododecks.com/202609/25/lknhDoFuWl8m8B3CFLmk/image.jpg"
                  alt="Learn2Earn CEO and Founder"
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 45vw, 25vw"
                  className="object-cover object-center"
                />
              </motion.div>

              <div className="p-5 sm:p-6 xl:p-8">
                <motion.h2
                  variants={founderHeadingVariants}
                  className="whitespace-nowrap text-[24px] font-bold leading-[1.12] tracking-[-0.025em] text-[#1F4D3A]"
                >
                  CEO &amp; Founder
                </motion.h2>

                <div aria-hidden="true" className="mt-2.5 flex h-1 w-20 overflow-hidden rounded-full">
                  <motion.span
                    variants={founderUnderlineVariants}
                    className="h-full w-[58%] origin-left bg-[#1F4D3A]"
                  />
                  <motion.span
                    variants={founderUnderlineVariants}
                    className="h-full w-[42%] origin-left bg-[#E07B22]"
                  />
                </div>

                <motion.p
                  variants={founderHeadingVariants}
                  className="mt-3.5 text-[17px] font-semibold leading-tight text-[#4B4B48]"
                >
                  Building careers that pay
                </motion.p>
                <motion.div
                  variants={founderHeadingVariants}
                  className="mt-3.5 h-px w-full bg-[#D9D6CF]"
                />
                <motion.p
                  variants={founderHeadingVariants}
                  className="mt-3.5 text-[14px] leading-[1.55] text-[#686866]"
                >
                  Empowering professionals with the skills, network, and real-world opportunities to build impactful and rewarding careers.
                </motion.p>

                <motion.div variants={founderFeatureListVariants} className="mt-4 space-y-2">
                  {founderFeatures.map((feature) => (
                    <motion.div
                      key={feature.title}
                      variants={founderFeatureVariants}
                      whileHover={reduceMotion ? undefined : { y: -3 }}
                      className={cn(
                        'group grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2.5 rounded-xl p-2.5',
                        feature.background,
                      )}
                    >
                      <span className={cn('flex h-10 w-10 items-center justify-center rounded-full text-white', feature.iconBackground)}>
                        <motion.span variants={founderIconVariants} className="inline-flex">
                          <feature.icon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-[20deg]" strokeWidth={2.2} />
                        </motion.span>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold leading-tight text-[#1F4D3A]">{feature.title}</p>
                        <p className="mt-0.5 text-[12px] leading-snug text-[#686866]">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  variants={founderHeadingVariants}
                  className="mt-5 grid grid-cols-3 border-t border-[#E8E4DD] pt-4"
                >
                  <div className="flex min-w-0 flex-col items-center px-1 text-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F4D3A] text-white">
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </span>
                    <p className="mt-1.5 text-[12.5px] font-bold leading-tight text-[#1F4D3A]">
                      <FounderCountUp value={4.9} decimals={1} prefersReducedMotion={reduceMotion} /> Rating
                    </p>
                    <p className="mt-1 text-[10.5px] leading-tight text-[#777774]">
                      Based on <FounderCountUp value={800} suffix="+" prefersReducedMotion={reduceMotion} /> reviews
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col items-center border-x border-[#E8E4DD] px-1 text-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E07B22] text-white">
                      <BarChart3 className="h-3.5 w-3.5" />
                    </span>
                    <p className="mt-1.5 text-[12.5px] font-bold leading-tight text-[#1F4D3A]">
                      <FounderCountUp value={1.2} decimals={1} suffix="K+" prefersReducedMotion={reduceMotion} /> Success Stories
                    </p>
                    <p className="mt-1 text-[10.5px] leading-tight text-[#777774]">And counting</p>
                  </div>
                  <div className="flex min-w-0 flex-col items-center px-1 text-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3679C8] text-white">
                      <Globe2 className="h-3.5 w-3.5" />
                    </span>
                    <p className="mt-1.5 text-[12.5px] font-bold leading-tight text-[#1F4D3A]">Global Network</p>
                    <p className="mt-1 text-[10.5px] leading-tight text-[#777774]">
                      Across <FounderCountUp value={40} suffix="+" prefersReducedMotion={reduceMotion} /> countries
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.article>
          </div>
        </section>

        {/* â€”â€”â€”â€”â€” INSTRUCTOR GRID â€”â€”â€”â€”â€” */}
        <section className={cn(instructorsPageContainer, 'relative py-16 lg:py-20')}>
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-[26px] sm:text-[34px] font-semibold leading-tight text-[#1A453B]">
                Our expert{' '}
                <em className="font-serif italic text-[#D87827]">instructors</em>
              </h2>
              <p className="mt-2 text-[14px] text-[#536078]">We believe every learner deserves a mentor who has walked the path.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#1A453B]/10 px-4 py-2 text-[13px] font-semibold text-[#1A453B] shadow-sm">
              <span>{filtered.length}</span>
              <span className="text-[#536078]">Instructors shown</span>
            </div>
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((s, idx) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : Math.min(idx * 0.04, 0.4) }}
                  className="group relative rounded-2xl bg-white border border-[#1A453B]/10 p-2 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#ECEEF0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-[#1A453B] text-[#1A453B]" />
                      <span className="text-[11px] font-bold text-[#1A453B]">{s.rating}</span>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-2 rounded-xl bg-[#F8F5F2] px-3 py-2.5 transition-colors duration-300 group-hover:bg-[#1A453B]">
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold text-[#1F4D3A] transition-colors duration-300 group-hover:text-white">{s.name}</p>
                      <p className="truncate text-[12.5px] text-[#8A8A8A] transition-colors duration-300 group-hover:text-white/70">{s.title}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/0 text-[#1A453B]/30 transition-all duration-300 group-hover:bg-white/15 group-hover:text-white">
                        <Twitter className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/0 text-[#1A453B]/30 transition-all duration-300 group-hover:bg-white/15 group-hover:text-white">
                        <Linkedin className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1 pt-2 pb-0.5 text-[11.5px] text-[#536078]">
                    <span>{s.courses}</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {s.students}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1A453B]/20 bg-white px-6 py-20 text-center"
            >
              <Search className="h-10 w-10 text-[#1A453B]/20" />
              <p className="mt-4 text-[16px] font-semibold text-[#1A453B]">No instructors found</p>
              <p className="mt-1 text-[13px] text-[#536078]">Try a different search term or category.</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All') }}
                className="mt-5 rounded-[10px] bg-[#D87827] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c96a1f]"
              >
                Reset filters
              </button>
            </motion.div>
          )}
        </section>

        {/* â€”â€”â€”â€”â€” BECOME INSTRUCTOR CTA â€”â€”â€”â€”â€” */}
        <section className="relative overflow-hidden bg-[#EEF3EF] py-16 lg:py-24">
          <div className={cn(instructorsPageContainer, 'relative')}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left â€” copy + form */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              >
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-[#1A453B]/15 px-4 py-1.5 text-[12px] font-semibold text-[#D87827]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Become an Instructor
                </motion.span>
                <motion.h2
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="mt-5 max-w-xl text-[30px] sm:text-[40px] font-semibold leading-[1.15] tracking-tight text-[#1A453B]"
                >
                  Begin your instructor journey{' '}
                  <em className="font-serif italic text-[#D87827]">today</em>
                </motion.h2>
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#536078]"
                >
                  Share your expertise with thousands of eager learners, build your personal brand, and earn rewarding income teaching what you love.
                </motion.p>

                <motion.form
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  onSubmit={handleApply}
                  className="mt-8 flex max-w-md items-center gap-3"
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A453B]/35" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full rounded-[12px] bg-white border border-[#1A453B]/15 py-3 pl-11 pr-4 text-[14px] text-[#1A453B] placeholder:text-[#1A453B]/35 outline-none transition-all focus:border-[#D87827] focus:ring-4 focus:ring-[#D87827]/10"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex shrink-0 items-center gap-2 rounded-[12px] bg-[#D87827] px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-[#D87827]/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D87827]/30"
                  >
                    {sent ? 'Applied!' : 'Apply Now'}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </motion.form>

                <motion.div
                  variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                  className="mt-8 flex flex-wrap items-center gap-6"
                >
                  {badgeItems.map((b) => (
                    <span key={b.label} className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[#1A453B]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#1A453B]/15">
                        <b.icon className="h-4 w-4 text-[#D87827]" />
                      </span>
                      {b.label}
                    </span>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: 36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto w-full max-w-[520px]"
              >
                <div className="relative h-[480px] w-full overflow-hidden rounded-[28px] bg-[#173F33] shadow-[0_28px_70px_-32px_rgba(23,63,51,0.65)]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
                      backgroundSize: '22px 22px',
                    }}
                  />
                  <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
                  <div aria-hidden="true" className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#2A5B4A]" />

                  <div className="absolute inset-x-0 bottom-0 h-[400px] overflow-hidden rounded-t-[150px]">
                    <motion.div
                      initial={reduceMotion ? false : { scale: 1.04 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=720&h=900&fit=crop&crop=face"
                        alt="Instructor ready to teach online"
                        fill
                        sizes="(max-width: 1023px) 100vw, 520px"
                        className="object-cover object-top"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#173F33] via-[#173F33]/25 to-transparent" />
                  </div>

                  <div className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-[#E07B22]" />
                    Teach what you know
                  </div>

                  <motion.span
                    animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute right-5 top-[34%] z-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-[0_16px_35px_-18px_rgba(0,0,0,0.45)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E4EEFB]">
                      <BadgeCheck className="h-4.5 w-4.5 text-[#3679C8]" />
                    </span>
                    <span>
                      <span className="block text-[14px] font-bold leading-none text-[#1F4D3A]">Earn 70%</span>
                      <span className="mt-1 block text-[10.5px] leading-none text-[#6B7280]">revenue share</span>
                    </span>
                  </motion.span>

                  <motion.span
                    animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
                    className="absolute left-5 top-[39%] z-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-[0_16px_35px_-18px_rgba(0,0,0,0.45)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F3EA]">
                      <Users className="h-4.5 w-4.5 text-[#1F4D3A]" />
                    </span>
                    <span>
                      <span className="block text-[14px] font-bold leading-none text-[#1F4D3A]">25,000+</span>
                      <span className="mt-1 block text-[10.5px] leading-none text-[#6B7280]">active instructors</span>
                    </span>
                  </motion.span>

                  <motion.div
                    animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.65 }}
                    className="absolute bottom-6 left-6 right-6 z-20 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#173F33]/85 p-4 backdrop-blur-md"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E07B22] text-white">
                      <Headphones className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-[21px] font-bold leading-tight text-white">Turn expertise into impact</span>
                      <span className="mt-1 block text-[12.5px] text-white/70">Build a career through practical teaching.</span>
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <LandingSiteFooter />

      <ScrollToTop />
    </div>
  )
}
