'use client'

import { Award, Trophy, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard, SectionHeader, EmptyState } from './shared'
import type { StudentCertificate, StudentAchievement } from './types'

export function CertificatesAchievements({
  certificates,
  achievements,
  onViewCert,
}: {
  certificates: StudentCertificate[]
  achievements?: StudentAchievement[]
  onViewCert?: (c: StudentCertificate) => void
}) {
  const earned = (achievements || []).filter((a) => a.earned)
  return (
    <SectionCard className="p-4">
      <SectionHeader icon={Award} title="Achievements" subtitle={`${earned.length} unlocked · ${certificates.length} certificate${certificates.length === 1 ? '' : 's'}`} />
      {certificates.length === 0 && earned.length === 0 ? (
        <EmptyState icon={Trophy} title="No achievements yet" description="Complete lessons, attend classes and submit work to unlock achievements and certificates." />
      ) : (
        <div className="space-y-3 mt-3">
          {achievements && achievements.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {achievements.slice(0, 6).map((a) => (
                <div
                  key={a.title}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center',
                    a.earned ? 'border-[#6D3DF5]/20 bg-[#F3EEFF]/60' : 'border-[#E9E7F5] bg-[#F8FAFC]',
                  )}
                  title={a.description}
                >
                  {a.earned ? <Trophy className="w-4 h-4 text-[#6D3DF5]" /> : <Lock className="w-4 h-4 text-[#C6C8D4]" />}
                  <p className="text-[9px] font-semibold text-[#0F1B3D] leading-tight">{a.title}</p>
                  <p className="text-[8px] text-[#536078] leading-tight line-clamp-2">{a.description}</p>
                </div>
              ))}
            </div>
          )}
          {certificates.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#536078]">Certificates</p>
              {certificates.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onViewCert?.(c)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E9E7F5] bg-white hover:border-[#6D3DF5]/40 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-[#6D3DF5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[#0F1B3D] truncate">{c.title}</p>
                    {c.issued_at && (
                      <p className="text-[9px] text-[#536078] mt-0.5">Issued {new Date(c.issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}