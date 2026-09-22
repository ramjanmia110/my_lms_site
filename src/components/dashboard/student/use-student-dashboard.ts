'use client'

import { useQuery } from '@tanstack/react-query'
import { studentsAPI, analyticsAPI, quotesAPI } from '@/lib/api'
import type { StudentProfileBundle, DailyQuote, Recommendation, LearningGoal } from './types'

function unwrap<T>(res: any, key?: string): T {
  const data = res?.data?.data ?? res?.data ?? res
  if (key && typeof data === 'object' && data !== null) return data[key]
  return data as T
}

export function useStudentDashboard(userId: number) {
  return useQuery({
    queryKey: ['student-dashboard', userId],
    queryFn: async () => {
      const bundleRes = await studentsAPI.getProfileBundle(userId)
      const bundle: StudentProfileBundle = unwrap<StudentProfileBundle>(bundleRes)
      return bundle
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
    retry: 2,
  })
}

export function useDailyQuote() {
  return useQuery({
    queryKey: ['daily-quote'],
    queryFn: async (): Promise<DailyQuote> => {
      const res = await quotesAPI.getDaily()
      return unwrap<DailyQuote>(res)
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async (): Promise<Recommendation[]> => {
      const res = await analyticsAPI.getRecommendations()
      return unwrap<Recommendation[]>(res, 'recommendations')
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useLearningGoals(userId: number) {
  return useQuery({
    queryKey: ['learning-goals', userId],
    queryFn: async (): Promise<{ overall_progress: number; goals: LearningGoal[] }> => {
      const res = await studentsAPI.getLearningGoals(userId)
      return unwrap(res)
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
    retry: 1,
  })
}

export function useWeeklyPromo(userId: number) {
  const { data: bundle } = useStudentDashboard(userId)
  const weekly = bundle?.analytics?.weekly ?? []
  const monthly = bundle?.analytics?.monthly
  const prev = monthly?.previous
  const curr = monthly?.current
  return { weekly, monthly, previous: prev ?? null, current: curr ?? null }
}