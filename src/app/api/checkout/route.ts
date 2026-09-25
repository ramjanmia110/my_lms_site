import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  course_id: z.number().int().positive(),
  course_title: z.string().optional(),
  course_price: z.number().optional(),
  name: z.string().min(1, 'Full name is required').max(255),
  father_name: z.string().min(1, "Father's name is required").max(255),
  mother_name: z.string().min(1, "Mother's name is required").max(255),
  gender: z.enum(['male', 'female', 'other']),
  age: z.string().optional(),
  email: z.string().email('Invalid email format').max(255),
  phone: z.string().min(1, 'Phone number is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  division: z.string().optional(),
  city: z.string().optional(),
  address: z.string().min(1, 'Address is required').max(1000),
  password: z.string().min(6, 'At least 6 characters').optional(),
  password_confirmation: z.string().optional(),
  role: z.enum(['student']).optional(),
  avatar: z.string().optional(),
})

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstMsg = Object.values(fieldErrors).flat()[0] || 'Validation constraints unfulfilled.'
      return NextResponse.json({ error: firstMsg, errors: fieldErrors }, { status: 400 })
    }

    const payload: Record<string, unknown> = { ...parsed.data, role: 'student' }
    if (parsed.data.password) {
      payload.password_confirmation = parsed.data.password
    }

    const authHeader = req.headers.get('authorization') || ''
    const laravelHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    if (authHeader) laravelHeaders['Authorization'] = authHeader

    const laravelRes = await fetch(`${API_BASE}/student/register`, {
      method: 'POST',
      headers: laravelHeaders,
      body: JSON.stringify(payload),
    })

    const laravelData = await laravelRes.json()

    if (!laravelRes.ok) {
      const fieldErrors = laravelData.errors
      if (fieldErrors) {
        const firstKey = Object.keys(fieldErrors)[0]
        const firstMsg = fieldErrors[firstKey][0]
        return NextResponse.json({ error: firstMsg, errors: fieldErrors, code: laravelData.message }, { status: laravelRes.status })
      }
      if (laravelData.message?.toLowerCase().includes('already enrolled')) {
        return NextResponse.json({ error: 'already_enrolled', code: laravelData.message }, { status: 409 })
      }
      return NextResponse.json({ error: laravelData.message || 'Registration failed.', code: laravelData.message }, { status: laravelRes.status })
    }

    const data = laravelData.data
    const courseId = data.course?.id || parsed.data.course_id

    return NextResponse.json({
      success: true,
      gatewayUrl: `/student-information?courseId=${courseId}`,
      user: data.user || null,
      enrollment: data.enrollment || null,
      course: data.course || null,
      transaction_id: data.transaction_id || null,
      access_token: data.access_token || null,
      refresh_token: data.refresh_token || null,
    })
  } catch (err) {
    console.error('Checkout API error:', err)
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}
