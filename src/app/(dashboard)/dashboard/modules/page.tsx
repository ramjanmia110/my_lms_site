'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Layers, Plus, Search, Trash2, Edit3, Loader2, X, BookOpen,
  GraduationCap, ListChecks, ChevronRight, Save,
} from 'lucide-react'
import { modulesAPI, coursesAPI } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CourseOption {
  id: number
  title: string
}

interface CourseModule {
  id: number
  course_id: number | null
  title: string
  description: string | null
  order: number
  lessons_count?: number
  course?: { id: number; title: string } | null
  created_at?: string
}

interface FormState {
  course_id: string
  title: string
  description: string
  order: string
}

const cardBase = 'rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.06]'

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3.5 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.06] ${color}`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center mb-2.5">
        <Icon size={15} className="text-slate-300" />
      </div>
      <div className="text-xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
    </motion.div>
  )
}

const emptyForm: FormState = { course_id: '', title: '', description: '', order: '' }

export default function ModulesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isManager = user?.role === 'admin' || user?.role === 'instructor'

  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<CourseModule[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<CourseModule | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchModules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await modulesAPI.getAll({ search: search || undefined, course_id: courseFilter || undefined })
      const list = res.data?.data ?? []
      setModules(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }, [search, courseFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchModules(), search || courseFilter ? 250 : 0)
    return () => clearTimeout(t)
  }, [fetchModules])

  useEffect(() => {
    coursesAPI.getAll({ per_page: 200 })
      .then((r) => {
        const raw = r.data?.data
        const list = Array.isArray(raw) ? raw : raw?.data || []
        setCourses(list.map((c: any) => ({ id: c.id, title: c.title })))
      })
      .catch(() => setCourses([]))
  }, [])

  const stats = useMemo(() => {
    const totalLessons = modules.reduce((s, m) => s + (m.lessons_count || 0), 0)
    const courseCount = new Set(modules.map((m) => m.course_id).filter(Boolean)).size
    return { modules: modules.length, lessons: totalLessons, courses: courseCount }
  }, [modules])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, course_id: courses[0] ? String(courses[0].id) : '' })
    setDialogOpen(true)
  }

  const openEdit = (m: CourseModule) => {
    setEditing(m)
    setForm({
      course_id: m.course_id ? String(m.course_id) : '',
      title: m.title,
      description: m.description || '',
      order: m.order !== undefined ? String(m.order) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.course_id) return toast.error('Select a course')
    if (!form.title.trim()) return toast.error('Module title is required')
    setSaving(true)
    try {
      const payload = {
        course_id: Number(form.course_id),
        title: form.title.trim(),
        description: form.description.trim() || null,
        order: form.order !== '' ? Number(form.order) : undefined,
      }
      if (editing) {
        await modulesAPI.update(editing.id, payload)
        toast.success('Module updated')
      } else {
        await modulesAPI.create(payload)
        toast.success('Module created')
      }
      setDialogOpen(false)
      fetchModules()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save module')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (m: CourseModule) => {
    if (!window.confirm(`Delete module "${m.title}"? Its lessons will be unassigned.`)) return
    setDeletingId(m.id)
    try {
      await modulesAPI.delete(m.id)
      toast.success('Module deleted')
      fetchModules()
    } catch {
      toast.error('Failed to delete module')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return modules.filter((m) => {
      if (courseFilter && String(m.course_id) !== courseFilter) return false
      if (!q) return true
      return [m.title, m.course?.title, m.description].some((f) => f?.toLowerCase().includes(q))
    })
  }, [modules, search, courseFilter])

  return (
    <div className="space-y-5">
      {/* Header + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#FF8A36]/10 border border-[#FF8A36]/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-[#FF8A36]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight">Course Modules</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Organize course lessons into modules</p>
          </div>
        </div>
        {isManager && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-sm"
          >
            <Plus size={11} /> Create Module
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Layers} label="Total Modules" value={stats.modules} color="" />
        <StatCard icon={ListChecks} label="Lessons in Modules" value={stats.lessons} color="" />
        <StatCard icon={GraduationCap} label="Courses With Modules" value={stats.courses} color="" />
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/30 transition-colors"
          />
        </div>
        <div className="w-56">
          <Select value={courseFilter || 'all'} onValueChange={(v) => setCourseFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button onClick={() => router.push('/dashboard/courses')} className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors">
          Manage courses <ChevronRight size={12} />
        </button>
      </div>

      {/* Modules table */}
      <div className="rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers size={14} className="text-emerald-400" />
            All Modules ({filtered.length})
          </h2>
          <span className="text-[10px] text-slate-500">{isManager ? 'You can create, edit and delete' : 'View only'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.05] text-slate-500">
                <th className="text-left px-5 py-3 font-semibold">Module</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Course</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Order</th>
                <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Lessons</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500"><Loader2 size={16} className="animate-spin inline-block mr-2" />Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Layers size={28} className="text-slate-400/40 mb-2" />
                      <p className="text-xs text-slate-500">{search || courseFilter ? 'No matching modules' : 'No modules yet. Create your first module to organize lessons.'}</p>
                      {isManager && !search && !courseFilter && (
                        <button onClick={openCreate} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-sm">
                          <Plus size={11} /> Create Module
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FF8A36]/10 border border-[#FF8A36]/15 flex items-center justify-center shrink-0">
                          <Layers size={13} className="text-[#FF8A36]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-[18rem]">{m.title}</p>
                          {m.description && (
                            <p className="text-[10px] text-slate-500 truncate max-w-[18rem]">{m.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-emerald-400/80">{m.course?.title || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-slate-400">#{m.order ?? 0}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 text-[10px]">
                        <BookOpen size={10} className="text-slate-500" /> {m.lessons_count ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isManager ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors" title="Edit">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDelete(m)} disabled={deletingId === m.id} className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors" title="Delete">
                            {deletingId === m.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600">Read only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Module' : 'Create Module'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the module details below.' : 'Add a new module to group lessons within a course.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Course *</label>
              <Select value={form.course_id} onValueChange={(v) => setForm((f) => ({ ...f, course_id: v }))}>
                <SelectTrigger className="h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 && <SelectItem value="" disabled>No courses available</SelectItem>}
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Module Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Getting Started with React"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What does this module cover?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/30 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Order</label>
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                placeholder="Auto (next available)"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/30 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setDialogOpen(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
              <X size={11} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-sm disabled:opacity-60">
              {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} {editing ? 'Save Changes' : 'Create Module'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
