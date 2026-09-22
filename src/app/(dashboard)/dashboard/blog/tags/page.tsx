'use client'

import { Tag } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaxonomyManager } from '@/components/dashboard/TaxonomyManager'
import { blogAPI } from '@/lib/api'

export default function BlogTagsPage() {
  return (
    <div>
      <PageHeader title="Blog Tags" subtitle="Tag articles for better discovery" backHref="/dashboard/blog" />
      <TaxonomyManager
        api={blogAPI.tags}
        fallbackApi={{ getAll: blogAPI.getPublicTags }}
        title="Tags"
        icon={Tag}
      />
    </div>
  )
}
