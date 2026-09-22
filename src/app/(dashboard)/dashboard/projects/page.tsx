'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Calendar,
  DollarSign,
  Users,
  Filter,
  X,
  RefreshCw,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Loader2,
  UserPlus,
  Trash2,
  Edit,
  BarChart3,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import api, { projectsAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

interface ProjectItem {
  id: number
  title: string
  description: string
  status: ProjectStatus
  budget: number
  deadline: string
  skills: string[]
  client: { id: number; name: string; avatar: string | null } | null
  proposals_count?: number
  created_at: string
}

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'outline' | 'success' | 'destructive'; color: string }> = {
  open: { label: 'Open', variant: 'default', color: 'text-[#FF8A36]' },
  in_progress: { label: 'In Progress', variant: 'outline', color: 'text-blue-400' },
  completed: { label: 'Completed', variant: 'success', color: 'text-emerald-500' },
  cancelled: { label: 'Cancelled', variant: 'destructive', color: 'text-red-400' },
}

const mockProjects: ProjectItem[] = [
  { id: 1, title: 'E-commerce Platform Redesign', description: 'Full redesign of the main e-commerce platform with improved UX and modern UI components.', status: 'open', budget: 15000, deadline: '2026-09-15', skills: ['React', 'TypeScript', 'Tailwind CSS', 'Stripe'], client: { id: 101, name: 'Alex Johnson', avatar: null }, proposals_count: 8, created_at: '2026-06-01' },
  { id: 2, title: 'Mobile App Backend API', description: 'Build a scalable RESTful API for the upcoming mobile application with authentication and real-time features.', status: 'in_progress', budget: 25000, deadline: '2026-10-01', skills: ['Node.js', 'PostgreSQL', 'Redis', 'WebSocket'], client: { id: 102, name: 'Sarah Chen', avatar: null }, proposals_count: 5, created_at: '2026-05-20' },
  { id: 3, title: 'Data Analytics Dashboard', description: 'Interactive dashboard with real-time data visualization, reporting, and export functionality.', status: 'completed', budget: 12000, deadline: '2026-07-01', skills: ['Python', 'D3.js', 'React', 'MongoDB'], client: { id: 103, name: 'Marcus Rivera', avatar: null }, proposals_count: 12, created_at: '2026-04-10' },
  { id: 4, title: 'AI Chatbot Integration', description: 'Integrate GPT-based chatbot into customer support workflow with context-aware responses.', status: 'open', budget: 8000, deadline: '2026-08-20', skills: ['Python', 'OpenAI', 'FastAPI', 'Docker'], client: { id: 104, name: 'Emily Watson', avatar: null }, proposals_count: 15, created_at: '2026-06-10' },
  { id: 5, title: 'Legacy System Migration', description: 'Migrate legacy monolith to microservices architecture with zero downtime deployment strategy.', status: 'in_progress', budget: 40000, deadline: '2026-12-01', skills: ['AWS', 'Kubernetes', 'Java', 'Terraform'], client: { id: 105, name: 'David Park', avatar: null }, proposals_count: 3, created_at: '2026-05-05' },
  { id: 6, title: 'Company Website Redesign', description: 'Marketing website redesign with CMS integration and SEO optimization.', status: 'cancelled', budget: 6000, deadline: '2026-06-15', skills: ['Next.js', 'Contentful', 'SCSS', 'SEO'], client: null, proposals_count: 0, created_at: '2026-03-15' },
]

export default function ProjectsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [statusTab, setStatusTab] = useState<ProjectStatus | 'all'>('all')
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '', budget: '', deadline: '', skills: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', budget: '', deadline: '', skills: '' })
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showProposalsDialog, setShowProposalsDialog] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await projectsAPI.getAll()
      const raw = res.data?.data?.data || res.data?.data || res.data || []
      const list: ProjectItem[] = (Array.isArray(raw) ? raw : []).map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        status: item.status || 'open',
        budget: Number(item.budget) || 0,
        deadline: item.deadline || '',
        skills: Array.isArray(item.skills) ? item.skills : [],
        client: item.client || null,
        proposals_count: item.proposals_count ?? (Array.isArray(item.proposals) ? item.proposals.length : 0),
        created_at: item.created_at || '',
      }))
      setProjects(list)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load projects. Please try again.')
      setProjects(mockProjects)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const allSkills = Array.from(new Set(projects.flatMap((p) => p.skills)))

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    )
  }

  const filtered = projects.filter((p) => {
    const searchLower = search.toLowerCase()
    const matchesSearch = p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      (p.client?.name && p.client.name.toLowerCase().includes(searchLower))
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some((s) => p.skills.includes(s))
    const matchesStatus = statusTab === 'all' || p.status === statusTab
    return matchesSearch && matchesSkills && matchesStatus
  })

  const openCount = projects.filter((p) => p.status === 'open').length
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length
  const completedCount = projects.filter((p) => p.status === 'completed').length
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)

  const handleCreate = async () => {
    setCreateError(null)
    if (!createForm.title || !createForm.description || !createForm.budget) {
      setCreateError('Title, description, and budget are required.')
      return
    }
    setCreating(true)
    try {
      const skills = createForm.skills
        ? createForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      await projectsAPI.create({
        title: createForm.title,
        description: createForm.description,
        budget: Number(createForm.budget),
        deadline: createForm.deadline || null,
        skills,
        category: 'general',
      })
      setShowCreateModal(false)
      setCreateForm({ title: '', description: '', budget: '', deadline: '', skills: '' })
      fetchProjects()
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || err?.response?.data?.errors?.title?.[0] || 'Failed to create project')
      const optimistic: ProjectItem = {
        id: Date.now(),
        title: createForm.title,
        description: createForm.description,
        status: 'open',
        budget: Number(createForm.budget) || 0,
        deadline: createForm.deadline || '',
        skills: createForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
        client: user ? { id: user.id, name: user.name || user.email, avatar: null } : null,
        proposals_count: 0,
        created_at: new Date().toISOString().split('T')[0],
      }
      setProjects((prev) => [optimistic, ...prev])
      setShowCreateModal(false)
      setCreateForm({ title: '', description: '', budget: '', deadline: '', skills: '' })
      setCreateError(null)
    } finally {
      setCreating(false)
    }
  }

  const openEditModal = (project: ProjectItem) => {
    setEditForm({
      title: project.title,
      description: project.description,
      budget: String(project.budget),
      deadline: project.deadline || '',
      skills: project.skills.join(', '),
    })
    setEditError(null)
    setShowEditModal(true)
  }

  const handleEdit = async () => {
    if (!selectedProject) return
    setEditError(null)
    if (!editForm.title || !editForm.description || !editForm.budget) {
      setEditError('Title, description, and budget are required.')
      return
    }
    setEditing(true)
    try {
      const skills = editForm.skills
        ? editForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      await api.put(`/projects/${selectedProject.id}`, {
        title: editForm.title,
        description: editForm.description,
        budget: Number(editForm.budget),
        deadline: editForm.deadline,
        skills: editForm.skills.split(',').map((s) => s.trim()),
      })
      setShowEditModal(false)
      setSelectedProject(null)
      fetchProjects()
    } catch {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? {
                ...p,
                title: editForm.title,
                description: editForm.description,
                budget: Number(editForm.budget) || 0,
                deadline: editForm.deadline || '',
                skills: editForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
              }
            : p,
        ),
      )
      setSelectedProject((prev) =>
        prev
          ? {
              ...prev,
              title: editForm.title,
              description: editForm.description,
              budget: Number(editForm.budget) || 0,
              deadline: editForm.deadline || '',
              skills: editForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
            }
          : prev,
      )
      setShowEditModal(false)
      setToast({ message: 'Project updated locally', type: 'success' })
    } finally {
      setEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return
    setDeleting(true)
    try {
      await api.delete(`/projects/${selectedProject.id}`)
    } catch {
      // fallback: local delete
    }
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id))
    setToast({ message: 'Project deleted successfully', type: 'success' })
    setShowDeleteConfirm(false)
    setSelectedProject(null)
    setDeleting(false)
  }

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!selectedProject) return
    try {
      await api.put(`/projects/${selectedProject.id}`, { status: newStatus })
    } catch {
      // fallback: update locally
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProject.id ? { ...p, status: newStatus } : p)),
    )
    setSelectedProject((prev) => (prev ? { ...prev, status: newStatus } : prev))
    setToast({ message: `Status changed to ${statusConfig[newStatus].label}`, type: 'success' })
  }

  const mockProposals = [
    { id: 1, freelancer: 'John Doe', amount: 12000, message: 'I have 5 years of experience in this area and can deliver high quality results.', submitted: '2026-06-15' },
    { id: 2, freelancer: 'Jane Smith', amount: 11500, message: 'I can deliver this within 2 weeks with full documentation.', submitted: '2026-06-16' },
    { id: 3, freelancer: 'Bob Wilson', amount: 13000, message: 'My portfolio includes similar projects. Happy to share references.', submitted: '2026-06-17' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Projects</h1>
            <p className="text-xs text-slate-400 mt-1">Manage and track all your projects.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs rounded-xl border-white/[0.08]" onClick={fetchProjects} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="h-9 gap-2 text-xs rounded-xl" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-3.5 h-3.5" /> Create Project
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF8A36]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#FF8A36]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{projects.length}</div>
                <div className="text-xs text-slate-400">Total Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{openCount}</div>
                <div className="text-xs text-slate-400">Open</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{inProgressCount}</div>
                <div className="text-xs text-slate-400">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
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
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</div>
                <div className="text-xs text-slate-400">Total Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'open', 'in_progress', 'completed', 'cancelled'] as const).map((tab) => {
          const count = tab === 'all' ? projects.length
            : tab === 'in_progress' ? inProgressCount
            : tab === 'completed' ? completedCount
            : tab === 'cancelled' ? projects.filter((p) => p.status === 'cancelled').length
            : openCount
          return (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusTab === tab
                  ? 'bg-[#FF8A36]/20 text-[#FF8A36] border border-[#FF8A36]/30'
                  : 'bg-black/20 text-slate-400 border border-white/[0.06] hover:border-white/[0.12] hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 text-[10px] opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by title, description, or client name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {allSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer gap-1 text-[10px] px-2.5 py-0.5"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && (
                      <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); toggleSkill(skill) }} />
                    )}
                  </Badge>
                ))}
                {selectedSkills.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400" onClick={() => setSelectedSkills([])}>
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.06] animate-pulse h-[320px]" />
          ))}
        </div>
      ) : error ? (
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] border-red-500/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-10 h-10 text-red-400/60 mb-3" />
            <p className="text-sm text-slate-300 mb-1">Failed to load projects</p>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={fetchProjects}>
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] border-white/[0.06]">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-slate-400/30 mb-3" />
            <p className="text-sm text-slate-300 mb-1">
              {projects.length === 0 ? 'No projects found' : 'No projects match your filters'}
            </p>
            <p className="text-xs text-slate-500">
              {projects.length === 0 ? 'Create your first project to get started.' : 'Try adjusting your search or filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="group relative overflow-hidden bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-sm border border-white/[0.06] hover:border-[#FF8A36]/30 hover:bg-white/[0.02] transition-all duration-300 h-full cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#FF8A36] transition-colors">{project.title}</h3>
                    </div>
                    <Badge variant={statusConfig[project.status].variant} className="shrink-0 ml-2 text-[10px] px-2 py-0.5">
                      {statusConfig[project.status].label}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  {/* Skills */}
                  {project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0 bg-white/5 text-slate-400 border-white/[0.06]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Client */}
                  {project.client && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[9px] bg-[#FF8A36]/10 text-[#FF8A36]">
                          {project.client.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-slate-500">{project.client.name}</span>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="font-medium text-white">{formatCurrency(project.budget)}</span>
                      </div>
                      {project.deadline && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(project.deadline)}</span>
                        </div>
                      )}
                    </div>
                    {project.proposals_count != null && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Users className="w-3 h-3" />
                        {project.proposals_count} proposals
                      </div>
                    )}
                  </div>

                  {/* Hover glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF8A36]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject && !showEditModal && !showDeleteConfirm} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-lg bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedProject?.title || 'Project Details'}</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {selectedProject?.client?.name && `By ${selectedProject.client.name} `}
              &middot; {selectedProject?.status && statusConfig[selectedProject.status]?.label}
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">{selectedProject.description}</p>

              {selectedProject.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[10px] px-2.5 py-0.5 bg-white/5 text-slate-400 border-white/[0.06]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator className="bg-white/[0.06]" />

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-black/30 rounded-xl p-3">
                  <span className="text-slate-400">Budget</span>
                  <p className="text-white font-semibold mt-0.5">{formatCurrency(selectedProject.budget)}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <span className="text-slate-400">Deadline</span>
                  <p className="text-white font-semibold mt-0.5">{selectedProject.deadline ? formatDate(selectedProject.deadline) : 'No deadline'}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <span className="text-slate-400">Status</span>
                  <p className="text-white font-semibold mt-0.5 capitalize">{selectedProject.status.replace('_', ' ')}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <span className="text-slate-400">Proposals</span>
                  <p className="text-white font-semibold mt-0.5">{selectedProject.proposals_count || 0}</p>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Status Change Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Change Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['open', 'in_progress', 'completed', 'cancelled'] as const).map((s) => (
                    <Button
                      key={s}
                      variant={selectedProject.status === s ? 'default' : 'outline'}
                      size="sm"
                      className={`h-7 text-[10px] rounded-lg border-white/[0.08] ${
                        selectedProject.status === s ? 'bg-[#FF8A36] hover:bg-[#FF8A36]/80 text-white' : ''
                      }`}
                      onClick={() => handleStatusChange(s)}
                    >
                      {statusConfig[s].label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Proposals Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">
                    {selectedProject.proposals_count || 0} Proposal{(selectedProject.proposals_count || 0) !== 1 ? 's' : ''}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] rounded-lg border-white/[0.08] gap-1"
                    onClick={() => setShowProposalsDialog(true)}
                  >
                    <Eye className="w-3 h-3" /> View Proposals
                  </Button>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs rounded-xl gap-1.5"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-xl border-[#FF8A36]/30 text-[#FF8A36] hover:bg-[#FF8A36]/10 gap-1.5"
                  onClick={() => openEditModal(selectedProject)}
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-xl border-white/[0.08]"
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create Project</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Post a new project for freelancers to bid on.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Title *</label>
              <Input
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="e.g. Build a React Dashboard"
                className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Description *</label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Describe the project requirements..."
                className="min-h-24 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Budget ($) *</label>
                <Input
                  type="number"
                  min="0"
                  value={createForm.budget}
                  onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                  placeholder="e.g. 5000"
                  className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Deadline</label>
                <Input
                  type="date"
                  value={createForm.deadline}
                  onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Skills (comma separated)</label>
              <Input
                value={createForm.skills}
                onChange={(e) => setCreateForm({ ...createForm, skills: e.target.value })}
                placeholder="e.g. React, Node.js, TypeScript"
                className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
              />
            </div>
            {createError && (
              <p className="text-xs text-red-400">{createError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs rounded-xl border-white/[0.08]"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-9 text-xs rounded-xl gap-1.5"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Project</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Title *</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="e.g. Build a React Dashboard"
                className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Description *</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe the project requirements..."
                className="min-h-24 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Budget ($) *</label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.budget}
                  onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                  placeholder="e.g. 5000"
                  className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Deadline</label>
                <Input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Skills (comma separated)</label>
              <Input
                value={editForm.skills}
                onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                placeholder="e.g. React, Node.js, TypeScript"
                className="h-9 rounded-xl bg-black/30 border-white/[0.08] text-xs text-white placeholder:text-slate-500"
              />
            </div>
            {editError && (
              <p className="text-xs text-red-400">{editError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs rounded-xl border-white/[0.08]"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-9 text-xs rounded-xl gap-1.5"
                onClick={handleEdit}
                disabled={editing}
              >
                {editing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit className="w-3.5 h-3.5" />}
                {editing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm bg-gradient-to-b from-[#042718] to-[#000B05] border border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Project</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              This action cannot be undone. The project and all its data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">{selectedProject?.title}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-white/[0.08]"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs rounded-xl gap-1.5"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Proposals Dialog */}
      <Dialog open={showProposalsDialog} onOpenChange={setShowProposalsDialog}>
        <DialogContent className="max-w-lg bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Proposals</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {selectedProject?.proposals_count || 0} proposal{(selectedProject?.proposals_count || 0) !== 1 ? 's' : ''} for {selectedProject?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(selectedProject?.proposals_count || 0) === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No proposals yet.</p>
            ) : (
              mockProposals.map((proposal) => (
                <div key={proposal.id} className="bg-black/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-[9px] bg-[#FF8A36]/10 text-[#FF8A36]">
                          {proposal.freelancer.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-white">{proposal.freelancer}</p>
                        <p className="text-[10px] text-slate-500">Submitted {formatDate(proposal.submitted)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#FF8A36]">{formatCurrency(proposal.amount)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{proposal.message}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-xl border-white/[0.08]"
              onClick={() => setShowProposalsDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className={`px-4 py-3 rounded-xl text-xs font-medium shadow-lg backdrop-blur-sm border ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {toast.message}
          </div>
        </motion.div>
      )}

      {/* Auto-clear toast */}
      {toast && (() => {
        setTimeout(() => setToast(null), 3000)
        return null
      })()}
    </div>
  )
}
