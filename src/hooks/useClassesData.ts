'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ClassCategory, LiveClass, LiveStatus } from '@/types'

function mockClasses(): LiveClass[] {
  const now = Date.now()
  return [
    { id: 'fb-1', title: 'Advanced React Patterns', category_name: 'Web Development', category_color: '#34d399', description: 'Compound components, render props, hooks, and context API.', instructor_name: 'Farhan Ahmed', instructor_avatar_url: null, instructor_bio: 'Senior frontend engineer with 8+ years in React ecosystem.', start_time: new Date(now - 8 * 60000).toISOString(), duration_minutes: 60, meeting_url: 'https://meet.jit.si/lms-react', max_seats: 40, enrolled_count: 34, recording_url: null, materials_url: null, status: 'published' },
    { id: 'fb-2', title: 'Intro to Data Structures', category_name: 'Computer Science', category_color: '#60a5fa', description: 'Arrays, linked lists, stacks, queues, and trees.', instructor_name: 'Nabila Rahman', instructor_avatar_url: null, instructor_bio: 'Data structures & algorithms instructor at top universities.', start_time: new Date(now + 35 * 60000).toISOString(), duration_minutes: 45, meeting_url: 'https://meet.jit.si/lms-ds', max_seats: 60, enrolled_count: 58, recording_url: null, materials_url: null, status: 'published' },
    { id: 'fb-3', title: 'IELTS Speaking Masterclass', category_name: 'English', category_color: '#f472b6', description: 'Practice Part 1, 2, and 3 with real-time feedback.', instructor_name: 'Tanvir Islam', instructor_avatar_url: null, instructor_bio: 'IELTS examiner with 10 years of experience.', start_time: new Date(now + 180 * 60000).toISOString(), duration_minutes: 90, meeting_url: 'https://meet.jit.si/lms-ielts', max_seats: 30, enrolled_count: 12, recording_url: null, materials_url: null, status: 'published' },
    { id: 'fb-4', title: 'UI/UX Design Fundamentals', category_name: 'Design', category_color: '#fbbf24', description: 'Wireframing, prototyping, and user research.', instructor_name: 'Shaila Sabrin Rina', instructor_avatar_url: null, instructor_bio: 'Product designer specialising in user research and prototyping.', start_time: new Date(now - 2880 * 60000).toISOString(), duration_minutes: 60, meeting_url: 'https://meet.jit.si/lms-uiux', max_seats: 50, enrolled_count: 50, recording_url: '#', materials_url: '#', status: 'published' },
    { id: 'fb-5', title: 'Python for Beginners', category_name: 'Programming', category_color: '#a78bfa', description: 'Loops, functions, scoping, and lambda expressions.', instructor_name: 'Rafiq Hasan', instructor_avatar_url: null, instructor_bio: 'Full-stack developer and Python enthusiast.', start_time: new Date(now - 4320 * 60000).toISOString(), duration_minutes: 75, meeting_url: 'https://meet.jit.si/lms-python', max_seats: 45, enrolled_count: 45, recording_url: '#', materials_url: '#', status: 'published' },
    { id: 'fb-6', title: 'Digital Marketing 101', category_name: 'Marketing', category_color: '#fb923c', description: 'SEO, SEM, social media, and email marketing.', instructor_name: 'Nabila Rahman', instructor_avatar_url: null, instructor_bio: 'Digital marketing strategist with award-winning campaigns.', start_time: new Date(now + 1440 * 60000).toISOString(), duration_minutes: 60, meeting_url: 'https://meet.jit.si/lms-marketing', max_seats: 80, enrolled_count: 21, recording_url: null, materials_url: null, status: 'published' },
    { id: 'fb-7', title: 'Calculus I: Limits & Continuity', category_name: 'Web Development', category_color: '#34d399', description: 'Formal definition of limits, continuity, and IVT.', instructor_name: 'Dr. Kamal Hossain', instructor_avatar_url: null, instructor_bio: 'Mathematics professor. Makes calculus fun and accessible.', start_time: new Date(now + 5760 * 60000).toISOString(), duration_minutes: 90, meeting_url: 'https://meet.jit.si/lms-calc', max_seats: 35, enrolled_count: 18, recording_url: null, materials_url: null, status: 'published' },
    { id: 'fb-8', title: 'ML: Linear Regression', category_name: 'Computer Science', category_color: '#60a5fa', description: 'Cost functions, gradient descent, R-squared.', instructor_name: 'Farhan Ahmed', instructor_avatar_url: null, instructor_bio: 'ML engineer building production models at scale.', start_time: new Date(now - 7200 * 60000).toISOString(), duration_minutes: 120, meeting_url: 'https://meet.jit.si/lms-ml', max_seats: 50, enrolled_count: 42, recording_url: '#', materials_url: '#', status: 'published' },
    { id: 'fb-9', title: 'Business English: Negotiation', category_name: 'English', category_color: '#f472b6', description: 'Key phrases, tone, and cultural considerations.', instructor_name: 'Tanvir Islam', instructor_avatar_url: null, instructor_bio: 'Business communication coach for professionals.', start_time: new Date(now + 360 * 60000).toISOString(), duration_minutes: 90, meeting_url: 'https://meet.jit.si/lms-bizeng', max_seats: 25, enrolled_count: 20, recording_url: null, materials_url: null, status: 'published' },
  ]
}

function mockCategories(): ClassCategory[] {
  return [
    { id: 'cat-wd', name: 'Web Development', color_hex: '#34d399' },
    { id: 'cat-cs', name: 'Computer Science', color_hex: '#60a5fa' },
    { id: 'cat-en', name: 'English', color_hex: '#f472b6' },
    { id: 'cat-ds', name: 'Design', color_hex: '#fbbf24' },
    { id: 'cat-pr', name: 'Programming', color_hex: '#a78bfa' },
    { id: 'cat-mk', name: 'Marketing', color_hex: '#fb923c' },
  ]
}

interface UseClassesResult {
  classes: LiveClass[]
  categories: ClassCategory[]
  points: number
  loading: boolean
  error: string | null
  setClasses: (c: LiveClass[] | ((prev: LiveClass[]) => LiveClass[])) => void
  setPoints: (p: number | ((prev: number) => number)) => void
  refetch: () => void
}

export function useClassesData(): UseClassesResult {
  const [classes, setClasses] = useState<LiveClass[]>(() => mockClasses())
  const [categories, setCategories] = useState<ClassCategory[]>(() => mockCategories())
  const [points, setPoints] = useState(40)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    Promise.all([
      (supabase as any).from('live_classes').select('*, class_categories(name, color_hex)').eq('status', 'published').order('start_time', { ascending: true }),
      (supabase as any).from('class_categories').select('*').order('name'),
      (supabase as any).from('student_points').select('total_points').eq('student_id', 'demo-user-001').single(),
    ]).then(([clsRes, catRes, ptRes]) => {
      const clsRows: any[] = clsRes.data || []
      const catRows: any[] = catRes.data || []
      if (clsRows.length > 0) {
        setClasses(clsRows.map((r: any) => ({
          id: r.id, title: r.title, description: r.description || '', category_id: r.category_id,
          category_name: r.class_categories?.name || r.subject || 'General',
          category_color: r.class_categories?.color_hex || '#34d399',
          instructor_name: r.instructor_name, instructor_avatar_url: r.instructor_avatar_url,
          instructor_bio: r.instructor_bio, thumbnail: r.thumbnail || null,
          start_time: r.start_time, duration_minutes: r.duration_minutes ?? 60,
          meeting_url: r.meeting_url, max_seats: r.max_seats ?? 100,
          enrolled_count: r.enrolled_count ?? 0, recording_url: r.recording_url,
          materials_url: r.materials_url || null, status: r.status || 'published',
          created_at: r.created_at,
        })))
      }
      if (catRows.length > 0) setCategories(catRows)
      if (ptRes.data) setPoints((ptRes.data as any).total_points ?? 40)
    }).catch((e: any) => {
      setError(e?.message || 'Supabase fetch failed')
    }).finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    refresh()
    const channel = supabase
      ? (supabase as any).channel('live-classes-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => { refresh() })
          .subscribe()
      : null
    return () => { if (channel) (supabase as any)?.removeChannel(channel) }
  }, [])

  return { classes, categories, points, loading, error, setClasses, setPoints, refetch: refresh }
}
