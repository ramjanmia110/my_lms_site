'use client'

import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useInView, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion'
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
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import EnrollmentModal from '@/components/landing/EnrollmentModal'
import { coursesAPI } from '@/lib/api'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
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
  { icon: BookOpen, accent: 'text-[#A78BFA] bg-[#A78BFA]/10 ring-[#A78BFA]/25', title: 'Learn', desc: 'Access premium courses and expert guidance.' },
  { icon: Wallet, accent: 'text-[#34D399] bg-[#34D399]/10 ring-[#34D399]/25', title: 'Earn', desc: 'Complete tasks, projects, and earn real income.' },
  { icon: Users, accent: 'text-[#60A5FA] bg-[#60A5FA]/10 ring-[#60A5FA]/25', title: 'Grow Together', desc: 'Join a supportive community and achieve more.' },
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

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Instructors', href: '#instructors' },
  { label: 'Community', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

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

const smarterStats: {
  icon: LucideIcon
  tint: string
  badge: string
  value: string
  label: string
}[] = [
  { icon: GraduationCap, tint: 'bg-[#F3EEFF]', badge: 'bg-[#6D3DF5]', value: '500+', label: 'Expert Instructors' },
  { icon: Play, tint: 'bg-[#EEF4FF]', badge: 'bg-[#3478F6]', value: '2000+', label: 'Video Lessons' },
  { icon: FolderOpen, tint: 'bg-[#ECFBF5]', badge: 'bg-[#18A878]', value: '100+', label: 'Learning Paths' },
  { icon: Users, tint: 'bg-[#FEF5E7]', badge: 'bg-[#F59E0B]', value: '50K+', label: 'Active Learners' },
]

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
  { id: 1, name: 'Arjun Mehta', title: 'UI/UX Design Expert', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: '10+ years crafting intuitive interfaces for startups and global brands.', rating: '4.9', courses: '2 Courses', students: '25,000+', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face' },
  { id: 2, name: 'Neha Kapoor', title: 'Digital Marketing Expert', accent: 'text-[#3478F6]', glow: 'bg-[#EEF4FF]', glowRing: 'bg-[#EEF4FF]/70', bio: 'Former growth lead helping brands scale with data-driven campaigns.', rating: '4.8', courses: '3 Courses', students: '20,000+', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face' },
  { id: 3, name: 'Rohit Verma', title: 'Full Stack Developer', accent: 'text-[#18A878]', glow: 'bg-[#ECFBF5]', glowRing: 'bg-[#ECFBF5]/70', bio: 'Full-stack engineer shipping production apps used by millions.', rating: '4.9', courses: '2 Courses', students: '30,000+', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
  { id: 4, name: 'Ananya Sharma', title: 'Data Science Expert', accent: 'text-[#6D3DF5]', glow: 'bg-[#F3EEFF]', glowRing: 'bg-[#F3EEFF]/70', bio: 'Data scientist turning raw data into actionable business insights.', rating: '4.8', courses: '2 Courses', students: '18,000+', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face' },
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

function FooterLinksCol({ title, icon, accent, links }: {
  title: string
  icon: ReactNode
  accent: string
  links: { label: string; href: string }[]
}) {
  return (
    <div className="col-span-2 md:col-span-1">
      <h4 className={`flex items-center gap-2 text-[13px] font-bold ${accent} mb-4`}>
        {icon}
        {title}
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
              className="text-[13px] text-[#8B94A8] hover:text-white transition-colors"
            >
              {link.label}
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
        <linearGradient id="ctaG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6D3DF5" /><stop offset="100%" stopColor="#3478F6" /></linearGradient>
      </defs>
      <circle cx="60" cy="60" r="46" fill="#6D3DF5" opacity="0.12" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="2 6" opacity="0.5" />
      <rect x="26" y="26" width="68" height="68" rx="18" fill="url(#ctaG)" />
      <path d="M52 44 v22 l16 9 v-22 z" fill="#FFFFFF" />
      <circle cx="60" cy="60" r="8" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
    </svg>
  )
}

export function LandingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
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

  useEffect(() => {
    setCoursePage(1)
  }, [activeCategory, priceRange, levelFilter, searchQuery, sortOrder])
  const [expertPage, setExpertPage] = useState(0)
  const expertTotalPages = Math.ceil(expertInstructors.length / 4)
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

  const [apiCourses, setApiCourses] = useState<any[] | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [demoOpen, setDemoOpen] = useState(false)
  const [demoVideoPlaying, setDemoVideoPlaying] = useState(false)
  const [testimonialVideoPlaying, setTestimonialVideoPlaying] = useState(false)
  const tiltRawX = useMotionValue(0)
  const tiltRawY = useMotionValue(0)
  const tiltX = useSpring(tiltRawX, { stiffness: 160, damping: 18, mass: 0.5 })
  const tiltY = useSpring(tiltRawY, { stiffness: 160, damping: 18, mass: 0.5 })
  const shadowShiftX = useTransform(tiltY, (v) => v * -0.9)
  const sheenShiftX = useTransform(tiltY, (v) => v * 2.4)
  const sheenShiftY = useTransform(tiltX, (v) => v * 2.4)

  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
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
              image: item.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop',
              tags: item.tags?.length ? item.tags : ['All Levels'],
              skills: Array.isArray(item.skills) && item.skills.length ? item.skills.slice(0, 3) : ['Beginner Friendly', 'Practical', 'Project-Based'],
              level: item.level || 'Beginner',
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
      const catOk = activeCategory === 'All' || String(c.category || 'General').trim() === activeCategory
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
      const levelOk = levelFilter === 'All' || String(c.level || '').trim() === levelFilter
      const q = searchQuery.trim().toLowerCase()
      const searchOk = !q
        || String(c.title || '').toLowerCase().includes(q)
        || String(c.instructor || '').toLowerCase().includes(q)
        || String(c.category || '').toLowerCase().includes(q)
        || String(Array.isArray(c.skills) ? c.skills.join(' ') : '').toLowerCase().includes(q)
      return catOk && priceOk && levelOk && searchOk
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
  }, [allCourses, activeCategory, priceRange, levelFilter, searchQuery, sortOrder])

  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCourses.length / pageSize))
  const effectivePage = Math.min(coursePage, totalPages)
  const paginatedCourses = filteredAndSortedCourses.slice((effectivePage - 1) * pageSize, effectivePage * pageSize)

  const resetAllFilters = () => {
    setActiveCategory('All')
    setPriceRange('All')
    setLevelFilter('All')
    setSearchQuery('')
  }

  const categoryOptions = useMemo(() => {
    const counts: Record<string, number> = {}
    allCourses.forEach((c: any) => {
      const k = String(c.category || 'General').trim() || 'General'
      counts[k] = (counts[k] || 0) + 1
    })
    const allCount = Object.values(counts).reduce((a, b) => a + b, 0)
    return [
      { key: 'All', label: 'All Courses', icon: LayoutGrid, count: allCount },
      ...Object.entries(categoryIconMap).map(([key, icon]) => ({
        key,
        label: key,
        icon,
        count: counts[key] || 0,
      })),
    ]
  }, [allCourses])

  const selectCategory = (key: string) => {
    setActiveCategory(key)
  }

  const selectPriceRange = (key: string) => {
    setPriceRange(key)
  }

  const dynamicStats = useMemo(() => {
    const src = apiCourses && apiCourses.length > 0 ? apiCourses : courses

    const uniqueInstructors = new Set(
      src.map((c: any) => String(c.instructor || 'Instructor').trim().toLowerCase())
    ).size

    const lessonsTotal = src.reduce((acc: number, c: any) => acc + (Number(c.lessons) || 0), 0)
    const hoursTotal = src.reduce((acc: number, c: any) => acc + (Number(c.hours) || 0), 0)

    const uniqueCategories = new Set(
      src.map((c: any) => String(c.category || 'General').trim()).filter(Boolean)
    ).size

    const studentsTotal = src.reduce((acc: number, c: any) => acc + (Number(c.students) || 0), 0)

    const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K+' : n + '+')

    return {
      instructors: uniqueInstructors > 0 ? `${uniqueInstructors}+` : smarterStats[0].value,
      videoLessons: lessonsTotal > 0 ? `${lessonsTotal}+` : hoursTotal > 0 ? `${hoursTotal}+` : smarterStats[1].value,
      learningPaths: uniqueCategories > 0 ? `${uniqueCategories}+` : smarterStats[2].value,
      activeLearners: studentsTotal > 0 ? fmt(studentsTotal) : smarterStats[3].value,
    }
  }, [apiCourses])

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
    if (el) el.scrollIntoView({ behavior: 'smooth' })
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
    <div className="min-h-screen bg-white text-brand-600 font-inter">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm shadow-slate-900/5'
            : 'bg-white/95 backdrop-blur-md border-b border-[#E9E7F5]'
        )}
      >
        <Container size="lg" className="py-2">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center group" aria-label="Learn2Earn">
              <motion.div
                className="relative"
                animate={{ y: [0, -1, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                <Image
                  src="/learn2earn-logo.png"
                  alt="Learn2Earn"
                  width={500}
                  height={158}
                  priority
                  className="h-9 sm:h-10 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => link.href.startsWith('#') ? scrollTo(link.href.slice(1)) : router.push(link.href)}
                    className={cn(
                      'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      'text-[#536078] hover:text-[#6D3DF5] hover:bg-[#F3EEFF]'
                    )}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden lg:flex items-center gap-3">
                <Link href="/login">
                <button className={cn(
                  'h-9 px-5 rounded-lg font-medium text-sm transition-all active:scale-[0.98]',
                  'bg-[#6D3DF5] hover:bg-[#5B2FE0] text-white shadow-sm'
                )}>
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button                 className="h-9 px-5 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2FE0] hover:to-[#2B66E0] text-white font-medium text-sm transition-all active:scale-[0.98]">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                'text-[#0F1B3D]'
              )}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </Container>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden bg-white border-t border-[#E9E7F5] overflow-hidden"
            >
              <div className="px-6 py-4 space-y-1">
                  {navLinks.map((link) => (
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
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-[#536078] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] font-medium transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-3 space-y-2">
                  <Link href="/login" className="block">
                    <button className="w-full h-10 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2FE0] hover:to-[#2B66E0] text-white font-medium text-sm transition-all">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup" className="block">
                    <button className="w-full h-10 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2FE0] hover:to-[#2B66E0] text-white font-medium text-sm transition-all">
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
      <section id="home" className="relative overflow-hidden bg-white font-inter">
        {/* Background: soft light glows + abstract shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-32 w-[640px] h-[640px] rounded-full bg-[#7C5CFC]/[0.10] blur-3xl" />
          <div className="absolute -bottom-44 -left-32 w-[560px] h-[560px] rounded-full bg-[#3B82F6]/[0.10] blur-3xl" />
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-[#2DD4BF]/[0.12] blur-3xl" />
          <div className="absolute top-24 right-[7%] w-20 h-20 rounded-2xl bg-violet-200/50 rotate-12" />
          <div className="absolute bottom-24 left-[4%] w-14 h-14 rounded-full border-2 border-blue-200/70" />
          <div className="absolute top-1/2 right-[15%] w-24 h-24 rounded-full bg-teal-100/60" />
        </div>

        <Container size="xl" className="relative pt-24 lg:pt-28 pb-14 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-14 items-center">
            {/* Left Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200/70 mb-6 shadow-sm shadow-slate-900/5"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                <span className="text-[11px] font-semibold tracking-[0.18em] text-violet-700 uppercase">All-in-One Learning Hub</span>
              </motion.div>

              {/* 3-line headline */}
              <motion.h1
                variants={fadeUp}
                className="text-[30px] sm:text-[42px] lg:text-[48px] font-extrabold leading-[1.12] tracking-tight mb-6"
              >
                <span className="text-[#0B1F3F]">Learn Skills.</span>
                <br />
                <span className="bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] bg-clip-text text-transparent">Build Projects.</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Start Earning.</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="text-[15px] sm:text-base text-slate-500 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0"
              >
                Learn practical skills, build real-world projects, grow your portfolio, and turn your knowledge into real earning opportunities.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 mb-9">
                <button
                  data-magnet
                  type="button"
                  onClick={() => scrollTo('courses')}
                  className="group w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] hover:from-[#5B21B6] hover:to-[#4338CA] text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Start Learning Now
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
                <button
                  data-magnet
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="group w-full sm:w-auto h-11 px-6 rounded-xl bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50/60 text-slate-700 font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                    <Play className="w-3 h-3 text-violet-600" fill="currentColor" />
                  </span>
                  Watch Demo
                </button>
              </motion.div>

              {/* Trust stats */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {[
                  { v: '10K+', l: 'Active Learners', icon: Users, c: 'text-[#6D28D9]', bg: 'bg-violet-50', ring: 'ring-violet-100', shadow: 'shadow-sm shadow-slate-900/5' },
                  { v: '500+', l: 'Courses', icon: BookOpen, c: 'text-[#2563EB]', bg: 'bg-blue-50', ring: 'ring-blue-100', shadow: 'shadow-sm shadow-slate-900/5' },
                  { v: '95%', l: 'Success Rate', icon: TrendingUp, c: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100', shadow: 'shadow-sm shadow-slate-900/5' },
                ].map((s) => (
                  <div
                    key={s.l}
                    className={cn('group flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-100 px-3.5 py-2.5 ring-1 ring-black/[0.02] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]', s.shadow)}
                  >
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center ring-1 shrink-0', s.bg, s.ring)}>
                      <s.icon className={cn('w-4 h-4', s.c)} strokeWidth={2.2} />
                    </div>
                    <div className="text-left">
                      <p className={cn('text-[20px] sm:text-[22px] font-extrabold leading-none tracking-tight tabular-nums', s.c)}>{s.v}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-1.5 whitespace-nowrap leading-none">{s.l}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Hero image */}
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.15 }}
              className="relative w-full max-w-[560px] mx-auto"
            >
              {/* Levitating framed card with spring 3D tilt */}
              <motion.div
                animate={prefersReducedMotion ? { y: 0, rotate: 0 } : { y: [0, -10, 0], rotate: [0, 0.6, 0] }}
                transition={prefersReducedMotion ? {} : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
                onMouseMove={handleHeroTilt}
                onMouseLeave={resetHeroTilt}
              >
                {/* Soft contact shadow (parallax with tilt) */}
                <div className="absolute left-1/2 -bottom-7 w-[80%] -translate-x-1/2" aria-hidden="true">
                  <motion.div
                    style={{ x: shadowShiftX }}
                    className="h-8 rounded-[50%] bg-slate-600/25 blur-xl"
                  />
                </div>

                {/* The frame - standard border design */}
                <motion.div
                  style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400, transformStyle: 'preserve-3d' }}
                  className="relative rounded-[2rem] border border-slate-200/80 bg-white/95 p-2.5 sm:p-3 shadow-sm shadow-slate-900/10 ring-1 ring-slate-900/5"
                >
                  {/* Top light accent */}
                  <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-b from-white/90 via-transparent to-transparent opacity-70 pointer-events-none" aria-hidden="true" />

                  <div className="relative rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50/40 p-4 sm:p-5">
                    {/* Cinematic live-photo drift on the image */}
                    <motion.div
                      animate={prefersReducedMotion ? { scale: 1, x: 0, y: 0 } : { scale: [1, 1.05, 1], x: [0, -9, 0], y: [0, -7, 0] }}
                      transition={prefersReducedMotion ? {} : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-auto"
                    >
                      <img
                        src="https://i.ibb.co.com/dHhB7k2/Chat-GPT-Image-Aug-13-2026-08-58-18-PM-removebg-preview.png"
                        alt="Student learning, building projects and earning illustration"
                        className="w-full h-auto object-contain"
                        loading="eager"
                      />
                    </motion.div>

                    {/* Glass glare (parallax with tilt) */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none rounded-[1.5rem] bg-gradient-to-br from-white/25 via-transparent to-white/10"
                      style={{ x: sheenShiftX, y: sheenShiftY }}
                      aria-hidden="true"
                    />
                  </div>
                </motion.div>
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
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
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
      <div className="relative overflow-hidden bg-[#0F1B3D] border-y border-white/10">
        <div className="flex whitespace-nowrap animate-marquee py-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-4 text-xs text-white/70 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18A878] animate-pulse" />
                Active Learners: <strong className="text-white font-semibold">4,209</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Code className="w-3 h-3 text-[#6D3DF5]" />
                Lines of Code Written Today: <strong className="text-white font-semibold">104K+</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3 h-3 text-[#60A5FA]" />
                Courses Completed Today: <strong className="text-white font-semibold">847</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-[#18A878]" />
                Badges Earned Today: <strong className="text-white font-semibold">312</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-[#60A5FA]" />
                Job Placements This Week: <strong className="text-white font-semibold">128</strong>
              </span>
            </div>
          ))}
        </div>
      </div>



      {/* Explore Popular Courses — Premium Smart Grid */}
      <section id="courses" className="py-16 lg:py-20 relative overflow-hidden">
        {/* Background student study image */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop&q=80"
            alt=""
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/95" />
        </div>

        <Container size="xl" className="relative z-10">
          {/* Hero banner — full-width image with text overlay on the image body */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="relative pb-8 lg:pb-10"
          >
            <div className="relative rounded-[24px] p-2 bg-gradient-to-r from-[#F3EEFF] via-white to-[#EEF4FF] border border-[#E9E7F5] shadow-sm overflow-hidden">
              <div className="relative overflow-hidden rounded-[18px] h-[150px] sm:h-[180px] lg:h-[200px] flex items-center justify-center">
                <Image
                  src="https://plain-apac-prod-public.komododecks.com/202609/11/for4HhQb0SsZ6Y8apglF/image.jpg"
                  alt="Students learning technology"
                  width={1920}
                  height={1280}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F1B3D]/90 via-[#0F1B3D]/45 to-[#0F1B3D]/20" />

                {/* Overlaid text — heading lives on the image body */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={staggerContainer}
                  className="relative z-10 text-center px-5 py-6 max-w-4xl"
                >
                  {/* Headline */}
                  <motion.h2 variants={fadeUp} className="text-[30px] lg:text-[40px] xl:text-[48px] font-extrabold tracking-tight leading-[1.08] text-white">
                    Courses Built For <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C4B5FD] to-[#93C5FD]">Careers</span>
                  </motion.h2>

                  {/* Subheading — two lines */}
                  <motion.p variants={fadeUp} className="text-[13px] lg:text-[15px] text-white/85 max-w-xl mx-auto leading-snug mt-3 line-clamp-2">
                    Master industry-relevant skills with hands-on projects, expert guidance and real career support.
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Toolbar: search + sort + view toggle */}
          <div className="rounded-[20px] bg-white border border-[#E9E7F5] shadow-sm p-3.5 flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B94A8]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-xl border border-[#E9E7F5] bg-[#F8FAFC] pl-9 pr-3 py-2.5 text-[12.5px] font-medium text-[#0F1B3D] placeholder:text-[#8B94A8] focus:outline-none focus:ring-2 focus:ring-[#6D3DF5]/20 focus:border-[#6D3DF5]/50 transition-all"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
                className={cn(
                  'w-full lg:w-auto inline-flex items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F1B3D] transition-all duration-200',
                  sortOpen ? 'border-[#6D3DF5]/50 ring-2 ring-[#6D3DF5]/15' : 'border-[#E9E7F5] hover:border-[#6D3DF5]/40'
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowDownWideNarrow className="w-4 h-4 text-[#6D3DF5]" />
                  {sortLabels[sortOrder]}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-[#8B94A8] transition-transform duration-300', sortOpen && 'rotate-180')} />
              </button>

              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} aria-hidden="true" />
                  <div className="absolute z-40 right-0 top-full mt-2 w-full min-w-[190px] rounded-xl bg-white border border-[#E9E7F5] py-1.5 shadow-lg shadow-slate-900/10">
                    {sortOptions.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => { setSortOrder(o.key); setSortOpen(false) }}
                        className={cn(
                          'w-[calc(100%-12px)] mx-1.5 flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-semibold text-left transition-colors',
                          sortOrder === o.key ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#536078] hover:bg-[#F8FAFC] hover:text-[#0F1B3D]'
                        )}
                      >
                        {o.label}
                        {sortOrder === o.key && <Check className="w-3.5 h-3.5 ml-auto text-[#6D3DF5]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Grid / List toggle */}
            <div className="inline-flex rounded-xl border border-[#E9E7F5] bg-[#F8FAFC] p-0.5 shrink-0 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                className={cn('w-9 h-8 rounded-[10px] flex items-center justify-center transition-all',
                  viewMode === 'grid' ? 'bg-white shadow-sm text-[#6D3DF5]' : 'text-[#8B94A8] hover:text-[#6D3DF5]')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                className={cn('w-9 h-8 rounded-[10px] flex items-center justify-center transition-all',
                  viewMode === 'list' ? 'bg-white shadow-sm text-[#6D3DF5]' : 'text-[#8B94A8] hover:text-[#6D3DF5]')}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Marketplace layout: sidebar filters + course grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-stretch">
            {/* ===== Sidebar (Filters) ===== */}
            <motion.aside variants={fadeUp} className="rounded-2xl bg-white border border-gray-100 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center shadow-md shadow-[#7C3AED]/25">
                    <SlidersHorizontal className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-[14px] font-bold text-gray-900 tracking-tight">Filter Courses</span>
                </span>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[11px] font-semibold text-[#7C3AED] hover:text-[#5B21B6] transition-colors"
                >
                  Reset All
                </button>
              </div>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Categories */}
              <div className="px-4 pt-3">
                <p className="text-[11px] font-bold text-gray-900 mb-2">Categories</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {categoryOptions.map((cat) => {
                    const isActive = activeCategory === cat.key
                    const label = sidebarCategoryLabels[cat.key] ?? cat.label
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => selectCategory(cat.key)}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 border',
                          isActive
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white border-[#7C3AED] shadow-md shadow-[#7C3AED]/25'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#7C3AED]/40 hover:text-[#7C3AED] hover:bg-[#F5F0FF]'
                        )}
                      >
                        <cat.icon className="w-3 h-3" strokeWidth={2} />
                        <span className="truncate">{label}</span>
                        <span className={cn(
                          'ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0',
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-200/60 text-gray-500'
                        )}>
                          {cat.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="h-px bg-gray-100 mx-4 my-3" />

              {/* Price Range */}
              <div className="px-4">
                <p className="text-[11px] font-bold text-gray-900 mb-2">Price Range</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {sidebarPriceOptions.map((opt) => {
                    const isActive = priceRange === opt.key
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => selectPriceRange(opt.key)}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 border text-center',
                          isActive
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white border-[#7C3AED] shadow-md shadow-[#7C3AED]/25'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#7C3AED]/40 hover:text-[#7C3AED] hover:bg-[#F5F0FF]'
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="h-px bg-gray-100 mx-4 my-3" />

              {/* Level */}
              <div className="px-4 pb-4">
                <p className="text-[11px] font-bold text-gray-900 mb-2">Level</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {levelOptions.map((opt) => {
                    const isActive = levelFilter === opt.key
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setLevelFilter(opt.key as any)}
                        className={cn(
                          'px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 border text-center',
                          isActive
                            ? 'bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white border-[#EA580C] shadow-md shadow-[#EA580C]/25'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#EA580C]/40 hover:text-[#EA580C] hover:bg-[#FFF7ED]'
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.aside>

            {/* ===== Main content ===== */}
            <div className="min-w-0 space-y-6 flex flex-col">

          {/* Course Grid — grid view */}
          {viewMode === 'grid' ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
            {paginatedCourses.map((course) => {
              const hasDiscount = Number(course.originalPrice) > Number(course.price) && Number(course.originalPrice) > 0
              const savings = hasDiscount ? Math.round((1 - course.price / course.originalPrice) * 100) : 0
              const courseSlug = course.slug || toSlug(course.title)
              const categoryKey = course.category === 'Development & Tech' ? 'tech' : course.category === 'AI & Data Science' ? 'tech' : course.category === 'Business & Marketing' ? 'business' : course.category === 'Personal Growth' ? 'business' : course.category === 'Career Development' || course.category === 'Language & Communication' ? 'business' : 'design'
              const categoryMeta = {
                design: { chip: 'bg-[#6D3DF5]', tint: 'from-[#F3EEFF]', accentText: 'text-[#6D3DF5]', borderHover: 'hover:border-[#6D3DF5]/40' },
                tech: { chip: 'bg-[#3478F6]', tint: 'from-[#EEF4FF]', accentText: 'text-[#3478F6]', borderHover: 'hover:border-[#3478F6]/40' },
                business: { chip: 'bg-[#18A878]', tint: 'from-[#ECFBF5]', accentText: 'text-[#18A878]', borderHover: 'hover:border-[#18A878]/40' },
              }[categoryKey]
              return (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: Math.min((course.id % 20) * 0.04, 0.3) }}
                className="group/card cursor-pointer"
                onClick={() => router.push(`/course/${courseSlug}`)}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn(
                  'h-full rounded-2xl border bg-white flex flex-col overflow-hidden transition-all duration-300',
                  'border-[#E5E7EB] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1',
                  categoryMeta.borderHover
                )}>
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-md', categoryMeta.chip)}>
                        {course.category === 'Design & Media' ? 'Design' : course.category === 'Development & Tech' || course.category === 'AI & Data Science' ? 'Tech' : course.category === 'Career Development' ? 'Career' : course.category === 'Language & Communication' ? 'Communication' : 'Business'}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-[11px] font-bold text-[#0F1B3D] flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                        {course.rating}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="text-[14px] font-bold text-[#0F1B3D] line-clamp-2 leading-snug mb-2 group-hover/card:text-[#6D3DF5] transition-colors">
                      {course.title}
                    </h3>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-600">
                        {course.instructor.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-[12px] font-medium text-[#536078]">{course.instructor}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.students >= 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.lessons} lessons
                      </span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-lg font-extrabold text-[#0F1B3D]">৳{course.price.toLocaleString()}</span>
                        {hasDiscount && (
                          <>
                            <span className="text-[11px] text-gray-400 line-through ml-1.5">৳{course.originalPrice.toLocaleString()}</span>
                            <span className={cn('ml-1.5 text-[10px] font-bold', categoryMeta.accentText)}>Save {savings}%</span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          savePendingEnrollment(course)
                          saveCourseSnapshot(course)
                          router.push(`/payment/${course.id}`)
                        }}
                        className="px-4 py-2 rounded-xl bg-[#0F1B3D] hover:bg-[#1E293B] text-white text-[12px] font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-95"
                      >
                        Enroll <ArrowRight className="w-3.5 h-3.5" />
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
            <div className="grid grid-cols-1 gap-4 lg:gap-5">
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
                    <div className={cn('rounded-2xl border bg-white flex flex-col sm:flex-row overflow-hidden transition-all duration-300 ring-1 ring-black/[0.02] hover:-translate-y-1', 'border-[#E9E7F5] shadow-sm hover:shadow-lg', categoryMeta.borderHover)}>
                      {/* Thumb */}
                      <div className="relative sm:w-60 lg:w-64 shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-slate-100">
                        <Image src={course.image} alt={course.title} fill className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110" />
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
                      <div className="flex-1 min-w-0 p-5 flex flex-col gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn('px-2 py-0.5 rounded-full border text-[9px] font-semibold', level.cls)}>{level.label}</span>
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white', categoryMeta.chip)}>
                            <categoryMeta.icon className="w-2.5 h-2.5" /> {course.category === 'Design & Media' ? 'Design' : course.category === 'Development & Tech' || course.category === 'AI & Data Science' ? 'Tech' : course.category === 'Career Development' ? 'Career' : 'Business'}
                          </span>
                          <span className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-bold text-[#F59E0B]">
                            <Star className="w-3 h-3 fill-[#F59E0B]" /> {course.rating}
                            <span className="text-[10px] font-medium text-[#536078]">({reviewCount})</span>
                          </span>
                        </div>

                        <h3 className="text-[15px] font-extrabold text-[#0F1B3D] line-clamp-1 transition-colors group-hover/card:text-[#6D3DF5]">{course.title}</h3>
                        <p className="text-[12px] text-[#536078] line-clamp-1">{skills.join(' · ')}{course.feature ? ` · ${course.feature}` : ''}</p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-[#536078]">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={cn('w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-[7px] font-bold text-white ring-1 ring-[#E9E7F5]', categoryMeta.avatar)}>{initials}</span>
                            <span className="truncate">{course.instructor}</span>
                            <BadgeCheck className="w-3 h-3 text-[#3478F6]" />
                          </span>
                          <span className="w-px h-3.5 bg-[#E9E7F5]" />
                          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3 text-[#3478F6]" />{course.students >= 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students}</span>
                          <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3 text-[#6D3DF5]" />{course.lessons} lessons</span>
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-[#18A878]" />{course.duration}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E9E7F5]">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[19px] font-extrabold text-[#6D3DF5]">৳{course.price.toLocaleString()}</span>
                            {hasDiscount && (
                              <>
                                <span className="text-[12px] font-semibold text-[#536078] line-through">৳{course.originalPrice.toLocaleString()}</span>
                                <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold', categoryMeta.accentText)}><TrendingUp className="w-2.5 h-2.5" />Save {savings}%</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[12px] font-bold text-[#6D3DF5] underline-offset-4 group-hover/card:underline cursor-pointer">Read More</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); savePendingEnrollment(course); saveCourseSnapshot(course); router.push(`/payment/${course.id}`) }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:shadow-md hover:brightness-110 active:scale-95 transition-all duration-200"
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F3EEFF] border border-[#6D3DF5]/15 shadow-chip mb-4">
                <FilterX className="w-7 h-7 text-[#6D3DF5]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1B3D]">No courses match your filters</h3>
              <p className="text-sm text-[#536078] mt-1.5 mb-5">Try lowering your price range or switching categories.</p>
              <button
                type="button"
                onClick={() => { resetAllFilters(); setCoursePage(1) }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[12.5px] font-bold shadow-sm transition-all duration-300 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </motion.div>
          )}

            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button
                type="button"
                onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
                disabled={effectivePage === 1}
                aria-label="Previous page"
                className={cn('w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95',
                  effectivePage === 1 ? 'border-[#E9E7F5] bg-[#F8FAFC] text-[#C3BDDC] cursor-not-allowed' : 'border-[#E9E7F5] bg-white text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5]')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCoursePage(p)}
                  aria-current={effectivePage === p ? 'page' : undefined}
                  className={cn('min-w-9 h-9 px-2 rounded-xl border text-[12.5px] font-bold tabular-nums transition-all active:scale-95',
                    effectivePage === p ? 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white border-transparent shadow-sm' : 'border-[#E9E7F5] bg-white text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5]')}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCoursePage((p) => Math.min(totalPages, p + 1))}
                disabled={effectivePage === totalPages}
                aria-label="Next page"
                className={cn('w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95',
                  effectivePage === totalPages ? 'border-[#E9E7F5] bg-[#F8FAFC] text-[#C3BDDC] cursor-not-allowed' : 'border-[#E9E7F5] bg-white text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5]')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-[11px] font-medium text-[#536078] text-center mt-2.5">
            Showing {paginatedCourses.length} of {filteredAndSortedCourses.length} courses
          </p>

        </Container>
      </section>

      {/* SECTION: Smarter Way to Learn Tech */}
      <section id="how-it-works" className="relative px-5 py-20 lg:py-24 overflow-hidden">
        {/* Soft multi-tone gradient background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F3EEFF] via-white to-[#ECFBF5] opacity-80" />
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#F3EEFF] blur-3xl opacity-70" />
          <div className="absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-[#EEF4FF] blur-3xl opacity-60" />
          <div className="absolute -bottom-32 left-1/3 w-[420px] h-[420px] rounded-full bg-[#ECFBF5] blur-3xl opacity-70" />
        </div>

        <Container size="xl" className="relative">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center max-w-[680px] mx-auto mb-12"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#E9E7F5] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#6D3DF5]" strokeWidth={2.2} />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]">Smarter Learning</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[28px] lg:text-[38px] font-extrabold text-[#0F1B3D] tracking-tight leading-tight mt-4 mb-3">
              <span className="relative inline-block text-[#0F1B3D]">
                The Smarter Way
                <svg className="absolute left-0 -bottom-1.5 w-full h-2.5" viewBox="0 0 140 10" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 7 C 40 2, 100 2, 138 6" stroke="#6D3DF5" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </span>{' '}
              to Learn Tech
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-[#536078] leading-relaxed mx-auto line-clamp-2" style={{ maxWidth: 600 }}>
              Everything you need to master modern tech skills in one platform — guided learning paths, hands-on projects and expert mentorship.
            </motion.p>
          </motion.div>

          {/* Two-column grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center"
          >
            {/* Left: Video card */}
            <motion.div variants={fadeUp} className="relative">
              <div className="relative rounded-[20px] overflow-hidden bg-black shadow-sm ring-1 ring-slate-900/10">
                {demoVideoPlaying ? (
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/bM8XmugoQuI?autoplay=1&rel=0"
                      title="Course demo video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc"
                      alt="Student working on a laptop"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        aria-label="Play video"
                        onClick={() => setDemoVideoPlaying(true)}
                        className="group flex items-center justify-center w-16 h-16 rounded-full bg-[#6D3DF5] ring-4 ring-white/25 group-hover:bg-[#5B2FE0] group-hover:scale-110 transition-all duration-300"
                      >
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </button>
                    </div>

                    {/* Bottom overlay bar */}
                    <div className="absolute bottom-0 inset-x-0">
                      <div className="bg-[#0F1B3D]/85 backdrop-blur-sm border-t border-white/10 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-md bg-[#6D3DF5]/25 flex items-center justify-center shrink-0">
                            <Video className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          </span>
                          <p className="text-[13px] font-bold text-white leading-tight truncate">The Smarter Way to Learn Tech — Course Introduction</p>
                        </div>
                        <span className="shrink-0 ml-3 text-[11px] font-medium text-white/70 tabular-nums">12:45</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right: stacked feature cards */}
            <div className="space-y-5">
              {[
                { icon: BookOpen, bg: 'bg-[#6D3DF5]', title: 'Structured Learning Paths', desc: 'Follow curated, step-by-step roadmaps designed by industry experts.' },
                { icon: Code, bg: 'bg-[#3478F6]', title: 'Hands-on Projects', desc: 'Build real products and portfolios with project-based, practical learning.' },
                { icon: MessageCircle, bg: 'bg-[#18A878]', title: 'Expert Mentorship', desc: 'Get 1-on-1 guidance from verified mentors whenever you need it.' },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="rounded-2xl bg-white border border-[#E9E7F5] p-5 shadow-sm hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('w-[50px] h-[50px] rounded-2xl flex items-center justify-center shrink-0', f.bg)}>
                      <f.icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-extrabold text-[#0F1B3D] leading-tight">{f.title}</p>
                      <p className="text-[12.5px] text-[#536078] leading-relaxed mt-1">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature tags row */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="flex flex-wrap items-center justify-center gap-3 mt-12"
          >
            {[
              { icon: Radio, color: 'text-[#6D3DF5]', border: 'border-[#6D3DF5]/30', label: 'Interactive Live Classes' },
              { icon: MessageSquare, color: 'text-[#3478F6]', border: 'border-[#3478F6]/30', label: 'Instant Feedback System' },
              { icon: UserCheck, color: 'text-[#18A878]', border: 'border-[#18A878]/30', label: 'Career Mentorship' },
              { icon: ShieldCheck, color: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30', label: 'Job-Ready Certifications' },
              { icon: Smartphone, color: 'text-[#6D3DF5]', border: 'border-[#6D3DF5]/30', label: 'Cross-Device Sync' },
            ].map((t, i) => (
              <motion.span
                key={t.label}
                variants={fadeUp}
                className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm transition-transform duration-300 hover:-translate-y-0.5', t.border)}
              >
                <t.icon className={cn('w-4 h-4', t.color)} strokeWidth={2.2} />
                <span className="text-[12px] font-bold text-[#0F1B3D] whitespace-nowrap">{t.label}</span>
              </motion.span>
            ))}
          </motion.div>

          {/* Bottom stats bar */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mt-10 bg-white border border-[#E9E7F5] rounded-2xl px-6 py-7 lg:py-8 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4">
              {[
                { icon: GraduationCap, tint: 'bg-[#F3EEFF]', color: 'text-[#6D3DF5]', label: 'Expert Instructors' },
                { icon: Play, tint: 'bg-[#EEF4FF]', color: 'text-[#3478F6]', label: 'Video Lessons' },
                { icon: GitFork, tint: 'bg-[#ECFBF5]', color: 'text-[#18A878]', label: 'Learning Paths' },
                { icon: Users, tint: 'bg-[#FEF5E7]', color: 'text-[#F59E0B]', label: 'Active Learners' },
              ].map((s, i) => (
                <motion.div key={s.label} className={cn('flex items-center gap-4 rounded-[14px] px-4 lg:px-5 py-5 lg:justify-center', s.tint)}>
                  <motion.div
                    animate={prefersReducedMotion ? {} : [
                      { scale: [1, 1.15, 1] },
                      { y: [0, -5, 0] },
                      { rotate: [-8, 8, -8] },
                      { x: [0, 3, -3, 0] },
                    ][i]}
                    transition={prefersReducedMotion ? {} : { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <s.icon className={cn('w-5 h-5', s.color)} strokeWidth={2.2} />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className={cn('text-[24px] leading-none font-extrabold tabular-nums', s.color)}>
                      {[dynamicStats.instructors, dynamicStats.videoLessons, dynamicStats.learningPaths, dynamicStats.activeLearners][i]}
                    </span>
                    <span className="text-[12px] font-semibold text-[#536078] mt-1.5 whitespace-nowrap">{s.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION: Expert Instructors - Meet Our Expert Instructors */}
      <section id="instructors" className="relative px-5 py-20 lg:py-24 bg-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(to_right,rgba(15,27,61,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,27,61,0.035)_1px,transparent_1px)] [background-size:46px_46px]" />
        {/* Soft atmospheric glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#F3EEFF]/70 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-28 w-80 h-80 rounded-full bg-[#EEF4FF]/70 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-[#ECFBF5]/70 blur-3xl pointer-events-none" />

        <Container size="xl" className="relative">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center max-w-[680px] mx-auto mb-12"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#F3EEFF] via-white to-[#EEF4FF] border border-[#6D3DF5]/20 shadow-chip mb-4">
                <GraduationCap className="w-3.5 h-3.5 text-[#6D3DF5]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6D3DF5]">Our Instructors</span>
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[26px] lg:text-[34px] font-extrabold text-[#0F1B3D] tracking-tight leading-tight">
              Meet Our Expert Instructors
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[13.5px] text-[#536078] leading-relaxed mx-auto mt-3 line-clamp-2" style={{ maxWidth: 480 }}>
              Learn directly from verified industry experts with real-world experience and proven strategies to accelerate your growth.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#6D3DF5]/20 px-4 py-2 shadow-chip">
                <BookOpen className="w-4 h-4 text-[#6D3DF5]" />
                <span className="text-[12.5px] font-extrabold text-[#0F1B3D]">37+ <span className="text-[#6D3DF5]">Expert Courses</span></span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#18A878]/20 px-4 py-2 shadow-chip">
                <Users className="w-4 h-4 text-[#18A878]" />
                <span className="text-[12.5px] font-extrabold text-[#0F1B3D]">37+ <span className="text-[#18A878]">Expert Mentors</span></span>
              </span>
            </motion.div>
          </motion.div>

          {/* Instructor cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {expertInstructors.slice(expertPage * 4, expertPage * 4 + 4).map((expert) => (
              <div
                key={expert.id}
                className="group relative flex flex-col rounded-2xl bg-white border border-[#E9E7F5] p-4 ring-1 ring-black/[0.02]  transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Photo with soft glow */}
                <div className="relative">
                  <div className={cn('absolute -top-4 -left-4 w-28 h-28 rounded-3xl blur-2xl opacity-70 pointer-events-none', expert.glow)} />
                  <div className="relative w-full aspect-[4/4] rounded-2xl overflow-hidden">
                    <Image src={expert.image} alt={expert.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  {/* Rating badge top-right */}
                  <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="text-[12px] font-extrabold text-[#0F1B3D] leading-none">{expert.rating}</span>
                  </div>
                  {/* Social badges left edge (revealed on hover) */}
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 translate-x-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    {[
                      { icon: Linkedin, label: 'LinkedIn', href: `https://www.linkedin.com/in/${expert.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
                      { icon: Github, label: 'GitHub', href: `https://github.com/${expert.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
                      { icon: Globe, label: 'Website', href: `https://${expert.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.dev` },
                    ].map(({ icon: Icon, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-8 h-8 rounded-full bg-white text-[#0F1B3D] shadow-md flex items-center justify-center transition-all duration-300 hover:text-white hover:bg-[#6D3DF5] hover:-translate-y-0.5"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Name / title */}
                <div className="mt-4 text-center">
                  <p className="text-[15px] font-extrabold text-[#0F1B3D] leading-tight">{expert.name}</p>
                  <p className={cn('text-[12px] font-bold mt-0.5', expert.accent)}>{expert.title}</p>
                  <p className="text-[12px] text-[#536078] leading-relaxed mt-2 line-clamp-2">{expert.bio}</p>
                </div>

                {/* Stats row */}
                <div className="mt-4 pt-4 border-t border-[#E9E7F5] flex items-center justify-center gap-6 text-[11px] text-[#536078]">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#6D3DF5]" />
                    {expert.courses}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#18A878]" />
                    {expert.students}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination + CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mt-10 flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-6">
              <button
                type="button"
                aria-label="Previous instructors"
                onClick={() => setExpertPage((p) => (p - 1 + expertTotalPages) % expertTotalPages)}
                className="w-10 h-10 rounded-full border border-[#E9E7F5] bg-white text-[#0F1B3D] shadow-chip flex items-center justify-center transition-all duration-300 hover:bg-[#F3EEFF] hover:text-[#6D3DF5] "
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: expertTotalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Instructor page ${i + 1}`}
                    onClick={() => setExpertPage(i)}
                    className={cn('h-2 rounded-full transition-all', expertPage === i ? 'w-7 bg-[#6D3DF5]' : 'w-2 bg-[#D9D5E8]')}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Next instructors"
                onClick={() => setExpertPage((p) => (p + 1) % expertTotalPages)}
                className="w-10 h-10 rounded-full border border-[#E9E7F5] bg-white text-[#0F1B3D] shadow-chip flex items-center justify-center transition-all duration-300 hover:bg-[#F3EEFF] hover:text-[#6D3DF5] "
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 3: Choose Your Learning Plan — Pricing */}
      <section id="pricing" className="relative px-5 py-20 lg:py-24 bg-white overflow-hidden">
        <Container size="xl" className="relative">
          {/* Soft background glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#F3EEFF] blur-3xl opacity-70 pointer-events-none" />
          <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-[#EEF4FF] blur-3xl opacity-70 pointer-events-none" />
          <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[#ECFBF5] blur-3xl opacity-70 pointer-events-none" />

          {/* Header */}
          <div className="text-center max-w-[650px] mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ECFBF5] via-white to-[#EEF4FF] border border-[#18A878]/20 mb-4 shadow-sm">
              <span className="text-xs">💎</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#18A878]">Flexible Plans</span>
            </div>
            <h2 className="text-[26px] lg:text-[34px] font-extrabold text-[#0F1B3D] tracking-tight leading-tight mb-2">
              Choose Your Learning Plan
            </h2>
            <h3 className="text-[20px] lg:text-[24px] font-semibold text-[#0F1B3D] mb-3 capitalize">
              Start Free, Upgrade to Unlock Earning Power
            </h3>
            <p className="text-sm text-[#536078] leading-relaxed mx-auto max-w-[640px] line-clamp-2">
              Whether you're exploring or ready to commit, we have a plan that fits. Higher tiers unlock faster access to freelance gigs, job placements, and higher referral commissions.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#F3EEFF] border border-[#6D3DF5]/15 mt-7 shadow-chip">
              <button
                onClick={() => setBilling('monthly')}
                className={cn(
                  'px-5 py-2 rounded-full text-[12px] font-bold transition-all duration-200',
                  billing === 'monthly'
                    ? 'bg-[#6D3DF5] text-white shadow-sm'
                    : 'text-[#536078] hover:text-[#0F1B3D]'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={cn(
                  'px-5 py-2 rounded-full text-[12px] font-bold transition-all duration-200 flex items-center gap-1.5',
                  billing === 'annual'
                    ? 'bg-[#6D3DF5] text-white shadow-sm'
                    : 'text-[#536078] hover:text-[#0F1B3D]'
                )}
              >
                Yearly
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[9px] font-extrabold',
                  billing === 'annual' ? 'bg-white/20 text-white' : 'bg-[#ECFBF5] text-[#18A878]'
                )}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mt-10 max-w-[1100px] mx-auto">
            {/* — Free Plan — */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="order-2 md:order-1 relative bg-white rounded-[24px] border border-[#E9E7F5] p-7 flex flex-col text-left h-full ring-1 ring-black/[0.02]  transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#6D3DF5]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F1B3D] leading-tight">Free</h3>
                  <p className="text-[11px] text-[#536078]">Explore and get started</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-extrabold text-[#0F1B3D] tracking-tight">৳0</span>
                <span className="text-[13px] text-[#536078] font-medium">/ forever</span>
              </div>
              <div className="my-1 border-t border-[#E9E7F5]" />
              <ul className="space-y-2.5 my-6 flex-1">
                {['Access to 3 free courses', 'Community forum access', 'Basic certificate', 'Limited freelance marketplace browsing'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#536078] shrink-0 mt-0.5" />
                    <span className="text-[12.5px] text-[#536078] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => selectPlan('free')} className="w-full py-3 rounded-xl border-2 border-[#6D3DF5] bg-white text-[#6D3DF5] text-[13px] font-bold transition-all duration-200 hover:bg-[#6D3DF5] hover:text-white  active:scale-[0.98]">
                Start Free
              </button>
            </motion.div>

            {/* — Pro Plan (Most Popular) — */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="order-1 md:order-2 relative bg-white rounded-[24px] border-2 border-[#6D3DF5] p-7 flex flex-col text-left h-full shadow-sm shadow-slate-900/5 md:scale-[1.03] transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="absolute top-0 right-0 px-3.5 py-1.5 rounded-tr-[24px] rounded-bl-[20px] bg-[#6D3DF5] text-white text-[9px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1">
                <Award className="w-3 h-3" /> Most Popular
              </div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#6D3DF5] flex items-center justify-center shadow-sm">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F1B3D] leading-tight">Pro</h3>
                  <p className="text-[11px] text-[#536078]">For serious learners ready to earn</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-[#0F1B3D] tracking-tight">{billing === 'annual' ? '৳792' : '৳990'}</span>
                <span className="text-[13px] text-[#536078] font-medium">/ month</span>
              </div>
              {billing === 'annual' && (
                <p className="text-[11px] text-[#18A878] font-semibold">billed ৳9,504/yr · save ৳2,376</p>
              )}
              <div className="my-4 border-t border-[#E9E7F5]" />
              <ul className="space-y-2.5 my-6 flex-1">
                {['Full access to all 25+ courses', 'Verified certificates', 'Freelance marketplace access', '15% referral commission', 'Priority job placement support', 'Weekly skill challenges entry'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#18A878] shrink-0 mt-0.5" />
                    <span className="text-[12.5px] text-[#536078] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => selectPlan('pro')} className="w-full py-3 rounded-xl bg-[#6D3DF5] text-white text-[13px] font-bold shadow-sm transition-all duration-200 hover:bg-[#6D3DF5]/90 active:scale-[0.98]">
                Get Pro
              </button>
            </motion.div>

            {/* — Premium Plan — */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="order-3 relative bg-gradient-to-b from-[#F3EEFF]/60 to-white rounded-[24px] border border-[#E9E7F5] p-7 flex flex-col text-left h-full ring-1 ring-black/[0.02]  transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3478F6] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F1B3D] leading-tight">Premium</h3>
                  <p className="text-[11px] text-[#536078]">Maximum earning potential</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-[#0F1B3D] tracking-tight">{billing === 'annual' ? '৳1,592' : '৳1,990'}</span>
                <span className="text-[13px] text-[#536078] font-medium">/ month</span>
              </div>
              {billing === 'annual' && (
                <p className="text-[11px] text-[#18A878] font-semibold">billed ৳19,104/yr · save ৳4,776</p>
              )}
              <div className="my-4 border-t border-[#E9E7F5]" />
              <ul className="space-y-2.5 my-6 flex-1">
                {['Everything in Pro', '1-on-1 mentor sessions', '25% referral commission', 'Guaranteed job interview assistance', 'Early access to new courses', 'Dedicated earnings manager'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#3478F6] shrink-0 mt-0.5" />
                    <span className="text-[12.5px] text-[#536078] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => selectPlan('premium')} className="w-full py-3 rounded-xl bg-[#3478F6] text-white text-[13px] font-bold shadow-sm transition-all duration-200 hover:bg-[#3478F6]/90 active:scale-[0.98]">
                Get Premium
              </button>
            </motion.div>
          </div>

        </Container>
      </section>


{/* SECTION: Turn Your Skills Into Income */}
      <section id="earn-with-your-skills" className="relative px-5 py-20 lg:py-24 overflow-hidden">
        {/* Soft multi-tone gradient background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F3EEFF] via-white to-[#FEF3E7] opacity-80" />
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#F3EEFF] blur-3xl opacity-70" />
          <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] rounded-full bg-[#EEF4FF] blur-3xl opacity-60" />
          <div className="absolute -bottom-32 left-1/3 w-[440px] h-[440px] rounded-full bg-[#ECFBF5] blur-3xl opacity-70" />
        </div>

        <Container size="xl" className="relative">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center max-w-[700px] mx-auto mb-12"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E9E7F5] mb-5 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#6D3DF5]">Career Ready</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[28px] lg:text-[38px] font-extrabold text-[#0F1B3D] tracking-tight leading-tight break-words">
              Turn Your Skills <span className="relative inline-block text-[#6D3DF5]">Into Income
              <svg className="absolute left-0 -bottom-1.5 w-full h-3" viewBox="0 0 150 10" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M4 7 C 20 3, 32 3, 48 6 C 62 9, 74 3, 88 5 C 102 7, 114 4, 146 6" stroke="#6D3DF5" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-[#536078] leading-relaxed mx-auto mt-4" style={{ maxWidth: 650, overflowWrap: 'anywhere' }}>
              From your first project to your first paycheck, learn the skills that turn your talent into real, sustainable income.
            </motion.p>
          </motion.div>

          {/* Two-column layout */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch"
          >
            {/* Left: Photo card */}
            <motion.div variants={fadeUp} className="relative rounded-[20px] overflow-hidden bg-white border border-[#E9E7F5] shadow-sm h-full">
              <div className="relative w-full h-full min-h-[320px]">
                <img
                  src="https://plain-apac-prod-public.komododecks.com/202608/28/6OEjH5EtzgdMbN5MTnmf/image.jpg"
                  alt="Freelancer working on a laptop in a warm home office"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                {/* Floating earnings badge */}
                <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-[#6D3DF5] shadow-sm flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" strokeWidth={2.4} />
                </div>
              </div>
            </motion.div>

            {/* Right: Feature cards */}
            <div className="flex flex-col justify-center gap-5 h-full">
              {[
                {
                  icon: FolderOpen,
                  tint: 'bg-[#F3EEFF]',
                  color: 'text-[#6D3DF5]',
                  title: 'Job-Ready Projects',
                  desc: 'Build a portfolio of real, industry-aligned projects that prove your skills to employers and clients.',
                },
                {
                  icon: UserCheck,
                  tint: 'bg-[#EEF4FF]',
                  color: 'text-[#3478F6]',
                  title: 'Career Mentorship',
                  desc: 'Get 1-on-1 guidance from experts who help you plan, position, and accelerate your career path.',
                },
                {
                  icon: Briefcase,
                  tint: 'bg-[#ECFBF5]',
                  color: 'text-[#18A878]',
                  title: 'Freelance & Job Support',
                  desc: 'Land your first paid gig or full-time role with resume help, referrals, and hands-on coaching.',
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="flex items-center gap-4 rounded-[16px] bg-white border border-[#E9E7F5] px-5 py-4 shadow-sm"
                >
                  <div className={cn('w-[50px] h-[50px] rounded-full flex items-center justify-center shrink-0', f.tint)}>
                    <f.icon className={cn('w-5.5 h-5.5', f.color)} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-extrabold text-[#0F1B3D] leading-tight">{f.title}</p>
                    <p className="text-[12px] text-[#536078] leading-relaxed mt-1">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature tags row */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="mt-12"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: FolderOpen, color: 'text-[#6D3DF5]', border: 'border-[#6D3DF5]/30', label: 'Portfolio Builder' },
                { icon: MessageSquare, color: 'text-[#3478F6]', border: 'border-[#3478F6]/30', label: 'Interview Prep' },
                { icon: Laptop, color: 'text-[#18A878]', border: 'border-[#18A878]/30', label: 'Freelance Marketplace' },
                { icon: TrendingUp, color: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30', label: 'Salary Insights' },
                { icon: Users, color: 'text-[#6D3DF5]', border: 'border-[#6D3DF5]/30', label: 'Alumni Network' },
              ].map((t) => (
                <motion.div key={t.label} variants={fadeUp}>
                  <span className={cn('inline-flex items-center gap-2 rounded-full bg-white border px-4 py-2 shadow-sm', t.border)}>
                    <t.icon className={cn('w-4 h-4', t.color)} strokeWidth={2.2} />
                    <span className="text-[12.5px] font-extrabold text-[#0F1B3D] leading-none">{t.label}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom stats bar */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="mt-10"
          >
            <div className="bg-white border border-[#E9E7F5] rounded-2xl px-6 py-7 lg:py-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4">
                {[
                  { icon: TrendingUp, tint: 'bg-[#F3EEFF]', color: 'text-[#6D3DF5]', value: '85%', label: 'Job Placement' },
                  { icon: DollarSign, tint: 'bg-[#EEF4FF]', color: 'text-[#3478F6]', value: '$72K', label: 'Avg Starting Salary' },
                  { icon: Users, tint: 'bg-[#ECFBF5]', color: 'text-[#18A878]', value: '1.2K+', label: 'Hired Alumni' },
                  { icon: Building, tint: 'bg-[#FEF5E7]', color: 'text-[#F59E0B]', value: '500+', label: 'Partner Companies' },
                ].map((s, i) => (
                  <motion.div key={s.label} className={cn('flex items-center gap-4 rounded-[14px] px-4 lg:px-5 py-5 lg:justify-center', s.tint)}>
                    <motion.div
                      animate={prefersReducedMotion ? {} : [
                        { y: [0, -6, 0], scale: [1, 1.08, 1] },
                        { rotate: [-10, 10, -10] },
                        { scale: [1, 1.16, 1] },
                        { x: [0, 5, -5, 0] },
                      ][i]}
                      transition={prefersReducedMotion ? {} : { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                      className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <s.icon className={cn('w-5 h-5', s.color)} strokeWidth={2.2} />
                    </motion.div>
                    <div className="flex flex-col">
                      <span className={cn('text-[24px] leading-none font-extrabold tabular-nums', s.color)}>{s.value}</span>
                      <span className="text-[12px] font-semibold text-[#536078] mt-1.5 whitespace-nowrap">{s.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
</motion.div>
        </Container>
      </section>

{/* SECTION: What Our Learners Say */}
      <section id="testimonials" className="relative px-5 py-20 lg:py-24 overflow-hidden">
        {/* Soft tinted background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#EEF4FF] via-white to-[#F3EEFF]" />
        {/* Soft multi-tone gradient blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -left-24 w-[420px] h-[420px] rounded-full bg-[#F3EEFF] blur-3xl opacity-70" />
          <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-[#EEF4FF] blur-3xl opacity-70" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[460px] h-[320px] rounded-full bg-[#ECFBF5] blur-3xl opacity-70" />
        </div>

        <Container size="xl" className="relative">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center max-w-[720px] mx-auto"
          >
            <motion.h2 variants={fadeUp} className="text-[28px] lg:text-[38px] font-extrabold text-[#0F1B3D] tracking-tight leading-tight">
              What Our Learners Say
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-sm text-[#536078] leading-relaxed mx-auto">
              Real voices from learners who transformed their skills.
            </motion.p>
          </motion.div>

          {/* Three-column row: side testimonial cards + center video */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr_1fr] gap-6 lg:gap-8 items-stretch max-w-[1150px] mx-auto"
          >
            {/* Left: text testimonial */}
            <motion.div variants={fadeUp} className="relative flex flex-col h-full rounded-2xl bg-white border border-[#E9E7F5] p-6 lg:p-7 shadow-sm">
              <Quote className="w-9 h-9 text-[#6D3DF5] fill-[#6D3DF5]/20" />
              <p className="mt-4 text-[13px] text-[#536078] leading-relaxed">{testimonialList[0]?.quote}</p>
              <div className="mt-6 pt-5 border-t border-[#E9E7F5] flex-1 flex flex-col justify-end">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#F3EEFF] shrink-0">
                    <Image src={testimonialList[0]?.image} alt={testimonialList[0]?.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0F1B3D] leading-tight truncate">{testimonialList[0]?.name}</p>
                    <p className="text-[11px] text-[#536078] leading-tight truncate">{testimonialList[0]?.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D3DF5]" />
                  <span className="h-px w-10 bg-[#6D3DF5]" />
                </div>
              </div>
            </motion.div>

            {/* Center: video testimonial */}
            <motion.div variants={fadeUp} className="relative h-full rounded-[20px] overflow-hidden border border-[#E9E7F5] shadow-sm lg:shadow-lg bg-black">
              <div className="relative w-full h-full min-h-[320px]">
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
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Young_woman_takes_selfie_at_home_workspace_with_breakfast_and_laptop_in_the_morning.jpg/960px-Young_woman_takes_selfie_at_home_workspace_with_breakfast_and_laptop_in_the_morning.jpg"
                      alt="Young woman smiling at her home workspace with a laptop"
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-black/10 pointer-events-none" />

                    {/* Centered play button */}
                    <button type="button" aria-label="Play testimonial video" onClick={() => setTestimonialVideoPlaying(true)} className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#6D3DF5] shadow-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </button>
                  </>
                )}

                {/* Bottom control bar */}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-[2px] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button type="button" aria-label="Pause" className="text-white shrink-0">
                      <Pause className="w-4 h-4 fill-white" />
                    </button>
                    <div className="relative flex-1 h-1.5 rounded-full bg-white/25">
                      <div className="absolute inset-y-0 left-0 w-[33%] rounded-full bg-[#6D3DF5]" />
                      <span className="absolute top-1/2 left-[33%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm" />
                    </div>
                    <span className="text-[10.5px] text-white tabular-nums whitespace-nowrap shrink-0">02:15 / 05:30</span>
                    <button type="button" aria-label="Volume" className="text-white shrink-0">
                      <Volume className="w-4 h-4" />
                    </button>
                    <button type="button" aria-label="Fullscreen" className="text-white shrink-0">
                      <Maximize className="w-4 h-4" />
                    </button>
                    <span className="rounded-[5px] bg-[#6D3DF5] px-1.5 py-0.5 text-[9.5px] font-bold text-white leading-none shrink-0">CC</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: text testimonial */}
            <motion.div variants={fadeUp} className="relative flex flex-col h-full rounded-2xl bg-white border border-[#E9E7F5] p-6 lg:p-7 shadow-sm">
              <Quote className="w-9 h-9 text-[#3478F6] fill-[#3478F6]/20" />
              <p className="mt-4 text-[13px] text-[#536078] leading-relaxed">{testimonialList[1]?.quote}</p>
              <div className="mt-6 pt-5 border-t border-[#E9E7F5] flex-1 flex flex-col justify-end">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#EEF4FF] shrink-0">
                    <Image src={testimonialList[1]?.image} alt={testimonialList[1]?.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0F1B3D] leading-tight truncate">{testimonialList[1]?.name}</p>
                    <p className="text-[11px] text-[#536078] leading-tight truncate">{testimonialList[1]?.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3478F6]" />
                  <span className="h-px w-10 bg-[#3478F6]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>
      {/* CTA + Footer */}
      <footer className="relative bg-[#0B1020] border-t border-white/5 overflow-hidden z-20">
        {/* branded top accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#6D3DF5] via-[#3478F6] to-[#18A878]" />
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[#6D3DF5]/25 blur-3xl opacity-60" />
        <div className="pointer-events-none absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#3478F6]/20 blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-[#18A878]/15 blur-3xl opacity-50" />
        {/* subtle dot grid texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:22px_22px]" />

        <Container size="full" className="relative py-16 lg:py-20">
          {/* Top CTA Banner */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="relative rounded-3xl bg-gradient-to-br from-[#171E36] via-[#12182E] to-[#0E1428] border border-white/10 overflow-hidden shadow-lg shadow-slate-900/10"
          >
            <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-[#6D3DF5]/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-16 w-72 h-72 rounded-full bg-[#3478F6]/25 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 right-1/3 w-56 h-56 rounded-full bg-[#18A878]/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className="relative flex flex-col xl:flex-row gap-10 items-center px-7 py-10 lg:px-12 lg:py-12">
              {/* Left: content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7">
                  <div className="shrink-0">
                    <CtaScene />
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/25 mb-4">
                      <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                      <span className="text-[10px] font-bold text-[#C4B5FD] uppercase tracking-wider">Learn. Earn. Grow.</span>
                    </span>
                    <h2 className="text-[26px] lg:text-[32px] font-extrabold text-white leading-tight">
                      Start Learning. Start Earning.
                    </h2>
                    <h3 className="text-[20px] lg:text-[24px] font-extrabold leading-snug mt-1.5 text-white capitalize">
                      Start Your <span className="relative inline-block text-[#C4B5FD]">Journey
                        <svg className="absolute left-0 -bottom-1.5 w-full h-2.5" viewBox="0 0 120 8" fill="none" preserveAspectRatio="none" aria-hidden="true">
                          <path d="M2 6 C 30 1, 90 1, 118 6" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </span> Today!
                    </h3>
                    <p className="text-[#9AA4B8] text-[13.5px] leading-relaxed mt-3 max-w-md">
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
                        <p className="text-[11px] text-[#8B94A8] leading-snug mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CTA */}
              <div className="shrink-0 flex flex-col items-center xl:items-end gap-3 xl:pr-2">
                <Link href="/signup">
                  <button data-magnet className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] hover:from-[#7C3AED] hover:to-[#A78BFA] text-white text-[14px] font-bold px-7 py-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                    Join Now &ndash; It&apos;s Free!
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>
                <p className="text-[11px] text-[#8B94A8]">No hidden charges. Cancel anytime.</p>
              </div>
            </div>
          </motion.div>

          {/* Main footer grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-8 gap-y-10 mt-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 xl:col-span-1">
              <Link href="/" className="inline-flex items-center mb-4 group" aria-label="Learn2Earn">
                <span className="inline-flex items-center justify-center rounded-xl bg-white px-3.5 py-2 shadow-sm transition-transform duration-300 group-hover:scale-[1.03]">
                  <Image
                    src="/learn2earn-logo.png"
                    alt="Learn2Earn"
                    width={500}
                    height={158}
                    className="h-8 w-auto object-contain"
                  />
                </span>
              </Link>
              <p className="text-[#8B94A8] text-[13px] leading-relaxed">
                The all-in-one platform to learn new skills, earn income, and build the future you deserve.
              </p>
              <div className="flex items-center gap-2 mt-5">
                {footerSocials.map((s) => (
                  <button
                    key={s.label}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8B94A8] hover:text-white hover:bg-[#6D3DF5] hover:border-[#6D3DF5] transition-all duration-200"
                  >
                    <s.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <FooterLinksCol title="Quick Links" icon={<Link2 className="w-3.5 h-3.5 text-[#A78BFA]" />} accent="text-[#A78BFA]" links={footerQuickLinks} />
            {/* For Learners */}
            <FooterLinksCol title="For Learners" icon={<GraduationCap className="w-3.5 h-3.5 text-[#34D399]" />} accent="text-[#34D399]" links={footerLearnerLinks} />
            {/* For Earners */}
            <FooterLinksCol title="For Earners" icon={<Wallet className="w-3.5 h-3.5 text-[#60A5FA]" />} accent="text-[#60A5FA]" links={footerEarnerLinks} />
            {/* Company */}
            <FooterLinksCol title="Company" icon={<Building className="w-3.5 h-3.5 text-[#A78BFA]" />} accent="text-[#A78BFA]" links={footerCompanyLinks} />

            {/* Stay Updated */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#34D399] mb-4">
                <MailPlus className="w-3.5 h-3.5 text-[#34D399]" />
                Stay Updated
              </h4>
              <p className="text-[12px] text-[#8B94A8] leading-relaxed mb-3">
                Subscribe to get the latest courses, tips, and updates.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1.5 focus-within:border-[#6D3DF5]/60 transition-colors"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 min-w-0 bg-transparent text-[12px] text-white placeholder:text-[#5B6478] px-2 outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] flex items-center justify-center text-white shadow-sm hover:from-[#7C3AED] hover:to-[#A78BFA] transition-all duration-200 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="flex items-start gap-1.5 text-[10.5px] text-[#5B6478] leading-snug mt-3">
                <Lock className="w-3 h-3 shrink-0 mt-0.5" />
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Legal bar */}
          <div className="mt-14 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-[12px] text-[#8B94A8]">&copy; 2026 Learn2Earn. All rights reserved.</p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-[#8B94A8]">
                {['Terms of Use', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'].map((item) => (
                  <button key={item} className="hover:text-white transition-colors">{item}</button>
                ))}
              </div>
              <p className="text-[12px] text-[#8B94A8]">Made with 💜 for learners worldwide.</p>
            </div>
          </div>
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
