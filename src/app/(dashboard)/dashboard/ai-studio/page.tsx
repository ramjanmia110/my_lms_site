'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  Globe,
  Zap,
  BarChart3,
  TrendingUp,
  Code,
  Star,
  CheckCircle2,
  Activity,
  BookOpen,
  Eye,
  Layout,
  Search,
  Shield,
  Layers,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'
import Link from 'next/link'

const options = [
  {
    title: 'AI Tool Generator',
    description: 'Describe the tool you want and AI will build it',
    icon: Brain,
    href: '/dashboard/ai-studio/tool-generator',
    gradient: 'from-purple-600 to-blue-600',
    glow: 'group-hover:shadow-purple-500/25',
    features: ['Custom functionality', 'Code generation', 'One-click deploy', 'API integration', 'Responsive design'],
    stats: { label: 'Tools Generated', value: '2,847', trend: '+12%' },
    categories: ['HTML/CSS', 'JavaScript', 'React', 'Utility'],
    recent: [
      { name: 'QR Code Generator', status: 'Live', lang: 'JavaScript', initials: 'QG' },
      { name: 'Image Compressor', status: 'Live', lang: 'Python', initials: 'IC' },
      { name: 'JSON Formatter', status: 'Draft', lang: 'React', initials: 'JF' },
    ],
    users: [
      { initials: 'JD', color: 'from-pink-500 to-rose-500' },
      { initials: 'AK', color: 'from-cyan-500 to-blue-500' },
      { initials: 'SM', color: 'from-amber-500 to-orange-500' },
    ],
  },
  {
    title: 'AI Blog Generator',
    description: 'Generate SEO-optimized blog posts with AI',
    icon: FileText,
    href: '/dashboard/ai-studio/blog-generator',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'group-hover:shadow-emerald-500/25',
    features: ['SEO optimization', 'Auto schema markup', 'WordPress publish', 'Multi-language', 'AI images'],
    stats: { label: 'Posts Created', value: '1,293', trend: '+18%' },
    categories: ['Tech', 'Tutorial', 'News', 'Guide'],
    recent: [
      { name: 'React Performance Tips', status: 'Draft', lang: 'Tech', initials: 'RP' },
      { name: 'Tailwind CSS Guide', status: 'Live', lang: 'Tutorial', initials: 'TG' },
      { name: 'AI Trends 2026', status: 'Live', lang: 'News', initials: 'AT' },
    ],
    users: [
      { initials: 'AL', color: 'from-violet-500 to-purple-500' },
      { initials: 'MR', color: 'from-green-500 to-emerald-500' },
      { initials: 'TC', color: 'from-sky-500 to-indigo-500' },
    ],
  },
]

const quickTools = [
  { name: 'SEO Checker', icon: Search, gradient: 'from-teal-500 to-cyan-600' },
  { name: 'Schema Gen', icon: Layers, gradient: 'from-orange-500 to-amber-600' },
  { name: 'Image Alt Text', icon: Layout, gradient: 'from-rose-500 to-pink-600' },
  { name: 'Plagiarism Check', icon: Shield, gradient: 'from-blue-500 to-indigo-600' },
]

const recentGenerations = [
  {
    type: 'Tool',
    title: 'QR Code Generator',
    status: 'Published',
    statusVariant: 'success' as const,
    time: '2 hours ago',
    initials: 'QG',
    gradient: 'from-purple-500/20 to-blue-500/20',
    views: 234,
  },
  {
    type: 'Blog',
    title: '10 Tips for React Performance',
    status: 'Draft',
    statusVariant: 'warning' as const,
    time: '5 hours ago',
    initials: 'RP',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    views: 0,
  },
  {
    type: 'Tool',
    title: 'Image Compressor',
    status: 'Published',
    statusVariant: 'success' as const,
    time: '1 day ago',
    initials: 'IC',
    gradient: 'from-purple-500/20 to-blue-500/20',
    views: 567,
  },
  {
    type: 'Blog',
    title: 'Ultimate Guide to Tailwind CSS',
    status: 'Published',
    statusVariant: 'success' as const,
    time: '2 days ago',
    initials: 'TG',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    views: 891,
  },
  {
    type: 'Tool',
    title: 'JSON Formatter Pro',
    status: 'Draft',
    statusVariant: 'warning' as const,
    time: '3 days ago',
    initials: 'JF',
    gradient: 'from-purple-500/20 to-blue-500/20',
    views: 0,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function AIStudioPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredGenerations = activeFilter === 'all'
    ? recentGenerations
    : recentGenerations.filter(g => g.type.toLowerCase() === activeFilter)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A36] to-amber-500 flex items-center justify-center shadow-lg shadow-[#FF8A36]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-space-grotesk text-white">AI Studio</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Generate tools and content with the power of AI
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="gap-1.5 px-3 py-1.5">
            <Zap className="w-3 h-3" />
            150 credits
          </Badge>
          <Badge variant="outline" className="gap-1.5 border-[#FF8A36]/20 text-[#FF8A36]">
            <Activity className="w-3 h-3" />
            Pro Plan
          </Badge>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Generations', value: '4,140', icon: BarChart3, trend: '+15%', color: 'text-[#FF8A36]' },
          { label: 'Active Tools', value: '12', icon: Code, trend: '+3 new', color: 'text-emerald-400' },
          { label: 'Published Blogs', value: '48', icon: BookOpen, trend: '+8%', color: 'text-blue-400' },
          { label: 'Total Views', value: '89.2K', icon: TrendingUp, trend: '+24%', color: 'text-purple-400' },
        ].map((stat) => {
          const StatIcon = stat.icon
          return (
            <Card key={stat.label} className="border border-white/[0.07] bg-black/30 backdrop-blur-xl hover:bg-white/[0.03] transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{stat.label}</span>
                  <StatIcon className={cn('w-4 h-4', stat.color)} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-space-grotesk text-white">{stat.value}</span>
                  <span className="text-[11px] font-medium text-emerald-400">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Main Option Cards */}
      <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <Link key={option.title} href={option.href}>
              <Card
                className={cn(
                  'group relative overflow-hidden cursor-pointer transition-all duration-500',
                  'hover:shadow-2xl hover:-translate-y-1',
                  'border border-white/[0.07] bg-black/30 backdrop-blur-xl',
                  option.glow,
                )}
              >
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-white/[0.03] to-transparent" />
                </div>

                {/* Gradient Overlay on Hover */}
                <div
                  className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500',
                    `bg-gradient-to-br ${option.gradient}`,
                  )}
                />

                {/* Shine Effect */}
                <div className="absolute -inset-full top-0 block h-full w-1/2 z-5 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-shimmer" />

                {/* Live Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Active</span>
                </div>

                <CardContent className="p-8">
                  {/* Icon Row with Users */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={cn(
                        'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center',
                        'shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                        option.gradient,
                      )}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Collaborator Avatars */}
                    <div className="flex -space-x-2">
                      {option.users.map((user, i) => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-[#0B3B24]">
                          <AvatarFallback className={cn('text-[10px] font-bold text-white bg-gradient-to-br', user.color)}>
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-[#0B3B24] bg-white/5 flex items-center justify-center">
                        <span className="text-[10px] text-slate-400 font-medium">+</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-2xl font-bold font-space-grotesk mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-300 text-white">
                    {option.title}
                  </h2>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Stats Badge */}
                  <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center', option.gradient)}>
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{option.stats.value}</p>
                      <p className="text-[11px] text-slate-400">{option.stats.label} <span className="text-emerald-400">{option.stats.trend}</span></p>
                    </div>
                  </div>

                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {option.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-[10px] px-2 py-0.5 bg-white/[0.04] border-white/[0.06] text-slate-300">
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {option.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle2 className={cn('w-3.5 h-3.5', option.gradient.includes('emerald') ? 'text-emerald-400' : 'text-purple-400')} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity Mini-list */}
                  <div className="mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-2">Recent</p>
                    <div className="space-y-1.5">
                      {option.recent.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                          <span className="text-slate-300 truncate flex-1">{item.name}</span>
                          <span className={cn(
                            'text-[10px] font-medium',
                            item.status === 'Live' ? 'text-emerald-400' : 'text-amber-400',
                          )}>{item.status}</span>
                          <span className="text-[10px] text-slate-500">{item.lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    size="lg"
                    className={cn(
                      'w-full group/btn transition-all duration-300',
                      'bg-white/5 backdrop-blur-xl border border-white/10 text-white',
                      'hover:bg-white/10 hover:border-white/20',
                    )}
                  >
                    <span>Open {option.title}</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>

                {/* Bottom Glow */}
                <div
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                  )}
                />
              </Card>
            </Link>
          )
        })}
      </motion.div>

      {/* Quick Tools Row */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[#FF8A36]" />
          <h3 className="text-sm font-semibold text-white">Quick Tools</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickTools.map((tool) => {
            const ToolIcon = tool.icon
            return (
              <button
                key={tool.name}
                className="group flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-black/20 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
              >
                <div className={cn('w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0', tool.gradient)}>
                  <ToolIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{tool.name}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Generations */}
      <motion.div variants={item}>
        <Card className="border border-white/[0.07] bg-black/30 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6">
            {/* Header with Filter Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF8A36]/20 to-amber-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#FF8A36]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Generations</h3>
                  <p className="text-xs text-slate-400">Your latest tools and blog posts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  {['all', 'tool', 'blog'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        'px-3 py-1 text-[11px] font-medium rounded-md transition-all capitalize',
                        activeFilter === filter
                          ? 'bg-[#FF8A36] text-white shadow-lg shadow-[#FF8A36]/20'
                          : 'text-slate-400 hover:text-white',
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  View all
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredGenerations.map((gen, index) => (
                <motion.div
                  key={gen.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer border border-transparent hover:border-white/[0.06]"
                >
                  <Avatar className="w-10 h-10 rounded-xl border border-white/10">
                    <AvatarFallback className={cn('rounded-xl bg-gradient-to-br text-xs font-semibold text-white', gen.gradient)}>
                      {gen.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{gen.title}</span>
                      <Badge variant={gen.statusVariant} className="text-[10px] px-1.5 py-0 uppercase">
                        {gen.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{gen.type}</span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400">{gen.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {gen.views > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Eye className="w-3 h-3" />
                        {gen.views}
                      </div>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <Globe className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredGenerations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No {activeFilter === 'tool' ? 'tools' : 'blog posts'} found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
