'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import {
  Search,
  Plus,
  BookOpen,
  Video,
  FileText,
  Edit,
  Trash2,
  Clock,
  Users,
  Star,
  ChevronRight,
  Loader2,
  Upload,
  X,
  Play,
  CheckCircle,
  ExternalLink,
  Grid3X3,
  List,
  Filter,
  ImagePlus,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Download,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import api, { coursesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import type { Course, Lesson } from '@/types'

const mockCourses: Course[] = [
  { id: 1, title: 'React Fundamentals: Build Modern Web Apps', slug: 'react-fundamentals-build-modern-web-apps', description: 'Learn React from scratch. Master components, hooks, state management, and build real-world applications with modern React patterns.', category: 'Development', level: 'beginner', price: 49.99, thumbnail: '', instructor: { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'instructor', avatar: null, email_verified_at: null, created_at: '2024-01-01T00:00:00Z', onboarding_completed: true, skills: ['React', 'Python', 'Data Science'], bio: 'Experienced instructor' }, duration: '12 hours', students_count: 3450, rating: 4.7, created_at: '2024-01-15T00:00:00.000Z', lessons: [] },
  { id: 2, title: 'Advanced TypeScript Patterns', slug: 'advanced-typescript-patterns', description: 'Deep dive into TypeScript generics, conditional types, mapped types, and advanced design patterns for large-scale applications.', category: 'Development', level: 'advanced', price: 79.99, thumbnail: '', instructor: { id: 2, name: 'Michael Chen', email: 'michael.chen@example.com', role: 'instructor', avatar: null, email_verified_at: null, created_at: '2024-01-01T00:00:00Z', onboarding_completed: true, skills: ['TypeScript', 'DevOps', 'Flutter'], bio: 'Full-stack developer' }, duration: '10 hours', students_count: 1870, rating: 4.9, created_at: '2024-02-20T00:00:00.000Z', lessons: [] },
  { id: 3, title: 'UI/UX Design Principles', slug: 'uiux-design-principles', description: 'Understand the fundamentals of UI/UX design. Learn wireframing, prototyping, and design systems.', category: 'Design', level: 'beginner', price: 39.99, thumbnail: '', instructor: { id: 3, name: 'Emily Rodriguez', email: 'emily.rodriguez@example.com', role: 'instructor', avatar: null, email_verified_at: null, created_at: '2024-01-01T00:00:00Z', onboarding_completed: true, skills: ['Design', 'UI/UX', 'Marketing'], bio: 'Creative designer' }, duration: '8 hours', students_count: 5200, rating: 4.5, created_at: '2024-03-01T00:00:00.000Z', lessons: [] },
  { id: 4, title: 'Python for Data Science & Machine Learning', slug: 'python-for-data-science-machine-learning', description: 'Data analysis, visualization, and ML with Python. Covers NumPy, Pandas, Matplotlib, Scikit-learn.', category: 'Data Science', level: 'intermediate', price: 89.99, thumbnail: '', instructor: { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'instructor', avatar: null, email_verified_at: null, created_at: '2024-01-01T00:00:00Z', onboarding_completed: true, skills: ['React', 'Python', 'Data Science'], bio: 'Experienced instructor' }, duration: '18 hours', students_count: 8900, rating: 4.8, created_at: '2024-04-10T00:00:00.000Z', lessons: [] },
  { id: 5, title: 'DevOps with Docker & Kubernetes', slug: 'devops-with-docker-kubernetes', description: 'Containerization with Docker, orchestration with Kubernetes, CI/CD pipelines, monitoring, and cloud deployment.', category: 'DevOps', level: 'advanced', price: 99.99, thumbnail: '', instructor: { id: 2, name: 'Michael Chen', email: 'michael.chen@example.com', role: 'instructor', avatar: null, email_verified_at: null, created_at: '2024-01-01T00:00:00Z', onboarding_completed: true, skills: ['TypeScript', 'DevOps', 'Flutter'], bio: 'Full-stack developer' }, duration: '15 hours', students_count: 2300, rating: 4.6, created_at: '2024-05-05T00:00:00.000Z', lessons: [] },
  { id: 6, title: 'Digital Marketing Strategy Masterclass', slug: 'digital-marketing-strategy-masterclass', description: 'SEO, social media marketing, email campaigns, and analytics.', category: 'Marketing', level: 'beginner', price: 29.99, thumbnail: '', instructor: { id: 3, name: 'Emily Rodriguez', email: 'emily.rodriguez@example.com', role: 'instructor', avatar: null, email_verified_at: null, created_at: '2024-01-01T00:00:00Z', onboarding_completed: true, skills: ['Design', 'UI/UX', 'Marketing'], bio: 'Creative designer' }, duration: '6 hours', students_count: 12400, rating: 4.4, created_at: '2024-06-12T00:00:00.000Z', lessons: [] },
  { id: 7, title: 'Machine Learning A-Z: Hands-On Python', slug: 'machine-learning-a-z-hands-on-python', description: 'Regression, classification, clustering, neural networks, and deep learning with TensorFlow.', category: 'AI & ML', level: 'intermediate', price: 109.99, thumbnail: '', instructor: { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'instructor', avatar: null, email_verified_at: null, created_at: '2024-01-01T00:00:00Z', onboarding_completed: true, skills: ['React', 'Python', 'Data Science'], bio: 'Experienced instructor' }, duration: '24 hours', students_count: 15600, rating: 4.9, created_at: '2024-07-01T00:00:00.000Z', lessons: [] },
  { id: 8, title: 'Flutter Mobile Development', slug: 'flutter-mobile-development', description: 'Native mobile apps for iOS and Android from a single codebase using Flutter and Dart.', category: 'Mobile', level: 'intermediate', price: 59.99, thumbnail: '', instructor: { id: 2, name: 'Michael Chen', email: 'michael.chen@example.com', role: 'instructor', avatar: null, email_verified_at: null, created_at: '2024-01-01T00:00:00Z', onboarding_completed: true, skills: ['TypeScript', 'DevOps', 'Flutter'], bio: 'Full-stack developer' }, duration: '14 hours', students_count: 4100, rating: 4.7, created_at: '2024-08-20T00:00:00.000Z', lessons: [] },
]

const mockEnrolledIds = new Set<number>([1, 3, 5])

const CATEGORIES = [
  'Development',
  'Design',
  'Data Science',
  'DevOps',
  'Business',
  'Marketing',
  'AI & ML',
  'Mobile',
  'Other',
] as const

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const

const levelColors: Record<string, 'success' | 'warning' | 'destructive'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'destructive',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

/* ---------- Course Card ---------- */
function CourseCard({
  course,
  enrolled,
  isOwner,
  onView,
  onEdit,
  onDelete,
  onEnroll,
  onGoToCourse,
  favorited,
  onToggleFavorite,
  progress,
}: {
  course: Course
  enrolled: boolean
  isOwner: boolean
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onEnroll: () => void
  onGoToCourse?: () => void
  favorited?: boolean
  onToggleFavorite?: () => void
  progress?: number
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="group relative overflow-hidden bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] rounded-xl shadow-lg hover:border-[#FF8A36]/30 hover:bg-white/[0.02] transition-all duration-300 h-full flex flex-col">
        <div
          className="aspect-video bg-black/30 relative overflow-hidden cursor-pointer"
          onClick={onView}
        >
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2418] to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                {course.level}
              </span>
            {enrolled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                <CheckCircle className="w-3 h-3" />
                Enrolled
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-slate-400">
              {course.category}
            </span>
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <Star className={`w-3.5 h-3.5 ${favorited ? 'fill-[#FF8A36] text-[#FF8A36]' : 'text-slate-400'}`} />
              </button>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              {course.duration}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400">
              <Star className="w-3 h-3 fill-current" />
              {course.rating}
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 ring-1 ring-white/[0.08]">
              <span className="text-[10px] font-semibold text-slate-300">{getInitials(course.instructor.name)}</span>
            </div>
            <span className="text-xs text-slate-400 truncate">{course.instructor.name}</span>
          </div>
          <h3
            className="text-sm font-semibold text-white mb-1.5 line-clamp-2 cursor-pointer flex-1"
            onClick={onView}
          >
            {course.title}
          </h3>
          <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
            {course.description.length > 80
              ? course.description.slice(0, 80) + '...'
              : course.description}
          </p>
          {enrolled && progress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400">Progress</span>
                <span className="text-[10px] font-semibold text-[#FF8A36]">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FF8A36, #E07328)' }} />
              </div>
            </div>
          )}
          {enrolled && onGoToCourse && (
            <button onClick={(e) => { e.stopPropagation(); onGoToCourse() }} className="mb-3 w-full py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-semibold hover:bg-[#10B981]/20 transition-all">
              Go to Course
            </button>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-white">{formatCurrency(course.price)}</span>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Users className="w-3 h-3" />
                {course.students_count.toLocaleString()}
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors" onClick={onEdit}>
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 hover:bg-white/[0.06] transition-colors" onClick={onDelete}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          {!isOwner && !enrolled && (
            <button onClick={onEnroll} className="mt-3 w-full py-2 rounded-xl bg-[#FF8A36] hover:bg-[#E07328] text-white text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Enroll Now
            </button>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF8A36]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </motion.div>
  )
}

/* ---------- Skeleton ---------- */
function CourseSkeleton() {
  return (
    <div className="bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="aspect-video bg-white/5 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse" />
          <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="h-5 w-full bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/* ---------- Create / Edit Course Modal ---------- */
function CourseFormModal({
  open,
  onOpenChange,
  course,
  onSaved,
  courses,
  setCourses,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  course: Course | null
  onSaved: () => void
  courses: Course[]
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>
}) {
  const isEdit = !!course
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('beginner')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (course) {
      setTitle(course.title)
      setDescription(course.description)
      setCategory(course.category)
      setLevel(course.level)
      setPrice(String(course.price))
      setDuration(course.duration)
    } else {
      setTitle('')
      setDescription('')
      setCategory('')
      setLevel('beginner')
      setPrice('')
      setDuration('')
    }
    setThumbnail(null)
  }, [course, open])

  const categories = useMemo(() => {
    const set = new Set(courses.map(c => c.category).filter(Boolean))
    return Array.from(set).sort()
  }, [courses])

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category || !price || !duration) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('category', category)
      formData.append('level', level)
      formData.append('price', price)
      formData.append('duration', duration.trim())
      if (thumbnail) formData.append('thumbnail', thumbnail)

      if (isEdit && course) {
        formData.append('_method', 'PUT')
        await coursesAPI.update(course.id, formData)
        toast.success('Course updated successfully')
      } else {
        await coursesAPI.create(formData)
        toast.success('Course created successfully')
      }

      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      if (!isEdit) {
        const newCourse: Course = {
          id: Date.now(),
          title: title.trim(),
          slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: description.trim(),
          category,
          level: level as 'beginner' | 'intermediate' | 'advanced',
          price: Number(price),
          duration: duration.trim(),
          thumbnail: '',
          instructor: { id: 0, name: 'You', email: '', role: 'instructor', avatar: null, email_verified_at: null, created_at: new Date().toISOString(), onboarding_completed: true, skills: [], bio: null },
          students_count: 0,
          rating: 0,
          created_at: new Date().toISOString(),
          lessons: [],
        }
        setCourses((prev) => [newCourse, ...prev])
        toast.success('Course created (offline mode)')
        onOpenChange(false)
      } else if (course) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id
              ? { ...c, title: title.trim(), description: description.trim(), category, level: level as 'beginner' | 'intermediate' | 'advanced', price: Number(price), duration: duration.trim() }
              : c
          )
        )
        toast.success('Course updated (offline mode)')
        onOpenChange(false)
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
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-y-auto z-50 rounded-xl border border-white/10 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl">
          <Dialog.Close className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors z-10">
            <X className="w-4 h-4" />
          </Dialog.Close>
          <div className="p-6 space-y-5">
            <Dialog.Title className="text-xl font-bold font-space-grotesk">
              {isEdit ? 'Edit Course' : 'Create New Course'}
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <Label htmlFor="course-title">Title *</Label>
                <Input
                  id="course-title"
                  placeholder="e.g. Advanced React Patterns"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="course-desc">Description *</Label>
                <Textarea
                  id="course-desc"
                  placeholder="Describe what students will learn..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select.Root value={category} onValueChange={setCategory}>
                    <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <Select.Value placeholder="Select category" />
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="z-50 rounded-lg border bg-popover text-popover-foreground shadow-md">
                        <Select.ScrollUpButton />
                        <Select.Viewport className="p-1">
                          {categories.map((cat) => (
                            <Select.Item
                              key={cat}
                              value={cat}
                              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
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
                  <Label>Level *</Label>
                  <Select.Root value={level} onValueChange={setLevel}>
                    <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="z-50 rounded-lg border bg-popover text-popover-foreground shadow-md">
                        <Select.ScrollUpButton />
                        <Select.Viewport className="p-1">
                          {LEVELS.map((lvl) => (
                            <Select.Item
                              key={lvl}
                              value={lvl}
                              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                            >
                              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                <Select.ItemIndicator>
                                  <Check className="h-4 w-4" />
                                </Select.ItemIndicator>
                              </span>
                              <Select.ItemText className="capitalize">{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                        <Select.ScrollDownButton />
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course-price">Price ($) *</Label>
                  <Input
                    id="course-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="49.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="course-duration">Duration *</Label>
                  <Input
                    id="course-duration"
                    placeholder="e.g. 12 hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Thumbnail</Label>
                <label
                  htmlFor="course-thumb"
                  className="mt-1.5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 p-6 cursor-pointer hover:border-[#FF8A36]/50 transition-colors"
                >
                  <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {thumbnail ? thumbnail.name : 'Click to upload thumbnail'}
                  </span>
                  <input
                    id="course-thumb"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="gradient" className="flex-1 gap-2" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEdit ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {submitting ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ---------- Add Lesson Modal ---------- */
function AddLessonModal({
  open,
  onOpenChange,
  courseId,
  lesson,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  courseId: number
  lesson: Lesson | null
  onSaved: () => void
}) {
  const isEdit = !!lesson
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'video' | 'text' | 'pdf'>('video')
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setType(lesson.type)
      setContent(lesson.content)
      setVideoUrl(lesson.video_url || '')
      setDuration(lesson.duration)
    } else {
      setTitle('')
      setType('video')
      setContent('')
      setVideoUrl('')
      setDuration('')
    }
  }, [lesson, open])

  const handleSubmit = async () => {
    if (!title.trim() || !duration) {
      toast.error('Please fill in title and duration')
      return
    }

    setSubmitting(true)
    try {
      const payload: Record<string, any> = {
        course_id: courseId,
        title: title.trim(),
        type,
        content: content.trim(),
        duration: duration.trim(),
      }
      if (type === 'video') payload.video_url = videoUrl.trim()

      if (isEdit && lesson) {
        await api.put(`/lessons/${lesson.id}`, payload)
        toast.success('Lesson updated successfully')
      } else {
        await api.post('/lessons', payload)
        toast.success('Lesson added successfully')
      }

      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto z-50 rounded-xl border border-white/10 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl">
          <Dialog.Close className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors z-10">
            <X className="w-4 h-4" />
          </Dialog.Close>
          <div className="p-6 space-y-5">
            <Dialog.Title className="text-xl font-bold font-space-grotesk">
              {isEdit ? 'Edit Lesson' : 'Add Lesson'}
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lesson-title">Title *</Label>
                <Input
                  id="lesson-title"
                  placeholder="e.g. Introduction to React"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Type *</Label>
                <div className="flex gap-2 mt-1.5">
                  {(['video', 'text', 'pdf'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                        type === t
                          ? 'border-[#FF8A36] bg-[#FF8A36]/10 text-[#FF8A36]'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
                      )}
                    >
                      {t === 'video' ? <Video className="w-4 h-4" /> : t === 'text' ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {type === 'video' && (
                <div>
                  <Label htmlFor="lesson-video">Video URL</Label>
                  <Input
                    id="lesson-video"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
              )}
              {(type === 'text' || type === 'pdf') && (
                <div>
                  <Label htmlFor="lesson-content">Content *</Label>
                  <Textarea
                    id="lesson-content"
                    placeholder={type === 'text' ? 'Write lesson content here...' : 'Provide PDF description or link...'}
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="lesson-duration">Duration *</Label>
                <Input
                  id="lesson-duration"
                  placeholder="e.g. 45 minutes"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="gradient" className="flex-1 gap-2" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {submitting ? 'Saving...' : isEdit ? 'Update Lesson' : 'Add Lesson'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ---------- Course Detail Modal ---------- */
function CourseDetailModal({
  course,
  open,
  onOpenChange,
  onRefresh,
}: {
  course: Course | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onRefresh: () => void
}) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deletingLesson, setDeletingLesson] = useState<number | null>(null)
  const { user } = useAuth()
  const isOwner = course ? user?.id === course.instructor.id : false

  const fetchLessons = useCallback(async () => {
    if (!course) return
    setLoadingLessons(true)
    try {
      const res = await coursesAPI.getLessons(course.id)
      setLessons(res.data.lessons || res.data.data || [])
    } catch {
      // lessons might not load individually
    } finally {
      setLoadingLessons(false)
    }
  }, [course])

  useEffect(() => {
    if (open && course) fetchLessons()
  }, [open, course, fetchLessons])

  const handleDeleteLesson = async (lessonId: number) => {
    setDeletingLesson(lessonId)
    try {
      await api.delete(`/lessons/${lessonId}`)
      toast.success('Lesson deleted')
      fetchLessons()
      onRefresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete lesson')
    } finally {
      setDeletingLesson(null)
    }
  }

  if (!course) return null

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[85vh] z-50 rounded-xl border border-white/10 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl flex flex-col">
            <Dialog.Close className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors z-10">
              <X className="w-4 h-4" />
            </Dialog.Close>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Dialog.Title className="text-2xl font-bold font-space-grotesk mb-2">
                      {course.title}
                    </Dialog.Title>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px] bg-[#FF8A36]/10 text-[#FF8A36]">
                            {getInitials(course.instructor.name)}
                          </AvatarFallback>
                        </Avatar>
                        {course.instructor.name}
                      </div>
                      <Badge variant={levelColors[course.level]} className="capitalize">
                        {course.level}
                      </Badge>
                      <Badge variant="outline">{course.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                        {course.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.students_count} students
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </div>
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(course.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">About This Course</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                </div>

                <Separator />

                {/* Lessons */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Course Content ({lessons.length} lessons)</h4>
                    {isOwner && (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditingLesson(null); setShowAddLesson(true) }}>
                        <Plus className="w-3.5 h-3.5" />
                        Add Lesson
                      </Button>
                    )}
                  </div>

                  {loadingLessons ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : lessons.length === 0 ? (
                    <Card className="border-dashed border-border/50">
                      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No lessons yet</p>
                        {isOwner && (
                          <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => { setEditingLesson(null); setShowAddLesson(true) }}>
                            <Plus className="w-3.5 h-3.5" />
                            Add First Lesson
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-1.5">
                      {lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/60 transition-colors group"
                        >
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#FF8A36]/10 text-[#FF8A36] text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {lesson.type === 'video' ? (
                              <Video className="w-4 h-4 text-blue-400 shrink-0" />
                            ) : lesson.type === 'text' ? (
                              <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            <span className="text-sm font-medium truncate">{lesson.title}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{lesson.duration}</span>
                            {lesson.type === 'video' && lesson.video_url && (
                              <a
                                href={lesson.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-slate-400 hover:text-[#FF8A36] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          {isOwner && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => { setEditingLesson(lesson); setShowAddLesson(true) }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-500"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                disabled={deletingLesson === lesson.id}
                              >
                                {deletingLesson === lesson.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AddLessonModal
        open={showAddLesson}
        onOpenChange={setShowAddLesson}
        courseId={course.id}
        lesson={editingLesson}
        onSaved={() => { fetchLessons(); onRefresh() }}
      />
    </>
  )
}

/* ---------- Delete Confirm Modal ---------- */
function DeleteConfirmModal({
  course,
  open,
  onOpenChange,
  onDeleted,
  courses,
  setCourses,
}: {
  course: Course | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onDeleted: () => void
  courses: Course[]
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!course) return
    setDeleting(true)
    try {
      await coursesAPI.delete(course.id)
      toast.success('Course deleted successfully')
      onOpenChange(false)
      onDeleted()
    } catch (err: any) {
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      toast.success('Course deleted (offline mode)')
      onOpenChange(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 rounded-xl border border-white/10 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <Dialog.Title className="text-lg font-bold font-space-grotesk mb-2">
              Delete Course
            </Dialog.Title>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{course?.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={deleting}>
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

/* ===================================================================== */
/*                               PAGE                                    */
/* ===================================================================== */
export default function CoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin'

  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set())
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  const toggleFavorite = useCallback((courseId: number) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  }, [])

  const courseProgress = useMemo(() => {
    const map = new Map<number, number>()
    enrolledIds.forEach(id => {
      map.set(id, Math.floor(Math.random() * 100))
    })
    return map
  }, [enrolledIds])

  const completedCount = Math.floor(enrolledIds.size * 0.3)

  const avgRating =
    courses.length > 0
      ? (courses.reduce((s, c) => s + c.rating, 0) / courses.length).toFixed(1)
      : '0.0'

  const categories = useMemo(() => {
    const set = new Set(courses.map(c => c.category).filter(Boolean))
    return Array.from(set).sort()
  }, [courses])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('all-courses')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await coursesAPI.getAll()
      const data = res.data.courses || res.data.data || res.data || []
      setCourses(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load courses')
      setCourses(mockCourses)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEnrolled = useCallback(async () => {
    try {
      const res = await api.get('/courses/enrolled')
      const data = res.data.courses || res.data.data || res.data || []
      const ids = (Array.isArray(data) ? data : []).map((c: any) => c.id || c.course_id)
      setEnrolledIds(new Set(ids.filter(Boolean)))
    } catch {
      setEnrolledIds(mockEnrolledIds)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
    fetchEnrolled()
  }, [fetchCourses, fetchEnrolled])

  const filtered = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
    const matchLevel = filterLevel ? c.level === filterLevel : true
    const matchCategory = filterCategory ? c.category === filterCategory : true
    return matchSearch && matchLevel && matchCategory
  })

  const enrolledCourses = filtered.filter((c) => enrolledIds.has(c.id))
  const ownedCourses = filtered.filter((c) => user && c.instructor.id === user.id)
  const displayCourses = activeTab === 'my-courses' ? enrolledCourses : activeTab === 'owned' ? ownedCourses : filtered

  const handleEnroll = async (courseId: number) => {
    if (courseId === 0) return
    try {
      await coursesAPI.enroll(courseId)
      setEnrolledIds((prev) => new Set(prev).add(courseId))
      toast.success('Enrolled successfully!')
      fetchCourses()
      fetchEnrolled()
    } catch (err: any) {
      const msg = err?.response?.data?.message || ''
      if (msg.includes('already')) {
        setEnrolledIds((prev) => new Set(prev).add(courseId))
        toast('Already enrolled')
      } else {
        toast.error(msg || 'Failed to enroll. Please try again.')
      }
    }
  }

  const exportCSV = () => {
    const headers = ['Title', 'Category', 'Level', 'Price', 'Duration', 'Students', 'Rating', 'Instructor']
    const rows = courses.map(c => [
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.level,
      String(c.price),
      c.duration,
      String(c.students_count),
      String(c.rating),
      `"${c.instructor.name}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'courses.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Courses exported')
  }

  const renderCourseCard = (course: Course) => (
    <CourseCard
      key={course.id}
      course={course}
      enrolled={enrolledIds.has(course.id)}
      isOwner={user?.id === course.instructor.id}
      onView={() => router.push(`/courses/${course.slug}`)}
      onGoToCourse={() => router.push(`/courses/${course.slug}`)}
      onEdit={() => setEditingCourse(course)}
      onDelete={() => setDeletingCourse(course)}
      onEnroll={() => handleEnroll(course.id)}
      favorited={favorites.has(course.id)}
      onToggleFavorite={() => toggleFavorite(course.id)}
      progress={courseProgress.get(course.id)}
    />
  )

  const renderCourseListItem = (course: Course) => (
    <motion.div key={course.id} variants={itemVariants}>
      <div className="rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] hover:border-[#FF8A36]/30 hover:bg-white/[0.02] transition-all cursor-pointer group">
        <div
          className="flex items-center gap-4 p-3"
          onClick={() => router.push(`/courses/${course.slug}`)}
        >
          <div className="w-20 h-14 rounded-lg bg-black/30 shrink-0 relative overflow-hidden ring-1 ring-white/[0.06]">
            {course.thumbnail && (
              <img src={course.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <span className="absolute top-1 left-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FF8A36]/20 text-[#FF8A36] border border-[#FF8A36]/20">
              {course.level}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {course.title}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {course.instructor.name} &middot; {course.category}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              {course.rating}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.students_count.toLocaleString()}
            </div>
            <span className="font-semibold text-white">{formatCurrency(course.price)}</span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(course.id) }}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <Star className={`w-3 h-3 ${favorites.has(course.id) ? 'fill-[#FF8A36] text-[#FF8A36]' : 'text-slate-400'}`} />
            </button>
            {enrolledIds.has(course.id) && (
              <>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                  Enrolled
                </span>
                <button onClick={(e) => { e.stopPropagation(); router.push(`/courses/${course.slug}`) }} className="text-[10px] font-semibold text-[#10B981] hover:underline shrink-0">
                  Go to Course
                </button>
              </>
            )}
          </div>
          {user?.id === course.instructor.id && (
            <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors" onClick={() => setEditingCourse(course)}>
                <Edit className="w-3 h-3" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 hover:bg-white/[0.06] transition-colors" onClick={() => setDeletingCourse(course)}>
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        {enrolledIds.has(course.id) && courseProgress.has(course.id) && (
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400">Progress</span>
              <span className="text-[10px] font-semibold text-[#FF8A36]">{courseProgress.get(course.id)}%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${courseProgress.get(course.id)}%`, background: 'linear-gradient(90deg, #FF8A36, #E07328)' }} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="max-w-md w-full bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] rounded-xl py-12 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Failed to Load Courses</h3>
            <p className="text-xs text-slate-400 mb-6">{error}</p>
            <button onClick={fetchCourses} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white text-xs font-semibold transition-all duration-200">
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Courses</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isInstructor ? 'Manage your course catalog and content.' : 'Browse and enroll in courses.'}
          </p>
        </div>
        {isInstructor && (
          <button onClick={() => { setEditingCourse(null); setShowCreateModal(true) }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF8A36] hover:bg-[#E07328] text-white text-xs font-semibold transition-all duration-200">
            <Plus className="w-3.5 h-3.5" />
            Create Course
          </button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF8A36]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#FF8A36]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{courses.length}</div>
                <div className="text-xs text-slate-400">Total Courses</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{enrolledCourses.length}</div>
                <div className="text-xs text-slate-400">Enrolled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{completedCount}</div>
                <div className="text-xs text-slate-400">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF8A36]/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-[#FF8A36]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{avgRating}</div>
                <div className="text-xs text-slate-400">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-black/20 border border-white/[0.08] rounded-xl p-0.5">
              <TabsTrigger value="all-courses" className="gap-2 data-[state=active]:bg-[#FF8A36] data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all">
                <Grid3X3 className="w-3.5 h-3.5" />
                All Courses
              </TabsTrigger>
              <TabsTrigger value="my-courses" className="gap-2 data-[state=active]:bg-[#FF8A36] data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all">
                <BookOpen className="w-3.5 h-3.5" />
                Enrolled
              </TabsTrigger>
              {isInstructor && (
                <TabsTrigger value="owned" className="gap-2 data-[state=active]:bg-[#FF8A36] data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all">
                  <BookOpen className="w-3.5 h-3.5" />
                  My Courses
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:border-[#FF8A36] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 pl-9 pr-3 py-1.5 bg-black/25 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF8A36] focus:ring-1 focus:ring-[#FF8A36] transition-all"
              />
            </div>
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="h-9 w-36 rounded-xl border border-white/[0.08] bg-black/25 px-3 py-1 text-xs text-white focus:outline-none focus:border-[#FF8A36] appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#042718] text-slate-400">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#042718] text-white">{cat}</option>
              ))}
            </select>
            <div className="flex items-center gap-1 bg-black/20 border border-white/[0.08] rounded-xl p-1">
              {[null, 'beginner', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level ?? 'all'}
                  onClick={() => setFilterLevel(level)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filterLevel === level
                      ? 'bg-[#FF8A36] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level ? level.charAt(0).toUpperCase() + level.slice(1) : 'All'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-black/20 border border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  view === 'grid' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  view === 'list' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Course Grid / List */}
        {loading ? (
          view === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <CourseSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 w-full rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )
        ) : displayCourses.length === 0 ? (
          <div className="bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.07] rounded-xl py-16 text-center">
              <BookOpen className="w-10 h-10 text-slate-400/40 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-white mb-1">
                {activeTab === 'my-courses'
                  ? 'No enrolled courses'
                  : activeTab === 'owned'
                  ? 'No courses yet'
                  : 'No courses found'}
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                {activeTab === 'my-courses'
                  ? 'Browse the catalog and enroll in courses to get started.'
                  : activeTab === 'owned'
                  ? 'Create your first course and start teaching students.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {activeTab === 'owned' && isInstructor && (
                <button onClick={() => { setEditingCourse(null); setShowCreateModal(true) }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF8A36] hover:bg-[#E07328] text-white text-xs font-semibold transition-all duration-200">
                  <Plus className="w-3.5 h-3.5" />
                  Create Course
                </button>
              )}
              {activeTab === 'all-courses' && !search && !filterLevel && !filterCategory && (
                <button onClick={fetchCourses} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white text-xs font-semibold transition-all duration-200">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              )}
          </div>
        ) : view === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {displayCourses.map(renderCourseCard)}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {displayCourses.map(renderCourseListItem)}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CourseFormModal
        open={showCreateModal || !!editingCourse}
        onOpenChange={(o) => { setShowCreateModal(false); if (!o) setEditingCourse(null) }}
        course={editingCourse}
        onSaved={() => { fetchCourses(); fetchEnrolled() }}
        courses={courses}
        setCourses={setCourses}
      />

      <CourseDetailModal
        course={viewingCourse}
        open={!!viewingCourse}
        onOpenChange={(o) => { if (!o) setViewingCourse(null) }}
        onRefresh={fetchCourses}
      />

      <DeleteConfirmModal
        course={deletingCourse}
        open={!!deletingCourse}
        onOpenChange={(o) => { if (!o) setDeletingCourse(null) }}
        onDeleted={() => { fetchCourses(); fetchEnrolled() }}
        courses={courses}
        setCourses={setCourses}
      />
    </div>
  )
}
