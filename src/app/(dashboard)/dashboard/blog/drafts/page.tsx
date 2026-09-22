'use client'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { PostsTable } from '@/components/blog/admin/PostsTable'

export default function BlogDraftsPage() {
  return (
    <div>
      <PageHeader title="Draft Posts" subtitle="Articles still in progress" actionHref="/dashboard/blog/new" actionLabel="New Post" />
      <PostsTable defaultStatus="draft" />
    </div>
  )
}
