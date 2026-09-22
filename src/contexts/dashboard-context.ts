'use client'
import { createContext, useContext } from 'react'

export type DashboardTab = 'dashboard' | 'courses' | 'classes' | 'students' | 'assignments' | 'projects' | 'marketplace' | 'jobs'

export interface DashboardContextType {
  activeTab: DashboardTab
  setActiveTab: (tab: DashboardTab) => void
}

export const DashboardContext = createContext<DashboardContextType>({
  activeTab: 'dashboard',
  setActiveTab: () => {},
})

export const useDashboard = () => useContext(DashboardContext)
