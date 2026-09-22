import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const gatewaySchema = z.object({
  status: z.enum(['VALID', 'FAILED', 'CANCELLED', 'success', 'failed']),
  tran_id: z.string().optional(),
  transaction_id: z.string().optional(),
  course_id: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  payment_method: z.string().optional(),
  error: z.string().optional(),
})

const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null) || Object.fromEntries(new URL(req.url).searchParams)
    const parsed = gatewaySchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 })
    }

    const { status, tran_id, transaction_id, course_id, payment_method } = parsed.data
    const txnId = tran_id || transaction_id || ''
    const method = payment_method || 'sslcommerz'

    if (status === 'VALID' || status === 'success') {
      const params = new URLSearchParams({
        status: 'VALID',
        transaction_id: txnId,
        course_id: String(course_id || ''),
        payment_method: method,
      })
      return NextResponse.redirect(new URL(`/payment/callback-handler?${params.toString()}`, frontendUrl))
    }

    return NextResponse.redirect(new URL(`/courses?payment=failed`, frontendUrl))
  } catch (err) {
    console.error('Payment callback error:', err)
    return NextResponse.redirect(new URL(`/courses?payment=failed`, frontendUrl))
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
