import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  draft: 'bg-[#EEF4FF] text-[#3478F6] border-[#3478F6]/20',
  review: 'bg-[#FEF5E7] text-[#F59E0B] border-[#F59E0B]/20',
  scheduled: 'bg-[#EEF4FF] text-[#3478F6] border-[#3478F6]/20',
  published: 'bg-[#ECFBF5] text-[#18A878] border-[#18A878]/20',
  archived: 'bg-[#FEE8E8] text-[#E5484D] border-[#E5484D]/20',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize',
        styles[status] || 'bg-[#F3EEFF] text-[#6D3DF5] border-[#6D3DF5]/20'
      )}
    >
      {status}
    </span>
  )
}
