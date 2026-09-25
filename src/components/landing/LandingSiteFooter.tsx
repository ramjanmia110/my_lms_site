'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Building,
  Facebook,
  GraduationCap,
  Instagram,
  Link2,
  Linkedin,
  Lock,
  MailPlus,
  Send,
  Sparkles,
  Twitter,
  Users,
  Wallet,
  Youtube,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '@/components/ui/container'

const footerCtaFeatures: {
  icon: LucideIcon
  accent: string
  title: string
  desc: string
}[] = [
  { icon: BookOpen, accent: 'text-[#F8B681] bg-[#E07B22]/10 ring-[#E07B22]/25', title: 'Learn', desc: 'Access premium courses and expert guidance.' },
  { icon: Wallet, accent: 'text-[#7BD6A9] bg-[#2E7D5B]/15 ring-[#2E7D5B]/40', title: 'Earn', desc: 'Complete tasks, projects, and earn real income.' },
  { icon: Users, accent: 'text-[#B8C9C0] bg-white/5 ring-white/15', title: 'Grow Together', desc: 'Join a supportive community and achieve more.' },
]

const footerQuickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Become an Instructor', href: '#instructors' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#' },
  { label: 'Contact Us', href: '#' },
]

const footerLearnerLinks = [
  { label: 'Browse Courses', href: '#courses' },
  { label: 'Learning Paths', href: '#how-it-works' },
  { label: 'Student Dashboard', href: '#' },
  { label: 'Certificates', href: '#' },
  { label: 'Career Support', href: '#' },
  { label: 'FAQs', href: '#' },
]

const footerEarnerLinks = [
  { label: 'How to Earn', href: '#earn-while-you-learn' },
  { label: 'Available Jobs', href: '#' },
  { label: 'Freelance Projects', href: '#' },
  { label: 'Affiliate Program', href: '#community' },
  { label: 'Payout Methods', href: '#' },
  { label: 'Earnings Calculator', href: '#' },
]

const footerCompanyLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Our Mission', href: '#' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Careers', href: '#' },
  { label: 'Press & Media', href: '#' },
  { label: 'Partners', href: '#' },
]

const footerSocials: { icon: LucideIcon; label: string }[] = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter / X' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Youtube, label: 'YouTube' },
]

const footerGridStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const footerColIn = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

function FooterLinksCol({ title, icon, links }: {
  title: string
  icon: ReactNode
  links: { label: string; href: string }[]
}) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const resolveHref = (href: string) => {
    if (!href.startsWith('#')) return href
    if (isHome) return href
    return href === '#' ? '/' : `/${href}`
  }

  return (
    <div>
      <h4 className="group/title mb-4 flex items-center gap-2 text-[16px] font-semibold text-white">
        <span className="transition-transform duration-300 group-hover/title:rotate-6 group-hover/title:scale-110">{icon}</span>
        {title}
        <span aria-hidden="true" className="h-px min-w-[12px] flex-1 bg-gradient-to-r from-white/25 to-transparent" />
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={resolveHref(link.href)}
              onClick={(event) => {
                if (isHome && link.href.startsWith('#')) {
                  const element = document.getElementById(link.href.slice(1))
                  if (element) {
                    event.preventDefault()
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }
              }}
              className="group/link relative inline-flex items-center gap-1.5 text-[14px] text-[#B8C9C0] transition-colors duration-200 hover:text-[#E07B22]"
            >
              <ArrowRight className="h-3.5 w-3.5 shrink-0 -translate-x-1.5 text-[#E07B22] opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100" />
              {link.label}
              <span aria-hidden="true" className="absolute -bottom-[3px] left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#E07B22] to-[#F59E0B] transition-transform duration-300 group-hover/link:scale-x-100" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CtaScene() {
  return (
    <svg viewBox="0 0 120 120" className="h-20 w-20 shrink-0" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="landing-footer-cta-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E07B22" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="46" fill="#E07B22" opacity="0.12" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#F8B681" strokeWidth="1.5" strokeDasharray="2 6" opacity="0.5" />
      <rect x="26" y="26" width="68" height="68" rx="18" fill="url(#landing-footer-cta-gradient)" />
      <path d="M52 44 v22 l16 9 v-22 z" fill="#FFFFFF" />
      <circle cx="60" cy="60" r="8" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
    </svg>
  )
}

export function LandingSiteFooter() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <footer
      className="relative z-20 overflow-hidden border-t border-[#234433]/60 bg-gradient-to-b from-[#0F2E24] to-[#143A2C]"
      style={{ fontFamily: "'Mona Sans', sans-serif" }}
    >
      <motion.div
        aria-hidden="true"
        animate={prefersReducedMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#E07B22,#F8B681,#2E7D5B,#F8B681,#E07B22)] bg-[length:200%_100%]"
      />
      <div className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full bg-[#2E6650]/40 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-[#1F4D3A]/50 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-[#E07B22]/10 opacity-50 blur-3xl" />
      <motion.div
        aria-hidden="true"
        animate={prefersReducedMotion ? undefined : { y: [0, -18, 0], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute right-[12%] top-24 h-24 w-24 rounded-full bg-[#E07B22]/15 blur-2xl"
      />
      <motion.div
        aria-hidden="true"
        animate={prefersReducedMotion ? undefined : { y: [0, 14, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="pointer-events-none absolute bottom-28 left-[8%] h-28 w-28 rounded-full bg-[#43A67A]/15 blur-2xl"
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#B8C9C0_1px,transparent_1px)] [background-size:22px_22px]" />

      <Container size="full" className="relative py-16 lg:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={footerColIn}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#16352A] via-[#123027] to-[#0F2A21] shadow-lg shadow-black/25"
        >
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#E07B22]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-[#43A67A]/20 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 top-1/3 h-56 w-56 rounded-full bg-[#1F4D3A]/40 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative flex flex-col items-center gap-10 px-7 py-10 lg:px-12 lg:py-12 xl:flex-row">
            <div className="flex-1">
              <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  <CtaScene />
                </div>
                <div className="text-center sm:text-left">
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#E07B22]/30 bg-[#E07B22]/10 px-3 py-1">
                    <Sparkles className="h-3 w-3 text-[#E07B22]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F8B681]">Learn. Earn. Grow.</span>
                  </span>
                  <h2 className="text-[26px] font-extrabold leading-tight text-white lg:text-[32px]">Start Learning. Start Earning.</h2>
                  <h3 className="mt-1.5 text-[20px] font-extrabold capitalize leading-snug text-white lg:text-[24px]">
                    Start Your{' '}
                    <span className="relative inline-block">
                      Journey
                      <svg className="absolute -bottom-1.5 left-0 h-2.5 w-full" viewBox="0 0 120 8" fill="none" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M2 6 C 30 1, 90 1, 118 6" stroke="#E07B22" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span>{' '}
                    Today!
                  </h3>
                  <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-[#B8C9C0]">
                    Join thousands of learners who are building skills, earning income, and creating a better future.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {footerCtaFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${feature.accent}`}>
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold leading-tight text-white">{feature.title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#8FA79D]">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-3 xl:items-end xl:pr-2">
              <Link href="/signup">
                <button className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E07B22] to-[#F59E0B] px-7 py-3.5 text-[14px] font-bold text-white shadow-sm transition-colors duration-300 hover:from-[#C96A18] hover:to-[#E07B22]">
                  Join Now &ndash; It&apos;s Free!
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>
              <p className="text-[11px] text-[#8FA79D]">No hidden charges. Cancel anytime.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-60px' }}
          variants={footerGridStagger}
          className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 xl:grid-cols-6"
        >
          <motion.div variants={footerColIn} className="col-span-2 md:col-span-3 xl:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center" aria-label="Learn2Earn">
              <span className="inline-flex items-center justify-center rounded-2xl bg-white px-3.5 py-2 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)]">
                <Image src="/footer-logo.jpg" alt="Learn2Earn" width={1088} height={960} className="h-14 w-auto object-contain" />
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed text-[#B8C9C0]">
              The all-in-one platform to learn new skills, earn income, and build the future you deserve.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {footerSocials.map((social, index) => (
                <motion.button
                  key={social.label}
                  variants={footerColIn}
                  custom={index}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.18, rotate: 6, y: -3 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A6B5C] bg-transparent text-[#B8C9C0] transition-colors duration-200 hover:border-[#E07B22] hover:bg-[#E07B22] hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
            <FooterLinksCol title="Quick Links" icon={<Link2 className="h-4 w-4 text-[#E07B22]" />} links={footerQuickLinks} />
          </motion.div>
          <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
            <FooterLinksCol title="For Learners" icon={<GraduationCap className="h-4 w-4 text-[#E07B22]" />} links={footerLearnerLinks} />
          </motion.div>
          <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
            <FooterLinksCol title="For Earners" icon={<Wallet className="h-4 w-4 text-[#F8B681]" />} links={footerEarnerLinks} />
          </motion.div>
          <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
            <FooterLinksCol title="Company" icon={<Building className="h-4 w-4 text-[#E07B22]" />} links={footerCompanyLinks} />
          </motion.div>

          <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
            <h4 className="group/title mb-4 flex items-center gap-2 text-[16px] font-semibold text-white">
              <span className="transition-transform duration-300 group-hover/title:rotate-6 group-hover/title:scale-110">
                <MailPlus className="h-4 w-4 text-[#E07B22]" />
              </span>
              Stay Updated
              <span aria-hidden="true" className="h-px min-w-[12px] flex-1 bg-gradient-to-r from-white/25 to-transparent" />
            </h4>
            <p className="mb-3 text-[12px] leading-relaxed text-[#B8C9C0]">Subscribe to get the latest courses, tips, and updates.</p>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 transition-all duration-300 focus-within:border-[#E07B22]/60 focus-within:shadow-[0_0_0_4px_rgba(224,123,34,0.12)]"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent px-2 text-[12px] text-white outline-none placeholder:text-[#5C776C]"
              />
              <motion.button
                type="submit"
                aria-label="Subscribe"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.15, rotate: -4 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#E07B22] to-[#F59E0B] text-white shadow-sm transition-colors duration-200 hover:from-[#C96A18] hover:to-[#E07B22]"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
            <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-snug text-[#5C776C]">
              <Lock className="mt-0.5 h-3 w-3 shrink-0" />
              We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-14 pt-8"
        >
          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-[#5C776C] to-transparent" />
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-[13px] text-[#5C776C]">&copy; 2026 <span className="font-semibold text-[#E07B22]">Learn2Earn</span>. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[#5C776C]">
              {['Terms of Use', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'].map((item) => (
                <button key={item} type="button" className="transition-colors hover:text-[#F8B681]">{item}</button>
              ))}
            </div>
            <p className="text-[13px] text-[#5C776C]">Made with &#128154; for learners worldwide.</p>
          </div>
        </motion.div>
      </Container>
    </footer>
  )
}
