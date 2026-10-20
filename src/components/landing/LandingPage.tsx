'use client'

import { useState, useEffect, useRef, useMemo, Fragment, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useInView, useReducedMotion, useMotionValue, useSpring, useTransform, useScroll, animate } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import {
  Menu, X, Star, Users, BookOpen,
  Clock, Award, TrendingUp, Sparkles,
  Briefcase, Globe, ShieldCheck,
  Play, ArrowRight, GraduationCap,
  CheckCircle,
  MapPin, CalendarDays,
  Code, Trophy, BarChart3,
  DollarSign,
  Download, Infinity as InfinityIcon,
  BadgeCheck,
  Heart, Zap, Flame, Target,
  Compass, Wallet, ClipboardCheck, Headphones,
  User, ShoppingBag, IndianRupee, FolderOpen,
  Palette, PenTool, ChevronLeft, ChevronRight, Quote,
  Linkedin, Github, Copy, Eye,
  Gift, Percent, Medal, Link2, Share2, HeartHandshake,
  Building, Send, Lock, MailPlus,
  Facebook, Twitter, Instagram, Youtube,
  Map, Bell, LayoutDashboard, LayoutGrid, MessageCircle, Brain, LineChart, FileCode2, Server, Smartphone, Languages,
  ChevronDown, MoreVertical, Pencil, Upload, FilterX, RefreshCw, Check,
  Radio, MessageSquare, UserCheck, GitFork, Video, Laptop, Pause, Volume, Maximize,
  Search, LayoutList, ArrowDownWideNarrow, SlidersHorizontal,
  Lightbulb, FileText, ArrowUpRight, UserPlus, PlayCircle,
  Crown,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import EnrollmentModal from '@/components/landing/EnrollmentModal'
import { coursesAPI } from '@/lib/api'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { savePendingEnrollment, saveCourseSnapshot } from '@/lib/pending-enrollment'
import { courses, toSlug, hoursToMonths } from '@/lib/course-catalog'

const referHowItWorks: {
  icon: LucideIcon
  grad: string
  title: string
  desc: string
}[] = [
  { icon: Link2, grad: 'from-[#6D3DF5] to-[#8B5CF6]', title: 'Share Your Link', desc: 'Share your unique referral link with your friends.' },
  { icon: Users, grad: 'from-[#3478F6] to-[#60A5FA]', title: 'Friends Join & Learn', desc: 'Your friends sign up, enroll in courses, and start learning.' },
  { icon: Wallet, grad: 'from-[#18A878] to-[#34D399]', title: 'They Succeed', desc: 'When your friends complete courses or make purchases.' },
  { icon: Gift, grad: 'from-[#6D3DF5] to-[#A78BFA]', title: 'You Earn Rewards', desc: 'You earn rewards, cash, vouchers, and more!' },
]

const referRewardCards: {
  icon: LucideIcon
  tint: string
  iconGrad: string
  title: string
  value: string
  valueColor: string
  desc: string
  progress: number
  progressGrad: string
  tag: string
}[] = [
  { icon: Wallet, tint: 'bg-[#ECFBF5]', iconGrad: 'from-[#18A878] to-[#34D399]', title: 'Cash Rewards', value: '₹500+', valueColor: 'text-[#18A878]', desc: 'Earn real cash and withdraw to your preferred method anytime.', progress: 72, progressGrad: 'from-[#18A878] to-[#34D399]', tag: 'Withdraw anytime' },
  { icon: Percent, tint: 'bg-[#EEF4FF]', iconGrad: 'from-[#3478F6] to-[#60A5FA]', title: 'Discount Vouchers', value: 'Up to 30%', valueColor: 'text-[#3478F6]', desc: 'Get exclusive discounts on courses and premium programs.', progress: 55, progressGrad: 'from-[#3478F6] to-[#60A5FA]', tag: 'On any course' },
  { icon: Medal, tint: 'bg-[#F3EEFF]', iconGrad: 'from-[#6D3DF5] to-[#8B5CF6]', title: 'Bonus Points', value: '1,000 Pts', valueColor: 'text-[#6D3DF5]', desc: 'Collect bonus points and redeem for amazing rewards.', progress: 64, progressGrad: 'from-[#6D3DF5] to-[#8B5CF6]', tag: 'Redeemable' },
  { icon: Gift, tint: 'bg-[#FEF5E7]', iconGrad: 'from-[#F59E0B] to-[#FBBF24]', title: 'Exclusive Perks', value: 'Early Access', valueColor: 'text-[#F59E0B]', desc: 'Unlock early access, special offers, and premium content.', progress: 48, progressGrad: 'from-[#F59E0B] to-[#FBBF24]', tag: 'Premium' },
]

const referSummaryRows: {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  value: string
}[] = [
  { icon: Users, iconBg: 'bg-[#EEF4FF]', iconColor: 'text-[#3478F6]', label: 'Total Invites', value: '128' },
  { icon: GraduationCap, iconBg: 'bg-[#EEF4FF]', iconColor: 'text-[#3478F6]', label: 'Friends Enrolled', value: '64' },
  { icon: CheckCircle, iconBg: 'bg-[#ECFBF5]', iconColor: 'text-[#18A878]', label: 'Successful Referrals', value: '42' },
  { icon: Wallet, iconBg: 'bg-[#F3EEFF]', iconColor: 'text-[#6D3DF5]', label: 'Pending Earnings', value: '₹2,350' },
]

const referBannerBlocks: {
  icon: LucideIcon
  grad: string
  title: string
  desc: string
  stat: string
  chipClass: string
}[] = [
  { icon: HeartHandshake, grad: 'from-[#6D3DF5] to-[#8B5CF6]', title: 'Help & Inspire', desc: 'Help your friends build skills and achieve their goals.', stat: '2K+ friends helped', chipClass: 'bg-[#F3EEFF] text-[#6D3DF5]' },
  { icon: Users, grad: 'from-[#3478F6] to-[#60A5FA]', title: 'Stronger Community', desc: 'Learn, grow, and succeed together with a supportive community.', stat: '5K+ members', chipClass: 'bg-[#EEF4FF] text-[#3478F6]' },
  { icon: TrendingUp, grad: 'from-[#18A878] to-[#34D399]', title: 'Unlimited Earning', desc: "There's no limit to how much you can earn. Keep growing together!", stat: 'No earning caps', chipClass: 'bg-[#ECFBF5] text-[#18A878]' },
  { icon: ShieldCheck, grad: 'from-[#6D3DF5] to-[#A78BFA]', title: 'Trusted & Secure', desc: 'Our platform is 100% safe, transparent, and trusted by thousands.', stat: '100% safe', chipClass: 'bg-[#FEF5E7] text-[#F59E0B]' },
]

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

const footerQuickLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Become an Instructor', href: '#instructors' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#' },
  { label: 'Contact Us', href: '#' },
]

const footerLearnerLinks: { label: string; href: string }[] = [
  { label: 'Browse Courses', href: '#courses' },
  { label: 'Learning Paths', href: '#how-it-works' },
  { label: 'Student Dashboard', href: '#' },
  { label: 'Certificates', href: '#' },
  { label: 'Career Support', href: '#' },
  { label: 'FAQs', href: '#' },
]

const footerEarnerLinks: { label: string; href: string }[] = [
  { label: 'How to Earn', href: '#earn-while-you-learn' },
  { label: 'Available Jobs', href: '#' },
  { label: 'Freelance Projects', href: '#' },
  { label: 'Affiliate Program', href: '#community' },
  { label: 'Payout Methods', href: '#' },
  { label: 'Earnings Calculator', href: '#' },
]

const footerCompanyLinks: { label: string; href: string }[] = [
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

const footerTrustBadges: {
  icon: LucideIcon
  accent: string
  title: string
  desc: string
}[] = [
  { icon: ShieldCheck, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', title: '100% Secure', desc: 'Your data is safe with us.' },
  { icon: Users, accent: 'text-[#60A5FA] bg-[#60A5FA]/10 ring-[#60A5FA]/25', title: 'Expert Instructors', desc: 'Learn from verified industry experts.' },
  { icon: InfinityIcon, accent: 'text-[#34D399] bg-[#34D399]/10 ring-[#34D399]/25', title: 'Lifetime Access', desc: 'Learn at your own pace, anytime.' },
  { icon: Headphones, accent: 'text-[#60A5FA] bg-[#60A5FA]/10 ring-[#60A5FA]/25', title: '24/7 Support', desc: "We're here to help you anytime." },
  { icon: Medal, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', title: 'Money Back Guarantee', desc: '7-day money back guarantee.' },
  { icon: Globe, accent: 'text-[#34D399] bg-[#34D399]/10 ring-[#34D399]/25', title: 'Global Community', desc: 'Join learners from 120+ countries.' },
]

const footerStats: {
  icon: LucideIcon
  accent: string
  value: string
  label: string
  stars?: boolean
}[] = [
  { icon: BookOpen, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', value: '500+', label: 'Expert Courses' },
  { icon: Users, accent: 'text-[#60A5FA] bg-[#60A5FA]/10 ring-[#60A5FA]/25', value: '50K+', label: 'Active Learners' },
  { icon: Briefcase, accent: 'text-[#34D399] bg-[#34D399]/10 ring-[#34D399]/25', value: '10K+', label: 'Jobs & Projects' },
  { icon: IndianRupee, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', value: '₹10Cr+', label: 'Paid to Learners' },
  { icon: Star, accent: 'text-[#FBBF24] bg-[#FBBF24]/10 ring-[#FBBF24]/25', value: '4.8/5', label: 'Average Rating', stars: true },
]

const earnFeatureRow: {
  icon: LucideIcon
  title: string
  desc: string
}[] = [
  { icon: GraduationCap, title: 'Create & Publish Courses', desc: 'Turn your expertise into structured courses and share them with the world.' },
  { icon: Users, title: 'Grow Your Audience', desc: 'Build a loyal following of learners and expand your reach across the platform.' },
  { icon: BarChart3, title: 'Earn More', desc: 'Track revenue, see what sells, and grow your teaching income month after month.' },
  { icon: Wallet, title: 'Get Paid Securely', desc: 'Withdraw your earnings anytime with fast, secure and reliable payouts.' },
]

const earnSteps: {
  icon: LucideIcon
  title: string
  desc: string
}[] = [
  { icon: Pencil, title: '1. Create', desc: 'Build your course and shape your content with easy tools.' },
  { icon: Upload, title: '2. Publish', desc: 'Launch your course live to the whole platform.' },
  { icon: Users, title: '3. Teach & Inspire', desc: 'Engage learners and grow your audience.' },
  { icon: DollarSign, title: '4. Earn', desc: 'Get paid for every happy learner you teach.' },
]

const learnApplyEarnSteps: {
  num: string
  title: string
  icon: LucideIcon
  grad: string
  desc: string
}[] = [
  { num: '01', title: 'Learn', icon: BookOpen, grad: 'from-[#6D3DF5] to-[#8B5CF6]', desc: 'Learn from expert-led courses and master in-demand skills.' },
  { num: '02', title: 'Apply', icon: Code, grad: 'from-[#3478F6] to-[#60A5FA]', desc: 'Complete projects, solve real problems, and build your portfolio.' },
  { num: '03', title: 'Earn', icon: DollarSign, grad: 'from-[#18A878] to-[#34D399]', desc: 'Get hired, work on gigs, and start earning a real income.' },
]

const waysToEarn: {
  icon: LucideIcon
  grad: string
  title: string
  desc: string
}[] = [
  { icon: User, grad: 'from-[#6D3DF5] to-[#8B5CF6]', title: 'Freelance Projects', desc: 'Get hired by clients for real projects and earn.' },
  { icon: ShoppingBag, grad: 'from-[#3478F6] to-[#60A5FA]', title: 'Marketplace Gigs', desc: 'Sell your services in our built-in marketplace.' },
  { icon: Users, grad: 'from-[#18A878] to-[#34D399]', title: 'Affiliate Earnings', desc: 'Refer friends and earn exciting commissions.' },
  { icon: Play, grad: 'from-[#6D3DF5] to-[#A78BFA]', title: 'Premium Content', desc: 'Create and sell courses, templates, or digital products.' },
]

const earnStatsBanner: {
  icon: LucideIcon
  grad: string
  value: string
  label: string
  sub: string
}[] = [
  { icon: IndianRupee, grad: 'from-[#6D3DF5] to-[#8B5CF6]', value: '₹10Cr+', label: 'Paid Out to Learners', sub: 'Real earnings, real impact' },
  { icon: Users, grad: 'from-[#3478F6] to-[#60A5FA]', value: '50K+', label: 'Active Earners', sub: 'Students who are earning every day' },
  { icon: Briefcase, grad: 'from-[#18A878] to-[#34D399]', value: '1000+', label: 'Jobs & Gigs', sub: 'Opportunities posted every month' },
  { icon: ShieldCheck, grad: 'from-[#6D3DF5] to-[#A78BFA]', value: '4.8/5', label: 'Learner Rating', sub: 'Trusted by thousands of happy learners' },
  { icon: Globe, grad: 'from-[#3478F6] to-[#7DD3FC]', value: 'Global', label: 'Opportunities', sub: 'Work with clients from around the world' },
]

const testimonialList: {
  id: number
  name: string
  role: string
  quote: string
  image: string
}[] = [
  { id: 1, name: 'Priya Sharma', role: 'Frontend Developer', quote: 'The hands-on projects and expert mentorship changed my career completely. I moved from a junior role to leading product builds within a year.', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face' },
  { id: 2, name: 'Daniel Carter', role: 'Data Analyst', quote: 'I started with zero analytics background. Today I build dashboards that drive real business decisions and my salary has doubled.', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop&crop=face' },
  { id: 3, name: 'Amina Khan', role: 'Product Designer', quote: 'The UI/UX track gave me a portfolio employers actually love. I now freelance for international clients from anywhere in the world.', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face' },
  { id: 4, name: 'Marco Rossi', role: 'Digital Marketer', quote: 'Learning marketing here unlocked a freelancing career I never thought possible. The live mentorship made all the difference.', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face' },
  { id: 5, name: 'Sofia Martinez', role: 'Full-Stack Developer', quote: 'From writing my first line of code to shipping full-stack apps, the structured path kept me motivated every single day.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face' },
  { id: 6, name: 'Arjun Nair', role: 'Software Engineer', quote: 'The career support and placement guidance helped me land my dream job. It was worth every minute I invested in learning.', image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop&crop=face' },
  { id: 7, name: 'Emma Wilson', role: 'Backend Engineer', quote: 'I loved how practical everything was. Real projects, real feedback, and a community that never lets you give up.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face' },
  { id: 8, name: 'Isabella Santos', role: 'Mobile Developer', quote: 'The Flutter track helped me ship my first app in weeks. The support community is simply the best I have ever seen.', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=face' },
  { id: 9, name: 'Liam Johnson', role: 'Cloud Architect', quote: 'The DevOps path took me from zero cloud knowledge to building production systems. My team trusts my architecture decisions now.', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face' },
  { id: 10, name: 'Nadia Rahman', role: 'UX Researcher', quote: 'Real user research, real design systems, real client projects. This platform made me job-ready faster than any degree could.', image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&h=200&fit=crop&crop=face' },
  { id: 11, name: 'Oliver Brown', role: 'AI Engineer', quote: 'The AI curriculum is incredibly current. I landed a machine learning role right after finishing the advanced track.', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop&crop=face' },
  { id: 12, name: 'Hannah Lee', role: 'Content Strategist', quote: 'I turned my writing skills into a thriving freelance business. The portfolio projects gave me clients within the first month.', image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&crop=face' },
]

const testimonialStats: {
  icon: LucideIcon
  bg: string
  value: string
  label: string
}[] = [
  { icon: Users, bg: 'bg-[#6D3DF5]', value: '25K+', label: 'Happy Learners' },
  { icon: Star, bg: 'bg-[#18A878]', value: '4.9/5', label: 'Average Rating' },
  { icon: MessageCircle, bg: 'bg-[#3478F6]', value: '2.5K+', label: 'Learner Reviews' },
  { icon: GraduationCap, bg: 'bg-[#3478F6]', value: '95%', label: 'Would Recommend' },
]

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const testimonialHeading = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const testimonialRow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const testimonialSlideIn = (fromLeft: boolean) => ({
  hidden: { opacity: 0, x: fromLeft ? -72 : 72 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
})

const testimonialVideoIn = {
  hidden: { opacity: 0, scale: 0.82 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 220, damping: 20 },
  },
}

function TestimonialPagination({
  index,
  onSelect,
  prefersReducedMotion,
}: {
  index: number
  onSelect: (i: number) => void
  prefersReducedMotion: boolean | null
}) {
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' as const }
  return (
    <div className="flex items-center justify-center mt-5 gap-1.5">
      {testimonialList.map((t, i) => {
        const active = i === index
        return (
          <Fragment key={t.id}>
            <button
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => onSelect(i)}
              className="flex items-center cursor-pointer p-1 -m-1"
            >
              <motion.span
                initial={false}
                animate={{ width: active ? 9 : 7, height: active ? 9 : 7, backgroundColor: active ? '#1F4D3A' : '#D8D4CB' }}
                transition={transition}
                className="rounded-full"
              />
            </button>
            {i < testimonialList.length - 1 && (
              <motion.span
                initial={false}
                animate={{ width: active ? 22 : 9, backgroundColor: active ? '#1F4D3A' : '#D8D4CB' }}
                transition={transition}
                className="hidden h-[2px] rounded-full"
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

const footerGridStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const footerColIn = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const pricingPlans: {
  key: 'free' | 'pro' | 'premium'
  name: string
  tagline: string
  icon: LucideIcon
  accent: string
  accentDark: string
  period: string
  priceMonthly: string
  priceAnnual: string
  annualNote: string
  features: string[]
  cta: string
  orderClass: string
  ribbon: boolean
  shimmer: boolean
  borderClass: string
  hoverBorderClass: string
  shadowClass: string
  hoverShadowClass: string
  ctaClass: string
}[] = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Explore and get started',
    icon: BookOpen,
    accent: '#1F4D3A',
    accentDark: '#14382A',
    period: '/ forever',
    priceMonthly: '৳0',
    priceAnnual: '৳0',
    annualNote: '',
    features: ['Access to 3 free courses', 'Community forum access', 'Basic certificate', 'Limited freelance marketplace browsing'],
    cta: 'Start Free',
    orderClass: 'order-2 lg:order-none',
    ribbon: false,
    shimmer: false,
    borderClass: 'border-[#E8E4DD]',
    hoverBorderClass: 'hover:border-[#1F4D3A]',
    shadowClass: 'shadow-[0_8px_28px_-12px_rgba(31,77,58,0.14)]',
    hoverShadowClass: 'hover:shadow-[0_26px_54px_-18px_rgba(31,77,58,0.30)]',
    ctaClass: 'border-2 border-[#1F4D3A] bg-white text-[#1F4D3A] hover:bg-[#1F4D3A] hover:text-white',
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For serious learners ready to earn',
    icon: GraduationCap,
    accent: '#E07B22',
    accentDark: '#B85E0F',
    period: '/ month',
    priceMonthly: '৳990',
    priceAnnual: '৳792',
    annualNote: 'billed ৳9,504/yr · save ৳2,376',
    features: ['Full access to all 25+ courses', 'Verified certificates', 'Freelance marketplace access', '15% referral commission', 'Priority job placement support', 'Weekly skill challenges entry'],
    cta: 'Get Pro',
    orderClass: 'order-1 md:col-span-2 lg:order-none lg:col-span-1',
    ribbon: true,
    shimmer: true,
    borderClass: 'border-transparent',
    hoverBorderClass: 'hover:border-transparent',
    shadowClass: 'shadow-[0_18px_44px_-16px_rgba(224,123,34,0.32)]',
    hoverShadowClass: 'hover:shadow-[0_30px_60px_-20px_rgba(224,123,34,0.40)]',
    ctaClass: 'bg-[#E07B22] text-white shadow-[0_10px_20px_-8px_rgba(224,123,34,0.55)] hover:bg-[#E07B22]/90',
  },
  {
    key: 'premium',
    name: 'Premium',
    tagline: 'Maximum earning potential',
    icon: Crown,
    accent: '#D9A441',
    accentDark: '#B8842B',
    period: '/ month',
    priceMonthly: '৳1,990',
    priceAnnual: '৳1,592',
    annualNote: 'billed ৳19,104/yr · save ৳4,776',
    features: ['Everything in Pro', '1-on-1 mentor sessions', '25% referral commission', 'Guaranteed job interview assistance', 'Early access to new courses', 'Dedicated earnings manager'],
    cta: 'Get Premium',
    orderClass: 'order-3 lg:order-none',
    ribbon: false,
    shimmer: false,
    borderClass: 'border-[#E8E4DD]',
    hoverBorderClass: 'hover:border-[#D9A441]',
    shadowClass: 'shadow-[0_8px_28px_-12px_rgba(31,77,58,0.14)]',
    hoverShadowClass: 'hover:shadow-[0_26px_54px_-18px_rgba(217,164,65,0.32)]',
    ctaClass: 'bg-[#D9A441] text-[#3A2A08] shadow-[0_10px_20px_-8px_rgba(217,164,65,0.50)] hover:bg-[#D9A441]/90',
  },
]

function PlanPrice({ amount, period, note, noFlip, prefersReducedMotion }: { amount: string; period: string; note: string; noFlip: boolean; prefersReducedMotion: boolean | null }) {
  return (
    <div className="mb-2">
      <div className="relative [perspective:600px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={amount}
            initial={noFlip || prefersReducedMotion ? false : { opacity: 0, y: 18, rotateX: -60 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={noFlip || prefersReducedMotion ? undefined : { opacity: 0, y: -18, rotateX: 60 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-baseline gap-1.5 justify-center will-change-transform"
          >
            <span className="text-[36px] font-bold text-[#1F4D3A] tracking-tight leading-none sm:text-[40px]">{amount}</span>
            <span className="text-[13px] font-medium text-[#6B7280]">{period}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="min-h-[22px]">
        <AnimatePresence mode="wait" initial={false}>
          {note ? (
            <motion.p
              key={amount + note}
              initial={noFlip || prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={noFlip || prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="pt-1 text-[11px] font-semibold text-[#1F4D3A]"
            >
              {note}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PricingCheck({ delay, prefersReducedMotion }: { delay: number; prefersReducedMotion: boolean | null }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-[18px] h-[18px] text-[#1F4D3A] shrink-0 mt-[1px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.path
        d="M20 6 9 17l-5-5"
        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={prefersReducedMotion ? undefined : { pathLength: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      />
    </svg>
  )
}

function RippleButton({ onClick, children, className }: { onClick?: () => void; children: ReactNode; className?: string }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([])
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRipples((r) => [...r, { id: Date.now() + Math.random(), x: e.clientX - rect.left, y: e.clientY - rect.top, size }])
    }
    onClick?.()
  }
  return (
    <button type="button" onClick={handleClick} className={cn('relative overflow-hidden', className)}>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          onAnimationEnd={() => setRipples((cur) => cur.filter((x) => x.id !== r.id))}
          className="pricing-ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      {children}
    </button>
  )
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Instructors', href: '#instructors' },
  { label: 'Community', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

const navCoursesDropdownItems: { label: string; key: string; color: string }[] = [
  { label: 'Design', key: 'Design & Media', color: 'bg-[#7C3AED]' },
  { label: 'UI/UX', key: 'Design & Media', color: 'bg-[#A78BFA]' },
  { label: 'Business', key: 'Business & Marketing', color: 'bg-[#E07B22]' },
  { label: 'Marketing', key: 'Business & Marketing', color: 'bg-[#F59E0B]' },
  { label: 'Development', key: 'Development & Tech', color: 'bg-[#1E293B]' },
]

const courseCardTheme: Record<string, { grad: string }> = {
  'Design & Media': { grad: 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]' },
  'Development & Tech': { grad: 'from-[#1E293B] via-[#263449] to-[#33425C]' },
  'AI & Data Science': { grad: 'from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB]' },
  'Business & Marketing': { grad: 'from-[#E07B22] via-[#EA8F3D] to-[#F59E0B]' },
  'Personal Growth': { grad: 'from-[#059669] via-[#10B981] to-[#34D399]' },
  'Career Development': { grad: 'from-[#0F766E] via-[#14B8A6] to-[#2DD4BF]' },
  'Language & Communication': { grad: 'from-[#D97706] via-[#F59E0B] to-[#FBBF24]' },
}

const defaultCardTheme = { grad: 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]' }

const courseFallbackImages = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=340&fit=crop',
]

function courseTagLabel(course: { title?: string; skills?: string[]; tags?: string[] }): string {
  const hay = [...(Array.isArray(course.skills) ? course.skills : []), ...(Array.isArray(course.tags) ? course.tags : []), String(course.title || '')]
    .join(' ')
    .toLowerCase()
  if (hay.includes('ux') || hay.includes('ui') || hay.includes('figma') || hay.includes('prototyp')) return 'UI/UX'
  if (hay.includes('seo') || hay.includes('marketing') || hay.includes('ads')) return 'Marketing'
  if (hay.includes('design') || hay.includes('photoshop') || hay.includes('brand')) return 'Design'
  if (hay.includes('development') || hay.includes('web ') || hay.includes('html') || hay.includes('code')) return 'Development'
  if (hay.includes('business') || hay.includes('management') || hay.includes('sales')) return 'Business'
  return 'Design'
}

function courseDurationMonths(course: { duration?: string; hours?: number }): string {
  const match = /(\d+)\s*months?/i.exec(String(course.duration || ''))
  let months = match ? Number(match[1]) : Math.round((Number(course.hours) || 30) / 5.5)
  if (!Number.isFinite(months) || months <= 0) months = 6
  return `${Math.max(3, Math.min(8, months))} Months`
}

function AnimatedCounter({ to, suffix = '', decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 1500
    const steps = 60
    const increment = to / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= to) {
        setCount(to)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, to])

  return (
    <span ref={ref}>
      {count.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}


function Stars({ rating, size = 'w-3 h-3', className }: { rating: number; size?: string; className?: string }) {
  const rounded = Math.round(rating)
  return (
    <span className={cn('inline-flex items-center gap-[2px]', className)} aria-label={`Rated ${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={cn(size, i < rounded ? 'fill-[#E07B22] text-[#E07B22]' : 'fill-transparent text-[#D9D2C4]')}
        />
      ))}
    </span>
  )
}

const smarterLeftFeatures: {
  icon: LucideIcon
  tint: string
  iconColor: string
  title: string
  desc: string
}[] = [
  { icon: BookOpen, tint: 'bg-[#F3EEFF]', iconColor: 'text-[#6D3DF5]', title: 'Structured Learning Paths', desc: 'Follow curated, step-by-step roadmaps designed by experts.' },
  { icon: Target, tint: 'bg-[#ECFBF5]', iconColor: 'text-[#18A878]', title: 'Hands-on Practice', desc: 'Build real projects and code daily in interactive environments.' },
  { icon: BarChart3, tint: 'bg-[#FEF5E7]', iconColor: 'text-[#F59E0B]', title: 'Progress Tracking', desc: 'Monitor streaks, milestones and skills with live analytics.' },
  { icon: Users, tint: 'bg-[#FDF0F5]', iconColor: 'text-[#EC4899]', title: 'Community Support', desc: 'Collaborate with peers, mentors and a thriving community.' },
]

const startLearningSteps: {
  icon: LucideIcon
  tile: string
  iconColor: string
  title: string
  desc: string
}[] = [
  { icon: UserPlus, tile: 'bg-[#DFF3E6]', iconColor: 'text-[#0B5D4B]', title: 'Create Your Free Account', desc: 'Sign up quickly and get started in just a few minutes.' },
  { icon: BookOpen, tile: 'bg-[#FDEBDD]', iconColor: 'text-[#F58220]', title: 'Explore Online Courses', desc: 'Browse a wide range of courses and find what matches your goals.' },
  { icon: PlayCircle, tile: 'bg-[#EDE7FF]', iconColor: 'text-[#7C5CFC]', title: 'Learn at Your Own Pace', desc: 'Access videos, resources and study materials anytime, anywhere.' },
  { icon: Award, tile: 'bg-[#E3EFFF]', iconColor: 'text-[#2F7BF6]', title: 'Get Certified', desc: 'Complete your courses and receive certificates to showcase your skills.' },
  { icon: TrendingUp, tile: 'bg-[#FDE7E9]', iconColor: 'text-[#E5484D]', title: 'Build a Better Future', desc: 'Gain in-demand skills and open doors to new opportunities.' },
]

const startLearningLine1 = ["It's", 'Easy', 'to']
const startLearningLine2 = ['Start', 'Learning']

const expertInstructors: {
  id: number
  name: string
  title: string
  accent: string
  glow: string
  glowRing: string
  bio: string
  rating: string
  courses: string
  students: string
  image: string
}[] = [
  { id: 1, name: 'Arjun Mehta', title: 'UI/UX Design Expert', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: '10+ years crafting intuitive interfaces for startups and global brands.', rating: '4.9', courses: '2 Courses', students: '25,000+', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' },
  { id: 2, name: 'Neha Kapoor', title: 'Digital Marketing Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Former growth lead helping brands scale with data-driven campaigns.', rating: '4.8', courses: '3 Courses', students: '20,000+', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face' },
  { id: 3, name: 'Rohit Verma', title: 'Full Stack Developer', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Full-stack engineer shipping production apps used by millions.', rating: '4.9', courses: '2 Courses', students: '30,000+', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face' },
  { id: 4, name: 'Ananya Sharma', title: 'Data Science Expert', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Data scientist turning raw data into actionable business insights.', rating: '4.8', courses: '2 Courses', students: '18,000+', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=480&h=600&fit=crop' },
  { id: 5, name: 'Vikram Singh', title: 'AI & ML Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'AI researcher mentoring thousands on machine learning fundamentals.', rating: '4.9', courses: '1 Courses', students: '22,000+', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' },
  { id: 6, name: 'Sneha Iyer', title: 'Product Management Expert', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Product leader guiding teams to ship customer-first roadmaps.', rating: '4.8', courses: '3 Courses', students: '15,000+', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face' },
  { id: 7, name: 'Karan Malhotra', title: 'Mobile Dev Expert', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Flutter & React Native specialist building award-winning apps.', rating: '4.8', courses: '2 Courses', students: '17,000+', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face' },
  { id: 8, name: 'Priyanka Rao', title: 'Graphic Design Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Award-winning designer crafting bold, memorable brand identities.', rating: '4.7', courses: '2 Courses', students: '12,000+', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face' },
  { id: 9, name: 'Aditya Kulkarni', title: 'Backend Engineering Expert', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Backend architect specializing in scalable APIs and systems.', rating: '4.8', courses: '1 Courses', students: '19,000+', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' },
  { id: 10, name: 'Ishita Banerjee', title: 'Content Strategy Expert', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Content strategist helping creators build loyal, growing audiences.', rating: '4.7', courses: '2 Courses', students: '11,000+', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face' },
  { id: 11, name: 'Rohan Deshmukh', title: 'Cloud & DevOps Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Cloud architect automating resilient, cost-efficient infrastructure.', rating: '4.8', courses: '3 Courses', students: '14,000+', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face' },
  { id: 12, name: 'Tanvi Joshi', title: 'Data Analytics Expert', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Analytics expert turning dashboards into decisive action plans.', rating: '4.8', courses: '2 Courses', students: '13,000+', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' },
  { id: 13, name: 'Sameer Khan', title: 'Cyber Security Expert', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Security specialist defending systems against modern cyber threats.', rating: '4.9', courses: '1 Courses', students: '16,000+', image: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=face' },
  { id: 14, name: 'Divya Nair', title: 'HR & Leadership Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Leadership coach empowering teams to perform at their best.', rating: '4.7', courses: '2 Courses', students: '10,000+', image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face' },
  { id: 15, name: 'Manish Gupta', title: 'Business Strategy Expert', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Strategist helping founders build scalable, profitable businesses.', rating: '4.8', courses: '3 Courses', students: '18,000+', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face' },
  { id: 16, name: 'Kavita Menon', title: 'Content Creator Coach', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Creator educator helping you turn passion into paid content.', rating: '4.8', courses: '2 Courses', students: '14,000+', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face' },
  { id: 17, name: 'Nikhil Rao', title: 'SaaS Product Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'SaaS founder sharing proven playbooks for product-led growth.', rating: '4.9', courses: '1 Courses', students: '19,000+', image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face' },
  { id: 18, name: 'Pooja Sharma', title: 'Freelancing Expert', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Freelance consultant teaching you to win clients and scale income.', rating: '4.7', courses: '2 Courses', students: '12,000+', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face' },
  { id: 19, name: 'Rajesh Iyer', title: 'Finance & Investing Expert', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Financial educator simplifying investing for young professionals.', rating: '4.8', courses: '3 Courses', students: '15,000+', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
  { id: 20, name: 'Meera Pillai', title: 'Public Speaking Coach', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Communication coach helping you present with confidence and impact.', rating: '4.8', courses: '2 Courses', students: '11,000+', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face' },
  { id: 21, name: 'Rahul Shah', title: 'Digital Marketing Strategist', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Data-driven marketer scaling brands with paid & organic growth.', rating: '4.5', courses: '1 Courses', students: '8,000+', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' },
  { id: 22, name: 'Meera Iyer', title: 'Financial Analytics Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Finance expert simplifying investing and portfolio building.', rating: '4.6', courses: '2 Courses', students: '8,900+', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face' },
  { id: 23, name: 'Ankit Verma', title: 'Full Stack Engineer', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Senior full-stack engineer building scalable web products.', rating: '4.7', courses: '2 Courses', students: '9,800+', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' },
  { id: 24, name: 'Shreya Joshi', title: 'Content Marketing Coach', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Content coach helping teams craft narratives that convert.', rating: '4.8', courses: '3 Courses', students: '10,700+', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face' },
  { id: 25, name: 'Arjun Nair', title: 'Mobile App Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Mobile specialist shipping polished native apps worldwide.', rating: '4.9', courses: '1 Courses', students: '11,600+', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face' },
  { id: 26, name: 'Priyanka Desai', title: 'Brand Designer', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Brand designer crafting identities people remember.', rating: '4.5', courses: '2 Courses', students: '12,500+', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face' },
  { id: 27, name: 'Kartik Rao', title: 'Data Engineer', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Data engineer turning messy data into pipelines.', rating: '4.6', courses: '2 Courses', students: '13,400+', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' },
  { id: 28, name: 'Nisha Malhotra', title: 'HR & Talent Coach', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'People coach helping teams hire, retain and grow.', rating: '4.7', courses: '1 Courses', students: '14,300+', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' },
  { id: 29, name: 'Aakash Mehta', title: 'Cybersecurity Analyst', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Security expert keeping systems and students safe.', rating: '4.8', courses: '2 Courses', students: '15,200+', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
  { id: 30, name: 'Ritika Sharma', title: 'Product Designer', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Product designer obsessed with delightful UX flows.', rating: '4.9', courses: '3 Courses', students: '16,100+', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face' },
  { id: 31, name: 'Varun Kapoor', title: 'Growth Marketing Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Growth lead running experiments that actually move metrics.', rating: '4.5', courses: '1 Courses', students: '17,000+', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face' },
  { id: 32, name: 'Asha Pillai', title: 'Soft Skills Coach', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Communication coach unlocking confident speaking.', rating: '4.6', courses: '2 Courses', students: '17,900+', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face' },
  { id: 33, name: 'Deepak Singh', title: 'DevOps Engineer', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'DevOps pro automating resilient cloud infrastructure.', rating: '4.7', courses: '2 Courses', students: '18,800+', image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop&crop=face' },
  { id: 34, name: 'Kavya Menon', title: 'Copywriting Coach', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Copywriter teaching voice-driven, high-converting writing.', rating: '4.8', courses: '1 Courses', students: '19,700+', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face' },
  { id: 35, name: 'Suresh Kale', title: 'Cloud Architect', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Cloud architect designing cost-efficient infrastructure.', rating: '4.9', courses: '2 Courses', students: '20,600+', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face' },
  { id: 36, name: 'Nandini Rao', title: 'UX Researcher', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'UX researcher turning user insights into better products.', rating: '4.5', courses: '3 Courses', students: '21,500+', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face' },
  { id: 37, name: 'Arnav Gupta', title: 'AI Product Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'AI product expert building and shipping ML features.', rating: '4.6', courses: '2 Courses', students: '22,400+', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face' },
]

function FooterLinksCol({ title, icon, links }: {
  title: string
  icon: ReactNode
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h4 className="group/title flex items-center gap-2 text-[16px] font-semibold text-white mb-4">
        <span className="transition-transform duration-300 group-hover/title:scale-110 group-hover/title:rotate-6">{icon}</span>
        {title}
        <span aria-hidden="true" className="h-px flex-1 min-w-[12px] bg-gradient-to-r from-white/25 to-transparent" />
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              onClick={(e) => {
                if (link.href.startsWith('#')) {
                  const el = document.getElementById(link.href.slice(1))
                  if (el) {
                    e.preventDefault()
                    el.scrollIntoView({ behavior: 'smooth' })
                  }
                }
              }}
              className="group/link relative inline-flex items-center gap-1.5 text-[14px] text-[#B8C9C0] hover:text-[#E07B22] transition-colors duration-200"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#E07B22] -translate-x-1.5 opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100 shrink-0" />
              {link.label}
              <span aria-hidden="true" className="absolute left-0 -bottom-[3px] h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#E07B22] to-[#F59E0B] transition-transform duration-300 group-hover/link:scale-x-100" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InviteScene() {
  return (
    <svg viewBox="0 0 620 240" className="w-full h-auto" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="invA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6D3DF5" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient>
        <linearGradient id="invB" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3478F6" /><stop offset="100%" stopColor="#60A5FA" /></linearGradient>
        <linearGradient id="invC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#18A878" /><stop offset="100%" stopColor="#34D399" /></linearGradient>
      </defs>

      {/* dashed connection line */}
      <path d="M60 120 C 200 120, 420 120, 560 120" stroke="#C4B5FD" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />

      {/* left card */}
      <g>
        <rect x="24" y="60" width="150" height="120" rx="18" fill="#FFFFFF" stroke="#E9E7F5" />
        <circle cx="99" cy="100" r="22" fill="url(#invA)" />
        <circle cx="99" cy="100" r="16" fill="none" stroke="#C4B5FD" strokeWidth="1.5" strokeDasharray="2 4" />
        <path d="M93 100 l5 5 l9 -9" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="50" y="134" width="98" height="8" rx="4" fill="#E9E7F5" />
        <rect x="50" y="148" width="70" height="8" rx="4" fill="#E9E7F5" />
      </g>

      {/* center mail/plus */}
      <g>
        <rect x="270" y="80" width="80" height="80" rx="20" fill="url(#invB)" />
        <rect x="284" y="94" width="52" height="38" rx="6" fill="none" stroke="#FFFFFF" strokeWidth="3.5" />
        <path d="M286 98 l24 20 l24 -20" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M310 120 v18 M301 129 h18" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* right card */}
      <g>
        <rect x="446" y="60" width="150" height="120" rx="18" fill="#FFFFFF" stroke="#E9E7F5" />
        <circle cx="521" cy="100" r="22" fill="url(#invC)" />
        <path d="M521 90 v20 M511 100 h20" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <rect x="472" y="134" width="98" height="8" rx="4" fill="#E9E7F5" />
        <rect x="520" y="148" width="50" height="8" rx="4" fill="#E9E7F5" />
      </g>
    </svg>
  )
}

const categoryIconMap: Record<string, LucideIcon> = {
  'Development & Tech': Code,
  'Design & Media': Palette,
  'Business & Marketing': BarChart3,
  'AI & Data Science': Brain,
  'Personal Growth': Target,
  'Career Development': Briefcase,
  'Language & Communication': Languages,
}

const categorySkillPool: Record<string, string[]> = {
  'Development & Tech': ['HTML', 'CSS', 'JavaScript', 'Python', 'Node.js', 'React', 'AWS', 'SQL'],
  'Design & Media': ['Photoshop', 'Figma', 'Illustrator', 'Color Theory', 'Typography', 'Motion Design'],
  'Business & Marketing': ['SEO', 'Content Strategy', 'Analytics', 'Social Media', 'Sales', 'Branding'],
  'AI & Data Science': ['Python', 'Machine Learning', 'Data Visualization', 'SQL', 'Deep Learning', 'NLP'],
  'Personal Growth': ['Productivity', 'Leadership', 'Communication', 'Emotional Intelligence'],
  'Career Development': ['Resume Writing', 'Interview Prep', 'LinkedIn', 'Personal Branding'],
  'Language & Communication': ['Business English', 'Public Speaking', 'Copywriting', 'Storytelling'],
}

const heroFilterChips: { label: string; key: string; icon: LucideIcon }[] = [
  { label: 'Web Dev', key: 'Development & Tech', icon: Code },
  { label: 'SEO', key: 'Business & Marketing', icon: TrendingUp },
  { label: 'UI/UX', key: 'Design & Media', icon: Palette },
  { label: 'AI & ML', key: 'AI & Data Science', icon: Brain },
]

const marqueeCourses: { title: string; img: string }[] = [
  { title: 'Full-Stack Web Development', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face' },
  { title: 'Advanced React & Next.js', img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop&crop=face' },
  { title: 'UI/UX Design Masterclass', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face' },
  { title: 'Digital Marketing Foundations', img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face' },
  { title: 'Data Science with Python', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face' },
  { title: 'Machine Learning Essentials', img: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop&crop=face' },
  { title: 'Flutter App Development', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face' },
  { title: 'Freelancing & Client Success', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=face' },
  { title: 'Cloud & DevOps Engineering', img: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face' },
  { title: 'Mobile App Development', img: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&h=200&fit=crop&crop=face' },
]

type SortKey = 'popular' | 'rating' | 'priceLow' | 'priceHigh' | 'newest'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Most Popular' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'priceLow', label: 'Price: Low to High' },
  { key: 'priceHigh', label: 'Price: High to Low' },
  { key: 'newest', label: 'Newest First' },
]

const sortLabels: Record<SortKey, string> = sortOptions.reduce((acc, o) => {
  acc[o.key] = o.label
  return acc
}, {} as Record<SortKey, string>)

const sidebarPriceOptions = [
  { key: 'All', label: 'All Prices' },
  { key: '30000to50000', label: '৳30K – ৳50K' },
  { key: '50000to70000', label: '৳50K – ৳70K' },
  { key: '70000to90000', label: '৳70K – ৳90K' },
  { key: '90000to100000', label: '৳90K – ৳100K' },
]

const levelOptions = [
  { key: 'All', label: 'All Levels' },
  { key: 'Beginner', label: 'Beginner' },
  { key: 'Intermediate', label: 'Intermediate' },
  { key: 'Advanced', label: 'Advanced' },
]

const sidebarCategoryLabels: Record<string, string> = {
  All: 'All Courses',
  'Development & Tech': 'Web Development',
  'Design & Media': 'Design',
  'Business & Marketing': 'Digital Marketing',
  'AI & Data Science': 'Data Science',
  'Personal Growth': 'Other',
  'Career Development': 'Career',
  'Language & Communication': 'Language',
}

function CtaScene() {
  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20 shrink-0" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ctaG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E07B22" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient>
      </defs>
      <circle cx="60" cy="60" r="46" fill="#E07B22" opacity="0.12" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#F8B681" strokeWidth="1.5" strokeDasharray="2 6" opacity="0.5" />
      <rect x="26" y="26" width="68" height="68" rx="18" fill="url(#ctaG)" />
      <path d="M52 44 v22 l16 9 v-22 z" fill="#FFFFFF" />
      <circle cx="60" cy="60" r="8" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
    </svg>
  )
}

/* ==========================================================================
   Landing — "Turn Your Skills Into Income" section motion variants
   ========================================================================== */
const earnFadeUpBlur = {
  hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const earnImageIn = {
  hidden: { opacity: 0, x: -46, scale: 0.94 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const earnCardContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const earnCardSlideRight = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

const earnIconPop = {
  hidden: { scale: 0, opacity: 0, rotate: -12 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 13, delay: 0.12 } as const,
  },
}

const earnPillContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
}

const earnPillItem = {
  hidden: { opacity: 0, y: 12, scale: 0.85 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

const earnStatContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const earnStatCard = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const earnStatIcon = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 280, damping: 15, delay: 0.08 } as const,
  },
}

const earnFloatPop = {
  hidden: { opacity: 0, scale: 0.6, y: 18 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

const earnWordContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const earnWord = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

/** Counts a stat number up from 0 when scrolled into view. */
function EarnCountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  prefersReducedMotion,
  className,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  prefersReducedMotion: boolean | null
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [n, setN] = useState(prefersReducedMotion ? value : 0)

  useEffect(() => {
    if (!inView || prefersReducedMotion) return
    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setN(v),
    })
    return () => controls.stop()
  }, [inView, value, prefersReducedMotion])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

/** Floating white overlay card used on the left freelancer photo. */
function EarnFloatingCard({
  className,
  entranceDelay = 0,
  bobDelay = 0,
  bobHeight = 10,
  parX,
  parY,
  parallax = true,
  prefersReducedMotion,
  children,
}: {
  className?: string
  entranceDelay?: number
  bobDelay?: number
  bobHeight?: number
  parX: MotionValue<number>
  parY: MotionValue<number>
  parallax?: boolean
  prefersReducedMotion: boolean | null
  children: ReactNode
}) {
  const fmtX = useTransform(parX, (v) => (parallax ? v * -10 : 0))
  const fmtY = useTransform(parY, (v) => (parallax ? v * -10 : 0))

  return (
    <motion.div style={{ x: fmtX, y: fmtY }} className={cn('absolute z-20', className)}>
      <motion.div
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-60px' }}
        variants={earnFloatPop}
        transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 280, damping: 16, delay: entranceDelay }}
        style={{ transformOrigin: 'center' }}
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, -bobHeight, 0] }}
          transition={prefersReducedMotion ? {} : { duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: bobDelay }}
          className="rounded-xl bg-white shadow-lg shadow-[#1F4D3A]/10 backdrop-blur px-4 py-3 leading-none"
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/** Small rotated black poster card stamped on the photo corner. */
function EarnPoster({ className }: { className?: string }) {
  return (
    <div className={cn('absolute z-10 -rotate-6 rounded-md bg-[#0B0B12] px-4 py-2.5 shadow-xl shadow-black/40 ring-1 ring-white/10', className)}>
      <p className="text-center text-[11px] leading-[1.35] font-extrabold tracking-[0.16em] text-[#F5C518] uppercase">
        Learn Skills<br />Earn Income
      </p>
    </div>
  )
}

/** Slow, cinematic pan-zoom over the freelancer image once scrolled into view. */
function EarnKenBurns({
  src,
  alt,
  prefersReducedMotion,
}: {
  src: string
  alt: string
  prefersReducedMotion: boolean | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 overflow-hidden"
      animate={
        inView && !prefersReducedMotion
          ? { scale: [1.06, 1.2, 1.06], x: [-16, 18, -16] }
          : undefined
      }
      transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
    </motion.div>
  )
}

/** Left freelancer photo card with a cream frame and mouse-move parallax overlays. */
function EarnImagePanel({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const parX = useSpring(rawX, { stiffness: 55, damping: 16, mass: 0.6 })
  const parY = useSpring(rawY, { stiffness: 55, damping: 16, mass: 0.6 })
  const badgeX = useTransform(parX, (v) => v * -16)
  const badgeY = useTransform(parY, (v) => v * -16)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <motion.div
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-80px' }}
      variants={earnImageIn}
      className="relative h-full"
    >
      {/* Decorative background behind the photo frame */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-8 -left-6 z-0 w-40 h-40 rounded-full bg-[#FDEBDD] blur-2xl opacity-80" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-6 z-0 w-44 h-44 rounded-full bg-[#DFF3E6] blur-2xl opacity-80" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-5 -left-5 z-0 w-28 h-28 rounded-full border-2 border-dashed border-[#E07B22]/40"
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 -right-5 z-0 w-24 h-24 rounded-full border-2 border-dashed border-[#18A878]/40"
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 52, repeat: Infinity, ease: 'linear' }}
      />

      {/* Gradient frame around the photo */}
      <div className="relative z-10 h-full rounded-[20px] bg-gradient-to-br from-[#E07B22] via-[#F5C518] to-[#18A878] p-[5px] shadow-[0_28px_70px_-24px_rgba(31,77,58,0.45)]">
        <div
          ref={panelRef}
          onMouseMove={(e) => {
            if (!isDesktop || prefersReducedMotion) return
            const el = panelRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 16)
            rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 16)
          }}
          onMouseLeave={() => {
            rawX.set(0)
            rawY.set(0)
          }}
          className="relative h-full min-h-[360px] w-full overflow-hidden rounded-[15px] bg-white sm:min-h-[480px] lg:min-h-[560px]"
        >
          <EarnKenBurns
            src="https://plain-apac-prod-public.komododecks.com/202609/25/vLPtT4lQgDXLgQ2EpfaL/image.jpg"
            alt="Man working on a laptop in a warm home office"
            prefersReducedMotion={prefersReducedMotion}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/25 via-transparent to-transparent" />

          {/* Poster graphic */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8, y: -8 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.25 }}
          >
            <EarnPoster className="top-5 right-5" />
          </motion.div>

          {/* Earned stat card */}
          <EarnFloatingCard className="top-20 right-5 px-4 py-3" entranceDelay={0.5} bobDelay={0.5} bobHeight={7} parX={parX} parY={parY} prefersReducedMotion={prefersReducedMotion}>
            <p className="text-[10px] font-bold text-[#5A6B63]">Earned</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[18px] leading-none font-extrabold text-[#1F4D3A] tabular-nums">
                <EarnCountUp value={12450} prefix="$" prefersReducedMotion={prefersReducedMotion} />
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-[#18A878]">
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.6} /> +32%
              </span>
            </div>
            <p className="text-[9.5px] font-semibold text-[#18A878] leading-none">this month</p>
          </EarnFloatingCard>

          {/* Certificate card */}
          <EarnFloatingCard className="top-44 right-5 px-4 py-3" entranceDelay={0.8} bobDelay={1.4} bobHeight={6} parX={parX} parY={parY} prefersReducedMotion={prefersReducedMotion}>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#DFF3E6]">
                <FileText className="w-[15px] h-[15px] text-[#18A878]" strokeWidth={2.2} />
                <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#18A878] ring-2 ring-white">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.2} />
                </span>
              </span>
              <div>
                <p className="text-[11px] leading-tight font-extrabold text-[#1F4D3A]">Certificate</p>
                <p className="text-[10px] leading-tight font-semibold text-[#5A6B63]">Completed</p>
              </div>
            </div>
          </EarnFloatingCard>

          {/* In-progress card */}
          <EarnFloatingCard className="bottom-5 left-5 px-4 py-3" entranceDelay={1.1} bobDelay={0.9} bobHeight={8} parX={parX} parY={parY} prefersReducedMotion={prefersReducedMotion}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DFF3E6]">
                <Play className="w-4 h-4 text-[#18A878] fill-[#18A878]" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] leading-tight font-extrabold text-[#1F4D3A]">Web Development</p>
                <p className="text-[10px] leading-tight font-semibold text-[#5A6B63]">· In Progress</p>
                <div className="mt-1.5 h-1.5 w-[120px] rounded-full bg-[#E9E7DF] overflow-hidden">
                  <motion.div
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    whileInView={prefersReducedMotion ? undefined : { width: '68%' }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 1.1, delay: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full bg-[#18A878]"
                  />
                </div>
              </div>
            </div>
          </EarnFloatingCard>

          {/* Glowing orange dollar badge */}
          <motion.div
            style={{ x: badgeX, y: badgeY }}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.4 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 280, damping: 14, delay: 1.35 }}
            className="absolute bottom-7 right-7 z-10"
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
              transition={prefersReducedMotion ? {} : { duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="relative w-12 h-12 rounded-full bg-[#E07B22] shadow-lg shadow-[#E07B22]/40 flex items-center justify-center"
            >
              <span className="earn-pulse-ring absolute -inset-1.5 rounded-full border-2 border-[#E07B22]/60" aria-hidden="true" />
              <DollarSign className="w-6 h-6 text-white" strokeWidth={2.4} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export function LandingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())
  const [activeCategory, setActiveCategory] = useState('All')
  const [priceRange, setPriceRange] = useState('All')
  const [priceOpen, setPriceOpen] = useState(false)
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortKey>('popular')
  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [coursePage, setCoursePage] = useState(1)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false)
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false)

  useEffect(() => {
    setCoursePage(1)
  }, [activeCategory, priceRange, levelFilter, searchQuery, sortOrder, activeTags])
  const [earnerSkill, setEarnerSkill] = useState('UI/UX')
  const [enrollingCourse, setEnrollingCourse] = useState<{
    id: number
    title: string
    instructor: string
    price: number
    originalPrice?: number | null
    image: string
    description?: string
    hours?: number
    lessons?: number
    rating?: number
    category?: string
    level?: string
  } | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const selectPlan = (plan: 'free' | 'pro' | 'premium') => {
    const url = `/payment/plan?plan=${plan}&billing=${billing}`
    if (isAuthenticated) {
      router.push(url)
    } else {
      router.push(`/login?redirect=${encodeURIComponent(url)}`)
    }
  }

  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [testimonialRightIndex, setTestimonialRightIndex] = useState(1)

  const [apiCourses, setApiCourses] = useState<any[] | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [demoOpen, setDemoOpen] = useState(false)
  const [demoVideoPlaying, setDemoVideoPlaying] = useState(false)
  const [testimonialVideoPlaying, setTestimonialVideoPlaying] = useState(false)
  const [testimonialVideoPlayed, setTestimonialVideoPlayed] = useState(false)
  const [testimonialCaptionsOn, setTestimonialCaptionsOn] = useState(false)
  const tiltRawX = useMotionValue(0)
  const tiltRawY = useMotionValue(0)
  const tiltX = useSpring(tiltRawX, { stiffness: 160, damping: 18, mass: 0.5 })
  const tiltY = useSpring(tiltRawY, { stiffness: 160, damping: 18, mass: 0.5 })
  const shadowShiftX = useTransform(tiltY, (v) => v * -0.9)
  const sheenShiftX = useTransform(tiltY, (v) => v * 2.4)
  const sheenShiftY = useTransform(tiltX, (v) => v * 2.4)

  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const total = testimonialList.length
    const id = window.setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % total)
      setTestimonialRightIndex((i) => (i + 1) % total)
    }, 6000)
    return () => window.clearInterval(id)
  }, [prefersReducedMotion])

  const stepsListRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  const stepsProgress = useScroll({
    target: stepsListRef,
    offset: ['start 0.82', 'end 0.62'],
  })
  const glowDotTop = useTransform(stepsProgress.scrollYProgress, (v) => `calc(${Math.min(Math.max(v, 0), 1) * 100}% - 5px)`)

  const parallaxX = useMotionValue(0)
  const parallaxY = useMotionValue(0)
  const parallaxSmoothX = useSpring(parallaxX, { stiffness: 120, damping: 22, mass: 0.6 })
  const parallaxSmoothY = useSpring(parallaxY, { stiffness: 120, damping: 22, mass: 0.6 })
  const girlParallaxX = useTransform(parallaxSmoothX, (v) => v * -18)
  const girlParallaxY = useTransform(parallaxSmoothY, (v) => v * -14)
  const blobRightParX = useTransform(parallaxSmoothX, (v) => v * 32)
  const blobRightParY = useTransform(parallaxSmoothY, (v) => v * 26)
  const blobLeftParX = useTransform(parallaxSmoothX, (v) => v * -26)
  const blobLeftParY = useTransform(parallaxSmoothY, (v) => v * -18)
  const capParallaxX = useTransform(parallaxSmoothX, (v) => v * -44)
  const capParallaxY = useTransform(parallaxSmoothY, (v) => v * -30)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const handleSectionMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || !isDesktop) return
    const rect = e.currentTarget.getBoundingClientRect()
    parallaxX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    parallaxY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  const resetSectionParallax = () => {
    parallaxX.set(0)
    parallaxY.set(0)
  }

  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) return
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
    })
    lenisRef.current = lenis
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    const sectionIds = navLinks
      .filter((l) => l.href.startsWith('#'))
      .map((l) => l.href.slice(1))

    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      const probe = window.scrollY + window.innerHeight * 0.35
      let current = 'home'
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= probe) current = id
      }
      setActiveSection(current)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    coursesAPI.getAll({ per_page: 50 })
      .then(res => {
        const raw = res.data?.data?.data || res.data?.data || res.data || []
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((item: any, idx: number) => {
            const price = Number(item.price) || 0
            const rawTitle = item.title || `Course #${item.id}`
            const localMatch = courses.find(c => c.title.toLowerCase() === rawTitle.toLowerCase())
            const rawHours = parseInt(String(item.duration ?? '').replace(/[^\d]/g, ''), 10)
            const pool = categorySkillPool[item.category] ?? categorySkillPool['Development & Tech']
            const pick = (offset: number) => pool[(Number(item.id) + offset) % pool.length]
            return {
              id: item.id,
              title: rawTitle,
              slug: item.slug || toSlug(rawTitle),
              instructor: item.instructor?.name || 'Instructor',
              rating: Number(item.rating) || 4.5,
              students: item.students_count || 0,
              price: price,
              originalPrice: item.original_price ? Number(item.original_price) : 0,
              hours: localMatch?.hours || (!Number.isNaN(rawHours) && rawHours > 10 ? rawHours : 24),
              lessons: item.lessons?.length || item.lessons_count || 0,
              category: item.category || 'Development & Tech',
              image: item.thumbnail || courseFallbackImages[Math.abs(Number(item.id) - 1) % courseFallbackImages.length],
              tags: item.tags?.length ? item.tags : ['All Levels'],
              skills: localMatch?.skills?.slice(0, 3)
                || (Array.isArray(item.skills) && item.skills.length ? item.skills.slice(0, 3) : [pick(0), pick(1), pick(2)]),
              level: item.level ? String(item.level).charAt(0).toUpperCase() + String(item.level).slice(1).toLowerCase() : 'Beginner',
              updated: item.updated_at ? `Updated ${new Date(item.updated_at).toLocaleString('en', { month: 'short' })} ${new Date(item.updated_at).getFullYear()}` : 'Updated 2026',
              feature: item.feature || 'Certificate Included',
              duration: hoursToMonths(item.duration, rawTitle),
            }
          })
          setApiCourses(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCourses(false))
  }, [])

  const allCourses = apiCourses && apiCourses.length > 0 ? apiCourses : courses

  const filteredAndSortedCourses = useMemo(() => {
    const items = allCourses.filter((c: any) => {
      const price = Number(c.price) || 0
      const catOk = activeCategory === 'All' || String(c.category || 'General').trim().toLowerCase() === activeCategory.toLowerCase()
      let priceOk = true
      if (priceRange !== 'All') {
        const m = priceRange.match(/^(\d+)to(\d+)$/)
        if (m) {
          const lo = Number(m[1])
          const hi = Number(m[2])
          priceOk = price >= lo && price <= hi
        } else {
          priceOk = false
        }
      }
      const levelOk = levelFilter === 'All' || String(c.level || '').trim().toLowerCase() === levelFilter.toLowerCase()
      const q = searchQuery.trim().toLowerCase()
      const searchOk = !q
        || String(c.title || '').toLowerCase().includes(q)
        || String(c.instructor || '').toLowerCase().includes(q)
        || String(c.category || '').toLowerCase().includes(q)
        || String(Array.isArray(c.skills) ? c.skills.join(' ') : '').toLowerCase().includes(q)
      const tagOk = activeTags.length === 0
        || activeTags.every((t) => {
          const hay = [
            ...(Array.isArray(c.skills) ? c.skills : []),
            ...(Array.isArray(c.tags) ? c.tags : []),
            String(c.category || ''),
            String(c.title || ''),
          ].join(' ').toLowerCase()
          return hay.includes(t.toLowerCase())
        })
      return catOk && priceOk && levelOk && searchOk && tagOk
    })
    return items.sort((a: any, b: any) => {
      switch (sortOrder) {
        case 'rating': return (Number(b.rating) || 0) - (Number(a.rating) || 0)
        case 'priceLow': return (Number(a.price) || 0) - (Number(b.price) || 0)
        case 'priceHigh': return (Number(b.price) || 0) - (Number(a.price) || 0)
        case 'newest': return (Number(b.id) || 0) - (Number(a.id) || 0)
        default: return (Number(b.students) || 0) - (Number(a.students) || 0)
      }
    })
  }, [allCourses, activeCategory, priceRange, levelFilter, searchQuery, sortOrder, activeTags])

  const pageSize = 12
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCourses.length / pageSize))
  const effectivePage = Math.min(coursePage, totalPages)
  const paginatedCourses = filteredAndSortedCourses.slice((effectivePage - 1) * pageSize, effectivePage * pageSize)

  const resetAllFilters = () => {
    setActiveCategory('All')
    setPriceRange('All')
    setLevelFilter('All')
    setSearchQuery('')
    setActiveTags([])
  }

  const categoryOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    allCourses.forEach((c: any) => {
      const k = String(c.category || 'General').trim() || 'General'
      counts[k] = (counts[k] || 0) + 1
    })
    const allCount = Object.values(counts).reduce((a, b) => a + b, 0)
    const known = Object.entries(categoryIconMap)
    const extra = Object.keys(counts)
      .filter((k) => !(k in categoryIconMap))
      .sort()
    return [
      { key: 'All', label: 'All Courses', icon: LayoutGrid, count: allCount },
      ...known.map(([key, icon]) => ({
        key,
        label: key,
        icon,
        count: counts[key] || 0,
      })),
      ...extra.map((key) => ({
        key,
        label: key,
        icon: Target,
        count: counts[key],
      })),
    ]
  }, [allCourses])

  const selectCategory = (key: string) => {
    setActiveCategory(key)
  }

  const selectPriceRange = (key: string) => {
    setPriceRange(key)
  }

  const careerTagOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    const ignore = new Set(['all levels', 'beginner friendly', 'practical', 'project-based'])
    allCourses.forEach((c: any) => {
      const items = [...(Array.isArray(c.skills) ? c.skills : []), ...(Array.isArray(c.tags) ? c.tags : [])]
      items.forEach((s: string) => {
        const k = String(s).trim()
        if (!k || ignore.has(k.toLowerCase())) return
        counts[k] = (counts[k] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }))
  }, [allCourses])

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  const activeFilterCount =
    (activeCategory !== 'All' ? 1 : 0)
    + (priceRange !== 'All' ? 1 : 0)
    + (levelFilter !== 'All' ? 1 : 0)
    + (searchQuery.trim() ? 1 : 0)
    + activeTags.length

  const renderFilters = (inDrawer = false) => (
    <div className="space-y-4">
      {/* Search */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_4px_18px_-10px_rgba(31,77,58,0.25)]">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1F4D3A]">Search</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#9AA7A0]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full h-10 rounded-lg border border-[#E8E4DD] bg-[#FAF8F4] pl-9 pr-3 text-[13px] font-medium text-[#1F4D3A] placeholder:text-[#9AA7A0] focus:outline-none focus:ring-2 focus:ring-[#E07B22]/20 focus:border-[#E07B22]/50 transition-all"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_4px_18px_-10px_rgba(31,77,58,0.25)]">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1F4D3A]">Categories</p>
        <div className="space-y-1.5">
          {categoryOptions.map((cat) => {
            const isActive = activeCategory === cat.key
            const label = sidebarCategoryLabels[cat.key] ?? cat.label
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => selectCategory(cat.key)}
                className={cn(
                  'w-full inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-all duration-200 border',
                  isActive
                    ? 'bg-[#E07B22] text-white border-[#E07B22] shadow-[0_6px_16px_-8px_rgba(224,123,34,0.6)]'
                    : 'bg-white text-[#5A6B63] border-[#EEE9E0] hover:border-[#E07B22]/40 hover:text-[#E07B22] hover:bg-[#FFF4E9]'
                )}
              >
                <cat.icon className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-white' : 'text-[#E07B22]')} strokeWidth={2} />
                <span className="truncate">{label}</span>
                <span className={cn(
                  'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 tabular-nums',
                  isActive ? 'bg-white/20 text-white' : 'bg-[#F3F0E8] text-[#8B94A8]'
                )}>
                  {cat.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Price */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_4px_18px_-10px_rgba(31,77,58,0.25)]">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1F4D3A]">Price</p>
        <div className="space-y-1.5">
          {sidebarPriceOptions.map((opt) => {
            const isActive = priceRange === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => selectPriceRange(opt.key)}
                className={cn(
                  'w-full inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-all duration-200 border',
                  isActive
                    ? 'bg-[#E07B22] text-white border-[#E07B22] shadow-[0_6px_16px_-8px_rgba(224,123,34,0.6)]'
                    : 'bg-white text-[#5A6B63] border-[#EEE9E0] hover:border-[#E07B22]/40 hover:text-[#E07B22] hover:bg-[#FFF4E9]'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tags */}
      {careerTagOptions.length > 0 && (
        <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_4px_18px_-10px_rgba(31,77,58,0.25)]">
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1F4D3A]">Tags</p>
          <div className="space-y-1">
            {careerTagOptions.map((tag) => {
              const checked = activeTags.includes(tag.label)
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className="w-full inline-flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] font-medium text-[#5A6B63] hover:text-[#1F4D3A] transition-colors"
                >
                  <span className={cn(
                    'w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-all duration-200',
                    checked ? 'bg-[#E07B22] border-[#E07B22] text-white' : 'bg-white border-[#D9D2C4]'
                  )}>
                    {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                  </span>
                  <span className="truncate">{tag.label}</span>
                  <span className="ml-auto text-[10px] font-bold text-[#9AA7A0] tabular-nums shrink-0">{tag.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Skill Level */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_4px_18px_-10px_rgba(31,77,58,0.25)]">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1F4D3A]">Skill Level</p>
        <div className="space-y-1">
          {levelOptions.filter((o) => o.key !== 'All').map((opt) => {
            const checked = levelFilter === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setLevelFilter(checked ? 'All' : opt.key as any)}
                className="w-full inline-flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] font-medium text-[#5A6B63] hover:text-[#1F4D3A] transition-colors"
              >
                <span className={cn(
                  'w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-all duration-200',
                  checked ? 'bg-[#E07B22] border-[#E07B22] text-white' : 'bg-white border-[#D9D2C4]'
                )}>
                  {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          resetAllFilters()
          if (inDrawer) setFiltersOpen(false)
        }}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E4DD] bg-white px-4 py-2.5 text-[12.5px] font-bold text-[#E07B22] hover:bg-[#FFF4E9] hover:border-[#E07B22]/50 transition-all duration-200 active:scale-[0.98]"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset All Filters
      </button>
    </div>
  )

  const toggleBookmark = (id: number) => {
    setBookmarked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { duration: 1.2, offset: -92 })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleHeroTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    tiltRawX.set(py * -10)
    tiltRawY.set(px * 12)
  }

  const resetHeroTilt = () => {
    tiltRawX.set(0)
    tiltRawY.set(0)
  }

  // Cursor Magnet effect
  useEffect(() => {
    const magnets = document.querySelectorAll('[data-magnet]')
    const onMove = (e: MouseEvent) => {
      magnets.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        const dist = Math.sqrt(x * x + y * y)
        if (dist < 80) {
          const pull = (1 - dist / 80) * 3
          ;(el as HTMLElement).style.transform = `translate(${x * pull * 0.1}px, ${y * pull * 0.1}px)`
          ;(el as HTMLElement).style.transition = 'transform 0.15s ease-out'
        } else {
          ;(el as HTMLElement).style.transform = ''
          ;(el as HTMLElement).style.transition = 'transform 0.3s ease-out'
        }
      })
    }
    const onLeave = () => {
      magnets.forEach((el) => {
        ;(el as HTMLElement).style.transform = ''
        ;(el as HTMLElement).style.transition = 'transform 0.3s ease-out'
      })
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="landing-page-root min-h-screen bg-white text-brand-600 font-inter">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="w-full">
          {/* Aurora Glass Bar */}
          <div className={cn('nav-aurora', scrolled && 'is-scrolled')}>
            <div className="nav-shell">
              <span className="nav-shine" aria-hidden="true" />
              <div className="landing-container landing-navbar relative mx-auto flex w-full items-center justify-between h-[68px] sm:h-[76px]">
                {/* Logo */}
                <Link href="/" className="flex items-center group w-[55%] sm:w-[45%] xl:w-auto" aria-label="Learn2Earn">
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
                      className="h-11 sm:h-[52px] w-full sm:w-auto object-contain rounded-2xl drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </motion.div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden xl:flex items-center gap-1">
                  {navLinks.map((link) => {
                    const isAnchor = link.href.startsWith('#')
                    const isActive = isAnchor && activeSection === link.href.slice(1)

                    if (link.label === 'Courses') {
                      return (
                        <div
                          key={link.label}
                          className="relative"
                          onMouseEnter={() => setCoursesDropdownOpen(true)}
                          onMouseLeave={() => setCoursesDropdownOpen(false)}
                        >
                          <button
                            onClick={() => scrollTo('courses')}
                            className={cn(
                              'nav-link px-4 py-2 rounded-[11px] font-medium transition-colors duration-200 inline-flex items-center gap-1',
                              isActive ? 'text-[#F47B20]' : 'text-[#1A1A1A] hover:text-[#F47B20]'
                            )}
                            aria-expanded={coursesDropdownOpen}
                            aria-haspopup="menu"
                          >
                            {isActive && (
                              <motion.span
                                layoutId="nav-active-pill"
                                className="nav-link-pill"
                                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                              />
                            )}
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
                                className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-56"
                                role="menu"
                              >
                                <div className="rounded-2xl border border-[#F0EAE0] bg-white/95 shadow-[0_18px_40px_-18px_rgba(31,45,61,0.35)] backdrop-blur-xl overflow-hidden p-2">
                                  {navCoursesDropdownItems.map((item) => (
                                    <button
                                      key={item.label}
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setActiveCategory(item.key)
                                        setActiveTags([])
                                        setCoursesDropdownOpen(false)
                                        scrollTo('courses')
                                      }}
                                      className="group/item w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left hover:bg-[#FDF0E5] transition-colors"
                                    >
                                      <span className={cn('w-2 h-2 rounded-full shrink-0', item.color)} />
                                      <span className="text-[13px] font-medium text-[#1A1A1A] group-hover/item:text-[#F47B20] transition-colors">{item.label}</span>
                                      <ArrowRight className="ml-auto w-3.5 h-3.5 text-[#8B94A8] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200" />
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }

                    return (
                      <button
                        key={link.label}
                        onClick={() => link.href.startsWith('#') ? scrollTo(link.href.slice(1)) : router.push(link.href)}
                        className={cn(
                          'nav-link px-4 py-2 rounded-[11px] font-medium transition-colors duration-200',
                          isActive ? 'text-[#F47B20]' : 'text-[#1A1A1A] hover:text-[#F47B20]'
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="nav-active-pill"
                            className="nav-link-pill"
                            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                          />
                        )}
                        {link.label}
                      </button>
                    )
                  })}
                </div>

                {/* Desktop Right */}
                <div className="hidden xl:flex items-center gap-3">
                  <Link href="/login" className="landing-control-frame">
                    <button
                      className={cn(
                        'landing-control-reset h-10 px-5 rounded-xl border-[1.5px] border-[#F47B20] whitespace-nowrap',
                        'bg-white text-[#F47B20] hover:bg-[#FDF0E5]',
                        'font-semibold text-sm transition-all active:scale-[0.98]'
                      )}
                    >
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button
                      className={cn(
                        'nav-cta h-10 px-5 rounded-xl whitespace-nowrap',
                        'bg-gradient-to-r from-[#F47B20] to-[#E8630A] text-white',
                        'shadow-[0_10px_22px_-10px_rgba(244,123,32,0.85)] hover:shadow-[0_14px_26px_-10px_rgba(244,123,32,0.95)]',
                        'font-semibold text-sm transition-all active:scale-[0.98]'
                      )}
                    >
                      Get Started
                    </button>
                  </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className={cn(
                    'xl:hidden p-2 rounded-xl transition-colors',
                    'text-[#0F1B3D] hover:bg-[#F3EEFF]'
                  )}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="xl:hidden px-4 sm:px-6"
            >
              <div className="nav-shell mt-1 rounded-3xl border border-[#F0EAE0] px-4 py-4 shadow-[0_10px_24px_-20px_rgba(31,45,61,0.35)] max-h-[calc(100dvh-110px)] overflow-y-auto overscroll-contain">
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const isActive = link.href.startsWith('#') && activeSection === link.href.slice(1)
                    if (link.label === 'Courses') {
                      return (
                        <div key={link.label}>
                          <button
                            onClick={() => {
                              setMobileCoursesOpen((o) => !o)
                              scrollTo('courses')
                            }}
                            className={cn(
                              'block w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors text-sm inline-flex items-center gap-1',
                              isActive
                                ? 'text-[#F47B20] bg-gradient-to-r from-[#F47B20]/12 to-[#6D3DF5]/12'
                                : 'text-[#536078] hover:text-[#F47B20] hover:bg-[#FDF0E5]'
                            )}
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
                                <div className="ml-3 mt-1 border-l-2 border-[#F47B20]/25 pl-3 space-y-0.5">
                                  {navCoursesDropdownItems.map((item) => (
                                    <button
                                      key={item.label}
                                      onClick={() => {
                                        setActiveCategory(item.key)
                                        setActiveTags([])
                                        setMobileOpen(false)
                                        scrollTo('courses')
                                      }}
                                      className="block w-full text-left px-4 py-2 rounded-lg text-[13px] font-medium text-[#536078] hover:text-[#F47B20] hover:bg-[#FDF0E5] transition-colors inline-flex items-center gap-2"
                                    >
                                      <span className={cn('w-2 h-2 rounded-full shrink-0', item.color)} />
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }
                    return (
                      <button
                        key={link.label}
                        onClick={() => {
                          if (link.href.startsWith('#')) {
                            scrollTo(link.href.slice(1))
                          } else {
                            router.push(link.href)
                          }
                          setMobileOpen(false)
                        }}
                        className={cn(
                          'block w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors text-sm',
                          isActive
                            ? 'text-[#F47B20] bg-gradient-to-r from-[#F47B20]/12 to-[#6D3DF5]/12'
                            : 'text-[#536078] hover:text-[#F47B20] hover:bg-[#FDF0E5]'
                        )}
                      >
                        {link.label}
                      </button>
                    )
                  })}
                </div>
                <div className="pt-3 space-y-2">
                  <Link href="/login" className="landing-control-frame block">
                    <button className="landing-control-reset w-full h-11 rounded-xl border-[1.5px] border-[#F47B20] text-[#F47B20] bg-white font-semibold text-sm transition-all active:scale-[0.98]">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup" className="block">
                    <button className="nav-cta w-full h-11 rounded-xl bg-gradient-to-r from-[#F47B20] to-[#E8630A] text-white font-semibold text-sm shadow-[0_12px_24px_-12px_rgba(244,123,32,0.9)] transition-all active:scale-[0.98]">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="hero relative overflow-hidden">
        <Container size="landing" className="hero-container relative">
          <div className="hero-grid">
            {/* Left - Text column */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="hero-text-col"
            >
              {/* Top badge */}
              <motion.div variants={fadeUp} className="hero-badge">
                <span className="hero-avatar-stack">
                  <img className="hero-avatar hero-avatar-a" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" width={26} height={26} loading="lazy" />
                  <img className="hero-avatar hero-avatar-b" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" width={26} height={26} loading="lazy" />
                  <img className="hero-avatar hero-avatar-c" src="https://randomuser.me/api/portraits/men/75.jpg" alt="" width={26} height={26} loading="lazy" />
                </span>
                <span className="hero-badge-divider" aria-hidden="true" />
                <span className="hero-badge-text">
                  Loved by <strong>20K+ Learners</strong>
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeUp} className="hero-title">
                Learn <span className="accent">skills.</span>
                <br />
                Build your <span className="accent">future.</span>
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} className="hero-sub">
                Learn practical skills, build real-world projects, grow your portfolio, and turn your knowledge into real earning opportunities.
              </motion.p>

              {/* Search bar */}
              <motion.form
                variants={fadeUp}
                className="hero-search"
                role="search"
                onSubmit={(e) => { e.preventDefault(); scrollTo('courses') }}
              >
                <Search className="hero-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills, courses, and tools..."
                  aria-label="Search courses, skills, and tools"
                />
                <button type="submit" className="hero-search-btn" aria-label="Search courses">
                  <ArrowUpRight className="hero-search-arrow" />
                </button>
              </motion.form>

              {/* Category chips */}
              <motion.div variants={fadeUp} className="hero-chips">
{heroFilterChips.map((c) => {
                  const ChipIcon = c.icon
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => { setActiveCategory(c.key); scrollTo('courses') }}
                      className={cn('hero-chip', activeCategory === c.key && 'hero-chip-active')}
                    >
                      <ChipIcon className="hero-chip-icon" />
                      {c.label}
                    </button>
                  )
                })}
              </motion.div>
            </motion.div>

            {/* Right - Animated Image */}
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.15 }}
              className="hero-visual"
            >
              <motion.div
                style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400, transformStyle: 'preserve-3d' }}
                onMouseMove={handleHeroTilt}
                onMouseLeave={resetHeroTilt}
                className="hero-panel-tilt"
              >
                <div className="hero-cutout-wrap">
                  <div className="hero-glow" aria-hidden="true" />
                  <motion.div
                    animate={{ y: [0, -14, 0], rotate: [-1, 1, -1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="hero-cutout-float"
                  >
                    <img
                      src="https://plain-apac-prod-public.komododecks.com/202610/16/gOuMoBQXUy8bfuq9FG1F/image.jpg"
                      alt="Student learning, building projects and earning illustration"
                      className="hero-cutout"
                      loading="eager"
                    />
                    <span className="hero-shine" aria-hidden="true" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Demo Video Modal */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDemoOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Watch demo video"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl rounded-2xl bg-white p-2 shadow-2xl"
            >
              <button
                onClick={() => setDemoOpen(false)}
                aria-label="Close demo video"
                className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg ring-1 ring-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/O96fE1E-rf8?autoplay=1&rel=0"
                  title="Learn2Earn - Learn How to Learn demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      <style dangerouslySetInnerHTML={{__html: `
        /* Hide document scrollbar so the full-width header reaches the right edge (no scrollbar gap) */
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        /* ---- Navbar - aurora glass design ---- */
        .nav-aurora {
          position: relative;
          border-radius: 0;
          padding: 0;
        }
        .nav-aurora.is-scrolled {
          border-radius: 0;
        }
        .nav-shell {
          position: relative;
          border-radius: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 253, 249, 0.88));
          backdrop-filter: blur(18px) saturate(170%);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
          overflow: visible;
          font-family: 'Mona Sans', sans-serif;
        }
        .nav-shine {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
        }
        .nav-shine::after {
          content: '';
          position: absolute;
          top: -30%;
          bottom: -30%;
          left: 0;
          width: 34%;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.65), transparent);
          transform: translateX(-180%) skewX(-18deg);
          animation: nav-shine 6s ease-in-out infinite;
        }
        @keyframes nav-shine {
          0% { transform: translateX(-180%) skewX(-18deg); }
          55%, 100% { transform: translateX(420%) skewX(-18deg); }
        }
        .nav-link {
          position: relative;
          z-index: 1;
          isolation: isolate;
          font-family: 'Mona Sans', sans-serif;
          font-size: 14px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 5px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, #F47B20, #6D3DF5);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .nav-link:hover::after,
        .nav-link[aria-expanded='true']::after {
          transform: scaleX(1);
        }
        .nav-link-pill {
          position: absolute;
          inset: 0;
          border-radius: 11px;
          background: linear-gradient(120deg, rgba(244, 123, 32, 0.14), rgba(109, 61, 245, 0.14));
          border: 1px solid rgba(244, 123, 32, 0.22);
          z-index: -1;
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
        @media (prefers-reduced-motion: reduce) {
          .nav-aurora, .nav-shine::after, .nav-cta::after { animation: none !important; }
        }
        /* ---- Course card image hover — cursor spotlight ---- */
        .course-spotlight {
          background:
            radial-gradient(190px circle at var(--mx, 50%) var(--my, 50%), rgba(224, 123, 34, 0.5), rgba(224, 123, 34, 0.14) 45%, transparent 72%);
        }
        /* ---- Hero - warm organic design ---- */
        .hero {
          background: var(--bg);
          color: var(--heading);
          font-family: var(--font-mona), sans-serif;
          padding: clamp(140px, 9vw, 200px) 0 clamp(120px, 7vw, 170px);
        }
        .hero-container {
          padding-top: 0;
          padding-bottom: 0;
        }
        @media (min-width: 1024px) {
          .hero-container { padding-top: 0; padding-bottom: 0; }
        }
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 20px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: minmax(0, 55fr) minmax(0, 45fr); gap: 16px; }
        }
        @media (min-width: 1920px) {
          .hero-grid { grid-template-columns: minmax(0, 50fr) minmax(0, 50fr); gap: clamp(48px, 4vw, 88px); }
        }

        /* decorative background */
        .hero-decor { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .hero-decor-ring, .hero-decor-arc { position: absolute; border-radius: 9999px; }
        .hero-decor-ring-1 { width: 520px; height: 520px; left: -150px; top: -130px; border: 1px solid rgba(232,99,10,0.14); }
        .hero-decor-ring-2 { width: 720px; height: 720px; right: -190px; bottom: -270px; border: 1px solid rgba(11,59,46,0.08); }
        .hero-decor-arc-1 { width: 180px; height: 180px; left: 46%; top: -70px; border: 1.5px solid rgba(232,99,10,0.10); }
        .hero-decor-arc-2 { width: 120px; height: 120px; right: 42%; bottom: -40px; border: 1.5px solid rgba(11,59,46,0.08); }
        .hero-decor-dot { position: absolute; border-radius: 9999px; }
        .hero-decor-dot-1 { width: 14px; height: 14px; right: 8%; top: 22%; background: rgba(232,99,10,0.14); }
        .hero-decor-dot-2 { width: 10px; height: 10px; left: 11%; bottom: 17%; background: rgba(11,59,46,0.10); }

        /* left column */
        .hero-text-col { width: 100%; max-width: clamp(560px, 40vw, 780px); margin-inline: auto; text-align: center; }
        @media (min-width: 1024px) {
          .hero-text-col { margin-inline: 0; text-align: left; }
        }

        /* badge */
        .hero-badge {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 6px 14px 6px 6px; border-radius: 9999px;
          background: var(--surface); border: 1px solid var(--border);
          box-shadow: 0 14px 34px -22px rgba(11,59,46,0.4);
          margin-bottom: 22px;
        }
        .hero-avatar-stack { display: flex; }
        .hero-avatar {
          width: 26px; height: 26px; border-radius: 9999px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 600; color: #fff; letter-spacing: 0.02em;
          border: 2px solid var(--surface); object-fit: cover;
        }
        .hero-avatar + .hero-avatar { margin-left: -8px; }
        .hero-avatar-a { background: linear-gradient(135deg, #E8630A, #F2994A); }
        .hero-avatar-b { background: linear-gradient(135deg, #0B3B2E, #2E8B6E); }
        .hero-avatar-c { background: linear-gradient(135deg, #4B5563, #9CA3AF); }
        .hero-badge-divider { width: 1px; height: 18px; background: var(--border); }
        .hero-badge-text { font-size: 13px; font-weight: 500; color: #5A6B63; letter-spacing: 0.01em; }
        .hero-badge-text strong { color: var(--accent); font-weight: 700; }

        /* headline */
        .hero-title {
          font-family: 'Mona Sans', sans-serif;
          font-size: 34px; font-weight: 600; line-height: 1.1;
          letter-spacing: -0.02em; color: #0B3B2E; margin: 0 0 16px;
        }
        .hero-title .accent {
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic; font-weight: 400;
          color: #E8630A; font-size: 1.1em; line-height: 1.1;
        }
        @media (min-width: 640px) { .hero-title { font-size: 40px; } }
        @media (min-width: 1024px) { .hero-title { font-size: clamp(55px, 1.1vw + 42.2px, 68px); } }

        /* paragraph */
        .hero-sub {
          font-size: 16px; font-weight: 400; line-height: 1.6;
          color: var(--text-muted); margin: 0 0 26px; max-width: 470px;
          margin-inline: auto;
        }
        @media (min-width: 1024px) { .hero-sub { margin-inline: 0; font-size: clamp(16px, 0.55rem + 0.7vw, 21px); } }

        /* search bar */
        .hero-search {
          position: relative; display: flex; align-items: center;
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          box-shadow: 0 16px 38px -24px rgba(11,59,46,0.5);
          max-width: clamp(520px, 26vw, 660px); margin-inline: auto; margin-bottom: 16px;
        }
        @media (min-width: 1024px) { .hero-search { margin-inline: 0; } }
        .hero-search-icon {
          position: absolute; left: 17px; top: 50%; transform: translateY(-50%);
          width: 17px; height: 17px; color: #9AA7A0; pointer-events: none;
        }
        .hero-search input {
          flex: 1; min-width: 0; height: 54px; padding: 0 62px 0 46px;
          border: 0; outline: none; background: transparent;
          font-size: 14px; font-weight: 500; color: var(--heading); font-family: inherit;
        }
        .hero-search input::placeholder { color: #9AA7A0; }
        .hero-search-btn {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          width: 40px; height: 40px; border: 0; border-radius: 10px;
          background: var(--accent); color: #fff; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .hero-search-btn:hover { background: #C95407; transform: translateY(-50%) scale(1.05); }
        .hero-search-arrow { width: 19px; height: 19px; stroke-width: 2.5; }

        /* category chips */
        .hero-chips { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 639px) { .hero-chips { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .hero-chip {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 8px 14px; border-radius: 999px;
          background: #EEF4EE; border: 1px solid #D5E2D6;
          color: #0B3B2E; font-size: 12px; font-weight: 500; font-family: inherit;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .hero-chip:hover { background: #E3EDE4; border-color: #C7DAC9; }
        .hero-chip-active { background: #D6E9DA; border-color: #A9CDB0; color: #0B3B2E; }
        .hero-chip-icon { width: 16px; height: 16px; stroke-width: 1.5; color: #0B3B2E; }

        /* right visual */
        .hero-visual { position: relative; width: 100%; max-width: 720px; margin-inline: auto; }
        .hero-panel-tilt { position: relative; transform-style: preserve-3d; }
        .hero-cutout-wrap { position: relative; z-index: 1; width: 100%; max-width: 700px; margin-inline: auto; }
        .hero-cutout-float { position: relative; will-change: transform; }
        .hero-cutout {
          position: relative; z-index: 1;
          width: 100%; height: auto; object-fit: contain;
          display: block; border-radius: 20px;
          filter: contrast(1.04) saturate(1.05);
        }
        @media (min-width: 1024px) { .hero-cutout-wrap { max-width: 720px; } }
        .hero-glow {
          position: absolute; left: 50%; top: 50%;
          width: 60%; height: 60%;
          transform: translate(-50%, -50%);
          border-radius: 9999px; z-index: 0; pointer-events: none;
          background: radial-gradient(circle, rgba(232,99,10,0.26) 0%, rgba(232,99,10,0.10) 55%, transparent 75%);
          filter: blur(16px);
          animation: hero-glow-pulse 5s ease-in-out infinite;
        }
        @keyframes hero-glow-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.94); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }
        .hero-shine {
          position: absolute; inset: 0; z-index: 2;
          border-radius: 20px; overflow: hidden; pointer-events: none;
        }
        .hero-shine::after {
          content: ''; position: absolute; top: -10%; bottom: -10%; width: 45%;
          left: -65%;
          background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.20) 50%, transparent 100%);
          transform: skewX(-18deg);
          animation: hero-shine-sweep 6.5s ease-in-out infinite;
        }
        @keyframes hero-shine-sweep {
          0%, 28% { left: -65%; }
          62%, 100% { left: 135%; }
        }
        .hero img {
          color: transparent;
          font-size: 0;
        }
        /* thin decorative outline circles, partly cut off by section edges */
        .hero-outline {
          position: absolute;
          border: 1px solid #E8E4DC;
          border-radius: 9999px;
          background: none;
          box-shadow: none;
          z-index: 0;
          pointer-events: none;
        }
        .hero-outline-1 { width: 700px; height: 700px; left: -190px; top: -250px; }
        .hero-outline-2 { width: 520px; height: 520px; right: -170px; top: -140px; }
        .hero-outline-3 { width: 300px; height: 300px; left: 7%; bottom: -110px; }
        .hero-outline-4 { width: 200px; height: 200px; right: 20%; bottom: -70px; }
        .hero-outline-5 { width: 430px; height: 430px; right: -150px; bottom: -190px; }

        /* tagline */
        .hero-tagline {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          margin-top: 20px; text-transform: uppercase;
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.25em; color: var(--heading);
        }
        .hero-tagline i { width: 5px; height: 5px; border-radius: 9999px; background: var(--accent); }

        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        .animate-marquee { background: transparent; animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        .marquee-pill {
          display: inline-flex; align-items: center; gap: 10px;
          height: 80px; padding: 0 36px; border-radius: 999px;
          border: 1px solid #E4DFD7; background: transparent;
          font-family: 'Mona Sans', sans-serif;
          font-size: 26px; font-weight: 500; color: #1B4D3E;
          white-space: nowrap;
        }
        .marquee-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 500;
          font-size: 28px; color: #1B4D3E;
        }
        .marquee-num--alt { color: #D9701F; }
        .marquee-sep {
          width: 80px; height: 80px; border-radius: 9999px; flex: none;
          border: 1px solid #E4DFD7;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; overflow: hidden;
        }
        .marquee-sep-icon { width: 34px; height: 34px; color: #1B4D3E; stroke-width: 1.1; }
        .marquee-sep img { width: 80px; height: 80px; border-radius: 9999px; object-fit: cover; display: block; flex: none; }
        @media (max-width: 1023px) {
          .marquee-pill { height: 56px; padding: 0 20px; font-size: 18px; gap: 8px; }
          .marquee-num { font-size: 20px; }
          .marquee-sep { width: 56px; height: 56px; }
          .marquee-sep img { width: 56px; height: 56px; }
          .marquee-sep-icon { width: 26px; height: 26px; }
        }
        @keyframes orbit-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes counter-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        @keyframes scroll-ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll-ticker 20s linear infinite; }
        @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 20px rgba(251,146,60,0.4); } 50% { box-shadow: 0 0 40px rgba(251,146,60,0.7); } }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out 1s infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; }
        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in-up-d1 { animation: fade-in-up 0.6s ease-out 0.1s forwards; opacity: 0; }
        .animate-fade-in-up-d2 { animation: fade-in-up 0.6s ease-out 0.2s forwards; opacity: 0; }
        @keyframes scale-in { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scale-in 0.4s ease-out forwards; }
        @keyframes glow-orange { 0%, 100% { box-shadow: 0 0 15px rgba(251,146,60,0.15); } 50% { box-shadow: 0 0 30px rgba(251,146,60,0.35); } }
        .animate-glow-orange { animation: glow-orange 3s ease-in-out infinite; }
        @keyframes leaderboard-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-55%); } }
        .animate-leaderboard { animation: leaderboard-scroll 25s linear infinite; }
        .animate-leaderboard:hover { animation-play-state: paused; }
      `}} />
      {/* Live Tracker Marquee */}
      <div className="relative overflow-hidden bg-[#FAF8F4]">
        <div className="flex whitespace-nowrap animate-marquee py-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {marqueeCourses.map((c) => (
                <div key={c.title} className="flex items-center gap-4 pr-4 shrink-0">
                  <div className="marquee-sep"><img src={c.img} alt="" width={80} height={80} loading="lazy" /></div>
                  <div className="marquee-pill marquee-course">{c.title}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAF8F4] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAF8F4] to-transparent z-10" />
      </div>



      {/* Courses Built For Careers — Curated Catalog */}
      <section id="courses" className="landing-section py-12 sm:py-16 lg:py-24 relative overflow-hidden" style={{ backgroundColor: '#FAF8F4', fontFamily: "var(--font-mona)" }}>
        {/* Soft decorative glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-16 -right-16 w-[260px] h-[260px] rounded-full bg-[#7C3AED]/10 blur-3xl sm:-top-24 sm:-right-24 sm:w-[420px] sm:h-[420px]" />
          <div className="absolute top-1/3 -left-20 w-[240px] h-[240px] rounded-full bg-[#E07B22]/10 blur-3xl sm:-left-28 sm:w-[380px] sm:h-[380px]" />
          <div className="absolute -bottom-20 left-1/2 w-[280px] h-[240px] rounded-full bg-[#1F4D3A]/10 blur-3xl sm:-bottom-28 sm:w-[460px] sm:h-[380px]" />
        </div>

        <Container size="landing" className="relative">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 lg:mb-12"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E8E4DD] px-3.5 py-1.5 shadow-[0_4px_14px_-8px_rgba(31,77,58,0.25)] mb-3.5 sm:mb-5">
                <span className="w-2 h-2 rounded-full bg-[#E07B22]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1F4D3A] sm:text-[11px] sm:tracking-[0.18em]">Courses</span>
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="landing-h2 text-[27px] sm:text-[32px] lg:text-[36px] font-semibold tracking-tight leading-[1.12] text-[#1F4D3A] break-words">
              Courses Built For Careers
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[13px] sm:text-[14px] lg:text-[15px] text-[#5A6B63] leading-relaxed mt-3 mx-auto max-w-xl">
              Master industry-relevant skills with hands-on projects, expert guidance and real career support.
            </motion.p>
          </motion.div>

          {/* Filter pills (removed — sidebar covers these) */}

          {/* Sort / results bar */}
          <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:flex-wrap sm:items-center">
            <p className="min-w-0 text-[12.5px] sm:text-[13px] font-medium text-[#5A6B63] tabular-nums">
              Showing{' '}
              <span className="font-bold text-[#1F4D3A]">{paginatedCourses.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}–{Math.min(effectivePage * pageSize, filteredAndSortedCourses.length)}</span>{' '}
              of <span className="font-bold text-[#1F4D3A]">{filteredAndSortedCourses.length}</span> Results
            </p>

            <div className="landing-control-frame flex w-full min-w-0 flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
              {/* Mobile filter trigger */}
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="landing-control-reset inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[#E8E4DD] bg-white px-3.5 text-[12.5px] font-bold text-[#1F4D3A] shadow-[0_2px_10px_-6px_rgba(31,77,58,0.25)] transition-all duration-200 hover:border-[#E07B22]/50 active:scale-[0.97] lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#E07B22]" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#E07B22] text-white text-[10px] font-bold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Grid / List toggle */}
              <div className="landing-control-frame inline-flex h-10 shrink-0 items-center rounded-xl border border-[#E8E4DD] bg-white p-0.5 shadow-[0_2px_10px_-6px_rgba(31,77,58,0.25)]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={cn('landing-control-reset flex h-9 w-9 items-center justify-center rounded-[10px] transition-all',
                    viewMode === 'grid' ? 'bg-[#1F4D3A] text-white shadow-sm' : 'text-[#8B94A8] hover:text-[#E07B22]')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={cn('landing-control-reset flex h-9 w-9 items-center justify-center rounded-[10px] transition-all',
                    viewMode === 'list' ? 'bg-[#1F4D3A] text-white shadow-sm' : 'text-[#8B94A8] hover:text-[#E07B22]')}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="landing-control-frame relative w-full min-w-0 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className={cn(
                    'landing-control-reset flex h-10 w-full items-center justify-between gap-2 whitespace-nowrap rounded-xl border border-[#E8E4DD] bg-white px-3.5 text-left text-[12.5px] font-bold text-[#1F4D3A] shadow-[0_2px_10px_-6px_rgba(31,77,58,0.25)] transition-all duration-200 sm:w-auto sm:min-w-[190px]',
                    sortOpen ? 'border-[#E07B22]/50 ring-2 ring-[#E07B22]/15' : 'hover:border-[#E07B22]/50'
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <ArrowDownWideNarrow className="w-4 h-4 shrink-0 text-[#E07B22]" />
                    <span className="truncate">{sortLabels[sortOrder]}</span>
                  </span>
                  <ChevronDown className={cn('w-4 h-4 shrink-0 text-[#8B94A8] transition-transform duration-300', sortOpen && 'rotate-180')} />
                </button>

                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} aria-hidden="true" />
                    <div className="absolute left-0 top-full z-40 mt-2 w-full min-w-[190px] rounded-xl border border-[#E8E4DD] bg-white py-1.5 shadow-[0_18px_40px_-18px_rgba(31,45,61,0.35)] sm:right-0 sm:left-auto sm:w-auto">
                      {sortOptions.map((o) => (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => { setSortOrder(o.key); setSortOpen(false) }}
                          className={cn(
                            'mx-1.5 flex w-[calc(100%-12px)] items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold transition-colors',
                            sortOrder === o.key ? 'bg-[#FDEBDD] text-[#E07B22]' : 'text-[#5A6B63] hover:bg-[#FAF8F4] hover:text-[#1F4D3A]'
                          )}
                        >
                          <span className="min-w-0 flex-1">{o.label}</span>
                          {sortOrder === o.key && <Check className="ml-auto w-3.5 h-3.5 shrink-0 text-[#E07B22]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Marketplace layout: sticky sidebar + course grid */}
          <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 3xl:gap-12">
            {/* Desktop sidebar */}
            <div className="hidden lg:block lg:sticky lg:top-28">
              {renderFilters(false)}
            </div>

            {/* Mobile filters drawer */}
            <AnimatePresence>
              {filtersOpen && (
                <>
                  <motion.div
                    key="filters-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setFiltersOpen(false)}
                    className="fixed inset-0 z-[60] bg-[#1F4D3A]/35 backdrop-blur-sm lg:hidden"
                    aria-hidden="true"
                  />
                  <motion.div
                    key="filters-drawer"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                    className="fixed bottom-0 left-0 top-0 z-[70] w-[310px] max-w-[calc(100vw-24px)] overflow-y-auto overscroll-contain bg-[#FAF8F4] p-4 shadow-2xl sm:p-5 lg:hidden scrollbar-none"
                  >
                    <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between border-b border-[#E8E4DD] bg-[#FAF8F4]/95 px-4 pb-3 pt-0 backdrop-blur sm:-mx-5 sm:px-5">
                      <span className="inline-flex items-center gap-2 text-[15px] font-bold text-[#1F4D3A]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] shadow-md shadow-[#7C3AED]/25">
                          <SlidersHorizontal className="w-4 h-4 text-white" />
                        </span>
                        Filters
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        aria-label="Close filters"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E4DD] bg-white text-[#5A6B63] transition-colors hover:text-[#E07B22] active:scale-90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {renderFilters(true)}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ===== Main content ===== */}
            <div className="min-w-0 space-y-6 flex flex-col">

          {/* Course Grid — grid view */}
          {viewMode === 'grid' ? (
          <motion.div layout className="landing-grid-cards grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5">
            {paginatedCourses.map((course, idx) => {
              const hasDiscount = Number(course.originalPrice) > Number(course.price) && Number(course.originalPrice) > 0
              const savings = hasDiscount ? Math.round((1 - course.price / course.originalPrice) * 100) : 0
              const courseSlug = course.slug || toSlug(course.title)
              const theme = courseCardTheme[course.category] ?? defaultCardTheme
              const catLabel = courseTagLabel(course)
              const studentsLabel = Number(course.students) >= 1000 ? `${(Number(course.students) / 1000).toFixed(1)}k` : String(course.students)
              return (
              <motion.div
                key={course.id}
                layout
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : Math.min(idx * 0.08, 0.48), ease: 'easeOut' }}
                className="group/card cursor-pointer"
                onClick={() => router.push(`/course/${courseSlug}`)}
                whileTap={{ scale: 0.985 }}
              >
                <div className={cn(
                  'relative flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-[#E8E4DD] shadow-[0_6px_24px_-12px_rgba(31,77,58,0.2)] transition-all duration-300',
                  'group-hover/card:-translate-y-1.5 group-hover/card:shadow-[0_22px_44px_-16px_rgba(31,77,58,0.32)] group-hover/card:ring-[#E07B22]/40'
                )}>
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-[16/10] overflow-hidden bg-slate-100"
                    onMouseMove={(e) => {
                      const el = e.currentTarget
                      const r = el.getBoundingClientRect()
                      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
                      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
                    }}
                  >
                    <div className={cn('absolute inset-0 bg-gradient-to-br', theme.grad)} />
                    {/* Gentle idle Ken Burns drift so the whole grid feels alive */}
                    <motion.div
                      className="absolute inset-0 will-change-transform"
                      initial={false}
                      animate={prefersReducedMotion ? { scale: 1.03 } : { scale: [1.03, 1.11, 1.03] }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, (max-width: 2099px) 33vw, 25vw"
                        className="relative object-cover grayscale-[45%] transition-[transform,filter] duration-700 ease-out group-hover/card:scale-[1.16] group-hover/card:grayscale-0"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/10 via-transparent to-transparent" />

                    {/* Cursor-follow spotlight — unique hover */}
                    <div className="course-spotlight pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

                    {/* Soft dark wash so the reveal pill reads clearly */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-2/3 bg-gradient-to-t from-[#0F2A21]/70 via-[#0F2A21]/15 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

                    {/* Slide-up "View course" reveal */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] translate-y-full opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,0.84,0.44,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100">
                      <div className="m-3 flex items-center justify-between gap-2 rounded-lg bg-white/15 px-3 py-2 ring-1 ring-white/30 backdrop-blur-md">
                        <span className="text-[11.5px] font-semibold text-white">View course</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/90">
                          {course.lessons} lessons
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {catLabel}
                      </span>
                    </div>

                    {hasDiscount && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center rounded-full bg-[#E07B22] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-[0_4px_12px_-4px_rgba(224,123,34,0.8)]">
                          {savings}% Off
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Stars rating={Number(course.rating) || 4.5} />
                      <span className="min-w-0 truncate text-[11px] font-medium text-[#5A6B63] sm:text-[11.5px]">By {course.instructor}</span>
                    </div>

                    <h3 className="mb-3 line-clamp-2 break-words text-[15px] font-semibold leading-snug text-[#1F4D3A] sm:text-[16px] lg:text-[16.5px]">
                      {course.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-[#5A6B63] mb-1">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#E07B22]" />
                        {course.lessons} Lessons
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#1F4D3A]" />
                        {studentsLabel} Students
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#E07B22]" />
                        {courseDurationMonths(course)}
                      </span>
                    </div>

                    <div className="flex-1" />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0EBE2] pt-3.5 sm:gap-3">
                      <div className="flex min-w-0 flex-wrap items-baseline gap-1.5">
                        <span className="break-words text-[15px] font-bold tabular-nums text-[#1F4D3A]">৳{course.price.toLocaleString()}</span>
                        {hasDiscount && (
                          <span className="break-words text-[11px] tabular-nums text-[#9AA7A0] line-through sm:text-[11.5px]">৳{course.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          savePendingEnrollment(course)
                          saveCourseSnapshot(course)
                          router.push(`/student-information?courseId=${course.id}`)
                        }}
                        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#E07B22] px-3 py-2 text-[12px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(224,123,34,0.85)] transition-all duration-300 hover:bg-[#C96A18] active:scale-90 sm:px-3.5"
                      >
                        Enroll
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/card:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              )
            })}
          </motion.div>
          ) : (
            // List view — horizontal cards
            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-5">
              {paginatedCourses.map((course) => {
                const hasDiscount = Number(course.originalPrice) > Number(course.price) && Number(course.originalPrice) > 0
                const savings = hasDiscount ? Math.round((1 - course.price / course.originalPrice) * 100) : 0
                const courseSlug = course.slug || toSlug(course.title)
                const badgeType = course.id % 3 === 0 ? 'Bestseller' : course.id % 3 === 1 ? 'New' : 'Trending'
                const categoryKey = course.category === 'Development & Tech' ? 'tech' : course.category === 'AI & Data Science' ? 'tech' : course.category === 'Business & Marketing' ? 'business' : course.category === 'Personal Growth' ? 'business' : course.category === 'Career Development' || course.category === 'Language & Communication' ? 'business' : 'design'
                const categoryMeta = {
                  design: { icon: Palette, chip: 'bg-[#6D3DF5] text-white', accentText: 'text-[#6D3DF5]', avatar: 'from-[#6D3DF5] to-[#8B5CF6]', borderHover: 'hover:border-[#6D3DF5]/40' },
                  tech: { icon: Code, chip: 'bg-[#3478F6] text-white', accentText: 'text-[#3478F6]', avatar: 'from-[#3478F6] to-[#60A5FA]', borderHover: 'hover:border-[#3478F6]/40' },
                  business: { icon: BarChart3, chip: 'bg-[#18A878] text-white', accentText: 'text-[#18A878]', avatar: 'from-[#18A878] to-[#34D399]', borderHover: 'hover:border-[#18A878]/40' },
                }[categoryKey]
                const trendBadge = {
                  Bestseller: { cls: 'bg-amber-500', icon: Award },
                  New: { cls: 'bg-emerald-500', icon: Zap },
                  Trending: { cls: 'bg-orange-500', icon: Flame },
                }[badgeType]
                const reviewCount = (Math.round(course.students / (2 + (course.id % 3))) + course.id * 37).toLocaleString()
                const levelStyles: Record<string, { label: string; cls: string }> = {
                  Beginner: { label: 'Beginner', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                  Intermediate: { label: 'Intermediate', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
                  Advanced: { label: 'Advanced', cls: 'bg-red-100 text-red-700 border-red-200' },
                }
                const level = levelStyles[course.level] ?? levelStyles['Beginner']
                const skills: string[] = Array.isArray(course.skills) && course.skills.length ? course.skills.slice(0, 3) : ['Beginner Friendly', 'Practical', 'Project-Based']
                const initials = course.instructor.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                return (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.35 }}
                    className="group/card cursor-pointer"
                    onClick={() => router.push(`/course/${courseSlug}`)}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className={cn('flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/[0.02] md:flex-row', 'border-[#E8E4DD] shadow-[0_6px_24px_-12px_rgba(31,77,58,0.18)] hover:shadow-[0_18px_40px_-16px_rgba(31,77,58,0.3)]', categoryMeta.borderHover, 'hover:ring-[#E07B22]/30')}>
                      {/* Thumb */}
                      <div
                        className="relative aspect-video shrink-0 overflow-hidden bg-slate-100 md:w-60 md:aspect-auto lg:w-64"
                        onMouseMove={(e) => {
                          const el = e.currentTarget
                          const r = el.getBoundingClientRect()
                          el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
                          el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 will-change-transform"
                          initial={false}
                          animate={prefersReducedMotion ? { scale: 1.03 } : { scale: [1.03, 1.1, 1.03] }}
                          transition={prefersReducedMotion ? { duration: 0 } : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Image src={course.image} alt={course.title} fill className="object-cover grayscale-[45%] transition-[transform,filter] duration-700 ease-out group-hover/card:scale-[1.14] group-hover/card:grayscale-0" />
                        </motion.div>
                        {/* Cursor-follow spotlight — unique hover */}
                        <div className="course-spotlight pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                        <div className={cn('absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm text-white', trendBadge.cls)}>
                          <trendBadge.icon className="w-2.5 h-2.5" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">{badgeType}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(course.id) }}
                          className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm active:scale-90"
                        >
                          <Heart className={cn('w-3 h-3 transition-colors', bookmarked.has(course.id) ? 'fill-red-500 text-red-500' : 'text-slate-600')} />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-semibold', level.cls)}>{level.label}</span>
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold text-white', categoryMeta.chip)}>
                            <categoryMeta.icon className="w-2.5 h-2.5" /> {course.category === 'Design & Media' ? 'Design' : course.category === 'Development & Tech' || course.category === 'AI & Data Science' ? 'Tech' : course.category === 'Career Development' ? 'Career' : 'Business'}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-[#E07B22] sm:ml-auto">
                            <Star className="w-3 h-3 fill-[#E07B22]" /> {course.rating}
                            <span className="text-[10px] font-medium text-[#536078]">({reviewCount})</span>
                          </span>
                        </div>

                        <h3 className="line-clamp-2 break-words text-[15px] font-extrabold text-[#1F4D3A] sm:line-clamp-1">{course.title}</h3>
                        <p className="line-clamp-2 text-[12px] text-[#536078] sm:line-clamp-1">{skills.join(' · ')}{course.feature ? ` · ${course.feature}` : ''}</p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-[#536078]">
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[7px] font-bold text-white ring-1 ring-[#E9E7F5]', categoryMeta.avatar)}>{initials}</span>
                            <span className="max-w-[110px] truncate sm:max-w-none">{course.instructor}</span>
                            <BadgeCheck className="w-3 h-3 shrink-0 text-[#3478F6]" />
                          </span>
                          <span className="hidden h-3.5 w-px bg-[#E9E7F5] sm:block" />
                          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3 shrink-0 text-[#3478F6]" />{course.students >= 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students}</span>
                          <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3 shrink-0 text-[#E07B22]" />{course.lessons} lessons</span>
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 shrink-0 text-[#E07B22]" />{courseDurationMonths(course)}</span>
                        </div>

                        <div className="mt-2 flex flex-col items-stretch gap-3 border-t border-[#F0EBE2] pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                            <span className="break-words text-[18px] font-extrabold text-[#1F4D3A] sm:text-[19px]">৳{course.price.toLocaleString()}</span>
                            {hasDiscount && (
                              <>
                                <span className="break-words text-[12px] font-semibold text-[#536078] line-through">৳{course.originalPrice.toLocaleString()}</span>
                                <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold', categoryMeta.accentText)}><TrendingUp className="w-2.5 h-2.5" />Save {savings}%</span>
                              </>
                            )}
                          </div>
                          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                            <span className="text-[12px] font-bold text-[#E07B22] underline-offset-4 group-hover/card:underline">Read More</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); savePendingEnrollment(course); saveCourseSnapshot(course); router.push(`/student-information?courseId=${course.id}`) }}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#E07B22] px-3 py-2 text-[12px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(224,123,34,0.75)] transition-all duration-200 hover:bg-[#C96A18] hover:shadow-[0_12px_22px_-10px_rgba(224,123,34,0.85)] active:scale-95 sm:flex-none sm:px-4"
                            >
                              Enroll Now <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* No results state */}
          {filteredAndSortedCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-[#E8E4DD] shadow-[0_6px_24px_-12px_rgba(31,77,58,0.2)] mb-4">
                <FilterX className="w-7 h-7 text-[#E07B22]" />
              </div>
              <h3 className="text-lg font-bold text-[#1F4D3A]">No courses match your filters</h3>
              <p className="text-sm text-[#5A6B63] mt-1.5 mb-5">Try lowering your price range or switching categories.</p>
              <button
                type="button"
                onClick={() => { resetAllFilters(); setCoursePage(1) }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E07B22] text-white text-[12.5px] font-bold shadow-[0_10px_24px_-10px_rgba(224,123,34,0.8)] hover:bg-[#C96A18] transition-all duration-300 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </motion.div>
          )}

            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 w-full overflow-x-auto pb-1 sm:mt-10">
              <div className="mx-auto flex min-w-max items-center justify-center gap-1.5 px-1">
                <button
                  type="button"
                  onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
                  disabled={effectivePage === 1}
                  aria-label="Previous page"
                  className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95',
                    effectivePage === 1 ? 'cursor-not-allowed border-[#E8E4DD] bg-[#F5F1E8] text-[#C4BCA9]' : 'border-[#E8E4DD] bg-white text-[#5A6B63] hover:border-[#E07B22]/50 hover:text-[#E07B22]')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCoursePage(p)}
                    aria-current={effectivePage === p ? 'page' : undefined}
                    className={cn('h-9 min-w-9 shrink-0 rounded-xl border px-2 text-[12.5px] font-bold tabular-nums transition-all active:scale-95',
                      effectivePage === p ? 'border-transparent bg-[#E07B22] text-white shadow-[0_10px_24px_-10px_rgba(224,123,34,0.8)]' : 'border-[#E8E4DD] bg-white text-[#5A6B63] hover:border-[#E07B22]/50 hover:text-[#E07B22]')}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCoursePage((p) => Math.min(totalPages, p + 1))}
                  disabled={effectivePage === totalPages}
                  aria-label="Next page"
                  className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95',
                    effectivePage === totalPages ? 'cursor-not-allowed border-[#E8E4DD] bg-[#F5F1E8] text-[#C4BCA9]' : 'border-[#E8E4DD] bg-white text-[#5A6B63] hover:border-[#E07B22]/50 hover:text-[#E07B22]')}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </Container>
      </section>

      {/* SECTION: It's Easy to Start Learning */}
      <section
        id="how-it-works"
        onMouseMove={handleSectionMouseMove}
        onMouseLeave={resetSectionParallax}
        className="landing-section relative py-12 sm:py-16 lg:py-24 overflow-hidden"
        style={{ fontFamily: 'var(--font-mona), ui-sans-serif, system-ui, sans-serif' }}
      >
        {/* Soft off-white gradient background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FBFAF7] via-white to-[#FFFFFF] opacity-90" />
          <div className="absolute -top-20 -right-16 w-[240px] h-[240px] rounded-full bg-[#FDEBDD]/70 blur-3xl opacity-60 sm:-top-32 sm:-right-24 sm:w-[420px] sm:h-[420px]" />
          <div className="absolute top-1/3 -left-16 w-[230px] h-[230px] rounded-full bg-[#DFF3E6]/60 blur-3xl opacity-60 sm:-left-24 sm:w-[380px] sm:h-[380px]" />
          <div className="absolute -bottom-20 left-1/3 w-[260px] h-[260px] rounded-full bg-white blur-3xl opacity-70 sm:-bottom-32 sm:w-[420px] sm:h-[420px]" />
        </div>

        {/* Green dotted grid - top left */}
        <div className="sl-twinkle-green pointer-events-none absolute left-4 top-8 h-20 w-20 opacity-50 [background-image:radial-gradient(rgba(11,93,75,0.45)_1.6px,transparent_1.6px)] [background-size:16px_16px] sm:left-6 sm:top-12 sm:h-28 sm:w-28" aria-hidden="true" />

        {/* Orange dotted grid - bottom right */}
        <div className="sl-twinkle-orange pointer-events-none absolute bottom-8 right-4 h-20 w-20 opacity-50 [background-image:radial-gradient(rgba(245,130,32,0.45)_1.6px,transparent_1.6px)] [background-size:16px_16px] sm:bottom-10 sm:right-6 sm:h-28 sm:w-28" aria-hidden="true" />

        {/* Light green corner blob - top right */}
        <div className="pointer-events-none absolute -top-10 right-0 h-48 w-48 sm:-top-14 sm:h-60 sm:w-60 lg:h-72 lg:w-72" aria-hidden="true">
          <div className="sl-blob-b h-full w-full bg-[#DFF3E6]/90" />
        </div>

        <Container size="landing" className="relative">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16 3xl:gap-24 items-center">
            {/* Left: copy + illustration */}
            <div className="relative">
              {/* Heading — words rise and unblur one by one */}
              <h2 className="landing-h2 max-w-full break-words text-[27px] sm:text-[34px] lg:text-[36px] font-bold leading-[1.15] tracking-tight" style={{ fontFamily: 'var(--font-mona), sans-serif' }}>
                <span className="block text-[#0B5D4B]">
                  {startLearningLine1.map((w, i) => (
                    <motion.span
                      key={w}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
                      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.3 + i * 0.13, ease: 'easeOut' }}
                      className="mr-[0.24em] inline-block"
                    >
                      <span className={cn('relative', w === 'Easy' && 'inline-block')}>
                        {w}
                        {w === 'Easy' && (
                          <span className="absolute -top-9 -right-5 hidden sm:block" aria-hidden="true">
                            <svg width="44" height="38" viewBox="0 0 44 38" fill="none">
                              <path d="M5 33L14 26" stroke="#1F9D6E" strokeWidth="2.4" strokeLinecap="round" className="sl-spark" style={{ animationDelay: '1.02s', transformOrigin: '14px 26px' }} />
                              <path d="M10 38L15 25" stroke="#1F9D6E" strokeWidth="2.4" strokeLinecap="round" className="sl-spark" style={{ animationDelay: '1.16s', transformOrigin: '15px 25px' }} />
                              <path d="M2 25L15 31" stroke="#1F9D6E" strokeWidth="2.4" strokeLinecap="round" className="sl-spark" style={{ animationDelay: '1.3s', transformOrigin: '2px 25px' }} />
                              <path d="M3 18L14 19" stroke="#F58220" strokeWidth="2.4" strokeLinecap="round" className="sl-spark" style={{ animationDelay: '1.44s', transformOrigin: '3px 18px' }} />
                            </svg>
                          </span>
                        )}
                      </span>
                    </motion.span>
                  ))}
                </span>

                <span className="relative z-10 mt-2 block">
                  <span className="relative inline-block overflow-hidden">
                    <span className="relative z-10 inline-block text-[#F58220]">
                      {startLearningLine2.map((w, i) => (
                        <motion.span
                          key={w}
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
                          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                          viewport={{ once: true, margin: '-60px' }}
                          transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.56 + i * 0.13, ease: 'easeOut' }}
                          className="mr-[0.24em] inline-block"
                        >
                          {w}
                        </motion.span>
                      ))}
                    </span>
                    {/* Orange shimmer sweep once after the words appear */}
                    <span className="sl-shimmer-sweep pointer-events-none absolute inset-y-0 -left-8 z-20 w-1/2 bg-gradient-to-r from-transparent via-[#FFC58A]/80 to-transparent opacity-0" aria-hidden="true" />
                  </span>

                  {/* Hand-drawn curved orange underline (pen-stroke draw) */}
                  <svg className="absolute -bottom-3 left-1 h-[10px] w-[200px] max-w-full sm:w-[240px] lg:w-[290px]" viewBox="0 0 240 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
                    <motion.path
                      d="M5 8.5 C 55 2.5, 130 2, 236 6.5"
                      stroke="#F58220"
                      strokeWidth="5"
                      strokeLinecap="round"
                      initial={prefersReducedMotion ? false : { pathLength: 0 }}
                      whileInView={prefersReducedMotion ? undefined : { pathLength: 1 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.9, delay: 1.05, ease: 'easeInOut' }}
                    />
                  </svg>
                </span>
              </h2>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.75, ease: 'easeOut' }}
                className="mt-5 max-w-[460px] text-[14px] leading-relaxed text-[#4B5563] sm:mt-7 sm:text-[16px]"
              >
                Join today and take your first step towards a brighter future. Learn at your own pace, from anywhere in the world.
              </motion.p>

              {/* Illustration */}
              <motion.div
                style={{ x: girlParallaxX, y: girlParallaxY }}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto mt-8 w-full max-w-[520px] sm:mt-10 lg:mt-14"
              >
                {/* Soft white glow */}
                <div className="absolute inset-4 rounded-[48px] bg-white blur-2xl" aria-hidden="true" />

                {/* Orange/yellow blob - right of image */}
                <motion.div style={{ x: blobRightParX, y: blobRightParY }} className="absolute -right-3 top-8 sm:-right-6 sm:top-10 lg:-right-10" aria-hidden="true">
                  <div className="sl-blob-a h-40 w-40 sm:h-52 sm:w-52 lg:h-64 lg:w-64 bg-gradient-to-br from-[#FFE9B8] to-[#FFC98D]/80" />
                </motion.div>

                {/* Light green blob - bottom-left */}
                <motion.div style={{ x: blobLeftParX, y: blobLeftParY }} className="absolute -bottom-8 -left-3 sm:-bottom-10 sm:-left-6 lg:-left-10" aria-hidden="true">
                  <div className="sl-blob-b h-40 w-40 sm:h-48 sm:w-48 lg:h-56 lg:w-56 bg-gradient-to-tr from-[#C7EED6] to-[#E9FBE9]/90" />
                </motion.div>

                {/* Girl image - slides in with scale-up, then floats */}
                <div className="relative z-10">
                  <motion.div
                    animate={prefersReducedMotion ? {} : { y: [0, -12, 0] }}
                    transition={prefersReducedMotion ? {} : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <img
                      src="/girl-learning.png"
                      alt="Smiling student wearing a green hijab, learning with headphones and a laptop"
                      loading="eager"
                      draggable={false}
                      className="relative mx-auto w-full select-none rounded-[24px] object-contain"
                    />
                  </motion.div>
                </div>

                {/* Play button - bottom-left of image */}
                <div className="absolute bottom-10 left-2 z-20 sm:bottom-16 sm:left-10">
                  <button
                    type="button"
                    aria-label="Play course introduction video"
                    onClick={() => setDemoVideoPlaying(true)}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_14px_32px_-10px_rgba(11,93,75,0.4)] ring-1 ring-black/5 transition-transform duration-300 hover:scale-110 sm:h-16 sm:w-16"
                  >
                    <span className="sl-play-ring absolute inset-0 rounded-full border-2 border-[#0B5D4B]/25" aria-hidden="true" />
                    <span className="sl-play-ring-delay absolute inset-0 rounded-full border-2 border-[#0B5D4B]/15" aria-hidden="true" />
                    <Play className="ml-0.5 h-5 w-5 text-[#0B5D4B] fill-current transition-transform duration-300 group-hover:translate-x-0.5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* Graduation cap - top right of image */}
                <motion.div style={{ x: capParallaxX, y: capParallaxY }} className="absolute -top-4 right-0 z-20 sm:-top-6 sm:right-6" aria-hidden="true">
                  <motion.div
                    animate={prefersReducedMotion ? {} : { rotate: [0, -10, 6, 0], y: [0, -6, 0] }}
                    transition={prefersReducedMotion ? {} : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B5D4B] shadow-[0_16px_30px_-10px_rgba(11,93,75,0.5)] sm:h-16 sm:w-16 sm:rounded-2xl"
                  >
                    <GraduationCap className="h-6 w-6 text-white sm:h-8 sm:w-8" strokeWidth={2.1} />
                  </motion.div>
                </motion.div>

                {/* Plant + stacked books - bottom-left */}
                <div className="absolute -bottom-8 left-0 z-20 hidden items-end gap-3 sm:flex" aria-hidden="true">
                  <div className="flex items-end">
                    <div className="h-4 w-14 rounded-sm bg-[#2F7BF6]/90" />
                    <div className="ml-1.5 h-5 w-16 rounded-sm bg-[#F58220]/90" />
                    <div className="ml-1.5 h-4 w-14 rounded-sm bg-[#0B5D4B]/90" />
                  </div>
                  <svg width="52" height="58" viewBox="0 0 52 58" fill="none" className="mb-3">
                    <path d="M26 22 C 32 14, 44 14, 46 6 C 40 8, 30 6, 26 2 C 22 6, 12 8, 6 6 C 8 14, 20 14, 26 22 Z" fill="#2FA96F" />
                    <path d="M26 22 C 22 28, 14 30, 8 28 C 10 20, 20 14, 26 14 Z" fill="#3AB97B" />
                    <path d="M26 22 C 30 28, 38 30, 44 28 C 42 20, 32 14, 26 14 Z" fill="#34B077" />
                    <path d="M25 22 L 26 44" stroke="#1F9D6E" strokeWidth="3" strokeLinecap="round" />
                    <path d="M15 44 L 37 44 L 34 56 L 18 56 Z" fill="#E8630A" />
                    <rect x="13" y="40" width="26" height="5" rx="2" fill="#F58220" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Right: 5 steps */}
            <div className="relative min-w-0 lg:pl-4">
              <div className="relative rounded-[24px] border border-[#ECEAE2] bg-white/80 p-4 shadow-[0_24px_70px_-42px_rgba(11,93,75,0.5)] backdrop-blur-sm sm:rounded-[28px] sm:p-6 lg:p-8">
                <div ref={stepsListRef} className="relative">
                  {/* Dotted connector line (base) */}
                  <div className="absolute bottom-8 left-11 top-8 hidden w-[3px] border-l-[3px] border-dotted border-[#D8CFC2] md:block" aria-hidden="true" />

                  {/* Line draws itself downward on scroll */}
                  <motion.div
                    style={{ scaleY: stepsProgress.scrollYProgress }}
                    className="absolute bottom-8 left-11 top-8 hidden w-[3px] origin-top rounded-full bg-gradient-to-b from-[#0B5D4B] to-[#3AB97B] md:block"
                    aria-hidden="true"
                  />

                  {/* Glowing dot travels down the line */}
                  <motion.div style={{ top: glowDotTop }} className="absolute left-9 z-20 hidden md:block" aria-hidden="true">
                    <span className="relative flex h-4 w-4">
                      <span className="absolute inset-0 rounded-full bg-[#0B5D4B]/30 blur-[2px]" />
                      <span className="relative h-4 w-4 rounded-full bg-[#0B5D4B] ring-4 ring-[#0B5D4B]/15" />
                    </span>
                  </motion.div>

                  <div className="space-y-3 sm:space-y-5 lg:space-y-6">
                    {startLearningSteps.map((s, i) => (
                      <motion.div
                        key={s.title}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 56 }}
                        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative flex items-start rounded-2xl p-2 sm:p-3"
                      >
                        <div className="flex min-w-0 items-start gap-3 transition-transform duration-300 group-hover:translate-x-[6px] sm:gap-5">
                          {/* Icon tile pops in with a bounce */}
                          <motion.div
                            initial={prefersReducedMotion ? false : { scale: 0, rotate: -10 }}
                            whileInView={prefersReducedMotion ? undefined : { scale: 1, rotate: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 16, delay: 0.06 + i * 0.12 }}
                            className="relative z-10 shrink-0"
                          >
                            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-[1.08] sm:h-16 sm:w-16 sm:rounded-2xl', s.tile)}>
                              <s.icon className={cn('h-5 w-5 sm:h-7 sm:w-7', s.iconColor)} strokeWidth={2.1} />
                            </div>
                          </motion.div>
                          <div className="min-w-0 pt-1.5">
                            <p className="break-words text-[15px] font-semibold leading-snug text-[#0B5D4B] transition-colors duration-300 group-hover:text-[#F58220] sm:text-[18px]">{s.title}</p>
                            <p className="mt-1 break-words text-[12.5px] leading-relaxed text-[#4B5563] line-clamp-4 sm:text-[14px] sm:line-clamp-2">{s.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo video modal opened by the play button */}
          <AnimatePresence>
            {demoVideoPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDemoVideoPlaying(false)}
                className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0B3B2E]/70 p-3 backdrop-blur-sm sm:p-4"
                role="dialog"
                aria-modal="true"
                aria-label="Course introduction video"
              >
                <motion.div
                  initial={{ scale: 0.92, y: 16, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 10, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
                >
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src="https://www.youtube.com/embed/bM8XmugoQuI?autoplay=1&rel=0"
                    title="Course demo video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    type="button"
                    aria-label="Close video"
                    onClick={() => setDemoVideoPlaying(false)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </section>

      {/* SECTION: Expert Instructors - Meet Our World-Class Experts */}
      <section id="instructors" className="landing-section relative overflow-hidden bg-[#F8F5F2] py-16 sm:py-20 lg:py-24">
        {/* Soft cream ambience */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-28 -right-24 w-[380px] h-[380px] rounded-full bg-white blur-3xl opacity-70" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-white blur-3xl opacity-70" />

        <Container size="landing" className="relative">
          <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.55fr)] lg:gap-14 3xl:gap-24">
            {/* Left column — copy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="lg:max-w-[380px]"
            >
              {/* Pill badge */}
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#1A453B]/15 px-3.5 py-1.5 shadow-sm">
                  <GraduationCap className="w-4 h-4 text-[#D87827]" />
                  <span className="text-sm font-medium text-[#1A453B]">Instructors</span>
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h2
                variants={fadeUp}
                className="landing-h2 mt-5 text-[30px] sm:text-[36px] font-medium leading-[1.1] tracking-tight text-[#1A453B]"
              >
                Meet our world-class
                <span className="block">
                  expert{' '}
                  <em className="relative inline-block font-serif italic font-normal text-[#E07B22] [font-size:1.15em] tracking-[-0.01em] align-baseline">instructors</em>
                </span>
              </motion.h2>

              {/* CTA button */}
              <motion.div variants={fadeUp} className="mt-8">
                <Link
                  href="/instructors"
                  prefetch
                  scroll
                  className="group inline-flex items-center gap-4 rounded-[10px] border border-[#1A453B]/25 bg-white py-[3px] pl-5 pr-[3px] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <span className="text-sm font-medium text-[#1A453B] whitespace-nowrap">View All Instructors</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#D87827] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
                  </span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right column — expert grid */}
            <div className="landing-grid-mentors grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              {expertInstructors.slice(0, 4).map((expert) => (
                <motion.div
                  key={expert.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                  className="group min-w-0 rounded-2xl border border-[#1A453B]/10 bg-white p-2 shadow-mentor transition-all duration-300 hover:-translate-y-2 hover:shadow-mentor-hover"
                >
                  {/* Portrait */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#ECEEF0]">
                    <Image
                      src={expert.image}
                      alt={expert.name}
                      fill
                      sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    {/* Rating badge — top-left */}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-[#1A453B] text-[#1A453B]" />
                      <span className="text-[13px] font-semibold leading-none text-[#1A453B]">{expert.rating}</span>
                    </div>
                  </div>

                  {/* Info bar */}
                  <div className="mt-1.5 flex flex-col items-start gap-2.5 rounded-xl bg-[#F8F5F2] px-4 py-3 transition-colors duration-300 group-hover:bg-[#1A453B] min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between min-[360px]:gap-3">
                    <div className="min-w-0">
                      <p className="text-[20px] font-semibold leading-tight text-[#1A453B] truncate transition-colors duration-300 group-hover:text-white">{expert.name}</p>
                      <p className="mt-0.5 text-[14px] leading-tight text-[#8A8A8A] truncate transition-colors duration-300 group-hover:text-white/70">{expert.title}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-[#1A453B]/25 transition-colors duration-300 group-hover:text-white/60">
                      <a
                        href={`https://twitter.com/${expert.name.toLowerCase().replace(/[^a-z0-9]+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${expert.name} on X`}
                        className="transition-colors hover:text-[#D87827]"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://www.linkedin.com/in/${expert.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${expert.name} on LinkedIn`}
                        className="transition-colors hover:text-[#D87827]"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 3: Choose Your Learning Plan — Pricing */}
      <section id="pricing" className="landing-section relative overflow-hidden bg-[#F8F5F0] py-16 sm:py-20 lg:py-24" style={{ fontFamily: 'var(--font-mona), sans-serif' }}>
        <Container size="landing" className="relative">

          {/* Header */}
          <div className="mx-auto mb-10 max-w-[720px] text-center sm:mb-12 lg:mb-14">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E8E4DD] px-4 py-2 shadow-[0_6px_18px_-10px_rgba(31,77,58,0.28)]">
                <Sparkles className="w-3.5 h-3.5 text-[#E07B22]" strokeWidth={2.2} />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1F4D3A]">Flexible Plans</span>
              </span>
            </motion.div>
            <motion.h2
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.05, ease: 'easeOut' }}
              className="landing-h2 mt-5 text-[30px] sm:text-[36px] font-bold tracking-tight leading-[1.08] text-[#1F4D3A]"
            >
              Choose Your Learning Plan
            </motion.h2>
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.1, ease: 'easeOut' }}
              className="mt-4 text-[15px] text-[#6B7280] leading-relaxed mx-auto max-w-[600px]"
            >
              Whether you&apos;re exploring or ready to commit, we have a plan that fits. Higher tiers unlock faster access to freelance gigs, job placements, and higher referral commissions.
            </motion.p>

            {/* Billing toggle */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
              className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4"
            >
              <div className="relative inline-flex w-full max-w-[260px] rounded-full border border-[#E8E4DD] bg-[#F4F1EB] p-1.5 shadow-[inset_0_1px_2px_rgba(31,77,58,0.08)] sm:w-auto sm:max-w-none">
                <motion.span
                  aria-hidden="true"
                  className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-full bg-[#1F4D3A] shadow-md"
                  animate={{ x: billing === 'annual' ? '100%' : '0%' }}
                  transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                />
                <button
                  type="button"
                  onClick={() => setBilling('monthly')}
                  aria-pressed={billing === 'monthly'}
                  className={cn(
                    'relative z-10 flex-1 min-w-[104px] whitespace-nowrap py-2.5 rounded-full text-[13px] font-bold transition-colors duration-200',
                    billing === 'monthly' ? 'text-white' : 'text-[#6B7280] hover:text-[#1F4D3A]'
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling('annual')}
                  aria-pressed={billing === 'annual'}
                  className={cn(
                    'relative z-10 flex-1 min-w-[104px] whitespace-nowrap py-2.5 rounded-full text-[13px] font-bold transition-colors duration-200',
                    billing === 'annual' ? 'text-white' : 'text-[#6B7280] hover:text-[#1F4D3A]'
                  )}
                >
                  Yearly
                </button>
              </div>
              <motion.span
                key={billing}
                animate={prefersReducedMotion ? undefined : { scale: [1, 1.16, 1] }}
                transition={prefersReducedMotion ? undefined : { duration: 0.55, times: [0, 0.45, 1], ease: 'easeInOut' }}
                className="inline-flex items-center gap-1 rounded-full bg-[#E07B22] px-3 py-1.5 text-white text-[11px] font-extrabold tracking-wide shadow-[0_6px_14px_-6px_rgba(224,123,34,0.55)]"
              >
                Save 20%
              </motion.span>
            </motion.div>
          </div>

          {/* Pricing cards */}
          <div className="landing-grid-pricing mx-auto mt-2 grid max-w-lg grid-cols-1 items-stretch gap-5 sm:max-w-2xl sm:gap-7 md:grid-cols-2 lg:max-w-[1160px] lg:grid-cols-3 lg:gap-8 3xl:gap-12">
            {pricingPlans.map((plan, idx) => {
              const isPro = plan.key === 'pro'
              const amount = billing === 'annual' ? plan.priceAnnual : plan.priceMonthly
              return (
                <motion.div
                  key={plan.key}
                  className={cn('h-full', plan.orderClass)}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 36, scale: isPro ? 0.94 : 1 }}
                  whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-70px' }}
                  transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="relative h-full">
                    {plan.shimmer && (
                      <div
                        aria-hidden="true"
                        className="pricing-pro-halo absolute -inset-3 rounded-[26px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(224,123,34,0.35), transparent 68%)', filter: 'blur(14px)' }}
                      />
                    )}
                    <div className={cn('h-full', isPro && 'pricing-card-float')}>
                      <div
                        className={cn(
                          'pricing-card relative flex h-full flex-col rounded-[20px] border-2 bg-white px-5 py-7 text-left transition-all duration-300 hover:-translate-y-2.5 sm:px-7 sm:py-8',
                          plan.borderClass,
                          plan.hoverBorderClass,
                          plan.shadowClass,
                          plan.hoverShadowClass
                        )}
                      >
                        {plan.ribbon && (
                          <div className="absolute -top-3 left-0 right-0 mx-auto w-fit z-10 inline-flex items-center gap-1.5 rounded-full bg-[#E07B22] px-4 py-1.5 text-white text-[10px] font-extrabold uppercase tracking-[0.14em] shadow-[0_10px_24px_-8px_rgba(224,123,34,0.6)]">
                            <Sparkles className="w-3 h-3" strokeWidth={2.6} />
                            Most Popular
                          </div>
                        )}

                        {plan.shimmer && (
                          <div
                            aria-hidden="true"
                            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px] overflow-hidden"
                            style={{ background: 'linear-gradient(90deg, #E07B22, #F2A65A, #E07B22)' }}
                          >
                            <div className="pricing-shine absolute inset-y-0 w-1/2 bg-white/50 blur-[2px]" />
                          </div>
                        )}

                      {/* Circular glowing badge */}
                      <div className="flex justify-center mb-5">
                        <div className="relative w-[64px] h-[64px]">
                          <div
                            aria-hidden="true"
                            className="pricing-glow absolute -inset-3 rounded-full blur-xl"
                            style={{ background: `radial-gradient(circle, ${plan.accent}70, transparent 70%)` }}
                          />
                          <div
                            aria-hidden="true"
                            className="pricing-orbit absolute -inset-3 rounded-full"
                            style={{ border: `1.5px dashed ${plan.accent}`, opacity: 0.45 }}
                          >
                            <span
                              className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full"
                              style={{ background: plan.accent, boxShadow: `0 0 12px 2px ${plan.accent}` }}
                            />
                          </div>
                          <div
                            className="pricing-bob relative flex items-center justify-center w-full h-full rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${plan.accent}, ${plan.accentDark})`,
                              boxShadow: `0 14px 28px -12px ${plan.accent}CC, 0 4px 12px -4px rgba(31,77,58,0.25), inset 0 1px 0 rgba(255,255,255,0.3)`,
                            }}
                          >
                            <plan.icon className="pricing-icon w-7 h-7 text-white" strokeWidth={2} />
                          </div>
                        </div>
                      </div>

                      {/* Name + tagline */}
                      <div className="text-center mb-4">
                        <h3 className="text-[22px] font-bold text-[#1F4D3A] tracking-tight leading-tight">{plan.name}</h3>
                        <p className="mt-1 text-[13px] font-medium text-[#6B7280]">{plan.tagline}</p>
                      </div>

                      {/* Price */}
                      <PlanPrice
                        amount={amount}
                        period={plan.period}
                        note={billing === 'annual' ? plan.annualNote : ''}
                        noFlip={plan.key === 'free'}
                        prefersReducedMotion={prefersReducedMotion}
                      />

                      {/* Divider */}
                      <div className="my-5 border-t border-[#E8E4DD]" />

                      {/* Features */}
                      <ul className="mb-6 flex-1 space-y-2.5">
                        {plan.features.map((feat, fi) => (
                          <motion.li
                            key={feat}
                            initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.45, delay: prefersReducedMotion ? 0 : 0.2 + fi * 0.08, ease: 'easeOut' }}
                            className="flex items-start gap-2.5 sm:gap-3"
                          >
                            <PricingCheck delay={prefersReducedMotion ? 0 : 0.2 + fi * 0.08 + 0.1} prefersReducedMotion={prefersReducedMotion} />
                            <span className="text-[15px] text-[#6B7280] leading-snug">{feat}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className="mt-auto">
                        <RippleButton
                          onClick={() => selectPlan(plan.key)}
                          className={cn(
                            'w-full py-3.5 rounded-full text-[14px] font-bold transition-all duration-300 active:scale-[0.97]',
                            plan.ctaClass
                          )}
                        >
                          {plan.cta}
                        </RippleButton>
                      </div>
                    </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

        </Container>
      </section>


{/* SECTION: Turn Your Skills Into Income */}
      <section
        id="earn-with-your-skills"
        className="landing-section relative overflow-hidden py-16 sm:py-20 lg:py-24"
        style={{ fontFamily: 'var(--font-mona), sans-serif' }}
      >
        {/* Soft warm cream background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#F8F5F0]">
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#FDEBDD] blur-3xl opacity-60" />
          <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] rounded-full bg-[#DFF3E6] blur-3xl opacity-50" />
          <div className="absolute -bottom-32 left-1/3 w-[440px] h-[440px] rounded-full bg-[#E3EFFF] blur-3xl opacity-50" />
        </div>

        <Container size="landing" className="relative">
          {/* Centered header: full width, one-line sub-heading */}
          <motion.div
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView={prefersReducedMotion ? undefined : 'visible'}
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="mx-auto mb-10 max-w-[760px] text-center sm:mb-12"
          >
            <motion.div
              variants={earnFadeUpBlur}
              className="earn-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8E4DD] mb-5 shadow-sm"
            >
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#E07B22]" />
                <span className="earn-badge-ping absolute inline-flex h-full w-full rounded-full bg-[#E07B22]" />
              </span>
              <span className="earn-badge-pulse text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#1F4D3A]">Career Ready</span>
            </motion.div>
            <motion.h2
              variants={earnWordContainer}
              className="landing-h2 text-[28px] lg:text-[36px] font-bold text-[#1F4D3A] tracking-tight leading-[1.15]"
            >
              <motion.span variants={earnWord} className="inline-block">Turn</motion.span>
              <motion.span variants={earnWord} className="ml-[0.18em] inline-block sm:ml-[0.24em]">Your</motion.span>
              <motion.span variants={earnWord} className="ml-[0.18em] inline-block sm:ml-[0.24em]">Skills</motion.span>
              <motion.span variants={earnWord} className="relative ml-[0.18em] inline-block text-[#E07B22] sm:ml-[0.24em]">Into Income
                <svg className="absolute left-0 -bottom-1.5 w-full h-3" viewBox="0 0 150 10" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <motion.path
                    d="M4 7 C 20 3, 32 3, 48 6 C 62 9, 74 3, 88 5 C 102 7, 114 4, 146 6"
                    stroke="#E07B22"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={prefersReducedMotion ? false : { pathLength: 0 }}
                    whileInView={prefersReducedMotion ? undefined : { pathLength: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ delay: 0.45, duration: 0.85, ease: 'easeInOut' }}
                  />
                </svg>
                <motion.span
                  className="earn-underline-shimmer"
                  aria-hidden="true"
                  initial={prefersReducedMotion ? false : { x: '-130%' }}
                  whileInView={prefersReducedMotion ? undefined : { x: '230%' }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: 0.95, duration: 1.05, ease: [0.4, 0, 0.2, 1] }}
                />
              </motion.span>
            </motion.h2>
            <motion.p
              variants={earnFadeUpBlur}
              className="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-[#5A6B63] sm:text-[16px]"
              style={{ overflowWrap: 'anywhere' }}
            >
              From your first project to your first paycheck, learn the skills that turn your talent into real, sustainable income.
            </motion.p>
          </motion.div>

          {/* Two-column layout: image left, content right */}
          <div className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 3xl:gap-24">
            {/* Left: full-height photo with floating overlays */}
            <EarnImagePanel prefersReducedMotion={prefersReducedMotion} />

            {/* Right: feature cards + stats */}
            <motion.div
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView={prefersReducedMotion ? undefined : 'visible'}
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="flex flex-col justify-center"
            >
              <motion.div
                variants={earnCardContainer}
                className="flex flex-col gap-5"
              >
              {[
                {
                  icon: FolderOpen,
                  tint: 'bg-[#DFF3E6]',
                  iconColor: 'text-[#18A878]',
                  hoverShadow: '0 24px 48px -20px rgba(24,168,120,0.35)',
                  title: 'Job-Ready Projects',
                  desc: 'Build a portfolio of real, industry-aligned projects that prove your skills to employers and clients.',
                },
                {
                  icon: UserCheck,
                  tint: 'bg-[#FDEBDD]',
                  iconColor: 'text-[#E07B22]',
                  hoverShadow: '0 24px 48px -20px rgba(224,123,34,0.38)',
                  title: 'Career Mentorship',
                  desc: 'Get 1-on-1 guidance from experts who help you plan, position, and accelerate your career path.',
                },
                {
                  icon: Briefcase,
                  tint: 'bg-[#E3EFFF]',
                  iconColor: 'text-[#3478F6]',
                  hoverShadow: '0 24px 48px -20px rgba(52,120,246,0.35)',
                  title: 'Freelance & Job Support',
                  desc: 'Land your first paid gig or full-time role with resume help, referrals, and hands-on coaching.',
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  variants={earnCardSlideRight}
                  whileHover={prefersReducedMotion ? undefined : { y: -6, boxShadow: f.hoverShadow, borderColor: 'rgba(224,123,34,0.25)' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="flex items-center gap-3.5 rounded-[16px] border border-[#E8E4DD] bg-white px-4 py-4 shadow-sm sm:gap-4 sm:px-5"
                >
                  <motion.div
                    variants={earnIconPop}
                    whileHover={prefersReducedMotion ? undefined : { rotate: 8, scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-[50px] sm:w-[50px]', f.tint)}
                  >
                    <f.icon className={cn('w-[22px] h-[22px]', f.iconColor)} strokeWidth={2.2} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold leading-tight text-[#1F4D3A] sm:text-[17px]">{f.title}</p>
                    <p className="text-[14px] text-[#5A6B63] leading-relaxed mt-1">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
              </motion.div>

              {/* Stat cards */}
              <motion.div variants={earnStatContainer} className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { icon: TrendingUp, tint: '#DFF3E6', accent: '#18A878', accentDark: '#0E9E6C', value: 85, decimals: 0, prefix: '', suffix: '%', numberClass: 'text-[#18A878]', label: 'Job Placement', delay: 0 },
                    { icon: DollarSign, tint: '#FDEBDD', accent: '#E07B22', accentDark: '#C46212', value: 72, decimals: 0, prefix: '$', suffix: 'K', numberClass: 'text-[#E07B22]', label: 'Avg Starting Salary', delay: 0.5 },
                    { icon: Users, tint: '#E3EFFF', accent: '#3478F6', accentDark: '#2057C9', value: 1.2, decimals: 1, prefix: '', suffix: 'K+', numberClass: 'text-[#3478F6]', label: 'Hired Alumni', delay: 1 },
                    { icon: Building, tint: '#FEF5E7', accent: '#F59E0B', accentDark: '#D97E06', value: 500, decimals: 0, prefix: '', suffix: '+', numberClass: 'text-[#F59E0B]', label: 'Partner Companies', delay: 1.5 },
                  ].map((s) => (
                    <motion.div
                      key={s.label}
                      variants={earnStatCard}
                      whileHover={prefersReducedMotion ? undefined : { y: -6, boxShadow: `0 22px 44px -20px ${s.accent}66` }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                      className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-[#E8E4DD] p-3.5 text-center shadow-sm sm:p-4"
                      style={{ background: `linear-gradient(160deg, ${s.tint} 0%, #FFFFFF 72%)` }}
                    >
                      <span aria-hidden="true" className="pointer-events-none absolute -top-7 -right-7 w-20 h-20 rounded-full blur-2xl opacity-70" style={{ background: s.accent }} />
                      <span aria-hidden="true" className="pointer-events-none absolute -bottom-9 -left-9 w-24 h-24 rounded-full border-[6px] opacity-10" style={{ borderColor: s.accent }} />

                      <div className="relative mb-2.5">
                        <motion.span
                          aria-hidden="true"
                          animate={prefersReducedMotion ? undefined : { scale: [1, 1.18, 1], opacity: [0.5, 0.15, 0.5] }}
                          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
                          className="absolute -inset-1.5 rounded-[18px] border-2"
                          style={{ borderColor: s.accent }}
                        />
                        <motion.div
                          variants={earnStatIcon}
                          whileHover={prefersReducedMotion ? undefined : { rotate: 8, scale: 1.1 }}
                          className="relative w-11 h-11 rounded-[14px] flex items-center justify-center shadow-md"
                          style={{ background: `linear-gradient(140deg, ${s.accent}, ${s.accentDark})`, boxShadow: `0 10px 22px -8px ${s.accent}99` }}
                        >
                          <s.icon className="w-5 h-5 text-white" strokeWidth={2.3} />
                        </motion.div>
                      </div>

                      <EarnCountUp
                        value={s.value}
                        decimals={s.decimals}
                        prefix={s.prefix}
                        suffix={s.suffix}
                        prefersReducedMotion={prefersReducedMotion}
                        className={cn('text-[19px] font-extrabold leading-none tabular-nums sm:text-[20px]', s.numberClass)}
                      />
                      <span className="mt-1.5 text-[9.5px] font-bold uppercase leading-tight tracking-[0.04em] text-[#5A6B63] sm:text-[9px] sm:tracking-[0.06em]">{s.label}</span>

                      <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

{/* SECTION: What Our Learners Say */}
      <section id="testimonials" className="landing-section relative overflow-hidden py-16 sm:py-20 lg:py-24">
        {/* Warm cream background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FFFFFF] via-[#FCFAF6] to-[#F8F5F0]" />
        {/* Soft warm-tone gradient blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -left-24 w-[420px] h-[420px] rounded-full bg-[#F3EDE2] blur-3xl opacity-60" />
          <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-[#F6F0E6] blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[460px] h-[320px] rounded-full bg-[#FDEEDF] blur-3xl opacity-50" />
        </div>

        <Container size="landing" className="relative">
          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView={prefersReducedMotion ? undefined : 'visible'}
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center max-w-[720px] mx-auto"
          >
            <motion.h2 variants={prefersReducedMotion ? undefined : testimonialHeading} className="landing-h2 text-[28px] lg:text-[36px] font-bold text-[#1F4D3A] tracking-tight leading-[1.2]" style={{ fontFamily: "'Mona Sans', sans-serif" }}>
              What Our Learners Say
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-sm text-[#6B7280] leading-relaxed mx-auto" style={{ fontFamily: "'Mona Sans', sans-serif" }}>
              Real voices from learners who transformed their skills.
            </motion.p>
          </motion.div>

          {/* Three-column row: side testimonial cards + center video */}
          <motion.div
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView={prefersReducedMotion ? undefined : 'visible'}
            viewport={{ once: true, margin: '-80px' }}
            variants={testimonialRow}
            className="mx-auto mt-10 grid max-w-[1150px] grid-cols-1 items-stretch gap-6 sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-[1fr_1.15fr_1fr] lg:gap-8 3xl:gap-16"
          >
            {/* Left: text testimonial */}
            <motion.div
              variants={prefersReducedMotion ? undefined : testimonialSlideIn(true)}
              whileHover={prefersReducedMotion ? undefined : { y: -6, boxShadow: '0 26px 50px -24px rgba(31, 77, 58, 0.30)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group relative flex h-full flex-col rounded-2xl border border-[#E8E4DD] bg-white p-5 shadow-sm sm:p-6 lg:p-7"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={testimonialIndex}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: 24 }}
                  transition={{ duration: 0.32, ease: 'easeInOut' }}
                  className="flex-1 flex flex-col"
                >
                  <motion.span
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.4, y: -6 }}
                    animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [0.4, 1.12, 1], y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 12 }}
                    aria-hidden="true"
                    className="self-start"
                  >
                    <Quote className={cn('w-9 h-9 text-[#1F4D3A] fill-[#1F4D3A]/20 transition-transform duration-300', prefersReducedMotion ? '' : 'group-hover:-rotate-6 group-hover:scale-110')} />
                  </motion.span>
                  <p className="mt-4 text-[15px] text-[#6B7280] leading-relaxed">{testimonialList[testimonialIndex]?.quote}</p>
                  <div className="mt-6 pt-5 border-t border-[#E8E4DD] flex-1 flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#F3EDE2] shrink-0">
                        <Image src={testimonialList[testimonialIndex]?.image} alt={testimonialList[testimonialIndex]?.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[16px] font-semibold text-[#1F4D3A] leading-tight truncate">{testimonialList[testimonialIndex]?.name}</p>
                        <p className="text-[13px] text-[#6B7280] leading-tight truncate mt-0.5">{testimonialList[testimonialIndex]?.role}</p>
                      </div>
                    </div>
                    <TestimonialPagination index={testimonialIndex} onSelect={setTestimonialIndex} prefersReducedMotion={prefersReducedMotion} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Center: video testimonial */}
            <motion.div
              variants={prefersReducedMotion ? undefined : testimonialVideoIn}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="group relative h-full overflow-hidden rounded-[16px] border border-[#E8E4DD] bg-black shadow-sm sm:order-3 sm:col-span-2 lg:order-none lg:col-span-1 lg:rounded-[20px] lg:shadow-lg"
            >
              <div className="relative h-full min-h-[300px] w-full sm:min-h-[360px] lg:min-h-[320px]">
                {testimonialVideoPlaying ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/O96fE1E-rf8?autoplay=1&rel=0"
                    title="Learner testimonial video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {/* Thumbnail with slow Ken Burns motion */}
                    <motion.img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Young_woman_takes_selfie_at_home_workspace_with_breakfast_and_laptop_in_the_morning.jpg/960px-Young_woman_takes_selfie_at_home_workspace_with_breakfast_and_laptop_in_the_morning.jpg"
                      alt="Young woman smiling at her home workspace with a laptop"
                      initial={false}
                      animate={prefersReducedMotion ? { scale: 1.05 } : { scale: [1.08, 1.18, 1.08] }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />

                    {/* Cinematic scrims */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(224,123,34,0.16),transparent_60%)] pointer-events-none" />

                    {/* Breathing frame glow */}
                    <motion.span
                      aria-hidden="true"
                      animate={prefersReducedMotion ? { opacity: 0.4 } : { opacity: [0.35, 0.75, 0.35] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="pointer-events-none absolute inset-0 rounded-[20px] border border-[#E07B22]/40"
                    />

                    {/* Soft animated corner glow */}
                    <motion.span
                      aria-hidden="true"
                      animate={prefersReducedMotion ? { opacity: 0.5 } : { scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#E07B22]/25 blur-3xl"
                    />

                    {/* Top badges */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:p-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 backdrop-saturate-150 px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                        <span aria-hidden="true" className="relative flex h-2 w-2">
                          <span className={cn('absolute inline-flex h-full w-full rounded-full bg-[#E07B22] opacity-75', prefersReducedMotion ? '' : 'animate-ping')} />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E07B22]" />
                        </span>
                        Learner Story
                      </span>
                      <motion.span
                        animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
                        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg"
                      >
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#E07B22]" />
                        HD
                      </motion.span>
                    </div>

                    {/* Floating glass chips above the control bar */}
                    <div className="pointer-events-none absolute left-4 bottom-[56px]">
                      <motion.span
                        animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg"
                      >
                        <Clock className="w-3 h-3 text-[#F8B681]" />
                        05:30
                      </motion.span>
                    </div>
                    <div className="pointer-events-none absolute right-4 bottom-[56px]">
                      <motion.span
                        animate={prefersReducedMotion ? undefined : { y: [0, -7, 0] }}
                        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg"
                      >
                        <Star className="w-3 h-3 fill-[#F8B681] text-[#F8B681]" />
                        4.8
                        <span className="font-semibold opacity-80">· 2.5K+</span>
                      </motion.span>
                    </div>

                    {/* Occasional shimmer sweep */}
                    <motion.span
                      aria-hidden="true"
                      animate={prefersReducedMotion ? undefined : { x: ['-140%', '240%'] }}
                      transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                      className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                    />

                    {/* Centered play stack */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {!testimonialVideoPlayed && (
                        <>
                          <motion.span
                            aria-hidden="true"
                            animate={prefersReducedMotion ? { opacity: 0.35 } : { scale: [1, 1.7, 1] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                            className="absolute w-28 h-28 rounded-full bg-[#E07B22]/20 blur-2xl"
                          />
                          <motion.span
                            aria-hidden="true"
                            animate={prefersReducedMotion ? { opacity: 0.4 } : { scale: [1, 1.9], opacity: [0.5, 0] }}
                            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
                            className="absolute w-[76px] h-[76px] rounded-full border-2 border-[#E07B22]/70"
                          />
                          <motion.span
                            aria-hidden="true"
                            animate={prefersReducedMotion ? { opacity: 0.4 } : { scale: [1, 1.55], opacity: [0.4, 0] }}
                            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut', delay: 0.95 }}
                            className="absolute w-[76px] h-[76px] rounded-full border border-[#F8B681]/60"
                          />
                        </>
                      )}
                      <motion.button
                        type="button"
                        aria-label="Play testimonial video"
                        onClick={() => {
                          setTestimonialVideoPlaying(true)
                          setTestimonialVideoPlayed(true)
                        }}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.15 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                        className="relative w-16 h-16 rounded-full bg-[#E07B22] shadow-[0_10px_30px_-6px_rgba(224,123,34,0.6)] flex items-center justify-center"
                      >
                        <span
                          aria-hidden="true"
                          className={cn('absolute inset-0 rounded-full bg-white/25 opacity-0 transition-opacity duration-300', prefersReducedMotion ? '' : 'group-hover:opacity-100')}
                        />
                        <Play className="relative w-6 h-6 text-white fill-white ml-0.5" />
                      </motion.button>
                    </div>
                  </>
                )}

                {/* Bottom control bar */}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2.5 backdrop-blur-[2px] sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button type="button" aria-label="Pause" className="text-white shrink-0">
                      <Pause className="w-4 h-4 fill-white" />
                    </button>
                    <div className="relative h-1.5 min-w-0 flex-1 rounded-full bg-white/25">
                      <div className="absolute inset-y-0 left-0 w-[33%] rounded-full bg-[#E07B22] transition-[width] duration-700 ease-out" />
                      <span className="absolute top-1/2 left-[33%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm" />
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-[9.5px] tabular-nums text-white sm:text-[10.5px]">02:15 / 05:30</span>
                    <button type="button" aria-label="Volume" className="text-white shrink-0">
                      <Volume className="w-4 h-4" />
                    </button>
                    <button type="button" aria-label="Fullscreen" className="text-white shrink-0">
                      <Maximize className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Toggle captions"
                      aria-pressed={testimonialCaptionsOn}
                      onClick={() => setTestimonialCaptionsOn((v) => !v)}
                      className="rounded-[5px] bg-[#E07B22] px-1.5 py-0.5 text-[9.5px] font-bold text-white leading-none shrink-0"
                    >
                      <motion.span
                        animate={testimonialCaptionsOn && !prefersReducedMotion ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                        className="block"
                      >
                        CC
                      </motion.span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: text testimonial */}
            <motion.div
              variants={prefersReducedMotion ? undefined : testimonialSlideIn(false)}
              whileHover={prefersReducedMotion ? undefined : { y: -6, boxShadow: '0 26px 50px -24px rgba(224, 123, 34, 0.30)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group relative flex h-full flex-col rounded-2xl border border-[#E8E4DD] bg-white p-5 shadow-sm sm:order-2 sm:col-start-2 sm:p-6 lg:order-none lg:col-start-auto lg:p-7"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={testimonialRightIndex}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.32, ease: 'easeInOut' }}
                  className="flex-1 flex flex-col"
                >
                  <motion.span
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.4, y: -6 }}
                    animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [0.4, 1.12, 1], y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 12 }}
                    aria-hidden="true"
                    className="self-start"
                  >
                    <Quote className={cn('w-9 h-9 text-[#E07B22] fill-[#E07B22]/20 transition-transform duration-300', prefersReducedMotion ? '' : 'group-hover:rotate-6 group-hover:scale-110')} />
                  </motion.span>
                  <p className="mt-4 text-[15px] text-[#6B7280] leading-relaxed">{testimonialList[testimonialRightIndex]?.quote}</p>
                  <div className="mt-6 pt-5 border-t border-[#E8E4DD] flex-1 flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#FDEEDF] shrink-0">
                        <Image src={testimonialList[testimonialRightIndex]?.image} alt={testimonialList[testimonialRightIndex]?.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[16px] font-semibold text-[#1F4D3A] leading-tight truncate">{testimonialList[testimonialRightIndex]?.name}</p>
                        <p className="text-[13px] text-[#6B7280] leading-tight truncate mt-0.5">{testimonialList[testimonialRightIndex]?.role}</p>
                      </div>
                    </div>
                    <TestimonialPagination index={testimonialRightIndex} onSelect={setTestimonialRightIndex} prefersReducedMotion={prefersReducedMotion} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </Container>
      </section>
      {/* CTA + Footer */}
      <footer className="relative bg-gradient-to-b from-[#0F2E24] to-[#143A2C] border-t border-[#234433]/60 overflow-hidden z-20" style={{ fontFamily: "'Mona Sans', sans-serif" }}>
        {/* branded top accent — animated gradient line */}
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#E07B22,#F8B681,#2E7D5B,#F8B681,#E07B22)] bg-[length:200%_100%]"
        />
        {/* deep green ambient glows */}
        <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[#2E6650]/40 blur-3xl opacity-60" />
        <div className="pointer-events-none absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#1F4D3A]/50 blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-[#E07B22]/10 blur-3xl opacity-50" />
        {/* floating warm orbs */}
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { y: [0, -18, 0], opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-24 right-[12%] w-24 h-24 rounded-full bg-[#E07B22]/15 blur-2xl"
        />
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { y: [0, 14, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="pointer-events-none absolute bottom-28 left-[8%] w-28 h-28 rounded-full bg-[#43A67A]/15 blur-2xl"
        />
        {/* subtle dot grid texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#B8C9C0_1px,transparent_1px)] [background-size:22px_22px]" />

        <Container size="landing" className="landing-footer relative py-16 lg:py-20">
          {/* Top CTA Banner */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="relative rounded-3xl bg-gradient-to-br from-[#16352A] via-[#123027] to-[#0F2A21] border border-white/10 overflow-hidden shadow-lg shadow-black/25"
          >
            <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-[#E07B22]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-16 w-72 h-72 rounded-full bg-[#43A67A]/20 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 right-1/3 w-56 h-56 rounded-full bg-[#1F4D3A]/40 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex flex-col xl:flex-row gap-10 3xl:gap-20 items-center px-7 py-10 lg:px-12 lg:py-12">
              {/* Left: content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7">
                  <div className="shrink-0">
                    <CtaScene />
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E07B22]/10 border border-[#E07B22]/30 mb-4">
                      <Sparkles className="w-3 h-3 text-[#E07B22]" />
                      <span className="text-[10px] font-bold text-[#F8B681] uppercase tracking-wider">Learn. Earn. Grow.</span>
                    </span>
                    <h2 className="text-[26px] lg:text-[32px] font-extrabold text-white leading-tight">
                      Start Learning. Start Earning.
                    </h2>
                    <h3 className="text-[20px] lg:text-[24px] font-extrabold leading-snug mt-1.5 text-white capitalize">
                      Start Your <span className="relative inline-block">Journey
                        <svg className="absolute left-0 -bottom-1.5 w-full h-2.5" viewBox="0 0 120 8" fill="none" preserveAspectRatio="none" aria-hidden="true">
                          <path d="M2 6 C 30 1, 90 1, 118 6" stroke="#E07B22" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </span> Today!
                    </h3>
                    <p className="text-[#B8C9C0] text-[13.5px] leading-relaxed mt-3 max-w-md">
                      Join thousands of learners who are building skills, earning income, and creating a better future.
                    </p>
                  </div>
                </div>

                {/* 3-icon feature row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  {footerCtaFeatures.map((f) => (
                    <div key={f.title} className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center ring-1 shrink-0', f.accent)}>
                        <f.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-white leading-tight">{f.title}</p>
                        <p className="text-[11px] text-[#8FA79D] leading-snug mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CTA */}
              <div className="shrink-0 flex flex-col items-center xl:items-end gap-3 xl:pr-2">
                <Link href="/signup">
                  <button data-magnet className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E07B22] to-[#F59E0B] hover:from-[#C96A18] hover:to-[#E07B22] text-white text-[14px] font-bold px-7 py-3.5 shadow-sm transition-colors duration-300">
                    Join Now &ndash; It&apos;s Free!
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>
                <p className="text-[11px] text-[#8FA79D]">No hidden charges. Cancel anytime.</p>
              </div>
            </div>
          </motion.div>

          {/* Main footer grid */}
          <motion.div
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView={prefersReducedMotion ? undefined : 'visible'}
            viewport={{ once: true, margin: '-60px' }}
            variants={footerGridStagger}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-8 gap-y-10 mt-16"
          >
            {/* Brand */}
            <motion.div variants={footerColIn} className="col-span-2 md:col-span-3 xl:col-span-1">
              <Link href="/" className="inline-flex items-center mb-4" aria-label="Learn2Earn">
                <span className="inline-flex items-center justify-center rounded-2xl bg-white px-3.5 py-2 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)]">
                  <Image
                    src="/footer-logo.jpg"
                    alt="Learn2Earn"
                    width={1088}
                    height={960}
                    className="h-14 w-auto object-contain"
                  />
                </span>
              </Link>
              <p className="text-[#B8C9C0] text-[13px] leading-relaxed">
                The all-in-one platform to learn new skills, earn income, and build the future you deserve.
              </p>
              <div className="flex items-center gap-2 mt-5">
                {footerSocials.map((s, si) => (
                  <motion.button
                    key={s.label}
                    variants={footerColIn}
                    custom={si}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.18, rotate: 6, y: -3 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-transparent border border-[#4A6B5C] flex items-center justify-center text-[#B8C9C0] hover:text-white hover:bg-[#E07B22] hover:border-[#E07B22] transition-colors duration-200"
                  >
                    <s.icon className="w-4 h-4" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
              <FooterLinksCol title="Quick Links" icon={<Link2 className="w-4 h-4 text-[#E07B22]" />} links={footerQuickLinks} />
            </motion.div>
            {/* For Learners */}
            <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
              <FooterLinksCol title="For Learners" icon={<GraduationCap className="w-4 h-4 text-[#E07B22]" />} links={footerLearnerLinks} />
            </motion.div>
            {/* For Earners */}
            <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
              <FooterLinksCol title="For Earners" icon={<Wallet className="w-4 h-4 text-[#F8B681]" />} links={footerEarnerLinks} />
            </motion.div>
            {/* Company */}
            <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
              <FooterLinksCol title="Company" icon={<Building className="w-4 h-4 text-[#E07B22]" />} links={footerCompanyLinks} />
            </motion.div>

            {/* Stay Updated */}
            <motion.div variants={footerColIn} className="col-span-2 md:col-span-1">
              <h4 className="group/title flex items-center gap-2 text-[16px] font-semibold text-white mb-4">
                <span className="transition-transform duration-300 group-hover/title:scale-110 group-hover/title:rotate-6">
                  <MailPlus className="w-4 h-4 text-[#E07B22]" />
                </span>
                Stay Updated
                <span aria-hidden="true" className="h-px flex-1 min-w-[12px] bg-gradient-to-r from-white/25 to-transparent" />
              </h4>
              <p className="text-[12px] text-[#B8C9C0] leading-relaxed mb-3">
                Subscribe to get the latest courses, tips, and updates.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1.5 focus-within:border-[#E07B22]/60 focus-within:shadow-[0_0_0_4px_rgba(224,123,34,0.12)] transition-all duration-300"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 min-w-0 bg-transparent text-[12px] text-white placeholder:text-[#5C776C] px-2 outline-none"
                />
                <motion.button
                  type="submit"
                  aria-label="Subscribe"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.15, rotate: -4 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                  className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E07B22] to-[#F59E0B] hover:from-[#C96A18] hover:to-[#E07B22] flex items-center justify-center text-white shadow-sm transition-colors duration-200 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
              <p className="flex items-start gap-1.5 text-[10.5px] text-[#5C776C] leading-snug mt-3">
                <Lock className="w-3 h-3 shrink-0 mt-0.5" />
                We respect your privacy. Unsubscribe anytime.
              </p>
            </motion.div>
          </motion.div>

          {/* Legal bar */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-14 pt-8"
          >
            <div className="h-px w-full mb-8 bg-gradient-to-r from-transparent via-[#5C776C] to-transparent" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-[13px] text-[#5C776C]">&copy; 2026 <span className="text-[#E07B22] font-semibold">Learn2Earn</span>. All rights reserved.</p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[#5C776C]">
                {['Terms of Use', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'].map((item) => (
                  <button key={item} className="hover:text-[#F8B681] transition-colors">{item}</button>
                ))}
              </div>
              <p className="text-[13px] text-[#5C776C]">Made with &#128154; for learners worldwide.</p>
            </div>
          </motion.div>
        </Container>
      </footer>



      {/* Enrollment Modal */}
      <EnrollmentModal
        open={!!enrollingCourse}
        onOpenChange={(open) => { if (!open) setEnrollingCourse(null) }}
        course={enrollingCourse || { id: 0, title: '', instructor: '', price: 0, image: '' }}
      />

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  )
}
