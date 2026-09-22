'use client'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { ToolEditor } from '@/components/tools/admin/ToolEditor'

export default function EditToolPage({ params }: { params: { id: string } }) {
  const toolId = parseInt(params.id, 10)
  return (
    <div>
      <PageHeader title="Edit Tool" subtitle="Update content, code and settings" backHref="/dashboard/tools" />
      {!isNaN(toolId) ? <ToolEditor toolId={toolId} /> : null}
    </div>
  )
}
