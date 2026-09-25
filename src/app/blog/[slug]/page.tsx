'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  BookOpen, Calendar, Eye, User, Copy, Check, ArrowLeft, ArrowRight,
  Loader2, Tag, Share2, Clock,
} from 'lucide-react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingSiteFooter } from '@/components/landing/LandingSiteFooter'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { AuthorAvatar } from '@/components/blog/AuthorAvatar'
import { blogAPI } from '@/lib/api'
import { sanitizeHtml, htmlToPlainText } from '@/lib/content'

interface PostDetail {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  published_at: string | null
  views_count: number
  seo_title?: string | null
  category: { id: number; name: string; slug: string } | null
  author: { id: number; name: string; avatar?: string | null; bio?: string | null } | null
  tags: { id: number; name: string; slug: string }[]
  related_posts: {
    id: number
    title: string
    slug: string
    excerpt: string | null
    cover_image: string | null
    published_at: string | null
    seo_title?: string | null
  }[]
}

function estimateReadTime(content: string): number {
  const words = htmlToPlainText(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    blogAPI.getPublicBySlug(slug)
      .then((res) => {
        const raw = res.data?.data
        const postData = raw?.post || raw
        if (postData?.id) {
          setPost({ ...postData, related_posts: raw?.related || postData?.related_posts || [] })
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (post) document.title = `${post.seo_title || post.title} | Learn2Earn`
  }, [post])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <LandingHeader />
        <div aria-hidden className="h-[100px] lg:h-[124px]" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
        </div>
        <LandingSiteFooter />
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <LandingHeader />
        <div aria-hidden className="h-[100px] lg:h-[124px]" />
        <div className="max-w-lg mx-auto text-center py-24 sm:py-32 px-4">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#0F1B3D]">Article not found</h1>
          <p className="text-sm text-slate-500 mt-2">This post may have been removed or is not published yet.</p>
          <Link href="/blog" className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-lg bg-[#6D3DF5] text-white text-xs font-semibold hover:bg-[#5B2FE0] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Link>
        </div>
        <LandingSiteFooter />
      </div>
    )
  }

  const readTime = estimateReadTime(post.content)
  const safeContent = sanitizeHtml(post.content)

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingHeader />
      <div aria-hidden className="h-[100px] lg:h-[124px]" />

      {/* Cover */}
      <div className="relative h-[200px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-[#F3EEFF]">
        {post.cover_image ? (
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-[#6D3DF5]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-[#0F1B3D]/45" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            {post.category && (
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full bg-[#6D3DF5] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider mb-2 sm:mb-3">
                {post.category.name}
              </span>
            )}
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-[32px] font-extrabold tracking-tight text-white leading-[36px] sm:leading-[46px] lg:leading-[52px] drop-shadow-lg max-w-3xl mx-auto">
              {post.seo_title || post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-2 sm:mt-3 text-[11px] sm:text-[12px] lg:text-[13px] text-white/85 leading-relaxed max-w-2xl mx-auto drop-shadow line-clamp-2 sm:line-clamp-1 px-1 sm:px-0">{post.excerpt}</p>
            )}
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-[9px] sm:text-[10px] text-white/75">
              <span className="flex items-center gap-1">
                <AuthorAvatar name={post.author?.name || 'Learn2Earn'} avatar={post.author?.avatar} size="xs" className="ring-1 ring-white/30" />
                <span className="font-semibold text-white">{post.author?.name || 'Learn2Earn'}</span>
              </span>
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readTime} min</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views_count?.toLocaleString() || 0}</span>
              <button onClick={copyLink} className="flex items-center gap-1 hover:text-white transition-colors">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />} {copied ? 'Copied' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb + body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-5 sm:mb-6 overflow-x-auto">
          <Link href="/" className="hover:text-[#6D3DF5] transition-colors shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <Link href="/blog" className="hover:text-[#6D3DF5] transition-colors shrink-0">Blog</Link>
          {post.category && (
            <>
              <span className="shrink-0">/</span>
              <Link href={`/blog?category=${post.category.slug}`} className="hover:text-[#6D3DF5] transition-colors shrink-0">{post.category.name}</Link>
            </>
          )}
        </div>
        {/* Body */}
        {safeContent ? (
          <article
            className="prose prose-slate max-w-none mt-6 sm:mt-8 text-[15px] sm:text-[16px] leading-[1.8] sm:leading-[1.9] text-[#2A3350] blog-content"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        ) : (
          <p className="mt-8 text-sm text-slate-500">This article has no content yet.</p>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#F0EEFA]">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {post.tags.map((t) => (
              <Link
                key={t.id}
                href={`/blog?tag=${t.slug}`}
                className="px-2 sm:px-2.5 py-1 rounded-full bg-[#F3EEFF] text-[#6D3DF5] text-[10px] sm:text-[11px] font-semibold hover:bg-[#6D3DF5]/15 transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Author box */}
        {post.author && (
          <div className="mt-6 sm:mt-8 rounded-2xl border border-[#E9E7F5] p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
            <AuthorAvatar name={post.author.name} avatar={post.author.avatar} size="lg" className="ring-2 ring-[#F3EEFF] shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0F1B3D]">{post.author.name}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{post.author.bio || 'Contributor at Learn2Earn'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Related posts */}
      {post.related_posts?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <h2 className="text-base sm:text-lg font-bold text-[#0F1B3D] mb-4">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {post.related_posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl border border-[#E9E7F5] bg-white overflow-hidden hover:border-[#6D3DF5]/40 hover:shadow-lg transition-all flex flex-col"
              >
                <div className="h-28 sm:h-32 overflow-hidden bg-[#F3EEFF]">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-[#6D3DF5]/30" />
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex-1">
                  <h3 className="text-[12px] sm:text-[13px] font-bold text-[#0F1B3D] group-hover:text-[#6D3DF5] transition-colors leading-snug line-clamp-2">
                    {p.seo_title || p.title}
                  </h3>
                  {p.published_at && (
                    <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="rounded-2xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] p-5 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold text-white">Enjoyed reading?</h3>
            <p className="text-xs sm:text-sm text-white/80 mt-1">Put your skills into practice with free interactive tools.</p>
          </div>
          <Link href="/tools" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white text-[#6D3DF5] text-xs font-semibold hover:bg-[#F3EEFF] transition-colors shrink-0">
            Explore Tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <LandingSiteFooter />
      <ScrollToTop />
    </div>
  )
}
