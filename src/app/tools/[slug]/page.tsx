'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Wrench, ArrowLeft, Loader2, Home, Layers } from 'lucide-react'
import { PublicNavbar } from '@/components/public/PublicNavbar'
import { LandingFooter } from '@/components/public/LandingFooter'
import { SandboxedToolViewer } from '@/components/tools/SandboxedToolViewer'
import { toolsAPI } from '@/lib/api'

interface ToolDetail {
  id: number
  title: string
  slug: string
  description: string | null
  html_code: string
  css_code: string
  js_code: string
  icon: string | null
  status: string
  visibility: string
  views_count: number
  usage_count: number
  version: number
  published_at: string | null
  category: { id: number; name: string; slug: string; color?: string } | null
  tags: { id: number; name: string; slug: string }[]
  related_tool_ids: number[] | null
}

const SECTION_MARKER = '<!-- tool section start here -->'

export default function ToolDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [tool, setTool] = useState<ToolDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    toolsAPI.getPublicBySlug(slug)
      .then((res) => {
        setTool(res.data?.data?.tool ?? null)
        setNotFound(!res.data?.data?.tool)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const handleUse = () => {
    if (tool) toolsAPI.recordUsage(tool.slug, { action: 'run' }).catch(() => {})
  }

  const split = useMemo(() => {
    if (!tool) return { interactiveHtml: '', sectionHtml: '', sectionCss: '', sectionJs: '' }
    const full = tool.html_code || ''
    const markerIdx = full.indexOf(SECTION_MARKER)
    if (markerIdx === -1) return { interactiveHtml: full, sectionHtml: '', sectionCss: '', sectionJs: '' }

    const interactivePart = full.substring(0, markerIdx)
    const sectionPart = full.substring(markerIdx)

    const styleMatch = sectionPart.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
    const scriptMatch = sectionPart.match(/<script[^>]*>([\s\S]*?)<\/script>/i)

    let sectionHtml = sectionPart
    if (styleMatch) sectionHtml = sectionHtml.replace(styleMatch[0], '')
    if (scriptMatch) sectionHtml = sectionHtml.replace(scriptMatch[0], '')

    return {
      interactiveHtml: interactivePart,
      sectionHtml: sectionHtml,
      sectionCss: styleMatch ? styleMatch[1] : '',
      sectionJs: scriptMatch ? scriptMatch[1] : '',
    }
  }, [tool])

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <PublicNavbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
        </div>
        <LandingFooter />
      </div>
    )
  }

  if (notFound || !tool) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <PublicNavbar />
        <div className="max-w-lg mx-auto text-center py-32 px-4">
          <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#0F1B3D]">Tool not found</h1>
          <p className="text-sm text-slate-500 mt-2">This tool may have been removed or is not published yet.</p>
          <Link href="/tools" className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-lg bg-[#6D3DF5] text-white text-xs font-semibold hover:bg-[#5B2FE0] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white font-sans">
      <PublicNavbar />

      {/* Tool -- exactly one viewport height, scrollable inside with hidden scrollbar */}
      <div className="relative h-screen">
        {/* Breadcrumb -- floating path only */}
        <div className="absolute top-0 inset-x-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-2">
            {/* Back arrow */}
            <Link href="/tools"
              className="group w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all shrink-0">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            {/* Breadcrumb crumbs */}
            <nav className="flex items-center gap-1.5 text-[12px] font-bold text-white min-w-0 flex-1"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              <Link href="/" className="flex items-center gap-1 hover:text-[#C4B5FD] transition-colors shrink-0">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <span className="text-white/30">·</span>
              <Link href="/tools" className="hover:text-[#C4B5FD] transition-colors shrink-0">Tools</Link>
              {tool.category && (
                <>
                  <span className="text-white/30">·</span>
                  <Link href={`/tools?category=${tool.category.slug}`}
                    className="flex items-center gap-1 hover:text-[#C4B5FD] transition-colors shrink-0">
                    <Layers className="w-3 h-3" /> {tool.category.name}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        <SandboxedToolViewer html={split.interactiveHtml} css={tool.css_code} js={tool.js_code} onRun={handleUse} fullScreen />
      </div>

      {/* Content sections extracted from tool HTML - rendered outside iframe for full responsiveness */}
      {split.sectionHtml && (
        <div className="bg-white w-full">
          {split.sectionCss && <style dangerouslySetInnerHTML={{ __html: split.sectionCss }} />}
          <div dangerouslySetInnerHTML={{ __html: split.sectionHtml }} />
          {split.sectionJs && (
            <script dangerouslySetInnerHTML={{ __html: split.sectionJs }} />
          )}
        </div>
      )}

      <LandingFooter />
    </div>
  )
}
