'use client'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { ToolsTable } from '@/components/tools/admin/ToolsTable'

export default function ToolsDraftsPage() {
  return (
    <div>
      <PageHeader title="Draft Tools" subtitle="Tools still in progress" actionHref="/dashboard/tools/new" actionLabel="New Tool" />
      <ToolsTable defaultStatus="draft" />
    </div>
  )
}
