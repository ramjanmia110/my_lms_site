export interface StudentCourse {
  id: number
  course_id: number
  title: string
  thumbnail: string | null
  level: string | null
  category: string | null
  price: number | null
  instructor: { id: number; name: string; avatar: string | null } | null
  progress: number
  completed: boolean
  status: string
  enrolled_at: string
  completed_at: string | null
  lessons_completed: number
  current_lesson: string | null
  estimated_completion: string
}

export interface StudentSummary {
  enrolled_courses: number
  completed_courses: number
  in_progress: number
  average_progress: number
  attendance_rate: number
  attendance_present: number
  attendance_absent: number
  attendance_late: number
  assignments: StudentAssignmentStats
  certificates: number
  payments: {
    total_paid: number
    pending: number
    outstanding: number
    plan: string
    renewal_date: string | null
    coupons_used: number
  }
  live_classes: { upcoming: number; joined: number; missed: number; recordings: number }
  study_time: { total_hours: number; this_week: number; this_month: number }
  xp: number
  level: number
  streak: number
  rank: number
  warnings: string[]
}

export interface StudentAssignmentStats {
  total: number
  submitted: number
  assigned: number
  graded: number
  pending: number
  late: number
  avg_grade: number
  avg_percentage: number
  completion_rate: number
  upcoming_deadlines: number
  max_attempts: number
}

export interface StudentAssignment {
  id: number | string
  assignment_id: number
  title: string
  course: string | null
  grade: number | null
  percentage: number | null
  status: string
  is_late: boolean
  due_date: string | null
  max_score: number
  passed: boolean
}

export interface StudentCertificate {
  id: number
  title: string
  certificate_number: string | null
  file_path: string | null
  issued_at: string
  expires_at: string | null
  status: string
}

export interface StudentPayment {
  id: number
  course: string | null
  amount: number
  currency: string
  method: string | null
  transaction_id: string | null
  status: string
  details: any
  created_at: string
}

export interface StudentLiveClass {
  id: number
  title: string | null
  date: string | null
  time: string | null
  duration: number | null
}

export interface StudentActivityEvent {
  type: string
  title: string
  description: string | null
  at: string
}

export interface StudentNotification {
  id: number
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface StudentAchievement {
  title: string
  description: string
  icon: string
  earned: boolean
}

export interface WeeklyActivityDay {
  date: string
  attendance: number
  submissions: number
  study_minutes: number
  activity: number
}

export interface MonthlySnap {
  attendance: number
  submissions: number
  study_hours: number
  activity: number
  certificates: number
}

export interface Recommendation {
  id: number
  title: string
  slug: string
  category: string | null
  level: string | null
  rating: number
  students_count: number
  reasons: string[]
}

export interface LearningGoal {
  key: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  icon: string
}

export interface DailyQuote {
  quote: string
  author: string
  date: string
}

export interface StudentProfileBundle {
  student: {
    id: number
    name: string
    email: string
    avatar: string | null
    student_id?: string | null
  }
  summary: StudentSummary
  courses: StudentCourse[]
  assignments: StudentAssignment[]
  assignmentStats: StudentAssignmentStats
  certificates: StudentCertificate[]
  payments: StudentPayment[]
  live_classes: { upcoming: StudentLiveClass[]; joined: any[] }
  analytics: { weekly: WeeklyActivityDay[]; monthly: { current: MonthlySnap; previous: MonthlySnap } }
  notifications: StudentNotification[]
  activity: StudentActivityEvent[]
  achievements: StudentAchievement[]
  learning_path: any[]
  attendance_rate?: number
}