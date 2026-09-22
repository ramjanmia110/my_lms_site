'use client'
import { motion } from 'framer-motion'
import { Video, Plus } from 'lucide-react'

interface EmptyStateProps {
  search?: boolean
  onCreateClick?: () => void
}

export function EmptyState({ search, onCreateClick }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="text-center py-20" style={{ color: '#8fae9f' }}>
      <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: '#0d251c', border: '1px solid #1f3a2d' }}>
        <Video size={26} color="#5f7a6d" />
      </div>
      <div className="text-base mb-1" style={{ color: '#f2fbf6' }}>
        {search ? 'No classes match your search.' : 'No classes yet.'}
      </div>
      <div className="text-xs mb-4">
        {search ? 'Try adjusting your filters or search terms.' : 'Create your first live class to get started.'}
      </div>
      {!search && onCreateClick && (
        <button onClick={onCreateClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
          style={{ background: '#1fbf7a', color: '#04231a' }}>
          <Plus size={14} /> Create Class
        </button>
      )}
    </motion.div>
  )
}
