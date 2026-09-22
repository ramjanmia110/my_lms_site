'use client'

import { useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  FileText,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  MessageSquare,
  Send,
  Star,
  Loader2,
  Trash2,
  Download,
  Copy,
  ClipboardCheck,
  Pencil,
  CalendarClock,
  BookOpen,
  Lightbulb,
  Target,
  ExternalLink,
  Paperclip,
  UploadCloud,
  RefreshCw,
  Eye,
  EyeOff,
  History,
  TrendingUp,
  BarChart3,
  Filter,
  Rocket,
  Timer,
  ClipboardList,
  ListChecks,
  AlertTriangle,
  Bell,
  Mail,
  Square,
  CheckSquare,
  Globe,
  Lock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate, formatDateRelative } from '@/lib/utils'
import { assignmentsAPI, coursesAPI, modulesAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AnyA = any
type TabKey = 'all' | 'active' | 'upcoming' | 'submitted' | 'late' | 'graded' | 'draft' | 'overdue'

const TAB_META: Record<TabKey, { label: string; icon: AnyA; activeCls: string; idleCls: string }> = {
  all: { label: 'All', icon: ClipboardList, activeCls: 'bg-[#FF8A36]/20 text-[#FF8A36]', idleCls: 'text-slate-400 hover:text-white' },
  active: { label: 'Active', icon: Timer, activeCls: 'bg-amber-500/20 text-amber-400', idleCls: 'text-slate-400 hover:text-white' },
  upcoming: { label: 'Upcoming', icon: CalendarClock, activeCls: 'bg-sky-500/20 text-sky-400', idleCls: 'text-slate-400 hover:text-white' },
  submitted: { label: 'Submitted', icon: CheckCircle2, activeCls: 'bg-[#FF8A36]/20 text-[#FF8A36]', idleCls: 'text-slate-400 hover:text-white' },
  late: { label: 'Late', icon: AlertTriangle, activeCls: 'bg-red-500/20 text-red-400', idleCls: 'text-slate-400 hover:text-white' },
  graded: { label: 'Graded', icon: Star, activeCls: 'bg-emerald-500/20 text-emerald-400', idleCls: 'text-slate-400 hover:text-white' },
  draft: { label: 'Draft', icon: Pencil, activeCls: 'bg-white/10 text-white', idleCls: 'text-slate-400 hover:text-white' },
  overdue: { label: 'Overdue', icon: AlertCircle, activeCls: 'bg-red-500/20 text-red-400', idleCls: 'text-slate-400 hover:text-white' },
}

const TYPE_LABEL: Record<string, string> = { file: 'File', text: 'Text', quiz: 'Quiz', group: 'Group' }
const CATEGORY_LABEL: Record<string, string> = { homework: 'Homework', quiz: 'Quiz', project: 'Project', exam: 'Exam', exercise: 'Exercise' }
const SUBMISSION_TYPE_LABEL: Record<string, string> = { upload: 'File upload', text: 'Text answer', url: 'Link submission', multiple: 'Files + text' }
const DIFFICULTY_META: Record<string, { label: string; cls: string }> = {
  easy: { label: 'Easy', cls: 'text-emerald-400' },
  medium: { label: 'Medium', cls: 'text-amber-400' },
  hard: { label: 'Hard', cls: 'text-rose-400' },
}

const coursePalette = [
  { tile: 'bg-gradient-to-br from-cyan-500/25 to-cyan-500/[0.06] text-cyan-400', dot: 'bg-cyan-400' },
  { tile: 'bg-gradient-to-br from-violet-500/25 to-violet-500/[0.06] text-violet-400', dot: 'bg-violet-400' },
  { tile: 'bg-gradient-to-br from-emerald-500/25 to-emerald-500/[0.06] text-emerald-400', dot: 'bg-emerald-400' },
  { tile: 'bg-gradient-to-br from-amber-500/25 to-amber-500/[0.06] text-amber-400', dot: 'bg-amber-400' },
  { tile: 'bg-gradient-to-br from-rose-500/25 to-rose-500/[0.06] text-rose-400', dot: 'bg-rose-400' },
  { tile: 'bg-gradient-to-br from-sky-500/25 to-sky-500/[0.06] text-sky-400', dot: 'bg-sky-400' },
  { tile: 'bg-gradient-to-br from-fuchsia-500/25 to-fuchsia-500/[0.06] text-fuchsia-400', dot: 'bg-fuchsia-400' },
  { tile: 'bg-gradient-to-br from-orange-500/25 to-orange-500/[0.06] text-orange-400', dot: 'bg-orange-400' },
]
function courseStyle(name?: string) {
  let h = 7
  const s = name || 'course'
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return coursePalette[h % coursePalette.length]
}

function assignmentTypeIcon(type?: string) {
  switch ((type || 'file').toLowerCase()) {
    case 'text': return <BookOpen className="w-4 h-4" />
    case 'quiz': return <Lightbulb className="w-4 h-4" />
    case 'group': return <Users className="w-4 h-4" />
    default: return <FileText className="w-4 h-4" />
  }
}

function isOverdue(dueDate?: string) {
  return !!dueDate && new Date(dueDate).getTime() < Date.now()
}

function dueInLabel(dueDate?: string) {
  if (!dueDate) return null
  const diff = new Date(dueDate).getTime() - Date.now()
  if (diff < 0) {
    const d = Math.abs(Math.round(diff / 86400000))
    return { label: d === 0 ? 'Overdue' : `Overdue ${d}d ago`, overdue: true }
  }
  const d = Math.round(diff / 86400000)
  return { label: d === 0 ? 'Due today' : `Due in ${d}d`, overdue: false }
}

function countdownLabel(dueDate?: string) {
  if (!dueDate) return null
  const diff = new Date(dueDate).getTime() - Date.now()
  if (diff < 0) {
    const d = Math.floor(-diff / 86400000)
    const h = Math.floor((-diff % 86400000) / 3600000)
    if (d > 0) return `Overdue ${d}d ${h}h`
    return h > 0 ? `Overdue ${h}h` : 'Overdue'
  }
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (d > 0) return `${d}d ${h}h left`
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

function letterGrade(pct: number) {
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.06]">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/5 animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-white/5 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-white/5 animate-pulse rounded w-1/2" />
            <Separator className="my-3 bg-white/[0.06]" />
            <div className="flex gap-4">
              <div className="h-3 bg-white/5 animate-pulse rounded w-24" />
              <div className="h-3 bg-white/5 animate-pulse rounded w-20" />
              <div className="h-3 bg-white/5 animate-pulse rounded w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin'
  const isStudent = user?.role === 'student'
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'due_date' | 'title' | 'max_score' | 'created_at'>('due_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const [selected, setSelected] = useState<AnyA>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [submitFor, setSubmitFor] = useState<AnyA>(null)
  const [gradeFor, setGradeFor] = useState<AnyA>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const emptyForm = {
    course_id: '', module_id: '', title: '', description: '', instructions: '',
    due_date: '', start_date: '', max_score: 100, passing_marks: '',
    type: 'file', category: 'homework', difficulty: 'medium', estimated_minutes: '',
    submission_type: 'upload', allowed_file_types: '', max_file_size_mb: 20, max_files: 1,
    allow_late_submission: false, late_penalty_percent: 0, attempts_allowed: 1,
    is_group_assignment: false, max_group_size: 2, visibility: 'all', status: 'published',
    schedule_publish: false, published_at: '',
  }
  const [createForm, setCreateForm] = useState<AnyA>({ ...emptyForm })
  const [editForm, setEditForm] = useState<AnyA>({ ...emptyForm })

  const [submitText, setSubmitText] = useState('')
  const [submitUrl, setSubmitUrl] = useState('')
  const [submitNotes, setSubmitNotes] = useState('')
  const [submitFiles, setSubmitFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const submitFileRef = useRef<HTMLInputElement>(null)

  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '', is_penalty_applied: false })

  const [resourceForm, setResourceForm] = useState<{ title: string; type: string; url: string; description: string; file: File | null }>({ title: '', type: 'link', url: '', description: '', file: null })

  const [commentText, setCommentText] = useState('')

  const filters = useMemo(() => {
    const f: AnyA = { per_page: 500, sort_by: sortBy, sort_dir: sortDir }
    if (courseFilter !== 'all') f.courseId = courseFilter
    if (moduleFilter !== 'all') f.module_id = moduleFilter
    if (search) f.search = search
    if (typeFilter !== 'all') f.type = typeFilter
    if (difficultyFilter !== 'all') f.difficulty = difficultyFilter
    return f
  }, [courseFilter, moduleFilter, search, typeFilter, difficultyFilter, sortBy, sortDir])

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['assignments-courses', isStudent],
    queryFn: () =>
      (isStudent ? coursesAPI.getEnrolled() : coursesAPI.getAll({ per_page: 100 })).then((r: AnyA) => {
        const raw = r.data?.data?.data || r.data?.data || r.data || []
        return (Array.isArray(raw) ? raw : []).map((c: AnyA) => ({ id: Number(c.id), title: c.title, course_id: c.course_id ? Number(c.course_id) : undefined }))
      }),
    enabled: !!user,
  })

  const { data: modulesData } = useQuery({
    queryKey: ['assignments-modules'],
    queryFn: () => modulesAPI.getAll({ per_page: 200 }).then((r: AnyA) => {
      const raw = r.data?.data?.data || r.data?.data || r.data || []
      return (Array.isArray(raw) ? raw : []).map((m: AnyA) => ({ id: Number(m.id), title: m.title, course_id: m.course_id ? Number(m.course_id) : undefined }))
    }),
    enabled: isInstructor,
  })

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useQuery({
    queryKey: ['assignments-dashboard'],
    queryFn: () => assignmentsAPI.getDashboard().then((r: AnyA) => r.data?.data ?? r.data),
    enabled: isInstructor,
  })

  const { data: assignmentsData, isLoading: assignmentsLoading, error: assignmentsError, refetch: refetchAssignments } = useQuery({
    queryKey: ['assignments', filters],
    queryFn: () => assignmentsAPI.getAll(filters).then((r: AnyA) => {
      const raw = r.data?.data?.data || r.data?.data || r.data || []
      return Array.isArray(raw) ? raw : []
    }),
  })

  const { data: allSubs } = useQuery({
    queryKey: ['assignments-submissions'],
    queryFn: () => assignmentsAPI.getAllSubmissions({ per_page: 500 }).then((r: AnyA) => {
      const raw = r.data?.data?.data || r.data?.data || r.data || []
      return Array.isArray(raw) ? raw : []
    }),
  })

  const { data: assignmentDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['assignment-detail', selected?.id],
    queryFn: () => assignmentsAPI.getOne(selected.id).then((r: AnyA) => r.data?.data || r.data),
    enabled: !!selected,
  })

  const enrolledIds = useMemo(() => (isStudent ? (coursesData || []).map((c: AnyA) => Number(c.course_id || c.id)) : []), [coursesData, isStudent])

  const assignments = useMemo(() => {
    if (!assignmentsData) return []
    if (!isStudent) return assignmentsData
    const ids = new Set(enrolledIds)
    if (ids.size === 0) return []
    return assignmentsData.filter((a: AnyA) => ids.has(Number(a.course_id)))
  }, [assignmentsData, isStudent, enrolledIds])

  const subInfo = useMemo(() => {
    const map: Record<number, { total: number; graded: number; late: number; pending: number }> = {}
    for (const s of allSubs || []) {
      const aId = Number(s.assignment_id)
      map[aId] = map[aId] || { total: 0, graded: 0, late: 0, pending: 0 }
      map[aId].total++
      if (s.grade != null) map[aId].graded++
      if (s.is_late) map[aId].late++
      if (s.grade == null) map[aId].pending++
    }
    return map
  }, [allSubs])

  function cardState(a: AnyA): { key: TabKey; color: string; bg: string; overdue: boolean; isLate: boolean; hasSubs: boolean } {
    if (a.status === 'draft') return { key: 'draft', color: 'text-slate-300', bg: 'bg-white/10', overdue: false, isLate: false, hasSubs: false }
    const info = subInfo[Number(a.id)]
    const hasSubs = !!info && info.total > 0
    const past = isOverdue(a.due_date)
    const within7 = a.due_date && new Date(a.due_date).getTime() <= Date.now() + 7 * 86400000
    if (hasSubs && info!.graded >= info!.total) return { key: 'graded', color: 'text-emerald-400', bg: 'bg-emerald-500/10', overdue: false, isLate: info!.late > 0, hasSubs: true }
    if (hasSubs && info!.late > 0) return { key: 'late', color: 'text-red-400', bg: 'bg-red-500/10', overdue: false, isLate: true, hasSubs: true }
    if (hasSubs) return { key: 'submitted', color: 'text-[#FF8A36]', bg: 'bg-[#FF8A36]/10', overdue: false, isLate: info!.late > 0, hasSubs: true }
    if (past) return { key: 'overdue', color: 'text-red-400', bg: 'bg-red-500/10', overdue: true, isLate: false, hasSubs: false }
    if (within7) return { key: 'upcoming', color: 'text-sky-400', bg: 'bg-sky-500/10', overdue: false, isLate: false, hasSubs: false }
    return { key: 'active', color: 'text-amber-400', bg: 'bg-amber-500/10', overdue: false, isLate: false, hasSubs: false }
  }

  function inTab(a: AnyA, tab: TabKey) {
    const s = cardState(a)
    switch (tab) {
      case 'all': return true
      case 'active': return s.key === 'active'
      case 'upcoming': return s.key === 'upcoming'
      case 'submitted': return s.key === 'submitted' || s.key === 'late'
      case 'late': return s.key === 'late' || s.isLate
      case 'graded': return s.key === 'graded'
      case 'draft': return s.key === 'draft'
      case 'overdue': return s.key === 'overdue'
    }
  }

  const currentList = useMemo(() => assignments.filter((a: AnyA) => inTab(a, activeTab)), [assignments, activeTab])

  const tabCount = useMemo(() => {
    const c: Record<TabKey, number> = { all: assignments.length, active: 0, upcoming: 0, submitted: 0, late: 0, graded: 0, draft: 0, overdue: 0 }
    for (const a of assignments) {
      const s = cardState(a)
      c[s.key]++
      if (s.key === 'submitted' || s.key === 'late') c.submitted++
      if (s.isLate || s.key === 'late') c.late++
    }
    return c
  }, [assignments])

  const stats = useMemo(() => {
    if (isStudent) {
      const toDo = assignments.filter((a: AnyA) => { const s = cardState(a); return s.key === 'active' || s.key === 'upcoming' }).length
      const overdue = assignments.filter((a: AnyA) => cardState(a).key === 'overdue').length
      const submitted = assignments.filter((a: AnyA) => { const s = cardState(a); return s.key === 'submitted' || s.key === 'late' }).length
      const graded = assignments.filter((a: AnyA) => cardState(a).key === 'graded').length
      const gradedSubs = (allSubs || []).filter((s: AnyA) => s.grade != null)
      const avg = gradedSubs.length ? Math.round((gradedSubs.reduce((x: number, s: AnyA) => x + Number(s.grade), 0) / gradedSubs.length) * 100) / 100 : null
      const completion = assignments.length ? Math.round((graded / assignments.length) * 100) : 0
      return { total: assignments.length, toDo, overdue, submitted, graded, late: (allSubs || []).filter((s: AnyA) => s.is_late).length, avg, completion }
    }
    const ds = dashboardData?.stats || dashboardData || {}
    const total = ds.total_assignments ?? assignments.length
    const active = assignments.filter((a: AnyA) => { const s = cardState(a); return s.key === 'active' || s.key === 'upcoming' }).length
    const overdue = assignments.filter((a: AnyA) => cardState(a).key === 'overdue').length
    return {
      total,
      active,
      overdue,
      pending: ds.pending ?? (allSubs || []).filter((s: AnyA) => s.grade == null).length,
      graded: ds.graded ?? (allSubs || []).filter((s: AnyA) => s.grade != null).length,
      late: ds.late ?? (allSubs || []).filter((s: AnyA) => s.is_late).length,
      avg: ds.average_grade ?? null,
      gradingRate: ds.grading_rate ?? null,
      lateRate: ds.late_rate ?? null,
    }
  }, [isStudent, assignments, allSubs, dashboardData])

  const upcomingDeadlines = useMemo(() => {
    if (isInstructor) {
      const u = dashboardData?.upcoming_deadlines || []
      if (Array.isArray(u)) return u
      return []
    }
    return assignments
      .filter((a: AnyA) => { const s = cardState(a); return s.key === 'upcoming' })
      .sort((a: AnyA, b: AnyA) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5)
  }, [isInstructor, dashboardData, assignments])

  const filteredModules = useMemo(() => {
    if (!modulesData) return []
    if (courseFilter !== 'all') return modulesData.filter((m: AnyA) => Number(m.course_id) === Number(courseFilter))
    return modulesData
  }, [modulesData, courseFilter])

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['assignments'] })
    queryClient.invalidateQueries({ queryKey: ['assignments-dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['assignments-submissions'] })
    queryClient.invalidateQueries({ queryKey: ['assignment-detail'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: AnyA) => assignmentsAPI.create(data),
    onSuccess: () => { invalidateAll(); setShowCreate(false); setCreateForm({ ...emptyForm }); toast.success('Assignment created successfully') },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || err?.response?.data?.errors?.title?.[0] || 'Failed to create assignment'),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AnyA }) => assignmentsAPI.update(id, data),
    onSuccess: () => { invalidateAll(); setShowEdit(false); toast.success('Assignment updated successfully') },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to update assignment'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => assignmentsAPI.delete(id),
    onSuccess: () => { invalidateAll(); setSelected(null); setShowDelete(false); toast.success('Assignment deleted successfully') },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to delete assignment'),
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => assignmentsAPI.duplicate(id),
    onSuccess: () => { invalidateAll(); toast.success('Assignment duplicated as draft') },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to duplicate assignment'),
  })

  const publishMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'draft' | 'published' }) => assignmentsAPI.publishToggle(id, status),
    onSuccess: () => { invalidateAll(); toast.success('Assignment publish state updated') },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to update publish state'),
  })

  const submitMutation = useMutation({
    mutationFn: ({ assignmentId }: { assignmentId: number }) => {
      const fd = new FormData()
      if (submitText) fd.append('text', submitText)
      if (submitUrl) fd.append('url', submitUrl)
      if (submitNotes) fd.append('notes', submitNotes)
      submitFiles.forEach((f) => fd.append('files', f))
      return assignmentsAPI.submit(assignmentId, fd)
    },
    onSuccess: () => {
      toast.success('Assignment submitted for review')
      setSubmitFor(null)
      setSubmitText(''); setSubmitUrl(''); setSubmitNotes(''); setSubmitFiles([])
      invalidateAll()
    },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to submit assignment'),
  })

  const gradeMutation = useMutation({
    mutationFn: ({ assignmentId, submissionId, grade, feedback, is_penalty_applied }: AnyA) =>
      assignmentsAPI.grade(assignmentId, { submission_id: submissionId, grade, feedback, is_penalty_applied }),
    onSuccess: () => {
      toast.success('Grade submitted successfully')
      setGradeFor(null)
      setGradeForm({ grade: '', feedback: '', is_penalty_applied: false })
      invalidateAll()
    },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to submit grade'),
  })

  const resourceMutation = useMutation({
    mutationFn: ({ assignmentId, form }: { assignmentId: number; form: AnyA }) => {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('type', form.type)
      if (form.url) fd.append('url', form.url)
      if (form.description) fd.append('description', form.description)
      if (form.file) fd.append('file', form.file)
      return assignmentsAPI.addResource(assignmentId, fd)
    },
    onSuccess: () => { toast.success('Resource added'); setResourceForm({ title: '', type: 'link', url: '', description: '', file: null }); invalidateAll() },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to add resource'),
  })

  const resourceDeleteMutation = useMutation({
    mutationFn: ({ assignmentId, resourceId }: { assignmentId: number; resourceId: number }) => assignmentsAPI.deleteResource(assignmentId, resourceId),
    onSuccess: () => { toast.success('Resource deleted'); invalidateAll() },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to delete resource'),
  })

  const commentMutation = useMutation({
    mutationFn: (assignmentId: number) => assignmentsAPI.addComment(assignmentId, { comment: commentText }),
    onSuccess: () => { toast.success('Comment posted'); setCommentText(''); invalidateAll() },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to post comment'),
  })

  const reminderMutation = useMutation({
    mutationFn: ({ id, kind }: { id: number; kind: 'due' | 'submission' | 'grade' }) => {
      if (kind === 'due') return assignmentsAPI.sendDueReminder(id)
      if (kind === 'submission') return assignmentsAPI.sendSubmissionReminder(id)
      return assignmentsAPI.sendGradePublished(id)
    },
    onSuccess: () => toast.success('Reminder sent to students'),
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Failed to send reminder'),
  })

  const bulkPublish = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: 'draft' | 'published' }) => Promise.all(ids.map((id) => assignmentsAPI.publishToggle(id, status))),
    onSuccess: () => { toast.success('Bulk action completed'); setSelectedIds(new Set()); invalidateAll() },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Bulk action failed'),
  })

  const bulkDelete = useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => assignmentsAPI.delete(id))),
    onSuccess: () => { toast.success('Assignments deleted'); setSelectedIds(new Set()); invalidateAll() },
    onError: (err: AnyA) => toast.error(err?.response?.data?.message || 'Bulk delete failed'),
  })

  function buildPayload(form: AnyA) {
    const allowed = form.allowed_file_types
      ? form.allowed_file_types.split(',').map((s: string) => s.trim().replace(/^\./, '')).filter(Boolean)
      : []
    return {
      course_id: Number(form.course_id),
      module_id: form.module_id ? Number(form.module_id) : undefined,
      title: form.title,
      description: form.description,
      instructions: form.instructions || undefined,
      due_date: form.due_date,
      start_date: form.start_date || undefined,
      max_score: Number(form.max_score) || 100,
      passing_marks: form.passing_marks ? Number(form.passing_marks) : undefined,
      type: form.type,
      category: form.category,
      difficulty: form.difficulty,
      estimated_minutes: form.estimated_minutes ? Number(form.estimated_minutes) : undefined,
      submission_type: form.submission_type,
      allowed_file_types: allowed.length ? allowed : undefined,
      max_file_size_mb: Number(form.max_file_size_mb) || 20,
      max_files: Number(form.max_files) || 1,
      allow_late_submission: !!form.allow_late_submission,
      late_penalty_percent: Number(form.late_penalty_percent) || 0,
      attempts_allowed: Number(form.attempts_allowed) || 1,
      is_group_assignment: !!form.is_group_assignment,
      max_group_size: form.is_group_assignment ? Number(form.max_group_size) || 2 : undefined,
      visibility: form.visibility,
      status: form.schedule_publish && form.published_at ? 'draft' : form.status,
      published_at: form.schedule_publish && form.published_at ? form.published_at : undefined,
    }
  }

  function handleCreate() {
    if (!createForm.course_id) { toast.error('Select a course'); return }
    if (!createForm.title.trim()) { toast.error('Title is required'); return }
    if (!createForm.description.trim()) { toast.error('Description is required'); return }
    if (!createForm.due_date) { toast.error('Due date is required'); return }
    createMutation.mutate(buildPayload(createForm))
  }

  function handleEdit() {
    if (!selected) return
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.due_date) {
      toast.error('Title, description, and due date are required')
      return
    }
    editMutation.mutate({ id: selected.id, data: buildPayload(editForm) })
  }

  function handleDelete() {
    if (!selected) return
    deleteMutation.mutate(selected.id)
  }

  function openEdit() {
    if (!selected) return
    const a = selected
    setEditForm({
      course_id: String(a.course_id ?? ''),
      module_id: a.module_id ? String(a.module_id) : '',
      title: a.title || '',
      description: a.description || '',
      instructions: a.instructions || '',
      due_date: a.due_date ? String(a.due_date).slice(0, 16) : '',
      start_date: a.start_date ? String(a.start_date).slice(0, 16) : '',
      max_score: a.max_score ?? a.total_marks ?? 100,
      passing_marks: a.passing_marks ?? '',
      type: a.type || 'file',
      category: a.category || 'homework',
      difficulty: a.difficulty || 'medium',
      estimated_minutes: a.estimated_minutes ?? '',
      submission_type: a.submission_type || 'upload',
      allowed_file_types: Array.isArray(a.allowed_file_types) ? a.allowed_file_types.join(', ') : (a.allowed_file_types || ''),
      max_file_size_mb: a.max_file_size_mb ?? 20,
      max_files: a.max_files ?? 1,
      allow_late_submission: !!a.allow_late_submission,
      late_penalty_percent: a.late_penalty_percent ?? 0,
      attempts_allowed: a.attempts_allowed ?? a.max_attempts ?? 1,
      is_group_assignment: !!a.is_group_assignment,
      max_group_size: a.max_group_size ?? a.group_size ?? 2,
      visibility: a.visibility || 'all',
      status: a.status === 'draft' ? 'draft' : 'published',
      schedule_publish: false,
      published_at: a.published_at ? String(a.published_at).slice(0, 16) : '',
    })
    setShowEdit(true)
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleDownloadCSV() {
    if (!assignmentDetail) return
    const subs = assignmentDetail.submissions || []
    const header = 'Name,Email,Attempt,Status,Late,Score,Percentage,Letter,Feedback,Submitted At\n'
    const rows = subs.map((sub: AnyA) => {
      const max = assignmentDetail.max_score || 100
      const pct = sub.grade != null ? Math.round((sub.grade / max) * 1000) / 10 : ''
      const letter = sub.grade != null ? letterGrade(Math.round((sub.grade / max) * 1000) / 10) : ''
      return `"${(sub.user?.name || 'Unknown').replace(/"/g, '""')}","${(sub.user?.email || '').replace(/"/g, '""')}",${sub.attempt_number || 1},"${sub.status || ''}","${sub.is_late ? 'yes' : 'no'}",${sub.grade ?? 'N/A'},${pct},${letter},"${(sub.feedback || '').replace(/"/g, '""')}","${sub.submitted_at || sub.created_at || ''}"`
    }).join('\n')
    const csv = header + rows
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveBlob(blob, `${assignmentDetail.title || 'submissions'}.csv`)
  }

  const handleCopyLink = (id: number) => {
    const url = `${window.location.origin}/dashboard/assignments?id=${id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const getCourseName = (id: number) => coursesData?.find((c: AnyA) => Number(c.id) === Number(id))?.title || ''

  const mySubmission = assignmentDetail?.my_submission

  function renderList(items: AnyA[]) {
    if (assignmentsError) {
      return (
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] border border-red-500/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <XCircle className="w-12 h-12 text-red-500/60 mb-4" />
            <h3 className="text-base font-medium mb-1 text-white">Failed to load assignments</h3>
            <p className="text-xs text-slate-400 mb-4">{(assignmentsError as AnyA)?.response?.data?.message || (assignmentsError as AnyA)?.message || 'Unknown error'}</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => refetchAssignments()}>Retry</Button>
          </CardContent>
        </Card>
      )
    }
    if (assignmentsLoading) {
      return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </motion.div>
      )
    }
    if (items.length === 0) {
      return (
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.06]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-slate-400/30 mb-4" />
            <h3 className="text-base font-medium mb-1 text-white">{isStudent ? 'No assignments in your courses' : 'No assignments'}</h3>
            <p className="text-xs text-slate-400">
              {isStudent
                ? 'Assignments published for your enrolled courses will appear here.'
                : search || courseFilter !== 'all' || typeFilter !== 'all' || difficultyFilter !== 'all' || moduleFilter !== 'all'
                  ? 'No assignments match the current filters.'
                  : 'Create your first assignment to get started.'}
            </p>
            {isInstructor && !search && courseFilter === 'all' && (
              <Button size="sm" className="mt-4 gap-1.5 rounded-xl" onClick={() => setShowCreate(true)}>
                <Plus className="w-3.5 h-3.5" /> Create Assignment
              </Button>
            )}
          </CardContent>
        </Card>
      )
    }
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
        {items.map((a: AnyA) => {
          const st = cardState(a)
          const overdue = st.overdue
          const subsCount = a.submissions_count ?? subInfo[Number(a.id)]?.total ?? 0
          const courseName = a.course?.title || getCourseName(Number(a.course_id)) || 'Course'
          const cs = courseStyle(courseName)
          const dm = DIFFICULTY_META[a.difficulty] || DIFFICULTY_META.medium
          const due = dueInLabel(a.due_date)
          const instructorName = a.instructor?.name || 'Unknown'
          const info = subInfo[Number(a.id)]
          const gradedCount = info?.graded ?? 0
          const hasSubs = !!info && info.total > 0
          return (
            <motion.div key={a.id} variants={itemVariants}>
              <Card
                className="group relative overflow-hidden bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border border-white/[0.06] hover:border-[#FF8A36]/30 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
                onClick={() => setSelected(a)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {isInstructor && (
                      <button
                        className="mt-0.5 shrink-0 text-slate-500 hover:text-[#FF8A36]"
                        onClick={(e) => { e.stopPropagation(); toggleSelect(a.id) }}
                        aria-label="Toggle select"
                      >
                        {selectedIds.has(a.id) ? <CheckSquare className="w-4 h-4 text-[#FF8A36]" /> : <Square className="w-4 h-4" />}
                      </button>
                    )}
                    <div className={`w-11 h-11 rounded-xl ${cs.tile} flex items-center justify-center shrink-0`}>
                      {assignmentTypeIcon(a.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-white group-hover:text-[#FF8A36] transition-colors truncate max-w-[340px]">
                              {a.title}
                            </h3>
                            <span className={`text-[9px] font-medium ${dm.cls}`}>● {dm.label}</span>
                            <Badge variant="outline" className={`gap-1 text-[10px] px-2 py-0.5 border-white/[0.08] ${st.color}`}>
                              {st.key === 'active' ? <Timer className="w-3 h-3" /> : st.key === 'graded' ? <Star className="w-3 h-3" /> : st.key === 'late' || st.key === 'overdue' ? <AlertCircle className="w-3 h-3" /> : st.key === 'draft' ? <Pencil className="w-3 h-3" /> : st.key === 'upcoming' ? <CalendarClock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              {st.key.charAt(0).toUpperCase() + st.key.slice(1)}
                            </Badge>
                            {a.status === 'published' ? (
                              <Badge variant="outline" className="gap-1 text-[10px] px-2 py-0.5 border-white/[0.08] text-slate-400">
                                <Eye className="w-3 h-3" /> Published
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-[10px] px-2 py-0.5 border-white/[0.08] text-slate-500">
                                <EyeOff className="w-3 h-3" /> Draft
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${cs.dot} shrink-0`} />
                            {courseName}
                            {a.module?.title && <><span className="text-slate-600">·</span><span className="truncate">{a.module.title}</span></>}
                            {a.assignment_code && <><span className="text-slate-600">·</span><span className="text-slate-500">{a.assignment_code}</span></>}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Separator className="my-3 bg-white/[0.06]" />
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            {overdue ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> : <Clock className="w-3.5 h-3.5" />}
                            <span className={overdue ? 'text-red-400' : ''}>{due ? due.label : 'No due date'}</span>
                          </div>
                          {!isStudent && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              {subsCount} submissions
                              {hasSubs && (
                                <span className="text-slate-500">· {gradedCount}/{info!.total} graded</span>
                              )}
                            </div>
                          )}
                          {isStudent && st.key === 'graded' && (
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-emerald-500" />
                              {myGradeFor(a)} marks
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {(a.max_score ?? a.total_marks ?? 100)} marks
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-[10px] bg-[#FF8A36]/10 text-[#FF8A36]">
                                {instructorName.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-slate-500">{instructorName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] px-2 rounded-lg text-slate-400 hover:text-white"
                            onClick={(e) => { e.stopPropagation(); handleCopyLink(a.id) }}
                          >
                            {copiedId === a.id ? <ClipboardCheck className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                            {copiedId === a.id ? 'Copied' : 'Copy Link'}
                          </Button>
                          {isInstructor ? (
                            <>
                              {st.key === 'draft' && (
                                <Button
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs rounded-xl"
                                  onClick={(e) => { e.stopPropagation(); publishMutation.mutate({ id: a.id, status: 'published' }) }}
                                >
                                  <Rocket className="w-3.5 h-3.5" /> Publish
                                </Button>
                              )}
                              {(hasSubs || st.key !== 'active') && (
                                <Button
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs rounded-xl"
                                  onClick={(e) => { e.stopPropagation(); setSelected(a) }}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  {st.key === 'graded' ? 'Review' : 'Grade'}
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              {st.key === 'graded' ? (
                                <Button
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs rounded-xl"
                                  onClick={(e) => { e.stopPropagation(); setSelected(a) }}
                                >
                                  <Star className="w-3.5 h-3.5" /> View Grade
                                </Button>
                              ) : st.key === 'submitted' || st.key === 'late' ? (
                                <Button
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs rounded-xl"
                                  onClick={(e) => { e.stopPropagation(); setSelected(a) }}
                                >
                                  <History className="w-3.5 h-3.5" /> View Submission
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs rounded-xl"
                                  onClick={(e) => { e.stopPropagation(); setSelected(a) }}
                                >
                                  <FileText className="w-3.5 h-3.5" /> Details
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF8A36]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  function myGradeFor(a: AnyA) {
    const sub = (allSubs || []).find((s: AnyA) => Number(s.assignment_id) === Number(a.id))
    return sub?.grade ?? ''
  }

  function StatSkeleton() {
    return (
      <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-7 w-10 bg-white/5 animate-pulse rounded" />
              <div className="h-3 w-16 bg-white/5 animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  function StatCard({ icon, value, label, iconCls, iconBg }: AnyA) {
    return (
      <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              <span className={iconCls}>{icon}</span>
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-white leading-tight">{value}</div>
              <div className="text-xs text-slate-400 truncate">{label}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Assignments</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isInstructor ? 'Create, publish, review and grade course assignments.' : 'Track and submit your coursework deliverables.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-white/[0.08] gap-1.5 text-xs"
            onClick={() => { refetchAssignments(); if (isInstructor) refetchDashboard(); }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          {isInstructor && (
            <Button className="gap-2 rounded-xl" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Create Assignment
            </Button>
          )}
        </div>
      </motion.div>

      {/* Summary Cards */}
      {isInstructor ? (
        dashboardLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)}
          </div>
        ) : dashboardError ? (
          <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] border border-red-500/20">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <XCircle className="w-10 h-10 text-red-500/60 mb-3" />
              <h3 className="text-sm font-medium mb-1 text-white">Failed to load dashboard</h3>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => refetchDashboard()}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-4">
            <StatCard icon={<ClipboardList className="w-5 h-5" />} value={stats.total} label="Total Assignments" iconCls="text-slate-300" iconBg="bg-white/10" />
            <StatCard icon={<Timer className="w-5 h-5" />} value={stats.active} label="Active" iconCls="text-amber-400" iconBg="bg-amber-500/10" />
            <StatCard icon={<CheckCircle2 className="w-5 h-5" />} value={stats.pending} label="Pending Review" iconCls="text-[#FF8A36]" iconBg="bg-[#FF8A36]/10" />
            <StatCard icon={<Star className="w-5 h-5" />} value={stats.graded} label="Graded" iconCls="text-emerald-400" iconBg="bg-emerald-500/10" />
            <StatCard icon={<AlertCircle className="w-5 h-5" />} value={stats.late} label="Late" iconCls="text-red-400" iconBg="bg-red-500/10" />
            <StatCard icon={<BarChart3 className="w-5 h-5" />} value={stats.avg != null ? `${stats.avg}` : '—'} label={`Avg Score · ${stats.gradingRate ?? 0}% graded`} iconCls="text-sky-400" iconBg="bg-sky-500/10" />
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatCard icon={<ClipboardList className="w-5 h-5" />} value={stats.total} label="Assigned" iconCls="text-slate-300" iconBg="bg-white/10" />
          <StatCard icon={<Timer className="w-5 h-5" />} value={stats.toDo} label="To Do" iconCls="text-amber-400" iconBg="bg-amber-500/10" />
          <StatCard icon={<CheckCircle2 className="w-5 h-5" />} value={stats.submitted} label="Submitted" iconCls="text-[#FF8A36]" iconBg="bg-[#FF8A36]/10" />
          <StatCard icon={<Star className="w-5 h-5" />} value={stats.graded} label="Graded" iconCls="text-emerald-400" iconBg="bg-emerald-500/10" />
          <StatCard icon={<AlertCircle className="w-5 h-5" />} value={stats.late} label="Late" iconCls="text-red-400" iconBg="bg-red-500/10" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} value={`${stats.completion}%`} label={`Avg ${stats.avg ?? '—'} marks`} iconCls="text-sky-400" iconBg="bg-sky-500/10" />
        </div>
      )}

      {/* Upcoming deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-[#FF8A36]" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Upcoming deadlines</h3>
              <span className="text-[10px] text-slate-500">· within 7 days</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {upcomingDeadlines.map((d: AnyA) => {
                const cd = countdownLabel(d.due_date)
                const overdue = isOverdue(d.due_date)
                return (
                  <button
                    key={d.id ?? d.assignment_id ?? String(d.course_id) + d.due_date}
                    onClick={() => {
                      const target = assignments.find((a: AnyA) => Number(a.id) === Number(d.id || d.assignment_id))
                      if (target) setSelected(target)
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all hover:border-[#FF8A36]/30 ${overdue ? 'border-red-500/25 bg-red-500/5' : 'border-white/[0.06] bg-black/20'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${courseStyle(d.course?.title).tile} flex items-center justify-center shrink-0`}>
                      {assignmentTypeIcon(d.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-white truncate max-w-44">{d.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{d.course?.title || ''}</p>
                    </div>
                    <span className={`text-[10px] font-semibold shrink-0 ${overdue ? 'text-red-400' : 'text-amber-300'}`}>{cd}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <ScrollArea className="max-w-full">
          <div className="flex items-center gap-2 bg-black/20 rounded-xl p-1 border border-white/[0.06] w-max">
            {(Object.keys(TAB_META) as TabKey[]).filter((t) => !(t === 'draft' && isStudent)).map((tab) => {
              const meta = TAB_META[tab]
              const Icon = meta.icon
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab ? meta.activeCls : meta.idleCls}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                  <span className="text-[10px] opacity-60 ml-0.5">({tabCount[tab]})</span>
                </button>
              )
            })}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-52 h-9 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05]/50 backdrop-blur-sm text-xs"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-40 h-9 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05]/50 backdrop-blur-sm border-white/[0.08] text-xs text-slate-300">
              <SelectValue placeholder={coursesLoading ? 'Loading courses...' : isStudent ? 'My courses' : 'All courses'} />
            </SelectTrigger>
            <SelectContent className="bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.08] text-slate-300 max-h-64">
              <SelectItem value="all" className="text-xs">All Courses</SelectItem>
              {coursesData?.map((c: AnyA) => (
                <SelectItem key={c.id} value={String(c.id)} className="text-xs">{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isInstructor && (
            <>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-40 h-9 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05]/50 backdrop-blur-sm border-white/[0.08] text-xs text-slate-300">
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.08] text-slate-300 max-h-64">
                  <SelectItem value="all" className="text-xs">All Modules</SelectItem>
                  {filteredModules.map((m: AnyA) => (
                    <SelectItem key={m.id} value={String(m.id)} className="text-xs">{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-28 h-9 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05]/50 backdrop-blur-sm border-white/[0.08] text-xs text-slate-300">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.08] text-slate-300">
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  {Object.entries(TYPE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-28 h-9 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05]/50 backdrop-blur-sm border-white/[0.08] text-xs text-slate-300">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.08] text-slate-300">
                  <SelectItem value="all" className="text-xs">Any Difficulty</SelectItem>
                  {Object.entries(DIFFICULTY_META).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as AnyA)}>
            <SelectTrigger className="w-32 h-9 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05]/50 backdrop-blur-sm border-white/[0.08] text-xs text-slate-300">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.08] text-slate-300">
              <SelectItem value="due_date" className="text-xs">Due date</SelectItem>
              <SelectItem value="title" className="text-xs">Title</SelectItem>
              <SelectItem value="max_score" className="text-xs">Marks</SelectItem>
              <SelectItem value="created_at" className="text-xs">Created</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 rounded-xl border-white/[0.08] p-0"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDir === 'asc' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5 rotate-180" />}
          </Button>
        </div>
      </div>

      {/* Bulk actions */}
      {isInstructor && selectedIds.size > 0 && (
        <Card className="bg-gradient-to-b from-[#0B402C] to-[#042718] border-[#FF8A36]/25">
          <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-white">
              <Filter className="w-3.5 h-3.5 text-[#FF8A36]" />
              <span className="font-medium">{selectedIds.size} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 text-[11px] rounded-xl gap-1.5"
                disabled={bulkPublish.isPending}
                onClick={() => bulkPublish.mutate({ ids: Array.from(selectedIds), status: 'published' })}
              >
                <Rocket className="w-3 h-3" /> Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[11px] rounded-xl border-white/[0.08] gap-1.5"
                disabled={bulkPublish.isPending}
                onClick={() => bulkPublish.mutate({ ids: Array.from(selectedIds), status: 'draft' })}
              >
                <EyeOff className="w-3 h-3" /> Unpublish
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-[11px] rounded-xl gap-1.5"
                disabled={bulkDelete.isPending}
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.size} selected assignments? This cannot be undone.`)) bulkDelete.mutate(Array.from(selectedIds))
                }}
              >
                <Trash2 className="w-3 h-3" /> Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-[11px] rounded-xl text-slate-400"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment List */}
      {renderList(currentList)}

      {/* Create Assignment Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white overflow-hidden max-h-[90vh]">
          <div className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-[#0B402C] via-[#05261A] to-[#042718] px-5 py-4">
            <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-[#FF8A36]/15 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FF8A36]/10 border border-[#FF8A36]/20 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-[#FF8A36]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Create Assignment</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Configure a new assignment for a course.</p>
              </div>
            </div>
          </div>
          <ScrollArea className="max-h-[calc(90vh-90px)]">
            <div className="p-5 space-y-4">
              {/* Live preview */}
              {(() => {
                const selectedCourse = coursesData?.find((c: AnyA) => String(c.id) === createForm.course_id)
                const cs = courseStyle(selectedCourse?.title)
                const dm = DIFFICULTY_META[createForm.difficulty] || DIFFICULTY_META.medium
                const due = dueInLabel(createForm.due_date)
                return (
                  <div className="rounded-xl bg-black/30 border border-white/[0.06] p-3.5">
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Live preview</p>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${cs.tile} flex items-center justify-center shrink-0`}>{assignmentTypeIcon(createForm.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-white truncate">{createForm.title.trim() || 'Untitled assignment'}</p>
                          <span className={`text-[9px] font-medium ${dm.cls}`}>● {dm.label}</span>
                          <span className="text-[9px] font-medium text-sky-400/90 bg-sky-500/10 rounded-full px-1.5 py-0.5">{CATEGORY_LABEL[createForm.category] || createForm.category}</span>
                          <span className={`text-[9px] font-medium ${createForm.status === 'draft' ? 'text-slate-400 bg-white/10' : 'text-emerald-400 bg-emerald-500/10'} rounded-full px-1.5 py-0.5`}>
                            {createForm.schedule_publish && createForm.published_at ? 'Scheduled' : createForm.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                          <span className="truncate">{selectedCourse?.title || 'No course selected'}</span>
                          <span className="text-slate-600">·</span>
                          <span className="shrink-0 text-slate-400">{createForm.max_score || 100} marks</span>
                          <span className="text-slate-600">·</span>
                          <span className="shrink-0 text-slate-400">{SUBMISSION_TYPE_LABEL[createForm.submission_type]}</span>
                        </p>
                      </div>
                      {due && (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-lg shrink-0 ${due.overdue ? 'bg-red-500/10 text-red-400' : 'bg-amber-400/10 text-amber-300'}`}>
                          <CalendarClock className="w-3 h-3" /> {due.label}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Course *</Label>
                  <Select value={createForm.course_id} onValueChange={(v) => setCreateForm({ ...createForm, course_id: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white max-h-64">
                      {coursesData?.map((c: AnyA) => (
                        <SelectItem key={c.id} value={String(c.id)} className="text-xs">{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Module / Class (optional)</Label>
                  <Select value={createForm.module_id} onValueChange={(v) => setCreateForm({ ...createForm, module_id: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white">
                      <SelectValue placeholder="No module" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white max-h-64">
                      <SelectItem value="" className="text-xs">No module</SelectItem>
                      {filteredModules.map((m: AnyA) => (
                        <SelectItem key={m.id} value={String(m.id)} className="text-xs">{m.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Title *</Label>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Week 3: React Hooks"
                  className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Description *</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe the assignment requirements..."
                  className="min-h-20 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Instructions (optional)</Label>
                <Textarea
                  value={createForm.instructions}
                  onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                  placeholder="Step-by-step instructions for students..."
                  className="min-h-20 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Type</Label>
                  <Select value={createForm.type} onValueChange={(v) => setCreateForm({ ...createForm, type: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      {Object.entries(TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Category</Label>
                  <Select value={createForm.category} onValueChange={(v) => setCreateForm({ ...createForm, category: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      {Object.entries(CATEGORY_LABEL).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Difficulty</Label>
                  <Select value={createForm.difficulty} onValueChange={(v) => setCreateForm({ ...createForm, difficulty: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      {Object.entries(DIFFICULTY_META).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Submission</Label>
                  <Select value={createForm.submission_type} onValueChange={(v) => setCreateForm({ ...createForm, submission_type: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      {Object.entries(SUBMISSION_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Due Date *</Label>
                  <Input
                    type="datetime-local"
                    value={createForm.due_date}
                    onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Start Date (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={createForm.start_date}
                    onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Max Marks</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={createForm.max_score}
                    onChange={(e) => setCreateForm({ ...createForm, max_score: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Passing Marks</Label>
                  <Input
                    type="number"
                    min={0}
                    value={createForm.passing_marks}
                    onChange={(e) => setCreateForm({ ...createForm, passing_marks: e.target.value })}
                    placeholder="Optional"
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Est. Minutes</Label>
                  <Input
                    type="number"
                    min={1}
                    value={createForm.estimated_minutes}
                    onChange={(e) => setCreateForm({ ...createForm, estimated_minutes: e.target.value })}
                    placeholder="Optional"
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Max Files</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={createForm.max_files}
                    onChange={(e) => setCreateForm({ ...createForm, max_files: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Max File Size (MB)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={512}
                    value={createForm.max_file_size_mb}
                    onChange={(e) => setCreateForm({ ...createForm, max_file_size_mb: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Attempts</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={createForm.attempts_allowed}
                    onChange={(e) => setCreateForm({ ...createForm, attempts_allowed: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Allowed File Types (comma separated)</Label>
                <Input
                  value={createForm.allowed_file_types}
                  onChange={(e) => setCreateForm({ ...createForm, allowed_file_types: e.target.value })}
                  placeholder="pdf, doc, docx, zip, png, jpg"
                  className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Visibility</Label>
                  <Select value={createForm.visibility} onValueChange={(v) => setCreateForm({ ...createForm, visibility: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      <SelectItem value="all" className="text-xs">All users</SelectItem>
                      <SelectItem value="enrolled" className="text-xs">Enrolled only</SelectItem>
                      <SelectItem value="selected" className="text-xs">Selected students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Late Penalty (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={createForm.late_penalty_percent}
                    onChange={(e) => setCreateForm({ ...createForm, late_penalty_percent: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, allow_late_submission: !createForm.allow_late_submission })}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${createForm.allow_late_submission ? 'border-[#FF8A36]/40 bg-[#FF8A36]/10' : 'border-white/[0.08] bg-black/30 hover:border-white/[0.15]'}`}
                >
                  <span>
                    <span className="block text-xs font-medium text-white">Allow late submission</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">Students may submit after due date</span>
                  </span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${createForm.allow_late_submission ? 'bg-[#FF8A36] border-[#FF8A36] text-[#04130C]' : 'border-white/[0.2]'}`}>
                    {createForm.allow_late_submission && <CheckCircle2 className="w-3 h-3" />}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, is_group_assignment: !createForm.is_group_assignment })}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${createForm.is_group_assignment ? 'border-[#FF8A36]/40 bg-[#FF8A36]/10' : 'border-white/[0.08] bg-black/30 hover:border-white/[0.15]'}`}
                >
                  <span>
                    <span className="block text-xs font-medium text-white">Group assignment</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">Students work in teams</span>
                  </span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${createForm.is_group_assignment ? 'bg-[#FF8A36] border-[#FF8A36] text-[#04130C]' : 'border-white/[0.2]'}`}>
                    {createForm.is_group_assignment && <CheckCircle2 className="w-3 h-3" />}
                  </span>
                </button>
              </div>

              {createForm.is_group_assignment && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Max Group Size</Label>
                  <Input
                    type="number"
                    min={2}
                    value={createForm.max_group_size}
                    onChange={(e) => setCreateForm({ ...createForm, max_group_size: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
              )}

              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, schedule_publish: !createForm.schedule_publish })}
                  className="w-full flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-[#FF8A36]" />
                    <span>
                      <span className="block text-xs font-medium text-white">Schedule publishing</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">Save as draft and publish automatically later</span>
                    </span>
                  </span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${createForm.schedule_publish ? 'bg-[#FF8A36] border-[#FF8A36] text-[#04130C]' : 'border-white/[0.2]'}`}>
                    {createForm.schedule_publish && <CheckCircle2 className="w-3 h-3" />}
                  </span>
                </button>
                {createForm.schedule_publish && (
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-400">Publish At</Label>
                    <Input
                      type="datetime-local"
                      value={createForm.published_at}
                      onChange={(e) => setCreateForm({ ...createForm, published_at: e.target.value })}
                      className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                    />
                  </div>
                )}
                {!createForm.schedule_publish && (
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, status: 'published' })}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium border transition-colors ${createForm.status === 'published' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' : 'border-white/[0.08] bg-black/30 text-slate-400 hover:text-white'}`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Publish now
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, status: 'draft' })}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium border transition-colors ${createForm.status === 'draft' ? 'border-white/20 bg-white/10 text-white' : 'border-white/[0.08] bg-black/30 text-slate-400 hover:text-white'}`}
                    >
                      <EyeOff className="w-3.5 h-3.5" /> Save as draft
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-xl border-white/[0.08]"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-9 text-xs rounded-xl gap-1.5"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Create
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white overflow-hidden max-h-[90vh]">
          <div className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-[#0B402C] via-[#05261A] to-[#042718] px-5 py-4">
            <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-[#FF8A36]/15 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FF8A36]/10 border border-[#FF8A36]/20 flex items-center justify-center shrink-0">
                <Pencil className="w-5 h-5 text-[#FF8A36]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Edit Assignment</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Update assignment configuration.</p>
              </div>
            </div>
          </div>
          <ScrollArea className="max-h-[calc(90vh-90px)]">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Course *</Label>
                  <Select value={editForm.course_id} onValueChange={(v) => setEditForm({ ...editForm, course_id: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white max-h-64">
                      {coursesData?.map((c: AnyA) => (
                        <SelectItem key={c.id} value={String(c.id)} className="text-xs">{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Module / Class</Label>
                  <Select value={editForm.module_id} onValueChange={(v) => setEditForm({ ...editForm, module_id: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white max-h-64">
                      <SelectItem value="" className="text-xs">No module</SelectItem>
                      {filteredModules.map((m: AnyA) => (
                        <SelectItem key={m.id} value={String(m.id)} className="text-xs">{m.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Title *</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Description *</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="min-h-20 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Instructions</Label>
                <Textarea
                  value={editForm.instructions}
                  onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                  className="min-h-20 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Type</Label>
                  <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      {Object.entries(TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Category</Label>
                  <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      {Object.entries(CATEGORY_LABEL).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Difficulty</Label>
                  <Select value={editForm.difficulty} onValueChange={(v) => setEditForm({ ...editForm, difficulty: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      {Object.entries(DIFFICULTY_META).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Submission</Label>
                  <Select value={editForm.submission_type} onValueChange={(v) => setEditForm({ ...editForm, submission_type: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                      {Object.entries(SUBMISSION_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Due Date *</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Max Marks</Label>
                  <Input type="number" min={1} value={editForm.max_score} onChange={(e) => setEditForm({ ...editForm, max_score: e.target.value })} className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Passing Marks</Label>
                  <Input type="number" min={0} value={editForm.passing_marks} onChange={(e) => setEditForm({ ...editForm, passing_marks: e.target.value })} className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Attempts</Label>
                  <Input type="number" min={1} value={editForm.attempts_allowed} onChange={(e) => setEditForm({ ...editForm, attempts_allowed: e.target.value })} className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Max Files</Label>
                  <Input type="number" min={1} value={editForm.max_files} onChange={(e) => setEditForm({ ...editForm, max_files: e.target.value })} className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Max File Size (MB)</Label>
                  <Input type="number" min={1} value={editForm.max_file_size_mb} onChange={(e) => setEditForm({ ...editForm, max_file_size_mb: e.target.value })} className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400">Late Penalty (%)</Label>
                  <Input type="number" min={0} max={100} value={editForm.late_penalty_percent} onChange={(e) => setEditForm({ ...editForm, late_penalty_percent: e.target.value })} className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Allowed File Types (comma separated)</Label>
                <Input
                  value={editForm.allowed_file_types}
                  onChange={(e) => setEditForm({ ...editForm, allowed_file_types: e.target.value })}
                  className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400">Visibility</Label>
                <Select value={editForm.visibility} onValueChange={(v) => setEditForm({ ...editForm, visibility: v })}>
                  <SelectTrigger className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                    <SelectItem value="all" className="text-xs">All users</SelectItem>
                    <SelectItem value="enrolled" className="text-xs">Enrolled only</SelectItem>
                    <SelectItem value="selected" className="text-xs">Selected students</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, allow_late_submission: !editForm.allow_late_submission })}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${editForm.allow_late_submission ? 'border-[#FF8A36]/40 bg-[#FF8A36]/10' : 'border-white/[0.08] bg-black/30'}`}
                >
                  <span>
                    <span className="block text-xs font-medium text-white">Allow late submission</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">Students may submit after due date</span>
                  </span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${editForm.allow_late_submission ? 'bg-[#FF8A36] border-[#FF8A36] text-[#04130C]' : 'border-white/[0.2]'}`}>
                    {editForm.allow_late_submission && <CheckCircle2 className="w-3 h-3" />}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, is_group_assignment: !editForm.is_group_assignment })}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${editForm.is_group_assignment ? 'border-[#FF8A36]/40 bg-[#FF8A36]/10' : 'border-white/[0.08] bg-black/30'}`}
                >
                  <span>
                    <span className="block text-xs font-medium text-white">Group assignment</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">Students work in teams</span>
                  </span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${editForm.is_group_assignment ? 'bg-[#FF8A36] border-[#FF8A36] text-[#04130C]' : 'border-white/[0.2]'}`}>
                    {editForm.is_group_assignment && <CheckCircle2 className="w-3 h-3" />}
                  </span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-white/[0.08]" onClick={() => setShowEdit(false)}>Cancel</Button>
                <Button size="sm" className="h-9 text-xs rounded-xl gap-1.5" onClick={handleEdit} disabled={editMutation.isPending}>
                  {editMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Assignment Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setGradeFor(null); setResourceForm({ title: '', type: 'link', url: '', description: '', file: null }) } }}>
        <DialogContent className="max-w-3xl bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white max-h-[88vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-white flex items-center gap-2 flex-wrap">
                  {selected?.title || 'Assignment Details'}
                  {assignmentDetail?.assignment_code && <span className="text-[10px] text-slate-500 font-normal">{assignmentDetail.assignment_code}</span>}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-1">
                  {getCourseName(selected?.course_id) || selected?.course?.title || ''}
                  {selected?.due_date ? <> &middot; Due {formatDate(selected.due_date)}</> : ''}
                </DialogDescription>
              </div>
              {isInstructor && assignmentDetail && (
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-white/[0.08] gap-1.5" onClick={openEdit}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-white/[0.08] gap-1.5" onClick={() => duplicateMutation.mutate(assignmentDetail.id)} disabled={duplicateMutation.isPending}>
                    <Copy className="w-3 h-3" /> Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 text-xs rounded-xl gap-1.5 ${assignmentDetail.status === 'draft' ? 'border-emerald-400/30 text-emerald-300' : 'border-white/[0.08]'}`}
                    onClick={() => publishMutation.mutate({ id: assignmentDetail.id, status: assignmentDetail.status === 'draft' ? 'published' : 'draft' })}
                    disabled={publishMutation.isPending}
                  >
                    {assignmentDetail.status === 'draft' ? <Rocket className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {assignmentDetail.status === 'draft' ? 'Publish' : 'Unpublish'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5" onClick={() => setShowDelete(true)}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-1">
            {detailLoading ? (
              <div className="space-y-4 py-4">
                <div className="h-4 w-48 bg-white/5 animate-pulse rounded" />
                <div className="h-3 w-full bg-white/5 animate-pulse rounded" />
                <Separator className="bg-white/[0.06]" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                    <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 bg-white/5 animate-pulse rounded" />
                      <div className="h-2.5 w-48 bg-white/5 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : assignmentDetail ? (
              <div className="space-y-5 py-2">
                {/* Meta tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <MetaTile icon={<FileText className="w-3.5 h-3.5" />} label="Type" value={TYPE_LABEL[assignmentDetail.type] || assignmentDetail.type || 'File'} color="text-[#FF8A36]" />
                  <MetaTile icon={<ListChecks className="w-3.5 h-3.5" />} label="Category" value={CATEGORY_LABEL[assignmentDetail.category] || assignmentDetail.category || 'Homework'} color="text-sky-400" />
                  <MetaTile icon={<Target className="w-3.5 h-3.5" />} label="Difficulty" value={DIFFICULTY_META[assignmentDetail.difficulty]?.label || 'Medium'} color="text-amber-400" />
                  <MetaTile icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Marks" value={`${assignmentDetail.max_score ?? 100}${assignmentDetail.passing_marks != null ? ` · pass ${assignmentDetail.passing_marks}` : ''}`} color="text-emerald-400" />
                  <MetaTile icon={<Timer className="w-3.5 h-3.5" />} label="Est. time" value={assignmentDetail.estimated_minutes ? `${assignmentDetail.estimated_minutes} min` : '—'} color="text-sky-400" />
                  <MetaTile icon={<UploadCloud className="w-3.5 h-3.5" />} label="Submission" value={SUBMISSION_TYPE_LABEL[assignmentDetail.submission_type] || 'File upload'} color="text-[#FF8A36]" />
                  <MetaTile icon={<RefreshCw className="w-3.5 h-3.5" />} label="Attempts" value={String(assignmentDetail.attempts_allowed ?? 1)} color="text-amber-400" />
                  <MetaTile icon={assignmentDetail.visibility === 'all' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />} label="Visibility" value={assignmentDetail.visibility || 'all'} color="text-emerald-400" />
                  <MetaTile icon={<AlertCircle className="w-3.5 h-3.5" />} label="Late policy" value={`${assignmentDetail.allow_late_submission ? `Allowed · ${assignmentDetail.late_penalty_percent ?? 0}% penalty` : 'Not allowed'}`} color={assignmentDetail.allow_late_submission ? 'text-amber-400' : 'text-red-400'} />
                  <MetaTile icon={<Clock className="w-3.5 h-3.5" />} label="Due" value={formatDate(assignmentDetail.due_date)} color="text-white" />
                  <MetaTile icon={<Users className="w-3.5 h-3.5" />} label="Module" value={assignmentDetail.module?.title || 'None'} color="text-slate-300" />
                  <MetaTile icon={<Star className="w-3.5 h-3.5" />} label="Status" value={assignmentDetail.status === 'draft' ? 'Draft' : 'Published'} color={assignmentDetail.status === 'draft' ? 'text-slate-400' : 'text-emerald-400'} />
                </div>

                {/* Description / Instructions */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{assignmentDetail.description || 'No description provided.'}</p>
                </div>
                {assignmentDetail.instructions && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Instructions</h4>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-black/20 rounded-xl p-3 border border-white/[0.06]">{assignmentDetail.instructions}</p>
                  </div>
                )}

                {/* Rubric */}
                {Array.isArray(assignmentDetail.rubric) && assignmentDetail.rubric.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rubric</h4>
                    <div className="space-y-2">
                      {assignmentDetail.rubric.map((r: AnyA, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-xl bg-black/20 border border-white/[0.06] px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{r.criterion || r.title || `Criterion ${i + 1}`}</p>
                            {r.description && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{r.description}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-3">
                            <Badge variant="outline" className="text-[10px] border-white/[0.08] text-slate-400">{r.points || r.marks || 0} pts</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructor reminders */}
                {isInstructor && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg border-white/[0.08] gap-1.5" onClick={() => reminderMutation.mutate({ id: assignmentDetail.id, kind: 'due' })} disabled={reminderMutation.isPending}>
                      <Bell className="w-3 h-3" /> Due reminder
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg border-white/[0.08] gap-1.5" onClick={() => reminderMutation.mutate({ id: assignmentDetail.id, kind: 'submission' })} disabled={reminderMutation.isPending}>
                      <Mail className="w-3 h-3" /> Submission reminder
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg border-white/[0.08] gap-1.5" onClick={() => reminderMutation.mutate({ id: assignmentDetail.id, kind: 'grade' })} disabled={reminderMutation.isPending}>
                      <Star className="w-3 h-3" /> Grade published
                    </Button>
                  </div>
                )}

                <Separator className="bg-white/[0.06]" />

                {/* Resources */}
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-[#FF8A36]" />
                    Resources
                    <span className="text-[10px] text-slate-500">({assignmentDetail.resources?.length || 0})</span>
                  </h4>
                  {assignmentDetail.resources?.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {assignmentDetail.resources.map((r: AnyA) => (
                        <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-black/20 border border-white/[0.06] px-3 py-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#FF8A36]/10 text-[#FF8A36] flex items-center justify-center shrink-0">
                              {r.type === 'video' ? <Lightbulb className="w-3.5 h-3.5" /> : r.type === 'link' ? <ExternalLink className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate">{r.title}</p>
                              {r.description && <p className="text-[10px] text-slate-500 truncate">{r.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {r.url && (
                              <a href={r.url} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Open
                              </a>
                            )}
                            {r.file_path && (
                              <a href={r.file_path} target="_blank" rel="noreferrer" className="text-[10px] text-[#FF8A36] hover:underline flex items-center gap-1">
                                <Download className="w-3 h-3" /> Download
                              </a>
                            )}
                            {isInstructor && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-lg text-slate-500 hover:text-red-400"
                                onClick={() => resourceDeleteMutation.mutate({ assignmentId: assignmentDetail.id, resourceId: r.id })}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 bg-black/30 rounded-xl border border-white/[0.06] p-3 mb-3">No resources attached yet.</p>
                  )}

                  {isInstructor && (
                    <div className="rounded-xl bg-black/30 border border-white/[0.06] p-3 space-y-2">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Add resource</p>
                      <Input
                        value={resourceForm.title}
                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                        placeholder="Resource title"
                        className="h-8 rounded-xl bg-black/30 border-white/[0.08] text-[11px] text-white placeholder:text-slate-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={resourceForm.type} onValueChange={(v) => setResourceForm({ ...resourceForm, type: v })}>
                          <SelectTrigger className="h-8 rounded-xl bg-black/30 border-white/[0.08] text-[11px] text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#042718] border-white/[0.08] text-white">
                            <SelectItem value="file" className="text-xs">File</SelectItem>
                            <SelectItem value="link" className="text-xs">Link</SelectItem>
                            <SelectItem value="video" className="text-xs">Video</SelectItem>
                            <SelectItem value="document" className="text-xs">Document</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={resourceForm.url}
                          onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                          placeholder="https://... or leave for file"
                          className="h-8 rounded-xl bg-black/30 border-white/[0.08] text-[11px] text-white placeholder:text-slate-500"
                        />
                      </div>
                      <Input
                        value={resourceForm.description}
                        onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                        placeholder="Short description (optional)"
                        className="h-8 rounded-xl bg-black/30 border-white/[0.08] text-[11px] text-white placeholder:text-slate-500"
                      />
                      <label className="flex items-center gap-2.5 rounded-xl bg-black/30 border border-dashed border-white/[0.12] hover:border-[#FF8A36]/40 transition-colors px-3 py-2 cursor-pointer">
                        <Paperclip className="w-3.5 h-3.5 text-[#FF8A36] shrink-0" />
                        <span className="text-[10px] text-slate-400 truncate">{resourceForm.file ? resourceForm.file.name : 'Attach a file (optional)'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files ? e.target.files[0] : null })}
                        />
                      </label>
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg text-[10px] bg-gradient-to-b from-[#FF8A36] to-[#E86A10] hover:from-[#FF9A4D] hover:to-[#F0731A] text-[#04130C] font-semibold"
                        disabled={!resourceForm.title.trim() || resourceMutation.isPending}
                        onClick={() => resourceMutation.mutate({ assignmentId: assignmentDetail.id, form: resourceForm })}
                      >
                        {resourceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add Resource
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Submissions */}
                {isInstructor ? (
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-3 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#FF8A36]" />
                        Submissions ({assignmentDetail.submissions?.length || 0})
                      </span>
                      {assignmentDetail.submissions?.length > 0 && (
                        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5 rounded-lg border-white/[0.08] gap-1.5" onClick={handleDownloadCSV}>
                          <Download className="w-3 h-3" /> Export CSV
                        </Button>
                      )}
                    </h4>
                    {assignmentDetail.submissions?.length > 0 ? (
                      <div className="space-y-2">
                        {assignmentDetail.submissions.map((sub: AnyA) => {
                          const pct = sub.grade != null ? Math.round((sub.grade / (assignmentDetail.max_score || 100)) * 1000) / 10 : null
                          return (
                            <div key={sub.id} className="bg-black/20 rounded-xl p-3.5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <ProfileAvatar src={sub.user?.avatar || null} name={sub.user?.name || '?'} size="xs" className="shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-white truncate">{sub.user?.name || 'Unknown'}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      <span className="text-[10px] text-slate-500">
                                        Attempt {sub.attempt_number || 1} · Submitted {formatDateRelative(sub.submitted_at || sub.created_at)}
                                      </span>
                                      {sub.is_late && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Late</Badge>}
                                      {sub.graded_at && <span className="text-[10px] text-emerald-400/80">Graded {formatDateRelative(sub.graded_at)}</span>}
                                    </div>
                                    {(sub.file_url || sub.file_urls?.length || sub.url) && (
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {sub.url && <a href={sub.url} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-300 hover:underline flex items-center gap-0.5"><ExternalLink className="w-3 h-3" /> Link</a>}
                                        {(sub.file_urls || (sub.file_url ? [sub.file_url] : [])).map((f: string, i: number) => (
                                          <a key={i} href={f} target="_blank" rel="noreferrer" className="text-[10px] text-[#FF8A36] hover:underline flex items-center gap-0.5"><FileText className="w-3 h-3" /> File {i + 1}</a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1.5">
                                  {sub.grade != null ? (
                                    <div className="text-right">
                                      <div className="flex items-center gap-1.5">
                                        <Star className="w-3 h-3 text-emerald-500" />
                                        <span className="text-sm font-bold text-emerald-400">{sub.grade}/{assignmentDetail.max_score ?? 100}</span>
                                        {pct != null && <span className="text-[10px] text-slate-400">({pct}%)</span>}
                                        {pct != null && <span className="text-[10px] font-bold text-[#FF8A36]">{letterGrade(pct)}</span>}
                                      </div>
                                      <div className="flex items-center gap-2 justify-end mt-0.5">
                                        {sub.graded_by?.name && <span className="text-[9px] text-slate-500">by {sub.graded_by.name}</span>}
                                        {isInstructor && (
                                          <button className="text-[9px] text-slate-500 hover:text-[#FF8A36] underline" onClick={() => {
                                            setGradeFor({ ...sub, assignment_id: assignmentDetail.id, max_score: assignmentDetail.max_score ?? 100, passing_marks: assignmentDetail.passing_marks, rubric: assignmentDetail.rubric, title: assignmentDetail.title })
                                            setGradeForm({ grade: String(sub.grade), feedback: sub.feedback || '', is_penalty_applied: !!sub.is_penalty_applied })
                                          }}>Edit</button>
                                        )}
                                      </div>
                                      {sub.feedback && <p className="text-[10px] text-slate-400 mt-0.5 max-w-52 text-right line-clamp-2">{sub.feedback}</p>}
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="h-7 gap-1 text-[10px] rounded-lg"
                                      onClick={() => {
                                        setGradeFor({ ...sub, assignment_id: assignmentDetail.id, max_score: assignmentDetail.max_score ?? 100, passing_marks: assignmentDetail.passing_marks, rubric: assignmentDetail.rubric, title: assignmentDetail.title })
                                        setGradeForm({ grade: '', feedback: '', is_penalty_applied: false })
                                      }}
                                    >
                                      <Star className="w-3 h-3" /> Grade
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {sub.text && <p className="text-[11px] text-slate-400 mt-2 border-l-2 border-[#FF8A36]/30 pl-2 line-clamp-3">“{sub.text}”</p>}
                              {sub.notes && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">Note: {sub.notes}</p>}
                              {sub.versions?.length > 1 && (
                                <div className="mt-2">
                                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Version history</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {sub.versions.map((v: AnyA) => (
                                      <span key={v.id} className="text-[9px] text-slate-500 bg-white/[0.04] rounded-md px-1.5 py-0.5">v{v.version_number} {v.submitted_at ? formatDateRelative(v.submitted_at) : ''}{v.is_late ? ' · late' : ''}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-black/20 rounded-xl p-6 text-center">
                        <FileText className="w-8 h-8 text-slate-400/30 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No submissions yet.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#FF8A36]" />
                      My submission
                    </h4>
                    {mySubmission ? (
                      <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4">
                        {mySubmission.grade != null ? (
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${Math.min(100, mySubmission.percentage ?? 0)}%`, backgroundColor: (mySubmission.percentage ?? 0) >= 80 ? '#34d399' : (mySubmission.percentage ?? 0) >= 50 ? '#fbbf24' : '#f87171' }}
                                />
                              </div>
                              <span className="text-[13px] font-bold text-white shrink-0">{mySubmission.grade}/{assignmentDetail.max_score ?? 100}</span>
                              <span className="text-[11px] font-bold text-[#FF8A36] shrink-0">{mySubmission.letter_grade || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-slate-500">Score {mySubmission.percentage ?? 0}%{assignmentDetail.passing_marks != null ? ` · pass at ${assignmentDetail.passing_marks} marks` : ''}</span>
                              <Badge variant={mySubmission.percentage >= 50 ? 'success' : 'destructive'} className="text-[9px] px-1.5">
                                {mySubmission.percentage >= 50 ? 'Passed' : 'Not passed'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-amber-300 flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin" /> Awaiting review
                          </p>
                        )}
                        {mySubmission.is_late && <p className="text-[10px] text-red-400 mt-2">Submitted late</p>}
                        {mySubmission.feedback && (
                          <p className="text-[10px] text-slate-300 mt-2 border-l-2 border-[#FF8A36]/30 pl-2">“{mySubmission.feedback}”</p>
                        )}
                        {(mySubmission.file_urls?.length || mySubmission.file_url || mySubmission.url || mySubmission.text) && (
                          <div className="mt-3 space-y-1.5">
                            {mySubmission.text && <p className="text-[11px] text-slate-400 bg-black/30 rounded-lg p-2">“{mySubmission.text}”</p>}
                            <div className="flex items-center gap-2 flex-wrap">
                              {mySubmission.url && <a href={mySubmission.url} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Submitted link</a>}
                              {(mySubmission.file_urls || (mySubmission.file_url ? [mySubmission.file_url] : [])).map((f: string, i: number) => (
                                <a key={i} href={f} target="_blank" rel="noreferrer" className="text-[10px] text-[#FF8A36] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" /> File {i + 1}</a>
                              ))}
                            </div>
                          </div>
                        )}
                        {mySubmission.versions?.length > 1 && (
                          <div className="mt-3">
                            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Version history</p>
                            <div className="space-y-1.5">
                              {mySubmission.versions.map((v: AnyA) => (
                                <div key={v.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span className="w-5 h-5 rounded-md bg-[#FF8A36]/10 text-[#FF8A36] flex items-center justify-center text-[9px] font-bold shrink-0">v{v.version_number}</span>
                                  <span className="truncate">{v.submitted_at ? formatDateRelative(v.submitted_at) : 'Submitted'}{v.is_late ? ' · late' : ''}</span>
                                  {(v.url || v.file_urls?.length) && (
                                    <a href={v.url || v.file_urls?.[0]} target="_blank" rel="noreferrer" className="text-cyan-300 shrink-0 ml-auto"><ExternalLink className="w-3 h-3" /></a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {mySubmission.grade == null && (
                          <Button
                            size="sm"
                            className="mt-3 h-8 gap-1.5 text-[11px] rounded-lg"
                            onClick={() => {
                              setSubmitFor({
                                ...assignmentDetail,
                                my_submission: mySubmission,
                                attempts_left: Math.max(0, (assignmentDetail.attempts_allowed ?? 1) - (mySubmission.attempt_number || 0)),
                              })
                              setSubmitText(''); setSubmitUrl(''); setSubmitNotes(''); setSubmitFiles([])
                            }}
                          >
                            <RefreshCw className="w-3 h-3" /> Resubmit
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4 text-center">
                        <FileText className="w-8 h-8 text-slate-400/30 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 mb-3">You haven't submitted this assignment yet.</p>
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 text-[11px] rounded-lg"
                          onClick={() => {
                            setSubmitFor({ ...assignmentDetail, my_submission: null, attempts_left: assignmentDetail.attempts_allowed ?? 1 })
                            setSubmitText(''); setSubmitUrl(''); setSubmitNotes(''); setSubmitFiles([])
                          }}
                        >
                          <UploadCloud className="w-3 h-3" /> Submit Assignment
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <Separator className="bg-white/[0.06]" />

                {/* Comments */}
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#FF8A36]" />
                    Discussion ({assignmentDetail.comments?.length || 0})
                  </h4>
                  {assignmentDetail.comments?.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {assignmentDetail.comments.map((c: AnyA) => (
                        <div key={c.id} className="rounded-xl bg-black/20 border border-white/[0.06] p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <ProfileAvatar src={c.user?.avatar || null} name={c.user?.name || '?'} size="xs" />
                              <div>
                                <p className="text-[11px] font-medium text-white">{c.user?.name || 'Unknown'}</p>
                                <p className="text-[9px] text-slate-500">{formatDateRelative(c.created_at)}</p>
                              </div>
                            </div>
                            {c.user_id === user?.id && (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg text-slate-500 hover:text-red-400" onClick={() => assignmentsAPI.deleteComment(c.assignment_id, c.id).then(() => { invalidateAll(); toast.success('Comment deleted') })}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-2">{c.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 bg-black/30 rounded-xl border border-white/[0.06] p-3 mb-3">No discussion yet.</p>
                  )}
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-16 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500 resize-none flex-1"
                    />
                    <Button
                      size="sm"
                      className="h-9 gap-1.5 rounded-xl shrink-0"
                      disabled={!commentText.trim() || commentMutation.isPending}
                      onClick={() => commentMutation.mutate(assignmentDetail.id)}
                    >
                      {commentMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">Failed to load details.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={!!gradeFor} onOpenChange={(open) => { if (!open) setGradeFor(null) }}>
        <DialogContent className="max-w-md bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-400" />
              Grade Submission
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {gradeFor?.user?.name || 'Student'} · {gradeFor?.title || ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const max = gradeFor?.max_score || 100
              const val = Number(gradeForm.grade)
              const pct = !isNaN(val) && gradeForm.grade !== '' ? Math.round((val / max) * 1000) / 10 : null
              return (
                <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Score</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={max}
                        autoFocus
                        value={gradeForm.grade}
                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                        className="h-9 w-24 text-center text-sm font-bold rounded-xl bg-black/40 border-white/[0.08] text-white"
                      />
                      <span className="text-sm text-slate-400">/ {max}</span>
                    </div>
                  </div>
                  {pct != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden mr-3">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171' }} />
                      </div>
                      <span className="text-sm font-bold text-white shrink-0">{pct}%</span>
                      <span className={`text-sm font-bold ml-2 shrink-0 ${pct >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{letterGrade(pct)}</span>
                    </div>
                  )}
                  {gradeFor?.passing_marks != null && pct != null && (
                    <p className={`text-[10px] ${val >= gradeFor.passing_marks ? 'text-emerald-400' : 'text-red-400'}`}>
                      {val >= gradeFor.passing_marks ? 'Passing' : 'Below passing'} · pass mark {gradeFor.passing_marks}
                    </p>
                  )}
                </div>
              )
            })()}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-400">Feedback</Label>
              <Textarea
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                placeholder="Write feedback for the student..."
                className="min-h-24 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setGradeForm({ ...gradeForm, is_penalty_applied: !gradeForm.is_penalty_applied })}
              className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${gradeForm.is_penalty_applied ? 'border-[#FF8A36]/40 bg-[#FF8A36]/10' : 'border-white/[0.08] bg-black/30'}`}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>
                  <span className="block text-xs font-medium text-white">Apply late penalty</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Score already reflects the late deduction</span>
                </span>
              </span>
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${gradeForm.is_penalty_applied ? 'bg-[#FF8A36] border-[#FF8A36] text-[#04130C]' : 'border-white/[0.2]'}`}>
                {gradeForm.is_penalty_applied && <CheckCircle2 className="w-3 h-3" />}
              </span>
            </button>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-white/[0.08]" onClick={() => setGradeFor(null)}>Cancel</Button>
              <Button
                size="sm"
                className="h-9 text-xs rounded-xl gap-1.5"
                disabled={gradeMutation.isPending || !gradeForm.grade}
                onClick={() => gradeMutation.mutate({
                  assignmentId: gradeFor.assignment_id,
                  submissionId: gradeFor.id,
                  grade: Number(gradeForm.grade),
                  feedback: gradeForm.feedback,
                  is_penalty_applied: gradeForm.is_penalty_applied,
                })}
              >
                {gradeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                Save Grade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Dialog (student) */}
      <Dialog open={!!submitFor} onOpenChange={(open) => { if (!open) setSubmitFor(null) }}>
        <DialogContent className="max-w-lg bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#FF8A36]" />
              Submit Assignment
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {submitFor?.title || ''} · Due {submitFor?.due_date ? formatDate(submitFor.due_date) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const overdue = isOverdue(submitFor?.due_date)
              const attemptsLeft = submitFor?.attempts_left ?? (submitFor?.my_submission ? Math.max(0, (submitFor.attempts_allowed ?? 1) - (submitFor.my_submission.attempt_number || 0)) : (submitFor?.attempts_allowed ?? 1))
              const blockedLate = overdue && !submitFor?.allow_late_submission
              const attemptsExhausted = attemptsLeft <= 0
              const maxFiles = submitFor?.max_files ?? 1
              const maxSize = submitFor?.max_file_size_mb ?? 20
              const allowed = Array.isArray(submitFor?.allowed_file_types) ? submitFor.allowed_file_types : []
              const st = submitFor?.submission_type || 'upload'
              return (
                <>
                  <div className="rounded-xl bg-black/30 border border-white/[0.06] p-3.5 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="gap-1 text-[10px] border-white/[0.08] text-slate-400">
                        <RefreshCw className="w-3 h-3" /> Attempts left: {attemptsLeft}
                      </Badge>
                      {overdue ? (
                        <Badge variant="destructive" className="gap-1 text-[10px]">
                          <AlertCircle className="w-3 h-3" /> Past due
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-[10px] border-white/[0.08] text-slate-400">
                          <Clock className="w-3 h-3" /> {countdownLabel(submitFor?.due_date)}
                        </Badge>
                      )}
                      {submitFor?.allow_late_submission && submitFor?.late_penalty_percent != null && Number(submitFor.late_penalty_percent) > 0 && (
                        <Badge variant="outline" className="gap-1 text-[10px] border-amber-400/25 text-amber-300">
                          <AlertTriangle className="w-3 h-3" /> {submitFor.late_penalty_percent}% late penalty
                        </Badge>
                      )}
                    </div>
                    {blockedLate && (
                      <p className="text-[10px] text-red-400 bg-red-500/10 rounded-lg p-2">Late submissions are not allowed for this assignment.</p>
                    )}
                    {attemptsExhausted && !blockedLate && (
                      <p className="text-[10px] text-red-400 bg-red-500/10 rounded-lg p-2">You have reached the maximum number of attempts for this assignment.</p>
                    )}
                  </div>

                  {(st === 'text' || st === 'multiple') && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-400">Your answer</Label>
                      <Textarea
                        value={submitText}
                        onChange={(e) => setSubmitText(e.target.value)}
                        placeholder="Write your answer here..."
                        className="min-h-28 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500 resize-none"
                      />
                    </div>
                  )}

                  {(st === 'url' || st === 'multiple') && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-400">Submission link</Label>
                      <Input
                        type="url"
                        value={submitUrl}
                        onChange={(e) => setSubmitUrl(e.target.value)}
                        placeholder="https://..."
                        className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
                      />
                    </div>
                  )}

                  {(st === 'upload' || st === 'multiple') && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-400">Files (max {maxFiles}, {maxSize}MB each{allowed.length ? ` · ${allowed.join(', ')}` : ''})</Label>
                      <div
                        className={`rounded-xl border border-dashed p-4 text-center transition-colors cursor-pointer ${dragOver ? 'border-[#FF8A36]/60 bg-[#FF8A36]/10' : 'border-white/[0.12] hover:border-[#FF8A36]/40 bg-black/30'}`}
                        onClick={() => submitFileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragOver(false)
                          const files = Array.from(e.dataTransfer.files || [])
                          setSubmitFiles((prev) => [...prev, ...files].slice(0, maxFiles))
                        }}
                      >
                        <UploadCloud className={`w-6 h-6 mx-auto mb-1.5 ${dragOver ? 'text-[#FF8A36]' : 'text-slate-500'}`} />
                        <p className="text-[11px] text-slate-400">Drag &amp; drop files here, or click to browse</p>
                        <p className="text-[9px] text-slate-600 mt-1">You can add up to {maxFiles} file(s)</p>
                        <input
                          ref={submitFileRef}
                          type="file"
                          multiple={maxFiles > 1}
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            setSubmitFiles((prev) => [...prev, ...files].slice(0, maxFiles))
                            if (e.target) e.target.value = ''
                          }}
                        />
                      </div>
                      {submitFiles.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {submitFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-black/30 border border-white/[0.06] px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-[#FF8A36] shrink-0" />
                                <span className="text-[11px] text-slate-300 truncate">{f.name}</span>
                                <span className="text-[9px] text-slate-500 shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                              </div>
                              <button className="text-slate-500 hover:text-red-400 shrink-0" onClick={() => setSubmitFiles((prev) => prev.filter((_, j) => j !== i))}>
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-400">Notes to instructor (optional)</Label>
                    <Textarea
                      value={submitNotes}
                      onChange={(e) => setSubmitNotes(e.target.value)}
                      placeholder="Any notes for the reviewer..."
                      className="min-h-16 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-white/[0.08]" onClick={() => setSubmitFor(null)}>Cancel</Button>
                    <Button
                      size="sm"
                      className="h-9 text-xs rounded-xl gap-1.5"
                      disabled={
                        submitMutation.isPending ||
                        blockedLate ||
                        attemptsExhausted ||
                        (submitFiles.length === 0 && !submitText.trim() && !submitUrl.trim())
                      }
                      onClick={() => submitMutation.mutate({ assignmentId: submitFor.id })}
                    >
                      {submitMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Submit
                    </Button>
                  </div>
                </>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-sm bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              Delete Assignment
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to delete <span className="text-white font-medium">{selected?.title}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-white/[0.08]" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" className="h-9 text-xs rounded-xl gap-1.5" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetaTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-black/20 border border-white/[0.06] px-3 py-2">
      <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
        <span className={color}>{icon}</span> {label}
      </p>
      <p className={`text-[11px] font-medium truncate ${color}`}>{value}</p>
    </div>
  )
}
