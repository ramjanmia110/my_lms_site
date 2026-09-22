'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, Plus, Trash2, Copy, ExternalLink, Loader2, BookOpen, Eye, Pencil, CalendarClock,
} from 'lucide-react'
import { blogAPI } from '@/lib/api'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Pagination } from '@/components/content/Pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface PostRow {
  id: number
  title: string
  slug: string
  status: string
  views_count: number
  revision: number
  featured: boolean
  published_at: string | null
  category?: { id: number; name: string } | null
  author?: { id: number; name: string } | null
  user?: { id: number; name: string } | null
}

const statusOptions = ['draft', 'review', 'scheduled', 'published', 'archived']

export function PostsTable({ defaultStatus }: { defaultStatus?: string }) {
  const router = useRouter()
  const [posts, setPosts] = useState<PostRow[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(defaultStatus || '')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<PostRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await blogAPI.getAll({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 12,
      })
      const data = res.data?.data
      setPosts(Array.isArray(data?.data) ? data.data : [])
      setPage(data?.current_page || 1)
      setLastPage(data?.last_page || 1)
      setTotal(data?.total || 0)
      if (res.data?.counts) setCounts(res.data.counts)
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        try {
          const pubRes = await blogAPI.getPublic({ page, per_page: 12 })
          const pubData = pubRes.data?.data
          setPosts(Array.isArray(pubData?.data) ? pubData.data : [])
          setPage(pubData?.current_page || 1)
          setLastPage(pubData?.last_page || 1)
          setTotal(pubData?.total || 0)
        } catch {
          setError('You do not have permission to manage posts, or the service is unavailable.')
        }
      } else {
        setError('Failed to load posts. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => {
    const t = setTimeout(() => fetchPosts(), search ? 250 : 0)
    return () => clearTimeout(t)
  }, [fetchPosts])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await blogAPI.delete(deleteTarget.id)
      toast.success('Post deleted')
      setDeleteTarget(null)
      fetchPosts()
    } catch {
      toast.error('Failed to delete post')
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async (p: PostRow) => {
    try {
      const res = await blogAPI.duplicate(p.id)
      toast.success('Post duplicated')
      router.push(`/dashboard/blog/${res.data?.data?.id || ''}`)
    } catch {
      toast.error('Failed to duplicate post')
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536078]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts by title or slug..."
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
              {statusOptions.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Link
          href="/dashboard/blog/new"
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> New Post
        </Link>
      </div>

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

      {/* Error */}
      {error && !loading && (
        <div className="bg-white border border-[#E9E7F5] rounded-2xl p-10 text-center">
          <p className="text-sm text-[#536078] mb-4">{error}</p>
          <button onClick={fetchPosts} className="h-9 px-5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-[#E9E7F5] rounded-2xl flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
            <p className="text-xs text-[#536078]">Loading posts...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden"
        >
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-7 h-7 text-[#6D3DF5]" />
              </div>
              <p className="text-sm font-semibold text-[#0F1B3D] mb-1">No posts yet</p>
              <p className="text-xs text-[#536078]">Create your first blog post to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E9E7F5] bg-[#F8F7FC] text-[10px] uppercase tracking-widest text-[#536078]">
                    <th className="px-5 py-3 font-semibold">Post</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Author</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Views</th>
                    <th className="px-5 py-3 font-semibold text-right">Rev</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-b border-[#E9E7F5]/60 last:border-0 hover:bg-[#F8F7FC] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#F3EEFF] border border-[#E9E7F5] flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-[#6D3DF5]" />
                          </div>
                          <div className="min-w-0">
                            <Link href={`/dashboard/blog/${p.id}`} className="text-xs font-semibold text-[#0F1B3D] hover:text-[#6D3DF5] transition-colors block truncate max-w-[220px]">
                              {p.featured && <span className="text-[#F59E0B] mr-1">★</span>}
                              {p.title}
                            </Link>
                            <span className="text-[10px] text-[#94A3B8] truncate block max-w-[220px]">/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#536078]">
                        {p.category?.name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#3478F6] text-[10px] font-medium">{p.category.name}</span>
                        ) : <span className="text-[#94A3B8]">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#536078]">{p.author?.name || p.user?.name || <span className="text-[#94A3B8]">—</span>}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={p.status} />
                          {p.status === 'scheduled' && p.published_at && (
                            <span className="flex items-center gap-0.5 text-[10px] text-[#3478F6]" title={new Date(p.published_at).toLocaleString()}>
                              <CalendarClock className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#536078] text-right">
                        <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-[#94A3B8]" />{p.views_count?.toLocaleString() || 0}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#94A3B8] text-right font-mono">r{p.revision}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => router.push(`/dashboard/blog/${p.id}`)} title="Edit" className="p-1.5 rounded-lg text-[#536078] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDuplicate(p)} title="Duplicate" className="p-1.5 rounded-lg text-[#536078] hover:text-[#3478F6] hover:bg-[#EEF4FF] transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {p.status === 'published' && (
                            <Link href={`/blog/${p.slug}`} target="_blank" title="View public" className="p-1.5 rounded-lg text-[#536078] hover:text-[#18A878] hover:bg-[#ECFBF5] transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button onClick={() => setDeleteTarget(p)} title="Delete" className="p-1.5 rounded-lg text-[#536078] hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {posts.length > 0 && (
            <div className="px-5 py-3 border-t border-[#E9E7F5]">
              <Pagination page={page} lastPage={lastPage} total={total} onPageChange={setPage} />
            </div>
          )}
        </motion.div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="bg-white border border-[#E9E7F5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm">Delete Post</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setDeleteTarget(null)} className="h-8 px-4 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:bg-[#F8F7FC] transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="h-8 px-4 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
