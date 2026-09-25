'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_STEPS = [
  { n: 1, label: 'Student Info' },
  { n: 2, label: 'Order Review' },
  { n: 3, label: 'Payment' },
  { n: 4, label: 'Success' },
]

export default function CheckoutStepper({
  current,
  steps = DEFAULT_STEPS,
}: {
  current: number
  steps?: { n: number; label: string }[]
}) {
  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const status = step.n < current ? 'done' : step.n === current ? 'active' : 'upcoming'
          return (
            <li key={step.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <span
                  className={cn(
                    'relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                    status === 'done' && 'bg-[#6D3DF5] text-white shadow-[0_6px_16px_-6px_rgba(109,61,245,0.6)]',
                    status === 'active' &&
                      'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-[0_0_0_5px_rgba(109,61,245,0.15),0_8px_22px_-8px_rgba(109,61,245,0.7)]',
                    status === 'upcoming' && 'bg-white text-[#A9B3C8] border border-[#E9E7F5]'
                  )}
                >
                  {status === 'done' ? <Check className="w-4 h-4" strokeWidth={3} /> : step.n}
                </span>
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-wider hidden sm:block',
                    status === 'active' || status === 'done' ? 'text-[#6D3DF5]' : 'text-[#A9B3C8]'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="relative flex-1 mx-2 sm:mx-4 border-t border-dashed border-[#DCD8EF]">
                  <div
                    className={cn(
                      'absolute top-0 left-0 h-[2px] -mt-0.5 bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] transition-all duration-700',
                      status === 'done' || (step.n === current && current > 2) ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}