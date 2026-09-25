export interface PendingEnrollment {
  course_id: number
  course_title: string
  redirect_after_auth: string
  timestamp: number
}

const PENDING_KEY = 'pending_enrollment'

export function savePendingEnrollment(course: { id: number; title?: string }): void {
  if (typeof window === 'undefined') return
  const entry: PendingEnrollment = {
    course_id: course.id,
    course_title: course.title || '',
    redirect_after_auth: `/student-information?courseId=${course.id}`,
    timestamp: Date.now(),
  }
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(entry))
}

export function getPendingEnrollment(): PendingEnrollment | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as PendingEnrollment
    if (!entry.course_id) return null
    return entry
  } catch {
    return null
  }
}

export function clearPendingEnrollment(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(PENDING_KEY)
}

export function getPendingRedirect(): string | null {
  return getPendingEnrollment()?.redirect_after_auth || null
}

export function saveCourseSnapshot(course: { id: number; title?: string; price?: number }): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(
    `course_${course.id}`,
    JSON.stringify({ title: course.title || '', price: course.price || 0 })
  )
}

export function getCourseSnapshot(courseId: number): { title: string; price: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(`course_${courseId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { title: parsed.title || '', price: Number(parsed.price) || 0 }
  } catch {
    return null
  }
}