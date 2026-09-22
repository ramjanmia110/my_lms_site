'use client'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { ToolsTable } from '@/components/tools/admin/ToolsTable'

export default function ToolsPublishedPage() {
  return (
    <div>
      <PageHeader title="Published Tools" subtitle="Live tools visible on /tools" actionHref="/dashboard/tools/new" actionLabel="New Tool" />
      <ToolsTable defaultStatus="published" />
    </div>
  )
}
