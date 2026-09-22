'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Loader2, RotateCcw, BookOpen, History } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { blogAPI } from '@/lib/api'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import toast from 'react-hot-toast'

interface PostOption { id: number; title: string; status: string }
interface RevisionRow {
  id: number
  revision: number
  title: string
  status: string
  change_note: string | null
  created_at: string | null
  creator?: { id: number; name: string } | null
}

export default function BlogRevisionsPage() {
  const [posts, setPosts] = useState<PostOption[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [revisions, setRevisions] = useState<RevisionRow[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingRevisions, setLoadingRevisions] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<RevisionRow | null>(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    blogAPI.getAll({ per_page: 100 })
      .then((res) => {
        const raw = res.data?.data
        setPosts(Array.isArray(raw?.data) ? raw.data : [])
        if (raw?.data?.length) setSelectedId(String(raw.data[0].id))
      })
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoadingPosts(false))
  }, [])

  const fetchRevisions = useCallback(async (id: string) => {
    if (!id) return
    setLoadingRevisions(true)
    try {
      const res = await blogAPI.getRevisions(Number(id))
      setRevisions(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch {
      setRevisions([])
      toast.error('Failed to load revisions')
    } finally {
      setLoadingRevisions(false)
    }
  }, [])

  useEffect(() => { if (selectedId) fetchRevisions(selectedId) }, [selectedId, fetchRevisions])

  const handleRestore = async () => {
    if (!restoreTarget || !selectedId) return
    setRestoring(true)
    try {
      await blogAPI.restoreRevision(Number(selectedId), restoreTarget.revision)
      toast.success(`Restored to revision ${restoreTarget.revision}`)
      setRestoreTarget(null)
      fetchRevisions(selectedId)
    } catch { toast.error('Failed to restore revision') }
    finally { setRestoring(false) }
  }

  const selectedPost = posts.find((p) => String(p.id) === selectedId)

  return (
    <div>
      <PageHeader title="Post Revisions" subtitle="Browse and restore snapshots of article content" backHref="/dashboard/blog" />

      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white border border-[#E9E7F5] p-4">
          <div className="w-9 h-9 rounded-lg bg-[#F3EEFF] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-[#6D3DF5]" />
          </div>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full max-w-sm h-9 text-xs bg-white border border-[#E9E7F5] text-[#0F1B3D]">
              <SelectValue placeholder={loadingPosts ? 'Loading posts...' : 'Select a post'} />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E9E7F5]">
              {posts.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
          {selectedPost && <StatusBadge status={selectedPost.status} />}
        </motion.div>

        {loadingRevisions ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" /></div>
        ) : revisions.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#E9E7F5] rounded-2xl text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mx-auto mb-3">
              <GitBranch className="w-7 h-7 text-[#6D3DF5]" />
            </div>
            <p className="text-sm font-semibold text-[#0F1B3D] mb-1">No revisions yet</p>
            <p className="text-xs text-[#536078]">Revisions are created each time you save or publish a post.</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {revisions.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-2xl bg-white border border-[#E9E7F5] p-4 hover:border-[#6D3DF5]/20 transition-colors">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-[#F3EEFF] border border-[#E9E7F5] flex items-center justify-center">
                    <History className="w-4 h-4 text-[#6D3DF5]" />
                  </div>
                  {i < revisions.length - 1 && <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-2 bg-[#E9E7F5]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F1B3D]">r{r.revision}</span>
                    <span className="text-xs text-[#536078] truncate">{r.title}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.change_note && <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{r.change_note}</p>}
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                    {r.creator?.name ? ` · ${r.creator.name}` : ''}
                  </p>
                </div>
                <button onClick={() => setRestoreTarget(r)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-semibold text-[#536078] border border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5] hover:bg-[#F3EEFF] transition-all shrink-0">
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!restoreTarget} onOpenChange={(o) => !o && setRestoreTarget(null)}>
        <DialogContent className="bg-white border border-[#E9E7F5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm">Restore Revision</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Restore &ldquo;{selectedPost?.title}&rdquo; to revision {restoreTarget?.revision}? The current state will be saved as a new revision before restoring.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setRestoreTarget(null)} className="h-8 px-4 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:bg-[#F8F7FC] transition-colors">Cancel</button>
            <button onClick={handleRestore} disabled={restoring} className="h-8 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white disabled:opacity-50">
              {restoring ? 'Restoring...' : 'Restore'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
