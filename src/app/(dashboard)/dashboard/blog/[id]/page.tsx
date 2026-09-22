'use client'

import { PostEditor } from '@/components/blog/admin/PostEditor'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const postId = parseInt(params.id, 10)
  return (
    <div>
      {!isNaN(postId) ? <PostEditor postId={postId} /> : null}
    </div>
  )
}
