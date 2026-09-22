'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Star,
  Clock,
  DollarSign,
  Heart,
  Package,
  Upload,
  X,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  MessageSquare,
  Briefcase,
  ImagePlus,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { gigsAPI, ordersAPI } from '@/lib/api'
import { formatCurrency, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Web Development',
  'Design',
  'Marketing',
  'AI',
  'Writing',
  'Video',
  'Music',
  'Business',
] as const

const PACKAGES = ['Basic', 'Standard', 'Premium'] as const

const mockGigs: Gig[] = [
  {
    id: 1,
    title: 'Professional React Website Development',
    description: 'I will build a modern, responsive React application with TypeScript, Tailwind CSS, and best practices. Perfect for startups and businesses looking for a high-quality web presence.',
    category: 'Web Development',
    starting_price: 150,
    delivery_days: 7,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    requirements: 'Provide your design mockups or wireframes, content, and any specific requirements.',
    status: 'active',
    images: ['https://picsum.photos/seed/gig1/800/400'],
    seller: { id: 101, name: 'Alex Johnson', avatar: null, rating: 4.8 },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Modern UI/UX Design for Your App',
    description: 'I will design beautiful, user-friendly interfaces for your web or mobile application. Specializing in modern, clean designs that convert.',
    category: 'Design',
    starting_price: 200,
    delivery_days: 5,
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    requirements: 'Share your brand guidelines, target audience, and any reference designs you like.',
    status: 'active',
    images: ['https://picsum.photos/seed/gig2/800/400', 'https://picsum.photos/seed/gig2b/800/400'],
    seller: { id: 102, name: 'Sarah Chen', avatar: null, rating: 4.9 },
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'AI-Powered Chatbot Integration',
    description: 'I will integrate an intelligent AI chatbot into your website using OpenAI API, LangChain, and custom fine-tuning for your specific use case.',
    category: 'AI',
    starting_price: 300,
    delivery_days: 10,
    skills: ['OpenAI', 'LangChain', 'Python', 'Node.js'],
    requirements: 'Describe your business domain, target use cases, and any existing data sources.',
    status: 'active',
    images: ['https://picsum.photos/seed/gig3/800/400'],
    seller: { id: 103, name: 'Marcus Williams', avatar: null, rating: 4.7 },
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'SEO-Optimized Content Writing',
    description: 'I will write engaging, SEO-optimized blog posts and articles that rank high on Google. Research-backed content tailored to your audience.',
    category: 'Writing',
    starting_price: 80,
    delivery_days: 3,
    skills: ['SEO', 'Blog Writing', 'Copywriting', 'Keyword Research'],
    requirements: 'Provide your niche, target keywords, tone preferences, and any existing content samples.',
    status: 'active',
    images: ['https://picsum.photos/seed/gig4/800/400'],
    seller: { id: 104, name: 'Emily Davis', avatar: null, rating: 4.6 },
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'High-Converting Marketing Funnel',
    description: 'I will build a complete marketing funnel including landing pages, email sequences, and analytics tracking to maximize your conversion rates.',
    category: 'Marketing',
    starting_price: 250,
    delivery_days: 14,
    skills: ['Email Marketing', 'Landing Pages', 'Analytics', 'Conversion Optimization'],
    requirements: 'Share your target audience, product details, and any existing marketing materials.',
    status: 'active',
    images: ['https://picsum.photos/seed/gig5/800/400', 'https://picsum.photos/seed/gig5b/800/400'],
    seller: { id: 105, name: 'Jordan Lee', avatar: null, rating: 4.5 },
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    title: 'Professional Video Editing & Post-Production',
    description: 'I will edit your raw footage into a polished, engaging video with color grading, sound design, motion graphics, and professional transitions.',
    category: 'Video',
    starting_price: 180,
    delivery_days: 7,
    skills: ['Premiere Pro', 'After Effects', 'Color Grading', 'Sound Design'],
    requirements: 'Upload your raw footage, provide a brief or script, and specify any brand requirements.',
    status: 'active',
    images: ['https://picsum.photos/seed/gig6/800/400'],
    seller: { id: 106, name: 'Ryan Thompson', avatar: null, rating: 4.9 },
    created_at: new Date().toISOString(),
  },
]

const mockReviews: Record<number, { id: number; user: string; rating: number; comment: string; date: string }[]> = {
  1: [
    { id: 1, user: 'John D.', rating: 5, comment: 'Amazing work! Delivered on time and exceeded expectations.', date: '2024-03-15' },
    { id: 2, user: 'Sarah M.', rating: 4, comment: 'Great quality code, very professional. Would work with again.', date: '2024-02-20' },
    { id: 3, user: 'Mike R.', rating: 5, comment: 'Excellent communication and top-notch React skills.', date: '2024-01-10' },
  ],
  2: [
    { id: 4, user: 'Emily W.', rating: 5, comment: 'Beautiful design work. Captured our brand perfectly.', date: '2024-03-12' },
    { id: 5, user: 'David K.', rating: 4, comment: 'Very creative and responsive to feedback.', date: '2024-02-28' },
    { id: 6, user: 'Lisa T.', rating: 5, comment: 'Outstanding UI/UX skills. Highly recommended!', date: '2024-01-22' },
  ],
  3: [
    { id: 7, user: 'Tom B.', rating: 5, comment: 'Seamless AI integration. Works flawlessly.', date: '2024-03-05' },
    { id: 8, user: 'Anna P.', rating: 4, comment: 'Very knowledgeable about LangChain and OpenAI.', date: '2024-02-14' },
    { id: 9, user: 'Chris L.', rating: 5, comment: 'Transformed our customer support with this chatbot.', date: '2024-01-30' },
  ],
  4: [
    { id: 10, user: 'Rachel G.', rating: 4, comment: 'Engaging content that ranks well on Google.', date: '2024-03-18' },
    { id: 11, user: 'Mark S.', rating: 5, comment: 'SEO knowledge is impressive. Great writer!', date: '2024-02-10' },
    { id: 12, user: 'Karen L.', rating: 4, comment: 'Delivered high-quality articles on time.', date: '2024-01-05' },
  ],
  5: [
    { id: 13, user: 'Steve J.', rating: 5, comment: 'Conversion rates improved significantly!', date: '2024-03-01' },
    { id: 14, user: 'Nina F.', rating: 4, comment: 'Well-structured funnel with great analytics.', date: '2024-02-18' },
    { id: 15, user: 'Oscar R.', rating: 5, comment: 'Marketing expertise is second to none.', date: '2024-01-15' },
  ],
  6: [
    { id: 16, user: 'Laura H.', rating: 5, comment: 'Incredible video editing skills. Very professional.', date: '2024-03-20' },
    { id: 17, user: 'Dan C.', rating: 4, comment: 'Great motion graphics and color grading.', date: '2024-02-25' },
    { id: 18, user: 'Sophie W.', rating: 5, comment: 'Transformed our raw footage into a masterpiece.', date: '2024-01-28' },
  ],
}

interface Order {
  id: number
  gig_id: number
  gig_title: string
  package: string
  price: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'completed'
  date: string
}

const mockOrders: Order[] = [
  { id: 1, gig_id: 1, gig_title: 'Professional React Website Development', package: 'Standard', price: 300, status: 'in_progress', date: '2024-03-10' },
  { id: 2, gig_id: 3, gig_title: 'AI-Powered Chatbot Integration', package: 'Basic', price: 300, status: 'delivered', date: '2024-02-28' },
  { id: 3, gig_id: 2, gig_title: 'Modern UI/UX Design for Your App', package: 'Premium', price: 800, status: 'completed', date: '2024-02-15' },
  { id: 4, gig_id: 4, gig_title: 'SEO-Optimized Content Writing', package: 'Standard', price: 160, status: 'pending', date: '2024-03-18' },
  { id: 5, gig_id: 5, gig_title: 'High-Converting Marketing Funnel', package: 'Basic', price: 250, status: 'confirmed', date: '2024-03-20' },
  { id: 6, gig_id: 6, gig_title: 'Professional Video Editing & Post-Production', package: 'Standard', price: 360, status: 'delivered', date: '2024-03-01' },
]

interface Gig {
  id: number
  title: string
  description: string
  category: string
  starting_price: number
  delivery_days: number
  skills: string[]
  requirements: string
  status: 'active' | 'pending' | 'draft'
  images: string[]
  seller: { id: number; name: string; avatar: string | null; rating: number }
  created_at: string
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-[#FF8A36] to-[#E07328]',
    'from-[#0E2E1F] to-[#1a4a2e]',
    'from-[#10B981] to-[#059669]',
    'from-[#0E2E1F] to-[#1a4a2e]',
    'from-[#0E2E1F] to-[#1a4a2e]',
    'from-[#0E2E1F] to-[#1a4a2e]',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

/* ---------- Skeleton ---------- */
function GigCardSkeleton() {
  return (
    <div className="bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
        <div className="h-5 w-full bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="h-px bg-white/[0.06]" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-white/5 animate-pulse" />
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/* ---------- Gig Card ---------- */
function GigCard({
  gig,
  isFavorite,
  onToggleFavorite,
  onViewDetail,
}: {
  gig: Gig
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
  onViewDetail: (gig: Gig) => void
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card
        className="group h-full hover:shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] hover:border-[#FF8A36]/30 rounded-xl"
        onClick={() => onViewDetail(gig)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF8A36]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF8A36]/5 to-transparent rounded-bl-full" />
        <CardContent className="p-5 relative h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="secondary" className="text-[10px]">
              {gig.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(gig.id) }}
                className="hover:scale-110 transition-transform"
              >
                <Heart className={cn('w-3.5 h-3.5', isFavorite ? 'fill-[#FF8A36] text-[#FF8A36]' : 'text-slate-400')} />
              </button>
              <Clock className="w-3 h-3" />
              {gig.delivery_days} days
            </div>
          </div>

          <h3 className="text-sm font-semibold text-white mb-2 line-clamp-1 group-hover:text-[#FF8A36] transition-colors">
            {gig.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
            {truncate(gig.description, 120)}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {gig.skills?.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0">
                {skill}
              </Badge>
            ))}
            {gig.skills?.length > 4 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0">
                +{gig.skills.length - 4}
              </Badge>
            )}
          </div>

          <div className="h-px bg-white/[0.06] mb-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <div
                  className={cn(
                    'w-full h-full bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white',
                    getAvatarColor(gig.seller?.name || 'User')
                  )}
                >
                  {getInitials(gig.seller?.name || 'User')}
                </div>
              </Avatar>
              <span className="text-xs text-slate-400">{gig.seller?.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#FF8A36]">
                {formatCurrency(gig.starting_price)}
              </p>
              {gig.seller?.rating > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {gig.seller.rating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ---------- My Gig Card (with actions) ---------- */
function MyGigCard({
  gig,
  onEdit,
  onDelete,
}: {
  gig: Gig
  onEdit: (gig: Gig) => void
  onDelete: (gig: Gig) => void
}) {

  return (
    <motion.div variants={itemVariants}>
      <div className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-white truncate">{gig.title}</h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                  {gig.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 line-clamp-1">
                {truncate(gig.description, 100)}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(gig.starting_price)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {gig.delivery_days} days
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/5 border border-white/10 text-slate-400">
                  {gig.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors" onClick={() => onEdit(gig)}>
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 hover:bg-white/[0.06] transition-colors" onClick={() => onDelete(gig)}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
      </div>
    </motion.div>
  )
}

/* ---------- Detail Modal ---------- */
function GigDetailModal({
  gig,
  open,
  onOpenChange,
  onOrder,
}: {
  gig: Gig | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onOrder: (gig: Gig) => void
}) {
  const [contactOpen, setContactOpen] = useState(false)
  if (!gig) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-y-auto z-50 rounded-xl border border-white/10 bg-gradient-to-b from-[#042718]/95 to-[#000B05]/95 backdrop-blur-2xl p-0 shadow-2xl">
          <Dialog.Close className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-muted transition-colors z-10">
            <X className="w-4 h-4" />
          </Dialog.Close>

          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{gig.category}</Badge>
                  {gig.seller?.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{gig.seller.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <Dialog.Title className="text-xl font-bold font-space-grotesk">
                  {gig.title}
                </Dialog.Title>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-2xl font-bold text-[#FF8A36]">
                  {formatCurrency(gig.starting_price)}
                </p>
                <p className="text-xs text-slate-400">Starting at</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Avatar className="w-8 h-8">
                  <div
                    className={cn(
                      'w-full h-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white',
                      getAvatarColor(gig.seller?.name || 'User')
                    )}
                  >
                    {getInitials(gig.seller?.name || 'User')}
                  </div>
                </Avatar>
                <span className="font-medium text-white">{gig.seller?.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {gig.delivery_days} day delivery
              </div>
              <Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-xs h-8" onClick={() => setContactOpen(true)}>
                <MessageSquare className="w-3.5 h-3.5" />
                Contact
              </Button>
            </div>

            {gig.images && gig.images.length > 0 && (
              <div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {gig.images.map((img, i) => (
                    <div key={i} className="shrink-0 w-full max-w-[400px] h-48 rounded-lg overflow-hidden bg-white/5">
                      <img src={img} alt={`${gig.title} image ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-slate-400 whitespace-pre-line">
                {gig.description}
              </p>
            </div>

            {gig.skills?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {gig.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {gig.requirements && (
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <p className="text-sm text-slate-400 whitespace-pre-line">
                  {gig.requirements}
                </p>
              </div>
            )}

            {(mockReviews[gig.id]?.length > 0) && (
              <div>
                <h4 className="font-semibold mb-3">Reviews</h4>
                <div className="space-y-3">
                  {mockReviews[gig.id].map((review) => (
                    <div key={review.id} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{review.user}</span>
                        <span className="text-[10px] text-slate-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn('w-3 h-3', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600')} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422] flex-1 gap-2" onClick={() => { onOrder(gig); onOpenChange(false) }}>
                <ShoppingCart className="w-4 h-4" />
                Order Now
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <ContactSellerModal gig={gig} open={contactOpen} onOpenChange={setContactOpen} />
    </Dialog.Root>
  )
}

/* ---------- Contact Seller Modal ---------- */
function ContactSellerModal({
  gig,
  open,
  onOpenChange,
}: {
  gig: Gig
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim()) return
    toast.success(`Message sent to ${gig.seller.name}`)
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[60] rounded-xl border border-white/10 bg-gradient-to-b from-[#042718]/95 to-[#000B05]/95 backdrop-blur-2xl p-0 shadow-2xl">
          <Dialog.Close className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-muted transition-colors z-10">
            <X className="w-4 h-4" />
          </Dialog.Close>
          <div className="p-6 space-y-4">
            <Dialog.Title className="text-lg font-bold font-space-grotesk">
              Contact {gig.seller.name}
            </Dialog.Title>
            <p className="text-sm text-slate-400 -mt-2">
              Send a message about "{gig.title}"
            </p>
            <Separator />
            <div>
              <Label htmlFor="contact-msg" className="mb-2 block">Message</Label>
              <Textarea
                id="contact-msg"
                placeholder="Write your message here..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422] flex-1 gap-2" onClick={handleSend} disabled={!message.trim()}>
                <MessageSquare className="w-4 h-4" />
                Send Message
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ---------- Order Modal ---------- */
function OrderModal({
  gig,
  open,
  onOpenChange,
}: {
  gig: Gig | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [selectedPackage, setSelectedPackage] = useState<string>('Standard')
  const [requirements, setRequirements] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!gig) return null

  const packagePrices: Record<string, number> = {
    Basic: gig.starting_price,
    Standard: gig.starting_price * 2,
    Premium: gig.starting_price * 4,
  }

  const handleSubmit = async () => {
    if (!requirements.trim()) {
      toast.error('Please provide requirements')
      return
    }
    setSubmitting(true)
    try {
      await ordersAPI.create({
        gig_id: gig.id,
        package: selectedPackage,
        price: packagePrices[selectedPackage],
        requirements,
      })
      toast.success('Order placed successfully!')
      onOpenChange(false)
      setRequirements('')
      setSelectedPackage('Standard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto z-50 rounded-xl border border-white/10 bg-gradient-to-b from-[#042718]/95 to-[#000B05]/95 backdrop-blur-2xl p-0 shadow-2xl">
          <Dialog.Close className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-muted transition-colors z-10">
            <X className="w-4 h-4" />
          </Dialog.Close>

          <div className="p-6 space-y-5">
            <Dialog.Title className="text-xl font-bold font-space-grotesk">
              Order Service
            </Dialog.Title>
            <p className="text-sm text-slate-400 -mt-3">
              {gig.title}
            </p>

            <Separator />

            <div>
              <Label className="mb-2 block">Select Package</Label>
              <div className="grid grid-cols-3 gap-2">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-all',
                      selectedPackage === pkg
                        ? 'border-[#FF8A36] bg-[#FF8A36]/10 ring-1 ring-[#FF8A36]'
                        : 'border-white/[0.06] hover:border-muted-foreground/30'
                    )}
                  >
                    <p className="text-sm font-semibold">{pkg}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatCurrency(packagePrices[pkg])}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="requirements" className="mb-2 block">
                Requirements
              </Label>
              <Textarea
                id="requirements"
                placeholder="Describe what you need in detail..."
                rows={5}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total</span>
              <span className="text-lg font-bold text-[#FF8A36]">
                {formatCurrency(packagePrices[selectedPackage])}
              </span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422] flex-1 gap-2" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ---------- Create/Edit Gig Modal ---------- */
function GigFormModal({
  gig,
  open,
  onOpenChange,
  onSaved,
}: {
  gig: Gig | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: (gig?: Gig) => void
}) {
  const isEdit = !!gig
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [startingPrice, setStartingPrice] = useState('')
  const [deliveryDays, setDeliveryDays] = useState('')
  const [skills, setSkills] = useState('')
  const [requirements, setRequirements] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)

  useEffect(() => {
    if (gig) {
      setTitle(gig.title)
      setDescription(gig.description)
      setCategory(gig.category)
      setStartingPrice(String(gig.starting_price))
      setDeliveryDays(String(gig.delivery_days))
      setSkills(gig.skills?.join(', ') || '')
      setRequirements(gig.requirements || '')
    } else {
      setTitle('')
      setDescription('')
      setCategory(CATEGORIES[0])
      setStartingPrice('')
      setDeliveryDays('')
      setSkills('')
      setRequirements('')
    }
    setFiles(null)
  }, [gig, open])

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !startingPrice || !deliveryDays) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        title,
        description,
        category,
        starting_price: Number(startingPrice),
        delivery_days: Number(deliveryDays),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        requirements,
      }

      if (isEdit && gig) {
        await gigsAPI.update(gig.id, payload)
        toast.success('Gig updated successfully')
      } else {
        const res = await gigsAPI.create(payload)
        if (files && files.length > 0) {
          const fd = new FormData()
          for (let i = 0; i < files.length; i++) {
            fd.append('images[]', files[i])
          }
          await gigsAPI.updateImages(res.data.id, fd)
        }
        toast.success('Gig created successfully')
      }
      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      if (!isEdit) {
        const localGig: Gig = {
          id: Date.now(),
          title,
          description,
          category,
          starting_price: Number(startingPrice),
          delivery_days: Number(deliveryDays),
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
          requirements,
          status: 'active',
          images: [],
          seller: { id: 0, name: 'You', avatar: null, rating: 0 },
          created_at: new Date().toISOString(),
        }
        onOpenChange(false)
        onSaved(localGig)
        toast.success('Gig created locally (offline mode)')
      } else {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto z-50 rounded-xl border border-white/10 bg-gradient-to-b from-[#042718]/95 to-[#000B05]/95 backdrop-blur-2xl p-0 shadow-2xl">
          <Dialog.Close className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-muted transition-colors z-10">
            <X className="w-4 h-4" />
          </Dialog.Close>

          <div className="p-6 space-y-5">
            <Dialog.Title className="text-xl font-bold font-space-grotesk">
              {isEdit ? 'Edit Gig' : 'Create New Gig'}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <Label htmlFor="gig-title">Title *</Label>
                <Input
                  id="gig-title"
                  placeholder="I will build a stunning website..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="gig-desc">Description *</Label>
                <Textarea
                  id="gig-desc"
                  placeholder="Describe your service in detail..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select.Root value={category} onValueChange={setCategory}>
                    <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-gradient-to-b from-[#042718]/80 to-[#000B05]/80 px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="z-50 rounded-lg border bg-popover text-popover-foreground shadow-md">
                        <Select.ScrollUpButton />
                        <Select.Viewport className="p-1">
                          {CATEGORIES.map((cat) => (
                            <Select.Item
                              key={cat}
                              value={cat}
                              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                <Select.ItemIndicator>
                                  <Check className="h-4 w-4" />
                                </Select.ItemIndicator>
                              </span>
                              <Select.ItemText>{cat}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                        <Select.ScrollDownButton />
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div>
                  <Label htmlFor="gig-price">Starting Price ($) *</Label>
                  <Input
                    id="gig-price"
                    type="number"
                    min="1"
                    placeholder="50"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gig-days">Delivery Days *</Label>
                  <Input
                    id="gig-days"
                    type="number"
                    min="1"
                    placeholder="7"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gig-skills">Skills (comma separated)</Label>
                  <Input
                    id="gig-skills"
                    placeholder="React, Node.js, TypeScript"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gig-req">Requirements (what you need from buyer)</Label>
                <Textarea
                  id="gig-req"
                  placeholder="Share your requirements, any specific info needed..."
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              {!isEdit && (
                <div>
                  <Label>Images</Label>
                  <label
                    htmlFor="gig-images"
                    className="mt-1.5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/[0.06] p-6 cursor-pointer hover:border-[#FF8A36]/50 transition-colors"
                  >
                    <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-400">
                      Click to upload gig images
                    </span>
                    <input
                      id="gig-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFiles(e.target.files)}
                    />
                  </label>
                  {files && files.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {files.length} file(s) selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422] flex-1 gap-2" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEdit ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {submitting ? 'Saving...' : isEdit ? 'Update Gig' : 'Create Gig'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ---------- Delete Confirm Modal ---------- */
function DeleteConfirmModal({
  gig,
  open,
  onOpenChange,
  onDeleted,
}: {
  gig: Gig | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!gig) return
    setDeleting(true)
    try {
      await gigsAPI.delete(gig.id)
      toast.success('Gig deleted successfully')
      onOpenChange(false)
      onDeleted()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete gig')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 rounded-xl border border-white/10 bg-gradient-to-b from-[#042718]/95 to-[#000B05]/95 backdrop-blur-2xl p-0 shadow-2xl">
          <div className="p-6 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <Dialog.Title className="text-xl font-bold font-space-grotesk">
              Delete Gig
            </Dialog.Title>
            <p className="text-sm text-slate-400">
              Are you sure you want to delete <strong>"{gig?.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1 gap-2" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ============ SERVICES TAB ============ */
function ServicesTab() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderGig, setOrderGig] = useState<Gig | null>(null)

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const fetchGigs = async () => {
    setLoading(true)
    setError(false)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (category) params.category = category
      const res = await gigsAPI.getAll(params)
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      setGigs(Array.isArray(raw) ? raw : [])
    } catch {
      setGigs(mockGigs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGigs()
  }, [category])

  const handleViewDetail = (gig: Gig) => {
    setSelectedGig(gig)
    setDetailOpen(true)
  }

  const handleOrder = (gig: Gig) => {
    setOrderGig(gig)
    setOrderOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            placeholder="Search gigs by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/25 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF8A36] focus:ring-1 focus:ring-[#FF8A36] transition-all"
            onKeyDown={(e) => { if (e.key === 'Enter') fetchGigs() }}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select.Root value={category} onValueChange={setCategory}>
            <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-gradient-to-b from-[#042718]/80 to-[#000B05]/80 px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Select.Value placeholder="All Categories" />
              <Select.Icon>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 rounded-lg border bg-popover text-popover-foreground shadow-md">
                <Select.ScrollUpButton />
                <Select.Viewport className="p-1">
                  <Select.Item value="" className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Select.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </Select.ItemIndicator>
                    </span>
                    <Select.ItemText>All Categories</Select.ItemText>
                  </Select.Item>
                  {CATEGORIES.map((cat) => (
                    <Select.Item key={cat} value={cat} className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <Select.ItemIndicator>
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                      </span>
                      <Select.ItemText>{cat}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
                <Select.ScrollDownButton />
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422] gap-2" onClick={fetchGigs}>
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <GigCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] rounded-xl py-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">Failed to load gigs</h3>
          <p className="text-xs text-slate-400 mb-4">Something went wrong. Please try again.</p>
          <button onClick={fetchGigs} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF8A36] hover:bg-[#E07328] text-white text-xs font-semibold transition-all duration-200">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : gigs.length === 0 ? (
        <div className="bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] rounded-xl py-16 text-center">
          <Briefcase className="w-10 h-10 text-slate-400/40 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">No services found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || category
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'There are no gigs available yet. Check back later!'}
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} isFavorite={favorites.has(gig.id)} onToggleFavorite={toggleFavorite} onViewDetail={handleViewDetail} />
          ))}
        </motion.div>
      )}

      <GigDetailModal gig={selectedGig} open={detailOpen} onOpenChange={setDetailOpen} onOrder={handleOrder} />
      <OrderModal gig={orderGig} open={orderOpen} onOpenChange={setOrderOpen} />
    </div>
  )
}

/* ============ MY GIGS TAB ============ */
function MyGigsTab() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGig, setEditingGig] = useState<Gig | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingGig, setDeletingGig] = useState<Gig | null>(null)

  const fetchMyGigs = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await gigsAPI.getMy()
      const raw = res.data?.data ?? res.data
      setGigs(Array.isArray(raw) ? raw : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyGigs()
  }, [])

  const handleCreate = () => {
    setEditingGig(null)
    setFormOpen(true)
  }

  const handleEdit = (gig: Gig) => {
    setEditingGig(gig)
    setFormOpen(true)
  }

  const handleDeleteRequest = (gig: Gig) => {
    setDeletingGig(gig)
    setDeleteOpen(true)
  }

  const handleSaved = (newGig?: Gig) => {
    if (newGig) {
      setGigs(prev => [newGig, ...prev])
    } else {
      fetchMyGigs()
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold mb-1">Failed to load your gigs</h3>
        <p className="text-sm text-slate-400 mb-4">Something went wrong. Please try again.</p>
        <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422]" onClick={fetchMyGigs}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {gigs.length} {gigs.length === 1 ? 'gig' : 'gigs'} total
        </p>
        <Button size="sm" className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422] gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Create Gig
        </Button>
      </div>

      {gigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-16 h-16 text-slate-400/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No gigs yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mb-4">
            Start offering your services by creating your first gig!
          </p>
          <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422] gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Create Your First Gig
          </Button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {gigs.map((gig) => (
            <MyGigCard key={gig.id} gig={gig} onEdit={handleEdit} onDelete={handleDeleteRequest} />
          ))}
        </motion.div>
      )}

      <GigFormModal gig={editingGig} open={formOpen} onOpenChange={setFormOpen} onSaved={handleSaved} />
      <DeleteConfirmModal gig={deletingGig} open={deleteOpen} onOpenChange={setDeleteOpen} onDeleted={handleSaved} />
    </div>
  )
}

/* ============ ORDER STATUS BADGE ============ */
function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const config: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    in_progress: { label: 'In Progress', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    delivered: { label: 'Delivered', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  }
  const { label, color } = config[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color}`}>
      {label}
    </span>
  )
}

/* ============ ORDERS TAB ============ */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await ordersAPI.getAll()
      const raw = res.data?.data ?? res.data
      setOrders(Array.isArray(raw) ? raw : [])
    } catch {
      setOrders(mockOrders)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="w-16 h-16 text-slate-400/30 mb-4" />
        <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Browse services and place your first order to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left py-3 px-2 text-xs text-slate-400 font-medium">Gig</th>
            <th className="text-left py-3 px-2 text-xs text-slate-400 font-medium">Package</th>
            <th className="text-left py-3 px-2 text-xs text-slate-400 font-medium">Price</th>
            <th className="text-left py-3 px-2 text-xs text-slate-400 font-medium">Status</th>
            <th className="text-left py-3 px-2 text-xs text-slate-400 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-2 text-white font-medium text-xs">{order.gig_title}</td>
              <td className="py-3 px-2 text-slate-400 text-xs">{order.package}</td>
              <td className="py-3 px-2 text-[#FF8A36] text-xs font-semibold">{formatCurrency(order.price)}</td>
              <td className="py-3 px-2"><OrderStatusBadge status={order.status} /></td>
              <td className="py-3 px-2 text-slate-400 text-xs">{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ============ MAIN PAGE ============ */
export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Marketplace</h1>
          <p className="text-xs text-slate-400">
            Browse services or sell your skills in the gig marketplace
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="bg-black/20 border border-white/[0.08] rounded-xl p-0.5 w-full sm:w-auto grid grid-cols-3 gap-1">
            <TabsTrigger value="services" className="gap-2 data-[state=active]:bg-[#FF8A36] data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all">
              <Briefcase className="w-3.5 h-3.5" />
              Services
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-[#FF8A36] data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all">
              <ShoppingCart className="w-3.5 h-3.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="my-gigs" className="gap-2 data-[state=active]:bg-[#FF8A36] data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all">
              <Package className="w-3.5 h-3.5" />
              My Gigs
            </TabsTrigger>
          </TabsList>

          <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <TabsContent value="services">
                <ServicesTab />
              </TabsContent>
              <TabsContent value="orders">
                <OrdersTab />
              </TabsContent>
              <TabsContent value="my-gigs">
                <MyGigsTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </motion.div>
    </div>
  )
}
