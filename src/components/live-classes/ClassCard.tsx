'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Video, Calendar, Clock, Users, PlayCircle, Download, Timer, Plus, Star, Globe,
  DollarSign, Copy, MessageSquare, HelpCircle, Bookmark, Share2, Flag, Bell,
  CheckCircle2, Award, MonitorPlay, BarChart3, ChevronDown, ChevronUp, BadgeCheck,
} from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { AddToCalendar } from './AddToCalendar'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import type { Class } from '@/types'

interface ClassCardProps {
  cls: Class
  liveStatus: 'live' | 'upcoming' | 'past'
  onJoin: (c: Class) => void
  onBio: (c: Class) => void
  onCreateClick?: () => void
  onBookmark?: (c: Class) => void
  onShare?: (c: Class) => void
  onReport?: (c: Class) => void
  onRate?: (c: Class, rating: number) => void
  isBookmarked?: boolean
}

function parseClassDateTime(dateStr: string, timeStr: string): Date {
  const [time, modifier] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  if (modifier === 'PM' && hours !== 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0
  return new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
}

function copyToClipboard(text: string, e: React.MouseEvent) {
  e.stopPropagation()
  navigator.clipboard.writeText(text)
  import('react-hot-toast').then(m => m.default.success('Link copied!'))
}

export default function ClassCard({
  cls, liveStatus, onJoin, onBio, onCreateClick,
  onBookmark, onShare, onReport, onRate, isBookmarked = false,
}: ClassCardProps) {
  const maxStudents = cls.max_students || 50
  const enrolled = cls.enrolled_count || 0
  const seatsLeft = maxStudents - enrolled
  const durationMin = parseInt(cls.duration || '60') || 60
  const [showDetails, setShowDetails] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [reminderSet, setReminderSet] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  if (cls.id === -1) {
    return (
      <motion.div
        onClick={onCreateClick}
        className="flex items-center justify-center rounded-2xl p-[18px] min-h-[280px] cursor-pointer border-2 border-dashed transition-colors hover:bg-white/[0.02]"
        style={{ borderColor: '#1f3a2d', background: 'transparent' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#0d251c', border: '1px solid #1f3a2d' }}>
            <Plus size={22} color="#5eead4" />
          </div>
          <p className="text-sm font-semibold text-white">Create a new class</p>
          <p className="text-xs mt-1" style={{ color: '#8fae9f' }}>Schedule a live session</p>
        </div>
      </motion.div>
    )
  }

  const isLive = liveStatus === 'live'
  const isUpcoming = liveStatus === 'upcoming'
  const isPast = liveStatus === 'past'
  const courseProgress = cls.course_id ? Math.min(Math.round((enrolled / maxStudents) * 100), 100) : null

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-[18px] flex flex-col gap-3 relative group"
      style={{ background: '#0d251c', border: `1px solid ${isLive ? '#1f9d6f' : '#1f3a2d'}` }}>

      {/* Top badges row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {isLive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse"
              style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] inline-block" /> LIVE
            </div>
          )}
          {!isLive && isUpcoming && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
              <Timer size={11} /> Upcoming
            </div>
          )}
          {isPast && cls.recording_available && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}>
              <PlayCircle size={11} /> Recording
            </div>
          )}
          {isPast && !cls.recording_available && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8' }}>
              <CheckCircle2 size={11} /> Ended
            </div>
          )}
          {cls.auto_record && isUpcoming && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7' }}>
              <MonitorPlay size={10} /> Auto-record
            </div>
          )}
          {cls.course_id && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6' }}>
              <BarChart3 size={10} /> Course
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onBookmark?.(cls) }}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: isBookmarked ? '#fbbf2420' : 'transparent', border: 'none' }}>
            <Bookmark size={14} fill={isBookmarked ? '#fbbf24' : 'none'} color={isBookmarked ? '#fbbf24' : '#8fae9f'} />
          </button>
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu) }}
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'transparent', border: 'none' }}>
              <Share2 size={14} color="#8fae9f" />
            </button>
            {showShareMenu && (
              <div className="absolute right-0 top-8 z-50 w-40 rounded-xl py-1.5 shadow-lg"
                style={{ background: '#0a1b14', border: '1px solid #1f6f52' }}>
                {[
                  { label: 'Copy link', icon: Copy, action: () => cls.meeting_url && copyToClipboard(cls.meeting_url, {} as any) },
                  { label: 'Invite friends', icon: Users, action: () => onShare?.(cls) },
                ].map(item => (
                  <button key={item.label} onClick={(e) => { e.stopPropagation(); item.action(); setShowShareMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs cursor-pointer bg-transparent border-none text-left"
                    style={{ color: '#a9c9bb' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1f3a2d20')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <item.icon size={12} /> {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      {cls.thumbnail && (
        <div className="w-full h-32 rounded-xl overflow-hidden -mx-[18px] -mt-[18px] mb-0 relative" style={{ width: 'calc(100% + 36px)' }}>
          <img src={cls.thumbnail} alt={cls.title} className="w-full h-full object-cover" />
          {isLive && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(31,159,111,0.4), rgba(0,0,0,0.5))' }}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full animate-pulse"
                style={{ background: 'rgba(248,113,113,0.9)' }}>
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                <span className="text-xs font-bold text-white">LIVE NOW</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        {cls.category && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: '#1fbf7a15', color: '#5eead4', border: '1px solid #1fbf7a30' }}>
            {cls.category}
          </span>
        )}
        {cls.level && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              background: cls.level === 'advanced' ? '#f8717115' : cls.level === 'intermediate' ? '#fbbf2415' : '#34d39915',
              color: cls.level === 'advanced' ? '#f87171' : cls.level === 'intermediate' ? '#fbbf24' : '#34d399',
              border: `1px solid ${cls.level === 'advanced' ? '#f8717130' : cls.level === 'intermediate' ? '#fbbf2430' : '#34d39930'}`,
            }}>
            {cls.level.charAt(0).toUpperCase() + cls.level.slice(1)}
          </span>
        )}
        {cls.language && (
          <span className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: '#0d251c', border: '1px solid #1f3a2d', color: '#8fae9f' }}>
            <Globe size={10} /> {cls.language}
          </span>
        )}
        {cls.price !== undefined && cls.price !== null && cls.price > 0 && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: '#fbbf2415', color: '#fbbf24', border: '1px solid #fbbf2430' }}>
            ${cls.price}
          </span>
        )}
        {cls.price === 0 && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: '#34d39915', color: '#34d399', border: '1px solid #34d39930' }}>
            Free
          </span>
        )}
        {cls.platform && (
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: '#0d251c', border: '1px solid #1f3a2d', color: '#8fae9f' }}>
            {cls.platform === 'zoom' ? 'Zoom' : cls.platform === 'google_meet' ? 'Meet' : 'Custom'}
          </span>
        )}
      </div>

      {/* Title + description */}
      <div className="text-base font-semibold leading-tight text-white line-clamp-2">{cls.title}</div>
      {cls.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#8fae9f' }}>{cls.description}</p>
      )}

      {/* Instructor */}
      <button onClick={() => onBio(cls)} className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer text-left">
        <ProfileAvatar src={cls.instructor?.avatar || null} name={cls.instructor?.name || 'Instructor'} size="xs" />
        <span className="text-xs font-medium" style={{ color: '#a9c9bb' }}>{cls.instructor?.name || 'Instructor'}</span>
        {cls.instructor?.email_verified_at && (
          <BadgeCheck size={13} color="#34d399" fill="rgba(52,211,153,0.15)" />
        )}
      </button>

      {/* Date/time/duration */}
      <div className="flex items-center gap-3.5 text-xs" style={{ color: '#8fae9f' }}>
        <span className="flex items-center gap-1.5"><Calendar size={13} />{new Date(cls.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span className="flex items-center gap-1.5"><Clock size={13} />{cls.time}</span>
        <span className="flex items-center gap-1.5"><Timer size={13} />{durationMin}m</span>
      </div>

      {/* Rating (for past/recorded) */}
      {(isPast || (cls.rating && cls.rating > 0)) && (
        <div className="flex items-center gap-1.5 text-xs">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setUserRating(i); onRate?.(cls, i) }}
              className="bg-transparent border-none p-0 cursor-pointer">
              <Star size={13} color="#facc15" fill={i <= Math.round(userRating || cls.rating || 0) ? '#facc15' : 'none'} />
            </button>
          ))}
          {(cls.rating && cls.rating > 0) && (
            <>
              <span style={{ color: '#facc15' }} className="font-semibold">{cls.rating.toFixed(1)}</span>
              {cls.review_count !== undefined && <span style={{ color: '#8fae9f' }}>({cls.review_count})</span>}
            </>
          )}
        </div>
      )}

      {/* Progress bar for course classes */}
      {courseProgress !== null && (
        <div className="mt-1">
          <div className="flex items-center justify-between text-[10px] mb-1" style={{ color: '#8fae9f' }}>
            <span>Course progress</span>
            <span>{courseProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1f3a2d' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${courseProgress}%`, background: 'linear-gradient(90deg, #34d399, #1fbf7a)' }} />
          </div>
        </div>
      )}

      {/* Status-specific info */}
      {isLive && (
        <div className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2" style={{ background: '#0a1c16', border: '1px solid #1f3a2d', color: '#e8fff3' }}>
          <Users size={14} color="#34d399" />
          {seatsLeft > 0 ? `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left` : 'No seats left'}
          <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: '#34d399' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" /> In progress
          </span>
        </div>
      )}

      {isUpcoming && (
        <div className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2" style={{ background: '#0a1c16', border: '1px solid #1f3a2d', color: '#e8fff3' }}>
          <Timer size={14} color="#34d399" />
          Starts in <span className="font-bold"><CountdownTimer date={cls.date} time={cls.time} /></span>
          {seatsLeft <= 5 && seatsLeft > 0 && <span className="ml-auto" style={{ color: '#fbbf24' }}>Almost full</span>}
          {seatsLeft <= 0 && <span className="ml-auto" style={{ color: '#f87171' }}>Full — waitlist</span>}
        </div>
      )}

      {isPast && (
        <div className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2" style={{ background: '#0a1c16', border: '1px solid #1f3a2d', color: '#e8fff3' }}>
          <Users size={14} color="#60a5fa" />
          Attendance: {enrolled > 0 ? Math.min(Math.round((enrolled / maxStudents) * 100), 100) : 0}%
          {cls.recording_available && <span className="ml-auto text-[10px]" style={{ color: '#60a5fa' }}>Recording available</span>}
        </div>
      )}

      {/* Feature badges */}
      <div className="flex items-center gap-2 flex-wrap text-[10px]" style={{ color: '#8fae9f' }}>
        {cls.allow_chat !== false && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#0d251c', border: '1px solid #1f3a2d' }}>
            <MessageSquare size={10} /> Chat
          </span>
        )}
        {cls.allow_qa !== false && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#0d251c', border: '1px solid #1f3a2d' }}>
            <HelpCircle size={10} /> Q&A
          </span>
        )}
        {cls.recording_available && isPast && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#0d251c', border: '1px solid #1f3a2d' }}>
            <PlayCircle size={10} /> Replay
          </span>
        )}
        {cls.prerequisites && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#0d251c', border: '1px solid #1f3a2d' }}>
            <Award size={10} /> Prereqs
          </span>
        )}
      </div>

      {/* Expandable details */}
      <button onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails) }}
        className="flex items-center gap-1 text-[10px] bg-transparent border-none p-0 cursor-pointer"
        style={{ color: '#5eead4' }}>
        {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {showDetails ? 'Less info' : 'More info'}
      </button>

      {showDetails && (
        <div className="space-y-2 text-xs pt-1 border-t border-white/[0.05]" style={{ color: '#8fae9f' }}>
          {cls.prerequisites && (
            <div><span className="font-medium text-white">Prerequisites: </span>{cls.prerequisites}</div>
          )}
          {cls.materials_url && (
            <a href={cls.materials_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 no-underline" style={{ color: '#5eead4' }}>
              <Download size={11} /> Download materials
            </a>
          )}
          {cls.tags && cls.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(Array.isArray(cls.tags) ? cls.tags : []).filter(Boolean).map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full" style={{ background: '#1f3a2d30', color: '#8fae9f' }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        {isLive && (
          <button onClick={() => onJoin(cls)}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 px-3.5 rounded-xl border-none cursor-pointer"
            style={{ background: '#1fbf7a', color: '#04231a' }}>
            <Video size={15} /> Join now
          </button>
        )}

        {isUpcoming && seatsLeft > 0 && (
          <>
            <button onClick={() => onJoin(cls)}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 px-3.5 rounded-xl border-none cursor-pointer"
              style={{ background: '#1fbf7a', color: '#04231a' }}>
              <Calendar size={14} /> Enroll now
            </button>
            <button onClick={(e) => { e.stopPropagation(); setReminderSet(!reminderSet) }}
              className="flex items-center justify-center gap-1 text-sm font-semibold py-2.5 px-3 rounded-xl cursor-pointer"
              style={{ background: reminderSet ? '#fbbf2420' : 'transparent', border: `1px solid ${reminderSet ? '#fbbf2440' : '#1f3a2d'}`, color: reminderSet ? '#fbbf24' : '#a9c9bb' }}>
              <Bell size={14} fill={reminderSet ? '#fbbf24' : 'none'} />
            </button>
            <AddToCalendar classItem={cls} />
          </>
        )}

        {isUpcoming && seatsLeft <= 0 && (
          <button disabled className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3.5 rounded-xl cursor-not-allowed"
            style={{ background: '#152c22', border: '1px solid #1f6f52', color: '#5f7a6d' }}>
            <Calendar size={14} /> Join waitlist
          </button>
        )}

        {isPast && cls.recording_url && (
          <a href={cls.recording_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3 rounded-xl no-underline"
            style={{ border: '1px solid #1f6f52', color: '#5eead4' }}>
            <PlayCircle size={14} /> Watch replay
          </a>
        )}

        {isPast && cls.materials_url && !showDetails && (
          <a href={cls.materials_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3 rounded-xl no-underline"
            style={{ border: '1px solid #1f3a2d', color: '#a9c9bb' }}>
            <Download size={14} />
          </a>
        )}
      </div>

      {/* Bottom meta + report */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.05]" style={{ color: '#8fae9f' }}>
        <div className="flex items-center gap-3.5">
          <span className="flex items-center gap-1"><Clock size={11} />{durationMin} min</span>
          {isPast
            ? <span className="flex items-center gap-1"><Users size={11} />{enrolled} attended</span>
            : <span className="flex items-center gap-1"><Users size={11} />{enrolled} enrolled</span>
          }
        </div>
        <button onClick={(e) => { e.stopPropagation(); onReport?.(cls) }}
          className="bg-transparent border-none p-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: '#8fae9f' }}>
          <Flag size={11} />
        </button>
      </div>
    </motion.div>
  )
}
