'use client'

import { LayoutGrid } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaxonomyManager } from '@/components/dashboard/TaxonomyManager'
import { blogAPI } from '@/lib/api'

export default function BlogCategoriesPage() {
  return (
    <div>
      <PageHeader title="Blog Categories" subtitle="Organize articles by topic" backHref="/dashboard/blog" />
      <TaxonomyManager
        api={blogAPI.categories}
        fallbackApi={{ getAll: blogAPI.getPublicCategories }}
        title="Categories"
        icon={LayoutGrid}
      />
    </div>
  )
}
