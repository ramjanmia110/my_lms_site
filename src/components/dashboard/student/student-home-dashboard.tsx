'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { WelcomeHeader, WelcomeHeaderSkeleton } from './welcome-header'
import { StatCards, StatCardsSkeleton } from './stat-cards'
import { ContinueLearning } from './continue-learning'
import { ActiveEnrollments } from './active-enrollments'
import { UpcomingClasses } from './upcoming-classes'
import { AssignmentsPanel } from './assignments-panel'
import { WeeklyActivityChart } from './weekly-activity-chart'
import { LearningGoals } from './learning-goals'
import { ActivityFeed } from './activity-feed'
import { NotificationsPanel } from './notifications-panel'
import { CertificatesAchievements } from './certificates-achievements'
import { RecommendedCourses } from './recommended-courses'
import { OrdersPayments } from './orders-payments'
import { SectionSkeleton } from './shared'
import { useStudentDashboard, useDailyQuote, useRecommendations, useLearningGoals } from './use-student-dashboard'
import type { StudentProfileBundle, DailyQuote, Recommendation, LearningGoal } from './types'

const loadingGrid = (
  <>
    <div className="grid lg:grid-cols-2 gap-4">
      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={2} />
    </div>
    <div className="grid lg:grid-cols-2 gap-4">
      <SectionSkeleton rows={3} />
      <SectionSkeleton rows={3} />
    </div>
  </>
)

function RenderSections({
  bundle,
  quote,
  recommendations,
  goals,
}: {
  bundle: StudentProfileBundle
  quote?: DailyQuote
  recommendations?: Recommendation[]
  goals?: { overall_progress: number; goals: LearningGoal[] }
}) {
  const router = useRouter()
  const openCourse = (course: any) => {
    router.push(`/dashboard/courses?course=${course.course_id ?? course.id}`)
  }

  return (
    <div className="space-y-6">
      <WelcomeHeader name={bundle.student?.name ?? 'Student'} quote={quote} onboardingPct={bundle.summary?.average_progress ?? undefined} />
      <StatCards bundle={bundle} />
      <RecommendedCourses recommendations={recommendations ?? []} onOpen={(r) => router.push(`/courses/${r.slug ?? r.id}`)} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ContinueLearning courses={bundle.courses ?? []} onContinue={openCourse} />
          <ActiveEnrollments courses={bundle.courses ?? []} onViewAll={() => router.push('/dashboard/courses')} onOpen={openCourse} />
        </div>
        <div className="space-y-4">
          <LearningGoals goals={goals?.goals ?? []} overall={goals?.overall_progress} />
          <AssignmentsPanel assignments={bundle.assignments ?? []} stats={bundle.assignmentStats} onViewAll={() => router.push('/dashboard/assignments')} />
          <UpcomingClasses classes={bundle.live_classes?.upcoming ?? []} onViewAll={() => router.push('/dashboard/classes')} />
        </div>
      </div>

      <WeeklyActivityChart weekly={bundle.analytics?.weekly ?? []} />

      <div className="grid lg:grid-cols-2 gap-4">
        <ActivityFeed events={bundle.activity ?? []} />
        <div className="space-y-4">
          <NotificationsPanel notifications={bundle.notifications ?? []} />
          <CertificatesAchievements certificates={bundle.certificates ?? []} achievements={bundle.achievements ?? []} />
        </div>
      </div>

      <OrdersPayments payments={bundle.payments ?? []} totals={bundle.summary?.payments} onViewAll={() => router.push('/dashboard/orders')} />
    </div>
  )
}

export function StudentHomeDashboard({ userId, name, compact }: { userId: number; name?: string; compact?: boolean }) {
  const { data: bundle, isLoading, isError, refetch } = useStudentDashboard(userId)
  const { data: quote } = useDailyQuote()
  const { data: recommendations } = useRecommendations()
  const { data: goals } = useLearningGoals(userId)

  if (compact) {
    if (!bundle) return null
    return <RenderSections bundle={bundle} quote={quote} recommendations={recommendations} goals={goals} />
  }

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <WelcomeHeaderSkeleton />
        <StatCardsSkeleton />
        {loadingGrid}
      </motion.div>
    )
  }

  if (isError || !bundle) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <WelcomeHeader name={name ?? 'Student'} />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-semibold text-[#0F1B3D]">Couldn&apos;t load your dashboard</p>
          <p className="text-xs text-[#536078] mt-1">Please try again in a moment.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold hover:brightness-110 transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}><RenderSections bundle={bundle} quote={quote} recommendations={recommendations} goals={goals} /></motion.div>
}