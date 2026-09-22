'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Video, Maximize2, Minimize2, Users, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Class } from '@/types'

interface LiveClassModalProps {
  classItem: Class | null
  onClose: () => void
}

export function LiveClassModal({ classItem, onClose }: LiveClassModalProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (classItem) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [classItem, onClose])

  if (!classItem) return null

  const roomId = `lms-${classItem.id}`
  const jitsiUrl = `https://meet.jit.si/${roomId}#config.startWithAudioMuted=false&config.startWithVideoMuted=false`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            'bg-[#000B05] border border-green-900/30 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col',
            fullscreen ? 'fixed inset-4' : 'w-[90vw] max-w-5xl h-[80vh]'
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-900/20 bg-[#042718] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Video className="w-4 h-4 text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{classItem.title}</p>
                <p className="text-[10px] text-gray-400 truncate">
                  {classItem.instructor?.name || 'Instructor'} · {classItem.category || 'Live Class'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-2">
                <Clock size={12} /> {classItem.duration || '60'}m
                <span className="mx-1">·</span>
                <Users size={12} /> {classItem.enrolled_count || 0}
              </div>
              <Button
                onClick={() => setFullscreen(f => !f)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/5 h-8 w-8 p-0"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5 h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Jitsi Iframe */}
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              src={jitsiUrl}
              allow="camera; microphone; display-capture; autoplay"
              className="w-full h-full border-0"
              title={classItem.title}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-green-900/20 bg-[#042718] shrink-0">
            <p className="text-[10px] text-gray-500 text-center">
              Meeting room: <span className="text-[#10B981] font-mono">{roomId}</span> · Powered by Jitsi Meet
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
