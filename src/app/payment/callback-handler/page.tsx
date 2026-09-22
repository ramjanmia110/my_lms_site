'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { clearPendingEnrollment } from '@/lib/pending-enrollment'
import toast from 'react-hot-toast'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processPayment = async () => {
      const status = searchParams.get('status')
      const transactionId = searchParams.get('transaction_id') || searchParams.get('tran_id') || ''
      const courseId = searchParams.get('course_id') || ''
      const paymentMethod = searchParams.get('payment_method') || 'sslcommerz'

      if (status !== 'VALID' && status !== 'success') {
        toast.error('Payment was not successful.')
        router.push(`/dashboard/courses?payment=failed`)
        return
      }

      if (!courseId) {
        toast.error('Missing course information.')
        router.push('/dashboard/courses')
        return
      }

      const token = localStorage.getItem('access_token')
      if (!token) {
        toast.error('Session expired. Please log in again.')
        router.push(`/login?enroll=${courseId}`)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/enrollments/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_id: Number(courseId),
            payment_method: paymentMethod,
            transaction_id: transactionId || `gateway_${Date.now()}`,
            payment_details: JSON.stringify({ gateway_status: status }),
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Payment processing failed')
        }

        toast.success('Payment successful! Course activated.')
        clearPendingEnrollment()
        router.push(`/dashboard?enrolled=${courseId}`)
      } catch (err: any) {
        toast.error(err.message || 'Payment processing failed.')
        router.push(`/dashboard/courses?payment=failed`)
      }
    }

    processPayment()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Processing your payment...</p>
      </div>
    </div>
  )
}

export default function PaymentCallbackHandler() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
