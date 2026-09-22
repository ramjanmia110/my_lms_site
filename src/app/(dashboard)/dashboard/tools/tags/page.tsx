'use client'

import { Tag } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaxonomyManager } from '@/components/dashboard/TaxonomyManager'
import { toolsAPI } from '@/lib/api'

export default function ToolTagsPage() {
  return (
    <div>
      <PageHeader title="Tool Tags" subtitle="Tag tools for better discovery" backHref="/dashboard/tools" />
      <TaxonomyManager
        api={toolsAPI.tags}
        fallbackApi={{ getAll: toolsAPI.getPublicTags }}
        title="Tags"
        icon={Tag}
      />
    </div>
  )
}
