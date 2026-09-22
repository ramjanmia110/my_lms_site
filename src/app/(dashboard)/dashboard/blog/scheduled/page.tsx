'use client'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { PostsTable } from '@/components/blog/admin/PostsTable'

export default function BlogScheduledPage() {
  return (
    <div>
      <PageHeader title="Scheduled Posts" subtitle="Articles queued for future publication" actionHref="/dashboard/blog/new" actionLabel="New Post" />
      <PostsTable defaultStatus="scheduled" />
    </div>
  )
}
