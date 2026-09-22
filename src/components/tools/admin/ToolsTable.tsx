'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, Plus, Trash2, Copy, ExternalLink, Loader2, Wrench, Eye, Zap, Pencil,
  RefreshCw, AlertCircle, BarChart3, Package, ArrowUpRight, LayoutGrid, List,
} from 'lucide-react'
import { toolsAPI } from '@/lib/api'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Pagination } from '@/components/content/Pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface ToolRow {
  id: number
  title: string
  slug: string
  status: string
  visibility: string
  views_count: number
  usage_count: number
  version: number
  published_at: string | null
  category?: { id: number; name: string } | null
  tags?: { id: number; name: string }[]
  user?: { id: number; name: string } | null
}

export function ToolsTable({ defaultStatus }: { defaultStatus?: string }) {
  const router = useRouter()
  const [tools, setTools] = useState<ToolRow[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(defaultStatus || '')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<ToolRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const fetchTools = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await toolsAPI.getAll({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 12,
      })
      const data = res.data?.data
      setTools(Array.isArray(data?.data) ? data.data : [])
      setPage(data?.current_page || 1)
      setLastPage(data?.last_page || 1)
      setTotal(data?.total || 0)
      if (res.data?.counts) setCounts(res.data.counts)
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        try {
          const pubRes = await toolsAPI.getPublic({
            search: search || undefined,
            status: status || undefined,
            page,
            per_page: 12,
          })
          const pubData = pubRes.data?.data
          setTools(Array.isArray(pubData?.data) ? pubData.data : [])
          setPage(pubData?.current_page || 1)
          setLastPage(pubData?.last_page || 1)
          setTotal(pubData?.total || 0)
        } catch {
          setError('You do not have permission to view tools, or the tools service is unavailable.')
        }
      } else {
        setError('Failed to load tools. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => {
    const t = setTimeout(() => fetchTools(), search ? 250 : 0)
    return () => clearTimeout(t)
  }, [fetchTools])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await toolsAPI.delete(deleteTarget.id)
      toast.success('Tool deleted')
      setDeleteTarget(null)
      fetchTools()
    } catch {
      toast.error('Failed to delete tool')
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async (t: ToolRow) => {
    try {
      const res = await toolsAPI.duplicate(t.id)
      toast.success('Tool duplicated')
      router.push(`/dashboard/tools/${res.data?.data?.id || ''}`)
    } catch {
      toast.error('Failed to duplicate tool')
    }
  }

  const totalViews = tools.reduce((s, t) => s + (t.views_count || 0), 0)
  const totalUses = tools.reduce((s, t) => s + (t.usage_count || 0), 0)
  const publishedCount = counts.published || tools.filter((t) => t.status === 'published').length
  const draftCount = counts.draft || tools.filter((t) => t.status === 'draft').length

  return (
    <div className="space-y-5">
      {/* Summary stat tiles */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Total Tools', value: total || tools.length, icon: Package, color: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]' },
          { label: 'Published', value: publishedCount, icon: ArrowUpRight, color: 'text-[#18A878]', bg: 'bg-[#ECFBF5]' },
          { label: 'Drafts', value: draftCount, icon: LayoutGrid, color: 'text-[#3478F6]', bg: 'bg-[#EEF4FF]' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E9E7F5] rounded-xl p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F1B3D] leading-none">{s.value}</p>
              <p className="text-[10px] text-[#536078] mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-2.5"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536078]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools by title, slug, or description..."
            className="w-full pl-9 pr-3 h-9 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors"
          />
        </div>
        {!defaultStatus && (
          <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="h-9 w-[140px] rounded-xl bg-white border border-[#E9E7F5] text-[11px] text-[#0F1B3D]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E9E7F5]">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="flex rounded-lg overflow-hidden border border-[#E9E7F5] bg-white">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#536078] hover:text-[#0F1B3D]'}`}
            title="Table view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#536078] hover:text-[#0F1B3D]'}`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
        <Link
          href="/dashboard/tools/new"
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> New Tool
        </Link>
      </motion.div>

      {/* Counts */}
      {Object.keys(counts).length > 0 && (
        <div className="flex flex-wrap gap-2 text-[11px] text-[#536078]">
          {Object.entries(counts).map(([k, v]) => (
            <span key={k} className="px-2.5 py-1 rounded-lg bg-white border border-[#E9E7F5] capitalize">
              {k}: <span className="text-[#0F1B3D] font-semibold">{v}</span>
            </span>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E9E7F5] rounded-2xl p-10 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-[#6D3DF5]" />
          </div>
          <h3 className="text-base font-semibold text-[#0F1B3D] mb-1">Unable to load tools</h3>
          <p className="text-sm text-[#536078] mb-5 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchTools}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
              <p className="text-xs text-[#536078]">Loading tools...</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tools.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E9E7F5] rounded-2xl p-14 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-[#6D3DF5]" />
          </div>
          <h3 className="text-base font-semibold text-[#0F1B3D] mb-1">No tools yet</h3>
          <p className="text-sm text-[#536078] mb-5 max-w-sm mx-auto">
            Create your first interactive tool to embed in courses and lessons.
          </p>
          <Link
            href="/dashboard/tools/new"
            className="inline-flex items-center gap-1.5 h-9 px-5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Create Tool
          </Link>
        </motion.div>
      )}

      {/* Table View */}
      {!loading && !error && tools.length > 0 && viewMode === 'table' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E9E7F5] bg-[#F8F7FC] text-[10px] uppercase tracking-widest text-[#536078]">
                  <th className="px-5 py-3 font-semibold">Tool</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Visibility</th>
                  <th className="px-5 py-3 font-semibold text-right">Views</th>
                  <th className="px-5 py-3 font-semibold text-right">Uses</th>
                  <th className="px-5 py-3 font-semibold text-right">Ver</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t, idx) => (
                  <tr key={t.id} className="border-b border-[#E9E7F5]/60 last:border-0 hover:bg-[#F8F7FC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#F3EEFF] border border-[#E9E7F5] flex items-center justify-center shrink-0">
                          <Wrench className="w-4 h-4 text-[#6D3DF5]" />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/dashboard/tools/${t.id}`} className="text-xs font-semibold text-[#0F1B3D] hover:text-[#6D3DF5] transition-colors block truncate max-w-[220px]">
                            {t.title}
                          </Link>
                          <span className="text-[10px] text-[#94A3B8] truncate block max-w-[220px]">/{t.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#536078]">
                      {t.category?.name ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#3478F6] text-[10px] font-medium">
                          {t.category.name}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-[#536078] capitalize">{t.visibility}</td>
                    <td className="px-5 py-3.5 text-xs text-[#536078] text-right">
                      <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-[#94A3B8]" />{t.views_count?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#536078] text-right">
                      <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3 text-[#94A3B8]" />{t.usage_count?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#94A3B8] text-right font-mono">v{t.version}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/dashboard/tools/${t.id}`)} title="Edit" className="p-1.5 rounded-lg text-[#536078] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDuplicate(t)} title="Duplicate" className="p-1.5 rounded-lg text-[#536078] hover:text-[#3478F6] hover:bg-[#EEF4FF] transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {t.status === 'published' && (
                          <Link href={`/tools/${t.slug}`} target="_blank" title="View public" className="p-1.5 rounded-lg text-[#536078] hover:text-[#18A878] hover:bg-[#ECFBF5] transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button onClick={() => setDeleteTarget(t)} title="Delete" className="p-1.5 rounded-lg text-[#536078] hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[#E9E7F5]">
            <Pagination page={page} lastPage={lastPage} total={total} onPageChange={setPage} />
          </div>
        </motion.div>
      )}

      {/* Grid View */}
      {!loading && !error && tools.length > 0 && viewMode === 'grid' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {tools.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -2 }}
              className="bg-white border border-[#E9E7F5] rounded-2xl p-4 group cursor-pointer hover:border-[#6D3DF5]/30 hover:shadow-lg hover:shadow-[#6D3DF5]/5 transition-all"
              onClick={() => router.push(`/dashboard/tools/${t.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#6D3DF5]" />
                </div>
                <StatusBadge status={t.status} />
              </div>
              <h3 className="text-sm font-semibold text-[#0F1B3D] truncate mb-0.5 group-hover:text-[#6D3DF5] transition-colors">{t.title}</h3>
              <p className="text-[10px] text-[#94A3B8] truncate mb-3">/{t.slug}</p>
              {t.category?.name && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#3478F6] text-[10px] font-medium mb-3">
                  {t.category.name}
                </span>
              )}
              <div className="flex items-center gap-4 text-[10px] text-[#536078] pt-3 border-t border-[#E9E7F5]/60">
                <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-[#94A3B8]" />{t.views_count || 0}</span>
                <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3 text-[#94A3B8]" />{t.usage_count || 0}</span>
                <span className="ml-auto font-mono text-[#94A3B8]">v{t.version}</span>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-2 border-t border-[#E9E7F5]/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleDuplicate(t) }} className="p-1 rounded-md text-[#536078] hover:text-[#3478F6] hover:bg-[#EEF4FF] transition-colors" title="Duplicate">
                  <Copy className="w-3 h-3" />
                </button>
                {t.status === 'published' && (
                  <Link href={`/tools/${t.slug}`} target="_blank" onClick={(e) => e.stopPropagation()} className="p-1 rounded-md text-[#536078] hover:text-[#18A878] hover:bg-[#ECFBF5] transition-colors" title="View public">
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(t) }} className="p-1 rounded-md text-[#536078] hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3">
            <Pagination page={page} lastPage={lastPage} total={total} onPageChange={setPage} />
          </div>
        </motion.div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="bg-white border border-[#E9E7F5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm">Delete Tool</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-8 px-4 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:bg-[#F8F7FC] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 px-4 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
