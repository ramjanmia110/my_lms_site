'use client'

import { useCallback, useEffect, useState, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search, BookOpen, ArrowRight, Loader2, Calendar, Eye, User,
  Mail, Send, Tag, FolderOpen, ChevronLeft, ChevronRight,
  TrendingUp, Newspaper, X, Clock, MessageCircle, Bookmark,
} from 'lucide-react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingSiteFooter } from '@/components/landing/LandingSiteFooter'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { AuthorAvatar } from '@/components/blog/AuthorAvatar'
import { blogAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PostItem {
  id: number; title: string; slug: string; excerpt: string | null; content: string | null
  cover_image: string | null; published_at: string | null; views_count: number
  seo_title?: string | null
  category: { id: number; name: string; slug: string } | null
  author: { id: number; name: string; avatar?: string | null } | null
  tags: { id: number; name: string; slug: string }[] | null
}
interface Category { id: number; name: string; slug: string; posts_count?: number }
interface Tag { id: number; name: string; slug: string; posts_count?: number }
interface Author { id: number; name: string; avatar?: string | null; bio?: string | null; email?: string | null; role?: string | null; posts_count?: number }

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
      </div>
    }>
      <BlogContent />
    </Suspense>
  )
}

function BlogContent() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 8 }
      if (debouncedSearch) params.search = debouncedSearch
      if (activeCategory) params.category = activeCategory
      if (activeTag) params.tag = activeTag
      const res = await blogAPI.getPublic(params)
      const data = res.data?.data
      setPosts(Array.isArray(data?.data) ? data.data : [])
      setPage(data?.current_page || 1)
      setLastPage(data?.last_page || 1)
      setTotal(data?.total || 0)
    } catch { setPosts([]) }
    finally { setLoading(false) }
  }, [page, debouncedSearch, activeCategory, activeTag])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  useEffect(() => {
    Promise.all([
      blogAPI.getPublicCategories(),
      blogAPI.getPublicTags(),
      blogAPI.getPublicAuthors(),
    ]).then(([catRes, tagRes, authorRes]) => {
      setCategories(Array.isArray(catRes.data?.data) ? catRes.data.data : [])
      setTags(Array.isArray(tagRes.data?.data) ? tagRes.data.data : [])
      setAuthors(Array.isArray(authorRes.data?.data) ? authorRes.data.data : [])
    }).catch(() => {})
  }, [])

  const handleSearch = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }
  const handleSearchEnter = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setDebouncedSearch(search)
    setPage(1)
  }
  const handleCategoryFilter = (slug: string) => { setActiveCategory(activeCategory === slug ? '' : slug); setActiveTag(''); setPage(1) }
  const handleTagFilter = (slug: string) => { setActiveTag(activeTag === slug ? '' : slug); setActiveCategory(''); setPage(1) }
  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const clearFilters = () => { setSearch(''); setDebouncedSearch(''); setActiveCategory(''); setActiveTag(''); setPage(1) }

  const topArticles = [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 3)
  const siteAuthor = authors[0]

  const wordCount = (html: string) => html ? html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0
  const readTime = (post: PostItem) => Math.max(3, Math.ceil(wordCount(post.content || post.excerpt || '') / 200))

  return (
    <div className="min-h-screen bg-[#FAFBFD] font-sans">
      <LandingHeader />
      <div aria-hidden className="h-[100px] lg:h-[124px]" />

      {/* Header */}
      <section className="relative overflow-hidden bg-white border-b border-[#E9E7F5]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-[#6D3DF5]/[0.07] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[220px] sm:w-[350px] h-[220px] sm:h-[350px] rounded-full bg-[#3478F6]/[0.07] blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6D3DF5]/10 text-[#6D3DF5] text-xs font-semibold mb-3 sm:mb-4">
            <Newspaper className="w-3.5 h-3.5" /> Learn2Earn Blog
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F1B3D]">
            Learn, Explore &amp; Grow{' '}
            <span className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] bg-clip-text text-transparent">with Our Blog</span>
          </h1>
          <p className="mt-2.5 sm:mt-3 text-[#536078] max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
            Expert tutorials, practical guides and fresh insights to power your learning journey.
          </p>
          <div className="mt-5 sm:mt-6 flex items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] text-[#94A3B8]">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {total} Articles</span>
            <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {categories.length} Categories</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {authors.length} Author{authors.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </section>

      {/* Main two-column */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">

          {/* Left: Posts */}
          <main className="flex-1 min-w-0 lg:w-[70%]">
            {loading ? (
              <div className="space-y-5">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E9E7F5] overflow-hidden animate-pulse">
                    {i === 1 ? (
                      <><div className="h-[280px] bg-slate-100" /><div className="p-5 space-y-3"><div className="h-3 bg-slate-100 rounded w-32" /><div className="h-5 bg-slate-100 rounded w-4/5" /><div className="h-3 bg-slate-100 rounded w-full" /></div></>
                    ) : (
                      <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                        <div className="w-full sm:w-[180px] h-[120px] bg-slate-100 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-3 py-1"><div className="h-3 bg-slate-100 rounded w-24" /><div className="h-4 bg-slate-100 rounded w-4/5" /><div className="h-3 bg-slate-100 rounded w-full" /></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#E9E7F5]">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No articles found</p>
                <p className="text-xs text-slate-400 mt-1">{search || activeCategory || activeTag ? 'Try adjusting your search or filters.' : 'Check back soon for new content!'}</p>
                {(search || activeCategory || activeTag) && (
                  <button onClick={clearFilters} className="mt-4 h-8 px-4 rounded-xl text-xs font-semibold bg-[#6D3DF5] text-white hover:bg-[#5B2FD4] transition-colors">Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {/* Featured post */}
                  {posts[0] && (
                    <Link href={`/blog/${posts[0].slug}`} className="group block bg-white rounded-2xl border border-[#E9E7F5] overflow-hidden hover:border-[#6D3DF5]/30 hover:shadow-xl hover:shadow-[#6D3DF5]/[0.06] transition-all duration-300">
                      <div className="relative h-[200px] sm:h-[240px] lg:h-[280px] overflow-hidden bg-[#F3EEFF]">
                        {posts[0].cover_image ? (
                          <img src={posts[0].cover_image} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F3EEFF] to-[#EEF4FF]">
                            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#6D3DF5]/15" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B3D]/80 via-[#0F1B3D]/20 to-transparent" />
                        {posts[0].category && (
                          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-[#6D3DF5] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            {posts[0].category.name}
                          </span>
                        )}
                        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-medium flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {readTime(posts[0])} min read
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6">
                          <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                            <AuthorAvatar name={posts[0].author?.name || 'Learn2Earn'} avatar={posts[0].author?.avatar} size="sm" className="ring-2 ring-white/30" />
                            <div>
                              <span className="text-[10px] sm:text-[11px] text-white font-semibold block leading-tight">{posts[0].author?.name || 'Learn2Earn'}</span>
                              {posts[0].published_at && (
                                <span className="text-[9px] sm:text-[10px] text-white/60">
                                  {new Date(posts[0].published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                          <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white leading-snug line-clamp-2 drop-shadow-sm transition-all group-hover:drop-shadow-md">
                            {posts[0].seo_title || posts[0].title}
                          </h2>
                          {posts[0].excerpt && (
                            <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-[12px] text-white/70 leading-relaxed line-clamp-2 max-w-xl">{posts[0].excerpt}</p>
                          )}
                          <span className="inline-flex items-center gap-1.5 mt-2 sm:mt-3 text-[10px] sm:text-[11px] font-semibold text-white group-hover:gap-2.5 transition-all">
                            Read Article <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Remaining posts */}
                  {posts.slice(1).map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white rounded-2xl border border-[#E9E7F5] p-3 sm:p-4 hover:border-[#6D3DF5]/30 hover:shadow-lg hover:shadow-[#6D3DF5]/[0.04] transition-all duration-300">
                      <div className="w-full sm:w-[180px] h-[120px] sm:h-[120px] shrink-0 rounded-xl overflow-hidden bg-[#F3EEFF] relative">
                        {post.cover_image ? (
                          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F3EEFF] to-[#EEF4FF]">
                            <BookOpen className="w-6 h-6 text-[#6D3DF5]/20" />
                          </div>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#0F1B3D]/60 backdrop-blur-sm text-white text-[9px] font-medium flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {readTime(post)} min
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center gap-2 mb-1.5">
                          {post.category && (
                            <span className="px-2 py-0.5 rounded-md bg-[#F3EEFF] text-[#6D3DF5] text-[9px] font-bold uppercase tracking-wider">{post.category.name}</span>
                          )}
                          <span className="text-[10px] text-[#94A3B8]">
                            {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                            <h3 className="text-[14px] font-bold text-[#0F1B3D] group-hover:text-[#6D3DF5] transition-colors leading-snug line-clamp-1">{post.seo_title || post.title}</h3>
                        <p className="mt-1 text-[12px] text-[#536078] leading-relaxed line-clamp-2 flex-1">
                          {post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').slice(0, 130) + '...' : '')}
                        </p>
                        <div className="mt-auto pt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AuthorAvatar name={post.author?.name || 'Learn2Earn'} avatar={post.author?.avatar} size="xs" />
                            <span className="text-[10px] text-[#536078] font-medium">{post.author?.name || 'Learn2Earn'}</span>
                            <span className="text-[10px] text-[#CBD5E1]">·</span>
                            <span className="flex items-center gap-0.5 text-[10px] text-[#94A3B8]">
                              <Eye className="w-2.5 h-2.5" /> {(post.views_count || 0).toLocaleString()}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6D3DF5] group-hover:gap-1.5 transition-all">
                            Read More <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => goToPage(page - 1)}
                      className="h-9 w-9 rounded-xl border border-[#E9E7F5] bg-white flex items-center justify-center text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 2)
                      .reduce<(number | string)[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) => typeof p === 'string' ? (
                        <span key={`dots-${i}`} className="text-xs text-slate-400 px-1">...</span>
                      ) : (
                        <button key={p} onClick={() => goToPage(p)}
                          className={cn('h-9 w-9 rounded-xl text-xs font-semibold transition-colors',
                            page === p ? 'bg-[#6D3DF5] text-white shadow-md shadow-[#6D3DF5]/25' : 'border border-[#E9E7F5] bg-white text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5]'
                          )}>{p}</button>
                      ))
                    }
                    <button disabled={page >= lastPage} onClick={() => goToPage(page + 1)}
                      className="h-9 w-9 rounded-xl border border-[#E9E7F5] bg-white flex items-center justify-center text-[#536078] hover:border-[#6D3DF5]/40 hover:text-[#6D3DF5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="ml-2 text-[11px] text-[#94A3B8]">{total.toLocaleString()} article{total !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-[30%] shrink-0 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-2xl border border-[#E9E7F5] p-4">
              <h3 className="text-[11px] font-semibold text-[#536078] uppercase tracking-widest mb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input value={search} onChange={(e) => handleSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchEnter()}
                  placeholder="Search articles..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#FAFBFD] border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors" />
                {search && (
                  <button onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#6D3DF5]"><X className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>

            {/* About / Author — realistic card */}
            {siteAuthor && (
              <div className="bg-white rounded-2xl border border-[#E9E7F5] overflow-hidden">
                {/* Banner */}
                <div className="relative h-24 bg-gradient-to-br from-[#6D3DF5] via-[#5B21B6] to-[#3478F6] overflow-hidden">
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
                  <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/10 blur-lg" />
                </div>

                {/* Avatar overlapping banner */}
                <div className="relative px-5">
                  <div className="-mt-10 mb-3 flex justify-start">
                    <div className="relative">
                      <AuthorAvatar name={siteAuthor.name} avatar={siteAuthor.avatar} size="lg" className="ring-4 ring-white shadow-lg" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                  </div>

                  {/* Name + Role */}
                  <div>
                    <h4 className="text-sm font-bold text-[#0F1B3D] leading-tight">{siteAuthor.name}</h4>
                    {siteAuthor.role && (
                      <p className="text-[11px] text-[#6D3DF5] font-semibold mt-0.5">{siteAuthor.role}</p>
                    )}
                  </div>

                  {/* Bio */}
                  {siteAuthor.bio && (
                    <p className="mt-2.5 text-[11px] text-[#536078] leading-relaxed">{siteAuthor.bio}</p>
                  )}

                  {/* Stats row */}
                  <div className="mt-3 flex items-center gap-4 py-2.5 border-t border-[#F0EEFA]">
                    <div className="text-center flex-1">
                      <p className="text-sm font-bold text-[#0F1B3D]">{siteAuthor.posts_count ?? 0}</p>
                      <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Articles</p>
                    </div>
                    <div className="w-px h-6 bg-[#F0EEFA]" />
                    <div className="text-center flex-1">
                      <p className="text-sm font-bold text-[#0F1B3D]">Writer</p>
                      <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Role</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pb-5">
                    {siteAuthor.email && (
                      <a href={`mailto:${siteAuthor.email}`}
                        className="flex-1 h-9 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#6D3DF5]/15 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                    <Link href="/blog"
                      className="flex-1 h-9 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-[#6D3DF5]/25 transition-all">
                      View Posts
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Top Articles */}
            {topArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E9E7F5] p-4">
                <h3 className="text-[11px] font-semibold text-[#536078] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#6D3DF5]" /> Top Articles
                </h3>
                <div className="space-y-3">
                  {topArticles.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-3 group">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#F3EEFF] shrink-0">
                        {post.cover_image ? (
                          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-[#6D3DF5]/30" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-semibold text-[#0F1B3D] group-hover:text-[#6D3DF5] transition-colors line-clamp-2 leading-snug">{post.seo_title || post.title}</h4>
                        <span className="text-[10px] text-[#94A3B8] mt-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          <span className="mx-0.5">·</span>
                          <Eye className="w-2.5 h-2.5" /> {(post.views_count || 0).toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E9E7F5] p-4">
                <h3 className="text-[11px] font-semibold text-[#536078] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-[#6D3DF5]" /> Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <button key={c.slug} onClick={() => handleCategoryFilter(c.slug)}
                      className={cn('w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] transition-colors',
                        activeCategory === c.slug ? 'bg-[#6D3DF5]/10 text-[#6D3DF5] font-semibold' : 'text-[#536078] hover:bg-[#F8F7FC]'
                      )}>
                      <span>{c.name}</span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                        activeCategory === c.slug ? 'bg-[#6D3DF5] text-white' : 'bg-[#F3EEFF] text-[#6D3DF5]'
                      )}>{c.posts_count ?? 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E9E7F5] p-4">
                <h3 className="text-[11px] font-semibold text-[#536078] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#6D3DF5]" /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <button key={t.slug} onClick={() => handleTagFilter(t.slug)}
                      className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
                        activeTag === t.slug ? 'bg-[#6D3DF5] text-white shadow-sm shadow-[#6D3DF5]/25' : 'bg-[#F3EEFF] text-[#6D3DF5] hover:bg-[#6D3DF5]/15'
                      )}>{t.name}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="bg-white rounded-2xl border border-[#E9E7F5] p-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center mb-3">
                <Send className="w-4.5 h-4.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-[#0F1B3D]">Subscribe to Newsletter</h3>
              <p className="mt-1 text-[11px] text-[#536078] leading-relaxed">Get the latest articles and insights delivered to your inbox.</p>
              <NewsletterWidget />
            </div>
          </aside>
        </div>
      </div>

      <LandingSiteFooter />
      <ScrollToTop />
    </div>
  )
}

function NewsletterWidget() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const handleSubscribe = async () => {
    if (!email.trim()) { toast.error('Please enter your email'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email'); return }
    setSubscribing(true)
    try {
      const res = await blogAPI.newsletter.subscribe({ email: email.trim() })
      toast.success(res.data?.message || 'Successfully subscribed!')
      setEmail('')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Subscription failed.')
    } finally { setSubscribing(false) }
  }
  return (
    <div className="mt-3 space-y-2">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
        placeholder="Your email address"
        className="w-full h-10 px-3 rounded-xl bg-[#FAFBFD] border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors" />
      <button onClick={handleSubscribe} disabled={subscribing}
        className="w-full h-10 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-[#6D3DF5]/25 transition-all disabled:opacity-60">
        {subscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        {subscribing ? 'Subscribing...' : 'Subscribe'}
      </button>
    </div>
  )
}
