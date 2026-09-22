'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Save, Send, Loader2, History, ExternalLink, Wrench, Settings2, Search,
  Upload, X,
} from 'lucide-react'
import { ToolCodeEditor } from '@/components/tools/ToolCodeEditor'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toolsAPI, uploadAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface CategoryOption { id: number; name: string }
interface TagOption { id: number; name: string }

export function ToolEditor({ toolId: initialToolId }: { toolId?: number }) {
  const router = useRouter()
  const [toolId, setToolId] = useState(initialToolId)
  const [loading, setLoading] = useState(!!initialToolId)
  const [saving, setSaving] = useState(false)
  const [savingPublish, setSavingPublish] = useState(false)
  const [wasPublished, setWasPublished] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')
  const [visibility, setVisibility] = useState('public')
  const [categoryId, setCategoryId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [seoTitle, setSeoTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [changeNote, setChangeNote] = useState('')
  const [version, setVersion] = useState(1)

  const [siteDomain, setSiteDomain] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [coverImageUploading, setCoverImageUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [publishedAt, setPublishedAt] = useState('')
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')
  const [js, setJs] = useState('')

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [tags, setTags] = useState<TagOption[]>([])

  const loadOptions = useCallback(async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        toolsAPI.categories.getAll({ per_page: 200 }),
        toolsAPI.tags.getAll(),
      ])
      const catRaw = catRes.data?.data
      setCategories(Array.isArray(catRaw) ? catRaw : catRaw?.data || [])
      const tagRaw = tagRes.data?.data
      setTags(Array.isArray(tagRaw) ? tagRaw : tagRaw?.data || [])
    } catch {
      try {
        const [catRes, tagRes] = await Promise.all([
          toolsAPI.getPublicCategories(),
          toolsAPI.getPublicTags(),
        ])
        const catRaw = catRes.data?.data
        setCategories(Array.isArray(catRaw) ? catRaw : catRaw?.data || [])
        const tagRaw = tagRes.data?.data
        setTags(Array.isArray(tagRaw) ? tagRaw : tagRaw?.data || [])
      } catch {}
    }
  }, [])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  useEffect(() => {
    if (!toolId) return
    setLoading(true)
    toolsAPI.getOne(toolId)
      .then((res) => {
        const t = res.data?.data
        if (!t) return
        setTitle(t.title || '')
        setSlug(t.slug || '')
        setDescription(t.description || '')
        setStatus(t.status || 'draft')
        setWasPublished(t.status === 'published')
        setVisibility(t.visibility || 'public')
        setCategoryId(t.tool_category_id ? String(t.tool_category_id) : '')
        setTagIds((t.tags || []).map((tag: any) => String(tag.id)))
        setSiteDomain(t.site_domain || '')
        setCoverImage(t.cover_image || '')
        setPublishedAt(t.published_at ? t.published_at.slice(0, 16) : '')
        setSeoTitle(t.seo_title || '')
        setMetaDescription(t.meta_description || '')
        setVersion(t.version || 1)
        setHtml(t.html_code || '')
        setCss(t.css_code || '')
        setJs(t.js_code || '')
      })
      .catch(() => toast.error('Failed to load tool'))
      .finally(() => setLoading(false))
  }, [toolId])

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImageUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'cover')
      const res = await uploadAPI.upload(fd)
      setCoverImage(res.data?.url || '')
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setCoverImageUploading(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  const isScheduled = publishedAt !== '' && new Date(publishedAt) > new Date()

  const buildPayload = (targetStatus: string) => ({
    title,
    slug: slug.trim() || undefined,
    description,
    html_code: html,
    css_code: css,
    js_code: js,
    status: targetStatus,
    visibility,
    tool_category_id: categoryId && categoryId !== 'none' ? Number(categoryId) : null,
    tag_ids: tagIds.map(Number),
    site_domain: siteDomain.trim() || null,
    cover_image: coverImage || null,
    published_at: targetStatus === 'scheduled' || targetStatus === 'published' ? (publishedAt || null) : null,
    seo_title: seoTitle || null,
    meta_description: metaDescription || null,
    change_note: changeNote || null,
  })

  const save = async (publish: boolean) => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (publish && !confirmDialog) {
      setConfirmDialog(true)
      return
    }
    const target = publish ? (isScheduled ? 'scheduled' : 'published') : status === 'published' ? 'published' : status
    setSaving(publish ? false : true)
    setSavingPublish(publish ? true : false)
    try {
      let res
      if (toolId) {
        res = await toolsAPI.update(toolId, buildPayload(target))
      } else {
        res = await toolsAPI.create(buildPayload(target))
      }
      toast.success(publish ? (isScheduled ? 'Tool scheduled' : 'Tool published') : 'Tool saved')
      const saved = res.data?.data
      if (saved?.id) {
        setVersion(saved.version || 1)
        setSlug(saved.slug || '')
        setStatus(saved.status || target)
        if (target === 'published') setWasPublished(true)
        if (!toolId) {
          setToolId(saved.id)
          window.history.replaceState(null, '', `/dashboard/tools/${saved.id}`)
        }
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || (publish ? 'Failed to publish tool' : 'Failed to save tool')
      toast.error(msg)
    } finally {
      setSaving(false)
      setSavingPublish(false)
      setConfirmDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-[#6D3DF5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F1B3D] tracking-tight truncate">{toolId ? title || 'Untitled Tool' : 'New Tool'}</h1>
              {toolId && <StatusBadge status={status} />}
              {toolId && <span className="text-[10px] text-[#94A3B8]">v{version}</span>}
            </div>
            {slug && <p className="text-[11px] text-[#94A3B8] truncate">/{slug}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toolId && (
            <>
              <Link href={`/dashboard/tools/versions`} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5] transition-colors">
                <History className="w-3.5 h-3.5" /> Versions
              </Link>
              {status === 'published' && (
                <Link href={`/tools/${slug}`} target="_blank" className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:border-[#18A878]/40 hover:text-[#18A878] transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Code Editor — full width, intentionally dark */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ToolCodeEditor html={html} css={css} js={js} onChange={(h, c, s) => { setHtml(h); setCss(c); setJs(s) }} onSave={() => save(false)} />
      </motion.div>

      {/* Details + SEO — side by side below editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-white border border-[#E9E7F5] overflow-hidden"
        >
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#E9E7F5] bg-[#F8F7FC]">
            <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] flex items-center justify-center">
              <Settings2 className="w-3.5 h-3.5 text-[#6D3DF5]" />
            </div>
            <h3 className="text-xs font-semibold text-[#0F1B3D]">Details</h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GPA Calculator"
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Slug</label>
              <div className="flex items-center">
                <span className="h-9 px-2.5 rounded-l-xl bg-[#F8F7FC] border border-r-0 border-[#E9E7F5] text-[11px] text-[#94A3B8] flex items-center shrink-0">/tools/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''))}
                  placeholder="auto-from-title"
                  className="w-full h-9 px-3 rounded-r-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Short description shown in tool listings"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Site Domain</label>
              <input
                value={siteDomain}
                onChange={(e) => setSiteDomain(e.target.value)}
                placeholder="e.g. example.com"
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors"
              />
              <p className="text-[10px] text-[#94A3B8] mt-1">Domain used in SEO preview and sitemap.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full h-9 text-xs bg-white border border-[#E9E7F5] text-[#0F1B3D]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E9E7F5]">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Visibility</label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="w-full h-9 text-xs bg-white border border-[#E9E7F5] text-[#0F1B3D]">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E9E7F5]">
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="login">Logged-in</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Publish Date</label>
              <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors" />
              {isScheduled && <p className="mt-1.5 text-[10px] text-[#F59E0B] font-medium">Tool will be published at this date & time</p>}
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Category</label>
              <Select value={categoryId || 'none'} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full h-9 text-xs bg-white border border-[#E9E7F5] text-[#0F1B3D]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E9E7F5]">
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {tags.length === 0 && <span className="text-[10px] text-[#94A3B8]">No tags available</span>}
                {tags.map((t) => {
                  const active = tagIds.includes(String(t.id))
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTagIds((prev) => active ? prev.filter((x) => x !== String(t.id)) : [...prev, String(t.id)])}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${active ? 'bg-[#F3EEFF] text-[#6D3DF5] border-[#6D3DF5]/30' : 'text-[#536078] border-[#E9E7F5] hover:border-[#6D3DF5]/30'}`}
                    >
                      {t.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Change Note</label>
              <input
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="What changed in this version?"
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Cover Image</label>
              {coverImage ? (
                <div className="relative group rounded-xl border border-[#E9E7F5] overflow-hidden">
                  <img src={coverImage} alt="Cover" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverImageUploading}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-[#E9E7F5] hover:border-[#6D3DF5]/40 flex flex-col items-center justify-center gap-1.5 text-[#94A3B8] hover:text-[#6D3DF5] transition-colors disabled:opacity-50"
                >
                  {coverImageUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span className="text-[11px] font-medium">{coverImageUploading ? 'Uploading...' : 'Click to upload image'}</span>
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              <p className="text-[10px] text-[#94A3B8] mt-1">Shown as the tool thumbnail in listings.</p>
            </div>
          </div>
        </motion.div>

        {/* SEO */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl bg-white border border-[#E9E7F5] overflow-hidden"
        >
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#E9E7F5] bg-[#F8F7FC]">
            <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-[#3478F6]" />
            </div>
            <h3 className="text-xs font-semibold text-[#0F1B3D]">SEO &amp; Metadata</h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">SEO Title</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors"
                placeholder="Override page title for search engines"
              />
              <p className="text-[10px] text-[#94A3B8] mt-1">If empty, the tool title will be used.</p>
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors resize-none"
                placeholder="Description shown in search engine results"
              />
              <p className="text-[10px] text-[#94A3B8] mt-1">Recommended: 120-160 characters.</p>
            </div>

            {/* Preview card */}
            <div className="rounded-xl border border-[#E9E7F5] bg-[#F8F7FC] p-4">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-2">Search Preview</p>
              <p className="text-sm font-semibold text-[#3478F6] truncate mb-0.5">
                {seoTitle || title || 'Tool Title'}
              </p>
              <p className="text-[11px] text-[#18A878] mb-1">{siteDomain || 'yourdomain.com'}/tools/{slug || 'tool-slug'}</p>
              <p className="text-[11px] text-[#536078] line-clamp-2">
                {metaDescription || description || 'No description provided. Add one to improve search visibility.'}
              </p>
            </div>

            {/* Visibility info */}
            <div className="rounded-xl border border-[#E9E7F5] p-4">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-2">Visibility</p>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can access' },
                  { value: 'login', label: 'Logged-in', desc: 'Requires authentication' },
                  { value: 'premium', label: 'Premium', desc: 'Premium subscribers only' },
                  { value: 'course', label: 'Course', desc: 'Enrolled students only' },
                ].map((v) => (
                  <div key={v.value} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${visibility === v.value ? 'bg-[#F3EEFF] border border-[#6D3DF5]/20' : 'border border-transparent'}`}>
                    <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${visibility === v.value ? 'border-[#6D3DF5] bg-[#6D3DF5]' : 'border-[#94A3B8]'}`}>
                      {visibility === v.value && <div className="w-1 h-1 rounded-full bg-white mx-auto mt-[2px]" />}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#0F1B3D]">{v.label}</span>
                      <span className="text-[10px] text-[#94A3B8] ml-1.5">{v.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save / Publish — bottom */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-end gap-3 pt-2 pb-4"
      >
        <button
          onClick={() => save(false)}
          disabled={saving || savingPublish}
          className="flex items-center gap-1.5 h-10 px-5 rounded-xl text-sm font-semibold text-[#536078] bg-white border border-[#E9E7F5] hover:bg-[#F8F7FC] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || savingPublish}
          className="flex items-center gap-1.5 h-10 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all disabled:opacity-50"
        >
          {savingPublish ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isScheduled ? (toolId && wasPublished ? 'Reschedule' : 'Schedule') : (toolId && wasPublished ? 'Republish' : 'Publish')}
        </button>
      </motion.div>

      {/* Publish/Schedule confirm */}
      <Dialog open={confirmDialog} onOpenChange={(o) => !o && setConfirmDialog(false)}>
        <DialogContent className="bg-white border border-[#E9E7F5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm">{isScheduled ? 'Schedule Tool' : 'Publish Tool'}</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              {isScheduled
                ? <>Schedule &ldquo;{title || 'this tool'}&rdquo; to publish on {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(publishedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Continue?</>
                : <>Publishing will make &ldquo;{title || 'this tool'}&rdquo; publicly visible under /tools/{slug || '...'}. Continue?</>
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
