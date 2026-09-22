'use client'

import { motion } from 'framer-motion'

export function StatCard({ icon: Icon, label, value, color, hint }: { icon: any; label: string; value: number | string; color?: string; hint?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl bg-white border border-[#E9E7F5] ${color || ''}`}
    >
      <div className="w-9 h-9 rounded-lg bg-[#F3EEFF] flex items-center justify-center mb-2.5">
        <Icon size={16} className="text-[#6D3DF5]" />
      </div>
      <div className="text-xl font-bold text-[#0F1B3D] tracking-tight">{value}</div>
      <div className="text-[11px] text-[#536078] mt-0.5">{label}</div>
      {hint && <div className="text-[10px] text-[#94A3B8] mt-0.5">{hint}</div>}
    </motion.div>
  )
}
