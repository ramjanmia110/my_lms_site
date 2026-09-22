'use client'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { ToolsTable } from '@/components/tools/admin/ToolsTable'

export default function ToolsPage() {
  return (
    <div>
      <PageHeader
        title="All Tools"
        subtitle="Manage every interactive tool on the platform"
        actionHref="/dashboard/tools/new"
        actionLabel="New Tool"
      />
      <ToolsTable />
    </div>
  )
}
