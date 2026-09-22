'use client'

import { LayoutGrid } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaxonomyManager } from '@/components/dashboard/TaxonomyManager'
import { toolsAPI } from '@/lib/api'

export default function ToolCategoriesPage() {
  return (
    <div>
      <PageHeader title="Tool Categories" subtitle="Organize tools by category" backHref="/dashboard/tools" />
      <TaxonomyManager
        api={toolsAPI.categories}
        fallbackApi={{ getAll: toolsAPI.getPublicCategories }}
        title="Categories"
        icon={LayoutGrid}
      />
    </div>
  )
}
