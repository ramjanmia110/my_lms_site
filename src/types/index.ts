export interface Enrollment {
  id: number
  user_id: number
  course_id: number
  payment_id: number | null
  progress: number
  completed: boolean
  status: 'active' | 'pending' | 'cancelled'
  enrolled_at: string | null
  completed_at: string | null
}

export interface Payment {
  id: number
  user_id: number
  course_id: number
  amount: number
  currency: string
  payment_method: 'stripe' | 'sslcommerz' | 'manual' | 'bkash' | 'nagad' | 'demo'
  transaction_id: string | null
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'instructor' | 'freelancer' | 'client' | 'admin'
  avatar: string | null
  chat_avatar_url?: string | null
  phone?: string | null
  address?: string | null
  email_verified_at: string | null
  created_at: string
  last_activity?: string | null
  onboarding_completed: boolean
  profile_completed?: boolean
  skills: string[]
  bio: string | null
  interests?: string[]
  skill_level?: string
  country?: string
  learning_hours?: string
  career_goal?: string
  desired_skills?: string[]
  income_goal?: string
  freelancing_interest?: boolean
  goal?: string
  learning_style?: string
  available_time?: string
}

export interface Course {
  id: number
  title: string
  slug: string
  thumbnail: string | null
  description: string
  category: string
  price: number
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  instructor: User
  lessons: Lesson[]
  modules?: Module[]
  course_projects?: CourseProject[]
  live_classes?: Class[]
  students_count: number
  rating: number
  created_at: string
}

export interface Module {
  id: number
  course_id: number
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

export interface Lesson {
  id: number
  course_id: number
  module_id: number | null
  title: string
  type: 'video' | 'text' | 'pdf'
  content: string
  video_url: string | null
  duration: string
  order: number
  resources: string[]
}

export interface Class {
  id: number
  course_id: number | null
  course?: { id: number; title: string; slug?: string } | null
  title: string
  date: string
  time: string
  meeting_url: string | null
  description: string | null
  instructor: User
  attendance: Attendance[]
  available_seats?: number
  students_count?: number
  category?: string | null
  max_students?: number
  status?: string
  duration?: string | null
  thumbnail?: string | null
  level?: 'beginner' | 'intermediate' | 'advanced' | null
  language?: string
  price?: number | null
  platform?: 'zoom' | 'google_meet' | 'custom'
  recording_url?: string | null
  materials_url?: string | null
  enrolled_count?: number
  is_draft?: boolean
  auto_record?: boolean
  tags?: string[] | null
  rating?: number | null
  review_count?: number
  recording_available?: boolean
  waitlist_enabled?: boolean
  allow_chat?: boolean
  allow_qa?: boolean
  prerequisites?: string | null
}

export interface CourseProject {
  id: number
  course_id: number
  title: string
  description: string | null
  technologies: string[]
}

export interface LessonProgress {
  id: number
  user_id: number
  lesson_id: number
  course_id: number
  completed: boolean
  completed_at: string | null
}

export interface Attendance {
  id: number
  user_id: number
  present: boolean
}

export interface Assignment {
  id: number
  title: string
  description: string
  due_date: string
  course_id: number
  instructor: User
  submissions: Submission[]
}

export interface Submission {
  id: number
  user_id: number
  file_url: string | null
  text: string | null
  url: string | null
  grade: number | null
  feedback: string | null
  submitted_at: string
}

export interface Project {
  id: number
  title: string
  description: string
  budget: number
  deadline: string
  skills: string[]
  client: User
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  proposals: Proposal[]
}

export interface Proposal {
  id: number
  freelancer: User
  cover_letter: string
  bid_amount: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  conversation_id?: number | null
  group_id?: number | null
  reply_to_id?: number | null
  content: string | null
  file_url: string | null
  created_at: string
  read_at: string | null
  deleted_at?: string | null
  sender?: User
  receiver?: User
  reply_to?: { id: number; content: string | null; sender?: { id: number; name: string } } | null
  is_mine?: boolean
}

export interface Conversation {
  id: number
  user: User
  last_message?: {
    id: number
    content: string | null
    created_at: string
    is_mine: boolean
    read_at?: string | null
    sender_id: number
  } | null
  unread_count: number
  is_typing: boolean
  created_at: string
  is_pinned?: boolean
  is_muted?: boolean
  mute_expires_at?: string | null
  is_archived?: boolean
}

export interface ChatGroup {
  id: number
  name: string
  description: string | null
  avatar: string | null
  type: 'team' | 'channel' | 'group'
  owner: User
  members_count: number
  last_message?: {
    id: number
    content: string
    created_at: string
    sender_id: number
  } | null
  created_at: string
}

export interface ChatGroupMember {
  id: number
  name: string
  email: string
  avatar: string | null
  chat_avatar_url?: string | null
  role: 'owner' | 'admin' | 'member'
  is_online: boolean
}

export interface Wallet {
  balance: number
  transactions: Transaction[]
}

export interface Transaction {
  id: number
  type: 'credit' | 'debit'
  amount: number
  description: string
  created_at: string
}

export interface WordPressSite {
  id: number
  url: string
  name: string
  username: string
  status: 'connected' | 'disconnected' | 'error'
  last_sync: string | null
  created_at: string
}

export interface GeneratedTool {
  id: number
  title: string
  keyword: string
  code: string
  shortcode: string
  seo_title: string | null
  meta_description: string | null
  site_id: number | null
  live_url: string | null
  status: 'draft' | 'published'
  created_at: string
}

export interface GeneratedBlog {
  id: number
  title: string
  content: string
  seo_title: string
  meta_description: string
  faq: any
  schema: any
  shortcode: string
  site_id: number | null
  live_url: string | null
  status: 'draft' | 'published'
  created_at: string
}

export interface Analytics {
  total_students: number
  total_courses: number
  total_projects: number
  total_earnings: number
  ai_tools_generated: number
  connected_websites: number
  revenue_data: { month: string; amount: number }[]
  student_growth: { month: string; count: number }[]
  project_stats: { status: string; count: number }[]
}

export interface AnalyticsOverview {
  stats: {
    total_courses: number
    total_enrollments: number
    active_enrollments: number
    total_assignments: number
    submitted_assignments: number
    total_projects: number
    total_services: number
    total_jobs: number
    wallet_balance: number
    total_revenue: number
    total_earnings: number
    total_withdrawals: number
    net_revenue: number
    pending_payments: number
  }
  revenue: {
    monthly: { month: string; revenue: number; withdrawals: number }[]
    payment_methods: { payment_method: string; count: number; total: number }[]
    payment_statuses: { pending: number; completed: number; failed: number; refunded: number }
    recent_payments: { id: number; user: string; course: string; amount: number; method: string; status: string; created_at: string }[]
  }
  enrollments: {
    monthly: { month: string; count: number }[]
    total: number
    by_status: Record<string, number>
    completion: { completed: number; in_progress: number; average_progress: number; completion_rate: number }
  }
  course_performance: {
    popular_courses: {
      id: number; title: string; slug: string; category: string; level: string
      enrollments_count: number; rating: number; students_count: number; completion_rate: number
    }[]
    category_breakdown: { category: string; count: number; avg_rating: number; total_students: number }[]
    level_breakdown: Record<string, number>
  }
  student_activity: {
    total: number; active: number; at_risk: number; inactive: number
    weekly_active: number; monthly_active: number
    active_students: { id: number; name: string; email: string; avatar: string | null; enrolled_courses: number; average_progress: number; last_activity: string | null; has_completed: boolean }[]
    at_risk_students: { id: number; name: string; email: string; avatar: string | null; enrolled_courses: number; average_progress: number; last_activity: string | null; has_completed: boolean }[]
    inactive_students: { id: number; name: string; email: string; avatar: string | null; enrolled_courses: number; average_progress: number; last_activity: string | null; has_completed: boolean }[]
  }
  schedule: {
    upcoming_classes: { id: number; title: string; date: string; time: string; meeting_url: string | null; instructor: string; type: string }[]
    assignment_deadlines: { id: number; title: string; course: string; due_date: string; type: string }[]
    project_deadlines: { id: number; title: string; deadline: string; budget: number; type: string }[]
  }
  recommendations: {
    id: number; title: string; slug: string; category: string; level: string
    rating: number; students_count: number; reasons: string[]
  }[]
  charts: {
    enrollment_trends: { month: string; count: number }[]
    revenue_trends: { month: string; revenue: number }[]
    student_growth: { month: string; count: number }[]
    completion_trends: { month: string; total: number; completed: number }[]
    course_categories: { category: string; count: number }[]
  }
}

export interface ClassCategory {
  id: string
  name: string
  color_hex: string
}

export interface StudentPoints {
  student_id: string
  total_points: number
}

export type LiveStatus = 'live' | 'upcoming' | 'past'

export interface LiveClass {
  id: string
  title: string
  description?: string | null
  subject?: string
  category_id?: string | null
  category_name?: string
  category_color?: string
  instructor_name: string
  instructor_avatar_url: string | null
  instructor_bio?: string | null
  thumbnail?: string | null
  start_time: string
  duration_minutes: number
  meeting_url: string | null
  max_seats: number
  enrolled_count: number
  recording_url: string | null
  materials_url?: string | null
  status: 'draft' | 'published'
  created_at?: string
  // Extended fields
  instructor_id?: string
  instructor_email?: string
  is_favorite?: boolean
  is_pinned?: boolean
  meeting_password?: string
  platform?: 'jitsi' | 'zoom' | 'google_meet' | 'teams' | 'custom'
  recording_duration?: number
  recording_size?: number
  has_attendance_tracking?: boolean
  has_certificate?: boolean
  waiting_room_enabled?: boolean
  tags?: string[]
  level?: 'beginner' | 'intermediate' | 'advanced'
  language?: string
  price?: number
}

export interface ClassAttendance {
  id: string
  class_id: string
  user_id: string
  user_name: string
  joined_at: string
  left_at?: string
  duration_minutes?: number
  points_earned?: number
  hand_raised?: boolean
  question_count?: number
  chat_messages?: number
  poll_responses?: number
}

export interface ClassPoll {
  id: string
  class_id: string
  question: string
  options: string[]
  votes: Record<string, number>
  is_active: boolean
  created_at: string
}

export type ClassPollNew = {
  id: number
  class_id: number
  created_by: number
  question: string
  options: { text: string; votes: number }[]
  is_active: boolean
  is_anonymous: boolean
  ends_at: string | null
  total_votes?: number
  results?: Record<number, number>
  created_at: string
}

export interface ClassRecording {
  id: string
  class_id: string
  class_title: string
  url: string
  duration_minutes: number
  size_mb: number
  created_at: string
  download_url?: string
}

export interface ClassFeedback {
  id: string
  class_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

export interface ClassSettings {
  default_platform: 'jitsi' | 'zoom' | 'google_meet' | 'teams' | 'custom'
  allow_recording: boolean
  allow_chat: boolean
  allow_qa: boolean
  allow_polls: boolean
  allow_whiteboard: boolean
  allow_screen_sharing: boolean
  allow_file_sharing: boolean
  allow_breakout_rooms: boolean
  waiting_room_enabled: boolean
  default_reminder_minutes: number
  send_email_reminders: boolean
  send_push_reminders: boolean
  send_sms_reminders: boolean
  zoom_api_key?: string
  zoom_api_secret?: string
  google_meet_credentials?: string
  microsoft_teams_credentials?: string
  jitsi_domain?: string
}

// ========================================
// LIVE CLASSES MODULE - Extended Types
// ========================================

export interface ClassRecording2 {
  id: number
  class_id: number
  title: string
  url: string
  file_path: string | null
  thumbnail: string | null
  duration_seconds: number
  size_mb: number | null
  description: string | null
  is_public: boolean
  view_count: number
  created_at: string
}

export interface ClassMaterial2 {
  id: number
  class_id: number
  title: string
  type: 'file' | 'link' | 'video' | 'document'
  url: string | null
  file_path: string | null
  description: string | null
  download_count: number
  is_required: boolean
  created_at: string
}

export interface ClassPoll2 {
  id: number
  class_id: number
  created_by: number
  question: string
  options: { text: string; votes: number[] }[]
  is_active: boolean
  is_anonymous: boolean
  ends_at: string | null
  creator?: User
  created_at: string
}

export interface ClassParticipant {
  id: number
  class_id: number
  user_id: number
  status: 'joined' | 'left' | 'waiting' | 'kicked'
  joined_at: string | null
  left_at: string | null
  duration_seconds: number
  hand_raised: boolean
  is_muted: boolean
  is_video_on: boolean
  is_screen_sharing: boolean
  user?: User
  created_at: string
}

export interface ClassMessage {
  id: number
  class_id: number
  user_id: number
  message: string
  type: 'chat' | 'announcement' | 'system'
  reply_to_id: number | null
  is_pinned: boolean
  user?: User
  reply_to?: ClassMessage
  replies?: ClassMessage[]
  created_at: string
}

export interface LiveClassDashboard {
  total_classes: number
  today_classes: number
  upcoming_classes: number
  live_now: number
  completed: number
  cancelled: number
  recordings: number
  attendance_percentage: number
  average_participants: number
  total_hours: number
  recent_classes: Class[]
  next_class: Class | null
  popular_instructor: User | null
  total_students: number
  total_instructors: number
  average_session_duration: number
  this_week_classes: number
  monthly_trends: { month: string; count: number }[]
  attendance_trends: { month: string; rate: number }[]
  category_distribution: Record<string, number>
  platform_distribution: Record<string, number>
  status_distribution: Record<string, number>
  top_instructors: { name: string; classes: number; rating: number }[]
}

// ========================================
// STUDENTS MODULE - Extended Types
// ========================================

export interface StudentDashboard {
  total_students: number
  active: number
  new: number
  graduated: number
  suspended: number
  male: number
  female: number
  online: number
  offline: number
  attendance_percentage: number
  course_completion: number
  payments_collected: number
  recent_students: User[]
}

export interface StudentProfile {
  user: User
  courses: Enrollment[]
  attendance: { total: number; present: number; percentage: number }
  assignments: { total: number; submitted: number; graded: number }
  grades: { average: number; highest: number; lowest: number }
  payments: Payment[]
  documents: StudentDocument[]
  certificates: StudentCertificate[]
  activity_log: ActivityLog[]
}

export interface StudentDocument {
  id: number
  user_id: number
  title: string
  type: 'transcript' | 'certificate' | 'id_card' | 'payment_receipt' | 'other'
  file_path: string
  file_type: string | null
  file_size: number | null
  description: string | null
  is_verified: boolean
  created_at: string
}

export interface StudentCertificate {
  id: number
  user_id: number
  course_id: number
  certificate_number: string
  file_path: string | null
  issued_at: string
  expires_at: string | null
  status: 'active' | 'revoked' | 'expired'
  course?: Course
  created_at: string
}

export interface ActivityLog {
  id: number
  user_id: number
  loggable_type: string
  loggable_id: number
  action: string
  properties: Record<string, any> | null
  ip_address: string | null
  user?: User
  created_at: string
}

export interface StudentAnalytics {
  performance: { average_score: number; trend: string }
  learning_hours: { total: number; this_week: number; this_month: number }
  assignment_completion: { rate: number; on_time: number; late: number }
  course_completion: { rate: number; completed: number; in_progress: number }
  login_frequency: { daily_average: number; last_login: string; total_logins: number }
  attendance_trend: { date: string; percentage: number }[]
}

// ========================================
// ASSIGNMENTS MODULE - Extended Types
// ========================================

export interface AssignmentDashboard {
  total: number
  pending: number
  submitted: number
  graded: number
  late: number
  overdue: number
  average_score: number
  completion_rate: number
  recent_assignments: Assignment[]
}

export interface Assignment2 {
  id: number
  course_id: number
  title: string
  description: string
  instructions: string | null
  due_date: string
  total_marks: number
  type: 'file' | 'text' | 'quiz' | 'group'
  difficulty: 'easy' | 'medium' | 'hard'
  submission_type: 'upload' | 'text' | 'url' | 'multiple'
  allow_late_submission: boolean
  late_penalty_per_day: number | null
  plagiarism_check: boolean
  ai_grading_enabled: boolean
  max_attempts: number | null
  is_group_assignment: boolean
  group_size: number | null
  rubric: any | null
  files: string[] | null
  course?: Course
  instructor?: User
  submissions?: Submission2[]
  submissions_count?: number
  resources?: AssignmentResource[]
  comments?: AssignmentComment[]
  created_at: string
  updated_at: string
}

export interface AssignmentResource {
  id: number
  assignment_id: number
  title: string
  type: 'file' | 'link' | 'video' | 'sample_answer'
  url: string | null
  file_path: string | null
  description: string | null
  is_sample_answer: boolean
  created_at: string
}

export interface AssignmentComment {
  id: number
  assignment_id: number
  user_id: number
  parent_id: number | null
  comment: string
  type: 'discussion' | 'instructor_note' | 'feedback'
  user?: User
  parent?: AssignmentComment
  replies?: AssignmentComment[]
  created_at: string
}

export interface Submission2 {
  id: number
  assignment_id: number
  user_id: number
  file_url: string | null
  file_urls: string[] | null
  text: string | null
  url: string | null
  grade: number | null
  feedback: string | null
  status: 'submitted' | 'graded' | 'late' | 'returned' | 'resubmitted'
  is_late: boolean
  plagiarism_score: number | null
  ai_score: number | null
  ai_feedback: string | null
  attempt_number: number
  rubric_scores: any | null
  graded_by: string | null
  graded_at: string | null
  returned_at: string | null
  submitted_at: string
  user?: User
  assignment?: Assignment2
  created_at: string
}

export interface PlagiarismReport {
  id: number
  submission_id: number
  similarity_score: number
  report_data: any
  flagged_content: string | null
  status: 'pending' | 'reviewed' | 'cleared' | 'flagged'
  reviewer?: User
  review_notes: string | null
  created_at: string
}

export interface AssignmentAnalytics {
  completion_rate: number
  average_score: number
  submission_rate: number
  late_submission_rate: number
  top_students: { user: User; average_score: number; submissions: number }[]
  weak_students: { user: User; average_score: number; submissions: number }[]
  score_distribution: { range: string; count: number }[]
  submission_trend: { date: string; count: number }[]
}

// ========================================
// LIVE CLASSES MODULE - Extended Types
// ========================================

export interface ClassQA {
  id: number
  class_id: number
  user_id: number
  question: string
  answer: string | null
  status: 'pending' | 'answered' | 'pinned'
  votes: number
  is_pinned: boolean
  is_answered: boolean
  answered_by: number | null
  answered_at: string | null
  user?: User
  answerer?: User
  created_at: string
}

export interface ClassNote {
  id: number
  class_id: number
  user_id: number
  title: string | null
  content: string
  type: 'note' | 'summary' | 'resource'
  is_shared: boolean
  file_url: string | null
  user?: User
  created_at: string
}

export interface PollVote {
  id: number
  poll_id: number
  user_id: number
  selected_option: number
}

export interface ClassAnnouncement {
  id: number
  class_id: number
  user_id: number
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_read: boolean
  user?: User
  created_at: string
}

export interface ClassWaitingRoom {
  id: number
  class_id: number
  user_id: number
  status: 'waiting' | 'approved' | 'rejected'
  requested_at: string
  approved_at: string | null
  approved_by: number | null
  message: string | null
  user?: User
  created_at: string
}

export interface ClassAnalytics {
  attendance_rate: number
  join_rate: number
  completion_rate: number
  average_watch_time: number
  average_session_duration: number
  total_sessions: number
  top_classes: { id: number; title: string; attendance_rate: number; students: number }[]
  top_instructors: { id: number; name: string; classes: number; rating: number }[]
  most_active_students: { id: number; name: string; classes_attended: number; total_hours: number }[]
  weekly_data: { week: string; classes: number; attendance: number }[]
  monthly_data: { month: string; classes: number; attendance: number }[]
  category_stats: Record<string, { classes: number; avg_attendance: number }>
  platform_stats: Record<string, { classes: number; avg_attendance: number }>
}

export interface ClassReport {
  type: string
  title: string
  generated_at: string
  data: any
}

export interface ClassTimelineEvent {
  id: number
  class_id: number
  type: 'created' | 'started' | 'attendance_started' | 'break' | 'recording_started' | 'ended' | 'recording_uploaded'
  title: string
  description: string | null
  timestamp: string
  user?: User
}
