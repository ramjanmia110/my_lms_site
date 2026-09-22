'use client'

import { useState } from 'react'
import { Users, ImagePlus, Loader2, X } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaxonomyManager } from '@/components/dashboard/TaxonomyManager'
import { blogAPI, uploadAPI } from '@/lib/api'
import toast from 'react-hot-toast'

function AvatarUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'avatar')
      const res = await uploadAPI.upload(fd)
      const url = res.data?.data?.url || res.data?.url
      if (url) { onChange(url); toast.success('Avatar uploaded') }
      else toast.error('Upload failed')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div>
      <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Avatar</label>
      {value ? (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E9E7F5]">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-[#E9E7F5] bg-[#FAFAFE] cursor-pointer hover:border-[#6D3DF5]/40 hover:bg-[#F3EEFF]/30 transition-colors">
          {uploading ? (
            <Loader2 className="w-4 h-4 text-[#6D3DF5] animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-5 h-5 text-[#94A3B8]" />
              <span className="text-[8px] text-[#94A3B8] font-medium mt-0.5">Upload</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      )}
    </div>
  )
}

export default function BlogAuthorsPage() {
  return (
    <div>
      <PageHeader title="Blog Authors" subtitle="Manage authors and their profiles" backHref="/dashboard/blog" />
      <TaxonomyManager
        api={blogAPI.authors}
        fallbackApi={{ getAll: blogAPI.getPublicAuthors }}
        title="Authors"
        icon={Users}
        extraFields={(form: any, setForm: any) => (
          <>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Email</label>
              <input value={form.email || ''} onChange={(e) => setForm((f: any) => ({ ...f, email: e.target.value }))} type="email"
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Role</label>
              <input value={form.role || ''} onChange={(e) => setForm((f: any) => ({ ...f, role: e.target.value }))} placeholder="e.g. Staff Writer"
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors" />
            </div>
            <AvatarUpload value={form.avatar || ''} onChange={(url) => setForm((f: any) => ({ ...f, avatar: url }))} />
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Bio</label>
              <textarea value={form.bio || ''} onChange={(e) => setForm((f: any) => ({ ...f, bio: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-1 focus:ring-[#6D3DF5]/20 transition-colors resize-none" />
            </div>
          </>
        )}
      />
    </div>
  )
}
