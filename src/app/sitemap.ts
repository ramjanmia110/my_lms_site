import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'


function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.trim().length > 0
}

function buildUrl(path: string): string {
  const base = BASE_URL.replace(/\/+$/, '')
  const segment = path.replace(/^\/+|\/+$/g, '')
  return `${base}/${segment}`
}

async function fetchAllPublishedTools(): Promise<{ slug: string; updatedAt: string }[]> {
  const all: { slug: string; updatedAt: string }[] = []
  let page = 1

  while (true) {
    try {
      const res = await fetch(`${API_URL}/tools?per_page=50&page=${page}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        console.error(`[sitemap] Tools API returned ${res.status} on page ${page}`)
        break
      }
      const json = await res.json()
      const items = json?.data?.data
      if (!Array.isArray(items) || items.length === 0) break

      for (const t of items) {
        if (!isValidSlug(t.slug)) continue
        all.push({
          slug: t.slug.trim(),
          updatedAt: t.updated_at || t.published_at || '',
        })
      }

      const lastPage: number = json?.data?.last_page ?? 1
      if (page >= lastPage) break
      page++
    } catch (e) {
      console.error(`[sitemap] Failed to fetch tools page ${page}:`, e)
      break
    }
  }

  return all
}

async function fetchAllPublishedBlogs(): Promise<{ slug: string; updatedAt: string }[]> {
  const all: { slug: string; updatedAt: string }[] = []
  let page = 1

  while (true) {
    try {
      const res = await fetch(`${API_URL}/blog/posts?per_page=50&page=${page}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        console.error(`[sitemap] Blog API returned ${res.status} on page ${page}`)
        break
      }
      const json = await res.json()
      const items = json?.data?.data
      if (!Array.isArray(items) || items.length === 0) break

      for (const p of items) {
        if (!isValidSlug(p.slug)) continue
        all.push({
          slug: p.slug.trim(),
          updatedAt: p.updated_at || p.published_at || '',
        })
      }

      const lastPage: number = json?.data?.last_page ?? 1
      if (page >= lastPage) break
      page++
    } catch (e) {
      console.error(`[sitemap] Failed to fetch blogs page ${page}:`, e)
      break
    }
  }

  return all
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()
  const seen = new Set<string>()

  const entries: MetadataRoute.Sitemap = []

  function add(url: string, entry: Omit<MetadataRoute.Sitemap[number], 'url'>) {
    if (seen.has(url)) return
    seen.add(url)
    entries.push({ ...entry, url })
  }

  add(BASE_URL, {
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1.0,
  })

  add(`${BASE_URL}/tools`, {
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  add(`${BASE_URL}/blog`, {
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  const [tools, blogs] = await Promise.all([
    fetchAllPublishedTools(),
    fetchAllPublishedBlogs(),
  ])

  for (const t of tools) {
    const url = buildUrl(`tools/${t.slug}`)
    const lastModified = t.updatedAt ? new Date(t.updatedAt) : undefined
    add(url, {
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  for (const b of blogs) {
    const url = buildUrl(`blog/${b.slug}`)
    const lastModified = b.updatedAt ? new Date(b.updatedAt) : undefined
    add(url, {
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  return entries
}
