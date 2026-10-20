'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Instructors', href: '#instructors' },
  { label: 'Community', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

const navCoursesDropdownItems = [
  { label: 'Design', color: 'bg-[#7C3AED]' },
  { label: 'UI/UX', color: 'bg-[#A78BFA]' },
  { label: 'Business', color: 'bg-[#E07B22]' },
  { label: 'Marketing', color: 'bg-[#F59E0B]' },
  { label: 'Development', color: 'bg-[#1E293B]' },
]

export function LandingHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false)
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    const sectionIds = navLinks
      .filter((link) => link.href.startsWith('#'))
      .map((link) => link.href.slice(1))

    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      const probe = window.scrollY + window.innerHeight * 0.35
      let current = 'home'
      for (const id of sectionIds) {
        const element = document.getElementById(id)
        if (element && element.offsetTop <= probe) current = id
      }
      setActiveSection(current)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const resolveHref = (href: string) => {
    if (!href.startsWith('#')) return href
    if (isHome) return href
    return href === '#' ? '/' : `/${href}`
  }

  return (
    <>
      <motion.nav
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
        className="fixed left-0 top-0 z-50 w-screen max-w-none"
      >
        <div className="w-full">
          <div className={cn('bg-white/90 backdrop-blur-md', scrolled ? 'border-b border-[#E9E7F5]' : '')}>
            <div className="nav-shell-simple">
              <div className="relative mx-auto flex h-[68px] w-full max-w-[1280px] items-center justify-between px-5 sm:h-[76px] lg:px-8">
                <Link href="/" className="group flex w-[55%] items-center sm:w-[45%] xl:w-auto" aria-label="Learn2Earn">
                  <motion.div
                    className="relative w-full sm:w-auto"
                    animate={{ y: [0, -1.5, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                  >
                    <Image
                      src="https://plain-apac-prod-public.komododecks.com/202609/24/QvqonU8iVHyTE9fh3hih/image.png"
                      alt="Learn2Earn"
                      width={192}
                      height={58}
                      priority
                      className="h-11 w-full rounded-2xl object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03] sm:h-[52px] sm:w-auto"
                    />
                  </motion.div>
                </Link>

                <div className="hidden items-center gap-1 xl:flex">
                  {navLinks.map((link) => {
                    const isAnchor = link.href.startsWith('#')
                    const isActive = isHome && isAnchor && activeSection === link.href.slice(1)

                    if (link.label === 'Courses') {
                      return (
                        <div
                          key={link.label}
                          className="relative"
                          onMouseEnter={() => setCoursesDropdownOpen(true)}
                          onMouseLeave={() => setCoursesDropdownOpen(false)}
                        >
                          <button
                            type="button"
                            onClick={() => isHome && document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                            className={cn(
                              'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 inline-flex items-center gap-1',
                              isActive ? 'text-[#F47B20]' : 'text-[#1A1A1A] hover:text-[#F47B20]',
                            )}
                            aria-expanded={coursesDropdownOpen}
                            aria-haspopup="menu"
                          >
                            {isActive && <span className="absolute left-3 right-3 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-[#F47B20] to-[#6D3DF5]" />}
                            {link.label}
                            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', coursesDropdownOpen && 'rotate-180')} />
                          </button>
                          <AnimatePresence>
                            {coursesDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3"
                                role="menu"
                              >
                                <div className="overflow-hidden rounded-xl border border-[#E9E7F5] bg-white p-2 shadow-sm">
                                  {navCoursesDropdownItems.map((item) => (
                                    <Link
                                      key={item.label}
                                      href="/#courses"
                                      onClick={() => setCoursesDropdownOpen(false)}
                                      className="group/item flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#FDF0E5]"
                                      role="menuitem"
                                    >
                                      <span className={cn('h-2 w-2 shrink-0 rounded-full', item.color)} />
                                      <span className="text-[13px] font-medium text-[#1A1A1A] transition-colors group-hover/item:text-[#F47B20]">{item.label}</span>
                                      <ArrowRight className="ml-auto w-3.5 h-3.5 -translate-x-1 text-[#8B94A8] opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={link.label}
                        href={resolveHref(link.href)}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                          isActive ? 'text-[#F47B20]' : 'text-[#1A1A1A] hover:text-[#F47B20]',
                        )}
                      >
                        {isActive && <span className="absolute left-3 right-3 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-[#F47B20] to-[#6D3DF5]" />}
                        {link.label}
                      </Link>
                    )
                  })}
                </div>

                <div className="hidden items-center gap-3 xl:flex">
                  <Link href="/login" className="landing-control-frame">
                    <button
                      type="button"
                      className="landing-control-reset h-10 whitespace-nowrap rounded-xl border-[1.5px] border-[#F47B20] bg-white px-5 text-sm font-semibold text-[#F47B20] transition-all hover:bg-[#FDF0E5] active:scale-[0.98]"
                    >
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button
                      type="button"
                      className="nav-cta h-10 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#F47B20] to-[#E8630A] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(244,123,32,0.85)] transition-all hover:shadow-[0_14px_26px_-10px_rgba(244,123,32,0.95)] active:scale-[0.98]"
                    >
                      Get Started
                    </button>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen((open) => !open)}
                  className="rounded-xl p-2 text-[#0F1B3D] transition-colors hover:bg-[#F3EEFF] xl:hidden"
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileOpen}
                 >
                   {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                 </button>
               </div>
             </div>
           </div>
         </div>


        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="px-4 sm:px-6 xl:hidden"
            >
              <div className="mt-1 max-h-[calc(100dvh-110px)] overflow-y-auto overscroll-contain rounded-xl border border-[#E9E7F5] bg-white px-4 py-4 shadow-sm">
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const isAnchor = link.href.startsWith('#')
                    const isActive = isHome && isAnchor && activeSection === link.href.slice(1)

                    if (link.label === 'Courses') {
                      return (
                        <div key={link.label}>
                          <button
                            type="button"
                            onClick={() => {
                              if (isHome) {
                                setMobileCoursesOpen((open) => !open)
                              } else {
                                router.push('/#courses')
                                setMobileOpen(false)
                              }
                            }}
                            className={cn(
                              'inline-flex w-full items-center gap-1 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-gradient-to-r from-[#F47B20]/12 to-[#6D3DF5]/12 text-[#F47B20]'
                                : 'text-[#536078] hover:bg-[#FDF0E5] hover:text-[#F47B20]',
                            )}
                            aria-expanded={mobileCoursesOpen}
                          >
                            {link.label}
                            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', mobileCoursesOpen && 'rotate-180')} />
                          </button>
                          <AnimatePresence initial={false}>
                            {mobileCoursesOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
                                <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-[#F47B20]/25 pl-3">
                                  {navCoursesDropdownItems.map((item) => (
                                    <Link
                                      key={item.label}
                                      href="/#courses"
                                      onClick={() => setMobileOpen(false)}
                                      className="inline-flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-[13px] font-medium text-[#536078] transition-colors hover:bg-[#FDF0E5] hover:text-[#F47B20]"
                                    >
                                      <span className={cn('h-2 w-2 rounded-full', item.color)} />
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={link.label}
                        href={resolveHref(link.href)}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-gradient-to-r from-[#F47B20]/12 to-[#6D3DF5]/12 text-[#F47B20]'
                            : 'text-[#536078] hover:bg-[#FDF0E5] hover:text-[#F47B20]',
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
                <div className="space-y-2 pt-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="landing-control-frame block">
                    <button type="button" className="landing-control-reset h-11 w-full rounded-xl border-[1.5px] border-[#F47B20] bg-white text-sm font-semibold text-[#F47B20] transition-all active:scale-[0.98]">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="block">
                    <button type="button" className="nav-cta h-11 w-full rounded-xl bg-gradient-to-r from-[#F47B20] to-[#E8630A] text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(244,123,32,0.9)] transition-all active:scale-[0.98]">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style jsx global>{`
        .nav-shell-simple {
          position: relative;
          background: transparent;
          font-family: 'Mona Sans', sans-serif;
        }
        .nav-link-pill {
          display: none;
        }
        .nav-cta {
          position: relative;
          overflow: hidden;
        }
        .nav-cta::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.45), transparent);
          transform: translateX(-160%) skewX(-18deg);
          transition: transform 0.7s ease;
        }
        .nav-cta:hover::after { transform: translateX(160%) skewX(-18deg); }
      `}</style>
    </>
  )
}
