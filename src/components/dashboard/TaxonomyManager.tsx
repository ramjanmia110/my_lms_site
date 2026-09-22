'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Plus, Trash2, Pencil, Loader2, Tags, AlertCircle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface Item { id: number; name: string; slug?: string; site_domain?: string; tools_count?: number; posts_count?: number }

interface Api {
  getAll: (params?: any) => Promise<any>
  create: (data: any) => Promise<any>
  update: (id: number, data: any) => Promise<any>
  delete: (id: number) => Promise<any>
}

export function TaxonomyManager({
  api,
  fallbackApi,
  title,
  icon: Icon = Tags,
  extraFields,
}: {
  api: Api
  fallbackApi?: { getAll: (params?: any) => Promise<any> }
  title: string
  icon?: any
  extraFields?: (form: any, setForm: any) => ReactNode
}) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [form, setForm] = useState<{ name: string; slug?: string; [k: string]: any }>({ name: '' })
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getAll({ per_page: 200 })
      const raw = res.data?.data
      setItems(Array.isArray(raw) ? raw : raw?.data || [])
    } catch (err: any) {
      if (fallbackApi && (err?.response?.status === 401 || err?.response?.status === 403)) {
        try {
          const res = await fallbackApi.getAll()
          const raw = res.data?.data
          setItems(Array.isArray(raw) ? raw : raw?.data || [])
        } catch {
          setError(`You do not have permission to manage ${title.toLowerCase()}, or the service is unavailable.`)
        }
      } else {
        setError(`Failed to load ${title.toLowerCase()}. Please try again.`)
      }
    } finally {
      setLoading(false)
    }
  }, [api, fallbackApi, title])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Item) => {
    setEditing(item)
    setForm({ ...item, name: item.name })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const payload: any = { ...form }
      if (editing) {
        await api.update(editing.id, payload)
        toast.success('Updated')
      } else {
        await api.create(payload)
        toast.success('Created')
      }
      setDialogOpen(false)
      fetchItems()
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.errors?.name?.[0] || 'Failed to save'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(deleteTarget.id)
      toast.success('Deleted')
      setDeleteTarget(null)
      fetchItems()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[11px] text-[#536078]">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E9E7F5]">
            Total: <span className="text-[#0F1B3D] font-semibold">{items.length}</span>
          </span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add {title.slice(0, -1)}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-[#E9E7F5] rounded-2xl flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
            <p className="text-xs text-[#536078]">Loading {title.toLowerCase()}...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E9E7F5] rounded-2xl p-10 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-[#6D3DF5]" />
          </div>
          <h3 className="text-base font-semibold text-[#0F1B3D] mb-1">Unable to load {title.toLowerCase()}</h3>
          <p className="text-sm text-[#536078] mb-5 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchItems}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </motion.div>
      )}

      {/* Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden"
        >
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mx-auto mb-3">
                <Icon className="w-7 h-7 text-[#6D3DF5]" />
              </div>
              <p className="text-sm font-semibold text-[#0F1B3D] mb-1">No {title.toLowerCase()} yet</p>
              <p className="text-xs text-[#536078]">Create your first {title.slice(0, -1).toLowerCase()} to organize tools.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E9E7F5] bg-[#F8F7FC] text-[10px] uppercase tracking-widest text-[#536078]">
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[#E9E7F5]/60 last:border-0 hover:bg-[#F8F7FC] transition-colors">
                      <td className="px-5 py-3.5 text-xs font-semibold text-[#0F1B3D]">{item.name}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-[#536078] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-[#536078] hover:text-red-500 hover:bg-red-50 transition-colors">
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
        </motion.div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="bg-white border border-[#E9E7F5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm">{editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">Enter the name for this {title.slice(0, -1).toLowerCase()}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors"
              />
            </div>
            {extraFields?.(form, setForm)}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setDialogOpen(false)} className="h-8 px-4 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:bg-[#F8F7FC] transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="h-8 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="bg-white border border-[#E9E7F5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm">Delete {title.slice(0, -1)}</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Delete &ldquo;{deleteTarget?.name}&rdquo;? This cannot be undone.
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
