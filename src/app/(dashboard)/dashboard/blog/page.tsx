'use client'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { PostsTable } from '@/components/blog/admin/PostsTable'

export default function BlogPage() {
  return (
    <div>
      <PageHeader title="All Posts" subtitle="Manage every blog article" actionHref="/dashboard/blog/new" actionLabel="New Post" />
      <PostsTable />
    </div>
  )
}
