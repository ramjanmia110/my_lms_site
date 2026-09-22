'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Save, Send, Loader2, History, ExternalLink, BookOpen, ImagePlus, X,
} from 'lucide-react'
import { RichTextEditor } from '@/components/blog/RichTextEditor'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { blogAPI, uploadAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface CategoryOption { id: number; name: string }
interface TagOption { id: number; name: string }
interface AuthorOption { id: number; name: string }

const statusOptions = ['draft', 'review', 'scheduled', 'published', 'archived']

export function PostEditor({ postId: initialPostId }: { postId?: number }) {
  const router = useRouter()
  const [postId, setPostId] = useState(initialPostId)
  const [loading, setLoading] = useState(!!initialPostId)
  const [saving, setSaving] = useState(false)
  const [savingPublish, setSavingPublish] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [wasPublished, setWasPublished] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [categoryId, setCategoryId] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [publishedAt, setPublishedAt] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [changeNote, setChangeNote] = useState('')
  const [revision, setRevision] = useState(1)

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [tags, setTags] = useState<TagOption[]>([])
  const [authors, setAuthors] = useState<AuthorOption[]>([])

  const loadOptions = useCallback(async () => {
    try {
      const [catRes, tagRes, authorRes] = await Promise.all([
        blogAPI.categories.getAll({ per_page: 200 }),
        blogAPI.tags.getAll({ per_page: 200 }),
        blogAPI.authors.getAll({ per_page: 200 }),
      ])
      const catRaw = catRes.data?.data
      setCategories(Array.isArray(catRaw) ? catRaw : catRaw?.data || [])
      const tagRaw = tagRes.data?.data
      setTags(Array.isArray(tagRaw) ? tagRaw : tagRaw?.data || [])
      const authorRaw = authorRes.data?.data
      setAuthors(Array.isArray(authorRaw) ? authorRaw : authorRaw?.data || [])
    } catch {
      try {
        const [catRes, tagRes, authorRes] = await Promise.all([
          blogAPI.getPublicCategories(),
          blogAPI.getPublicTags(),
          blogAPI.getPublicAuthors(),
        ])
        const catRaw = catRes.data?.data
        setCategories(Array.isArray(catRaw) ? catRaw : catRaw?.data || [])
        const tagRaw = tagRes.data?.data
        setTags(Array.isArray(tagRaw) ? tagRaw : tagRaw?.data || [])
        const authorRaw = authorRes.data?.data
        setAuthors(Array.isArray(authorRaw) ? authorRaw : authorRaw?.data || [])
      } catch {}
    }
  }, [])

  useEffect(() => { loadOptions() }, [loadOptions])

  useEffect(() => {
    if (!postId) return
    setLoading(true)
    blogAPI.getOne(postId)
      .then((res) => {
        const p = res.data?.data
        if (!p) return
        setTitle(p.title || '')
        setSlug(p.slug || '')
        setSlugEdited(!!p.slug)
        setExcerpt(p.excerpt || '')
        setContent(p.content || '')
        setStatus(p.status || 'draft')
        setWasPublished(p.status === 'published')
        setCategoryId(p.blog_category_id ? String(p.blog_category_id) : '')
        setAuthorId(p.blog_author_id ? String(p.blog_author_id) : '')
        setTagIds((p.tags || []).map((t: any) => String(t.id)))
        setCoverImage(p.cover_image || '')
        setFeatured(!!p.featured)
        setPublishedAt(p.published_at ? p.published_at.slice(0, 16) : '')
        setSeoTitle(p.seo_title || '')
        setMetaDescription(p.meta_description || '')
        setRevision(p.revision || 1)
      })
      .catch(() => toast.error('Failed to load post'))
      .finally(() => setLoading(false))
  }, [postId])

  const isScheduled = publishedAt !== '' && new Date(publishedAt) > new Date()

  const buildPayload = (targetStatus: string) => ({
    title,
    slug: slug.trim() || undefined,
    excerpt,
    content,
    status: targetStatus,
    blog_category_id: categoryId && categoryId !== 'none' ? Number(categoryId) : null,
    blog_author_id: authorId && authorId !== 'none' ? Number(authorId) : null,
    tag_ids: tagIds.map(Number),
    cover_image: coverImage || null,
    featured,
    published_at: targetStatus === 'scheduled' || targetStatus === 'published' ? (publishedAt || null) : null,
    seo_title: seoTitle || null,
    meta_description: metaDescription || null,
    change_note: changeNote || null,
  })

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'cover')
      const res = await uploadAPI.upload(fd)
      const url = res.data?.data?.url || res.data?.url
      if (url) { setCoverImage(url); toast.success('Cover image uploaded') }
      else toast.error('Upload failed')
    } catch { toast.error('Upload failed') }
    finally { setUploadingCover(false); e.target.value = '' }
  }

  const save = async (publish: boolean) => {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (publish && !confirmDialog) { setConfirmDialog(true); return }
    const target = publish ? (isScheduled ? 'scheduled' : 'published') : status === 'published' ? 'published' : status
    setSaving(!publish)
    setSavingPublish(publish)
    try {
      const res = postId ? await blogAPI.update(postId, buildPayload(target)) : await blogAPI.create(buildPayload(target))
      toast.success(publish ? (isScheduled ? 'Post scheduled' : 'Post published') : 'Post saved')
      const saved = res.data?.data
      if (saved?.id) {
        setRevision(saved.revision || 1)
        setSlug(saved.slug || '')
        setStatus(saved.status || target)
        if (target === 'published') setWasPublished(true)
        if (!postId) {
          setPostId(saved.id)
          window.history.replaceState(null, '', `/dashboard/blog/${saved.id}`)
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || (publish ? 'Failed to publish post' : 'Failed to save post'))
    } finally { setSaving(false); setSavingPublish(false); setConfirmDialog(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" /></div>
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-[#6D3DF5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F1B3D] tracking-tight truncate">{postId ? title || 'Untitled Post' : 'New Post'}</h1>
              {postId && <StatusBadge status={status} />}
              {postId && <span className="text-[10px] text-[#94A3B8]">r{revision}</span>}
            </div>
            {slug && <p className="text-[11px] text-[#94A3B8] truncate">/{slug}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {postId && (
            <>
              <Link href="/dashboard/blog/revisions" className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5] transition-colors">
                <History className="w-3.5 h-3.5" /> Revisions
              </Link>
              {status === 'published' && (
                <Link href={`/blog/${slug}`} target="_blank" className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:border-[#18A878]/40 hover:text-[#18A878] transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Top: Title + Slug + Excerpt */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white border border-[#E9E7F5] p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Title *</label>
            <input value={title} onChange={(e) => {
              const t = e.target.value
              setTitle(t)
              if (!slugEdited) {
                setSlug(t.toLowerCase().replace(/[^a-z0-9\s-]+/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, ''))
              }
            }} placeholder="Enter post title..." autoFocus
              className="w-full h-12 px-4 rounded-xl bg-white border border-[#E9E7F5] text-[15px] font-semibold text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Slug</label>
            <div className="flex items-center">
              <span className="h-10 px-2.5 rounded-l-xl bg-[#F8F7FC] border border-r-0 border-[#E9E7F5] text-[11px] text-[#94A3B8] flex items-center shrink-0">/blog/</span>
              <input value={slug} onChange={(e) => { setSlugEdited(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')) }} placeholder="auto-from-title"
                className="w-full h-10 px-3 rounded-r-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors" />
              {slugEdited && (
                <button type="button" title="Re-sync from title" onClick={() => {
                  setSlugEdited(false)
                  setSlug(title.toLowerCase().replace(/[^a-z0-9\s-]+/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, ''))
                }} className="ml-1.5 p-1 rounded-md text-[#94A3B8] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] transition-colors shrink-0">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="Short summary shown in listings"
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors resize-none" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="rounded-2xl bg-white border border-[#E9E7F5] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E9E7F5] bg-[#F8F7FC] flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-[#6D3DF5]" />
          </div>
          <span className="text-[11px] font-semibold text-[#0F1B3D] uppercase tracking-widest">Content</span>
        </div>
        <div className="p-0">
          <RichTextEditor value={content} onChange={setContent} placeholder="Write your article..." />
        </div>
      </motion.div>

      {/* Bottom: Publishing + SEO side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Publishing */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-white border border-[#E9E7F5] p-4 space-y-4">
          <h3 className="text-[11px] font-semibold text-[#536078] uppercase tracking-widest">Publishing</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full h-10 text-xs bg-white border border-[#E9E7F5] text-[#0F1B3D]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="bg-white border-[#E9E7F5]">
                  {statusOptions.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Featured</label>
              <button type="button" onClick={() => setFeatured(!featured)}
                className={`w-full h-10 rounded-xl border text-xs font-semibold transition-colors ${featured ? 'border-[#6D3DF5]/40 bg-[#F3EEFF] text-[#6D3DF5]' : 'border-[#E9E7F5] text-[#536078] hover:border-[#6D3DF5]/30'}`}>
                {featured ? '★ Featured' : 'Not featured'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Category</label>
              <Select value={categoryId || 'none'} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full h-10 text-xs bg-white border border-[#E9E7F5] text-[#0F1B3D]"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-white border-[#E9E7F5]">
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Author</label>
              <Select value={authorId || 'none'} onValueChange={setAuthorId}>
                <SelectTrigger className="w-full h-10 text-xs bg-white border border-[#E9E7F5] text-[#0F1B3D]"><SelectValue placeholder="Select author" /></SelectTrigger>
                <SelectContent className="bg-white border-[#E9E7F5]">
                  <SelectItem value="none">No author</SelectItem>
                  {authors.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Publish Date</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors" />
                {publishedAt && (
                  <button type="button" onClick={() => setPublishedAt('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 hover:text-slate-600 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button type="button" onClick={() => {
                const now = new Date()
                const offset = now.getTimezoneOffset()
                const local = new Date(now.getTime() - offset * 60000)
                setPublishedAt(local.toISOString().slice(0, 16))
              }}
                className="h-10 px-3 rounded-xl border border-[#E9E7F5] text-[10px] font-semibold text-[#536078] hover:bg-[#F3EEFF] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30 transition-colors shrink-0">
                Now
              </button>
            </div>
            {isScheduled && <p className="mt-1.5 text-[10px] text-[#F59E0B] font-medium">Post will be published at this date & time</p>}
          </div>
          <div>
            <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Cover Image</label>
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden border border-[#E9E7F5]">
                <img src={coverImage} alt="" className="w-full h-32 object-cover" />
                <button type="button" onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-[#E9E7F5] bg-[#FAFAFE] cursor-pointer hover:border-[#6D3DF5]/40 hover:bg-[#F3EEFF]/30 transition-colors">
                {uploadingCover ? (
                  <Loader2 className="w-5 h-5 text-[#6D3DF5] animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 text-[#94A3B8] mb-1.5" />
                    <span className="text-[11px] text-[#94A3B8] font-medium">Click to upload cover image</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
              </label>
            )}
          </div>
          <div>
            <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.length === 0 && <span className="text-[10px] text-[#94A3B8]">No tags available</span>}
              {tags.map((t) => {
                const active = tagIds.includes(String(t.id))
                return (
                  <button key={t.id} type="button" onClick={() => setTagIds((prev) => active ? prev.filter((x) => x !== String(t.id)) : [...prev, String(t.id)])}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${active ? 'bg-[#F3EEFF] text-[#6D3DF5] border-[#6D3DF5]/30' : 'text-[#536078] border-[#E9E7F5] hover:border-[#6D3DF5]/30'}`}>
                    {t.name}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* SEO */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl bg-white border border-[#E9E7F5] p-4 space-y-4">
          <h3 className="text-[11px] font-semibold text-[#536078] uppercase tracking-widest">SEO</h3>
          <div>
            <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">SEO Title</label>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Override page title"
              className="w-full h-10 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Meta Description</label>
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="Meta description for search engines"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Change Note</label>
            <input value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="What changed in this revision?"
              className="w-full h-10 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors" />
          </div>
        </motion.div>
      </div>

      {/* Save / Publish — bottom */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-end gap-3 pt-2 pb-4">
        <button onClick={() => save(false)} disabled={saving || savingPublish}
          className="flex items-center gap-1.5 h-10 px-5 rounded-xl text-sm font-semibold text-[#536078] bg-white border border-[#E9E7F5] hover:bg-[#F8F7FC] transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
        <button onClick={() => save(true)} disabled={saving || savingPublish}
          className="flex items-center gap-1.5 h-10 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all disabled:opacity-50">
          {savingPublish ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isScheduled ? (postId && wasPublished ? 'Reschedule' : 'Schedule') : (postId && wasPublished ? 'Republish' : 'Publish')}
        </button>
      </motion.div>

      {/* Publish/Schedule confirm */}
      <Dialog open={confirmDialog} onOpenChange={(o) => !o && setConfirmDialog(false)}>
        <DialogContent className="bg-white border border-[#E9E7F5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm">{isScheduled ? 'Schedule Post' : 'Publish Post'}</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              {isScheduled
                ? <>Schedule &ldquo;{title || 'this post'}&rdquo; to publish on {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(publishedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Continue?</>
                : <>Publishing will make &ldquo;{title || 'this post'}&rdquo; publicly visible under /blog/{slug || '...'}. Continue?</>
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setConfirmDialog(false)} className="h-8 px-4 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:bg-[#F8F7FC] transition-colors">Cancel</button>
            <button onClick={() => save(true)} className="h-8 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white">{isScheduled ? 'Schedule' : 'Publish'}</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
