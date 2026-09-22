'use client'

import { Check, CreditCard, Smartphone, Building, Landmark, Zap, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaymentMethodOption {
  gateway: string
  method?: string
  label: string
  icon?: string | null
  is_default?: boolean
  note?: string
}

const ICONS: Record<string, any> = {
  card: CreditCard, cards: CreditCard, credit_card: CreditCard, stripe: CreditCard,
  bkash: Smartphone, nagad: Smartphone, sslcommerz: Building, gateway: Building,
  bank: Landmark, internet_banking: Globe,
}

export default function PaymentMethodGrid({
  methods, selected, onSelect, note,
}: {
  methods: PaymentMethodOption[]
  selected: string
  onSelect: (gateway: string) => void
  note?: string
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {methods.map((m) => {
        const id = m.method || m.gateway
        const Icon = ICONS[String(m.icon || m.gateway)] || Building
        const isSelected = selected === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={isSelected}
            className={cn(
              'relative group border rounded-2xl p-4 text-left transition-all duration-200',
              isSelected
                ? 'border-[#6D3DF5] bg-[#F3EEFF] shadow-[0_8px_24px_-10px_rgba(109,61,245,0.45)]'
                : 'border-[#E9E7F5] bg-white hover:border-[#6D3DF5]/40 hover:bg-[#F9F7FF]'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                  isSelected ? 'bg-white text-[#6D3DF5] shadow-sm' : 'bg-[#F3EEFF] text-[#6D3DF5] group-hover:bg-white'
                )}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                  isSelected ? 'border-[#6D3DF5] bg-[#6D3DF5]' : 'border-[#D8D6EC] bg-white'
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#0F1B3D]">{m.label}</p>
            <p className="text-[10px] text-[#536078] mt-1 leading-tight line-clamp-2">
              {m.note}
            </p>
            {m.is_default && (
              <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-[#3478F6] bg-[#EEF4FF] border border-[#3478F6]/20 px-1.5 py-0.5 rounded-full">
                <Zap className="w-2.5 h-2.5" /> RECOMMENDED
              </span>
            )}
          </button>
        )
      })}
      {note && <p className="col-span-full text-[11px] text-[#A9B3C8]">{note}</p>}
    </div>
  )
}