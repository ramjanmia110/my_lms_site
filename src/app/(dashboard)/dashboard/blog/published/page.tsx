'use client'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { PostsTable } from '@/components/blog/admin/PostsTable'

export default function BlogPublishedPage() {
  return (
    <div>
      <PageHeader title="Published Posts" subtitle="Live articles visible on /blog" actionHref="/dashboard/blog/new" actionLabel="New Post" />
      <PostsTable defaultStatus="published" />
    </div>
  )
}
