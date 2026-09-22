import { createClient } from '@supabase/supabase-js'
import type { ClassCategory, LiveClass, StudentPoints } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseClient: ReturnType<typeof createClient> | null = null

try {
  if (supabaseUrl.startsWith('http')) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch {
  // Supabase not configured — queries will fall back gracefully
}

export const supabase = supabaseClient

export function getUserId(): string {
  return 'demo-user-001'
}

export function mapRowToLiveClass(row: any): LiveClass {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category_id: row.category_id,
    category_name: row.class_categories?.name || row.category_name || row.subject || 'General',
    category_color: row.class_categories?.color_hex || row.category_color || '#34d399',
    instructor_name: row.instructor_name,
    instructor_avatar_url: row.instructor_avatar_url,
    instructor_bio: row.instructor_bio,
    thumbnail: row.thumbnail || null,
    start_time: row.start_time,
    duration_minutes: row.duration_minutes ?? 60,
    meeting_url: row.meeting_url,
    max_seats: row.max_seats ?? 100,
    enrolled_count: row.enrolled_count ?? 0,
    recording_url: row.recording_url,
    materials_url: row.materials_url || null,
    status: row.status || 'published',
    created_at: row.created_at,
  }
}

export function deriveStatus(start: string, durationMinutes: number): 'live' | 'upcoming' | 'past' {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = s + durationMinutes * 60000
  if (now >= s && now <= e) return 'live'
  if (now < s) return 'upcoming'
  return 'past'
}

export async function fetchClasses(): Promise<LiveClass[]> {
  if (!supabase) return []
  const { data, error } = await (supabase as any)
    .from('live_classes')
    .select('*, class_categories(name, color_hex)')
    .eq('status', 'published')
    .order('start_time', { ascending: true })
  if (error) throw error
  return ((data as any[]) || []).map(mapRowToLiveClass)
}

export async function fetchCategories(): Promise<ClassCategory[]> {
  if (!supabase) return []
  const { data, error } = await (supabase as any).from('class_categories').select('*').order('name')
  if (error) throw error
  return (data as any[]) || []
}

export async function fetchStudentPoints(studentId: string): Promise<number> {
  if (!supabase) return 0
  const { data, error } = await (supabase as any)
    .from('student_points')
    .select('total_points')
    .eq('student_id', studentId)
    .single()
  if (error) return 0
  return (data as any)?.total_points ?? 0
}

export async function joinClass(classId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not configured' }
  try {
    const { error: attErr } = await (supabase as any)
      .from('class_attendance')
      .upsert(
        { class_id: classId, user_id: userId, points_earned: 10 },
        { onConflict: 'class_id,user_id', ignoreDuplicates: false }
      )
    if (attErr) return { success: false, error: attErr.message }

    const { error: ptErr } = await (supabase as any).rpc('increment_student_points', {
      p_student_id: userId,
      p_points: 10,
    })
    if (ptErr) {
      const existing = await (supabase as any)
        .from('student_points')
        .select('total_points')
        .eq('student_id', userId)
        .single()
      const current = (existing.data as any)?.total_points ?? 0
      await (supabase as any)
        .from('student_points')
        .upsert({ student_id: userId, total_points: current + 10 }, { onConflict: 'student_id' })
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to join' }
  }
}

export async function fetchAttendanceForUser(classId: string, userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data } = await (supabase as any)
    .from('class_attendance')
    .select('id')
    .eq('class_id', classId)
    .eq('user_id', userId)
    .single()
  return !!data
}
