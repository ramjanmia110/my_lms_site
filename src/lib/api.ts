import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
})

let refreshPromise: Promise<any> | null = null

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  if (config.data instanceof FormData) {
    if (config.headers) {
      delete (config.headers as any)['Content-Type']
    }
  }

  if ((config.method || 'get').toLowerCase() === 'get' && config.headers) {
    config.headers['Cache-Control'] = 'no-cache, no-store, max-age=0'
    config.headers['Pragma'] = 'no-cache'
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        // Single-flight refresh: several requests can 401 at the same time
        // (e.g. parallel dashboard polls). Firing an independent /auth/refresh
        // for each blacklists all but the first token (JWT blacklist enabled),
        // so the losing calls would 401 and wipe the session. Share one promise.
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
              { refresh_token: refreshToken },
              { timeout: 10000 }
            )
            .then((response) => {
              const { access_token, refresh_token } = response.data
              localStorage.setItem('access_token', access_token)
              // The backend rotates the refresh token on every refresh (JWT
              // blacklist is enabled), so persist the NEW one — otherwise the
              // second auto-refresh re-sends a blacklisted token and 401s.
              if (refresh_token) {
                localStorage.setItem('refresh_token', refresh_token)
              }
              return response.data
            })
            .finally(() => {
              setTimeout(() => { refreshPromise = null }, 0)
            })
        }

        const data = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return api(originalRequest)
      } catch (refreshError: any) {
        // Only treat the session as dead when the refresh token itself was
        // rejected by the backend (401). Network/timeout failures during the
        // refresh request are transient — do NOT wipe a valid session.
        const rejected = refreshError?.response?.status === 401
        if (rejected || !localStorage.getItem('refresh_token')) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  signup: (data: any) =>
    api.post('/auth/signup', data),
  googleLogin: (token: string) =>
    api.post('/auth/google', { token }),
  githubLogin: (code: string) =>
    api.post('/auth/github', { code }),
  logout: () =>
    api.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', data),
  me: () =>
    api.get('/auth/me'),
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
}

export const coursesAPI = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getOne: (id: number) => api.get(`/courses/${id}`),
  getBySlug: (slug: string) => api.get(`/courses/slug/${slug}`),
  getPublic: (slug: string) => api.get(`/courses/slug/${slug}`),
  listPublic: (params?: any) => api.get('/courses', { params }),
  create: (data: FormData) =>
    api.post('/courses', data),
  update: (id: number, data: FormData) =>
    api.post(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
  enroll: (id: number) => api.post(`/courses/${id}/enroll`),
  getLessons: (id: number) => api.get(`/courses/${id}/lessons`),
  getEnrolled: () => api.get('/courses/enrolled'),
}

export const enrollmentAPI = {
  register: (data: {
    course_id: number
    course_title?: string
    course_price?: number
    name: string
    email: string
    phone: string
    address: string
    password?: string
    password_confirmation?: string
    bio?: string | null
    role?: string
  }) => api.post('/enrollments/register', data),
  initiate: (courseId: number) =>
    api.post('/enrollments/initiate', { course_id: courseId }),
  pay: (data: { course_id: number; payment_method: string; transaction_id?: string; payment_details?: string }) =>
    api.post('/enrollments/pay', data),
  myCourses: () =>
    api.get('/enrollments/my-courses'),
  check: (courseId: number) =>
    api.get(`/enrollments/check/${courseId}`),
  getActive: () =>
    api.get('/enrollments/active'),
  getMates: () =>
    api.get('/enrollments/mates'),
}

export const modulesAPI = {
  getAll: (params?: any) => api.get('/modules', { params }),
  getOne: (id: number) => api.get(`/modules/${id}`),
  create: (data: any) => api.post('/modules', data),
  update: (id: number, data: any) => api.put(`/modules/${id}`, data),
  delete: (id: number) => api.delete(`/modules/${id}`),
}

export const friendsAPI = {
  list: () => api.get('/friends'),
  request: (receiverId: number) => api.post('/friends/request', { receiver_id: receiverId }),
  accept: (id: number) => api.post(`/friends/${id}/accept`),
  reject: (id: number) => api.post(`/friends/${id}/reject`),
  cancel: (id: number) => api.delete(`/friends/${id}/cancel`),
  pending: () => api.get('/friends/pending'),
  suggestions: () => api.get('/friends/suggestions'),
  status: (userId: number) => api.get(`/friends/status/${userId}`),
  remove: (userId: number) => api.delete(`/friends/remove/${userId}`),
}

export const liveClassesAPI = {
  getDashboard: () => api.get('/live-classes/dashboard'),
  getAll: (params?: any) => api.get('/live-classes', { params }),
  getOne: (id: number) => api.get(`/live-classes/${id}`),
  create: (data: any) => api.post('/live-classes', data),
  update: (id: number, data: any) => api.put(`/live-classes/${id}`, data),
  delete: (id: number) => api.delete(`/live-classes/${id}`),
  myClasses: (params?: any) => api.get('/live-classes/my', { params }),
  join: (id: number) => api.post(`/live-classes/${id}/join`),
  remind: (id: number) => api.post(`/live-classes/${id}/remind`),
  getCalendar: (params?: any) => api.get('/live-classes/calendar', { params }),
  getWeek: (params?: any) => api.get('/live-classes/week', { params }),
  getMonth: (params?: any) => api.get('/live-classes/month', { params }),
  getToday: () => api.get('/live-classes/today'),
  getUpcoming: (params?: any) => api.get('/live-classes/upcoming', { params }),
  getLive: () => api.get('/live-classes/live'),
  getCompleted: (params?: any) => api.get('/live-classes/completed', { params }),
  getCancelled: (params?: any) => api.get('/live-classes/cancelled', { params }),
  createInstant: (data: any) => api.post('/live-classes/instant', data),
  getAttendance: (id: number) => api.get(`/live-classes/${id}/attendance`),
  markAttendance: (id: number, data: any) => api.post(`/live-classes/${id}/attendance`, data),
  getAttendanceReport: (params?: any) => api.get('/live-classes/attendance/report', { params }),
  getAttendanceHistory: (params?: any) => api.get('/live-classes/attendance/history', { params }),
  exportAttendance: (params?: any) => api.get('/live-classes/attendance/export', { params, responseType: 'blob' }),
  waitingRoom: (id: number, data?: any) => api.post(`/live-classes/${id}/waiting-room`, data),
  raiseHand: (id: number) => api.post(`/live-classes/${id}/raise-hand`),
  screenShare: (id: number, data?: any) => api.post(`/live-classes/${id}/screen-share`, data),
  sendPoll: (id: number, data: any) => api.post(`/live-classes/${id}/poll`, data),
  sendQuiz: (id: number, data: any) => api.post(`/live-classes/${id}/quiz`, data),
  sendChat: (id: number, data: any) => api.post(`/live-classes/${id}/chat`, data),
  toggleWhiteboard: (id: number) => api.post(`/live-classes/${id}/whiteboard`),
  createBreakoutRoom: (id: number, data: any) => api.post(`/live-classes/${id}/breakout-room`, data),
  getRecordings: (params?: any) => api.get('/live-classes/recordings', { params }),
  getRecordingMetadata: (url: string) => api.get('/live-classes/recordings/meta', { params: { url } }),
  getRecording: (id: number) => api.get(`/live-classes/recordings/${id}`),
  createRecording: (data: any) => api.put('/live-classes/recordings', data),
  updateRecording: (id: number, data: any) => api.patch(`/live-classes/recordings/${id}`, data),
  deleteRecording: (id: number) => api.delete(`/live-classes/recordings/${id}`),
  getResources: (params?: any) => api.get('/live-classes/resources', { params }),
  createResource: (data: any) => api.post('/live-classes/resources', data),
  deleteResource: (id: number) => api.delete(`/live-classes/resources/${id}`),
  getAnalytics: (params?: any) => api.get('/live-classes/analytics', { params }),
  sendReminder: (data: any) => api.post('/live-classes/send-reminder', data),
  pushNotification: (data: any) => api.post('/live-classes/push-notification', data),
  emailStudents: (data: any) => api.post('/live-classes/email-students', data),
  announcement: (data: any) => api.post('/live-classes/announcement', data),
  smsReminder: (data: any) => api.post('/live-classes/sms-reminder', data),
  getReports: {
    attendance: (params?: any) => api.get('/live-classes/reports/attendance', { params }),
    recordings: (params?: any) => api.get('/live-classes/reports/recordings', { params }),
    history: (params?: any) => api.get('/live-classes/reports/history', { params }),
    performance: (params?: any) => api.get('/live-classes/reports/performance', { params }),
  },
  getParticipants: (id: number, params?: any) => api.get(`/live-classes/${id}/participants`, { params }),
  addParticipant: (id: number, userId: number) => api.post(`/live-classes/${id}/participants`, { user_id: userId }),
  removeParticipant: (id: number, userId: number) => api.delete(`/live-classes/${id}/participants/${userId}`),
  getEnrolledStudents: (id: number, params?: any) => api.get(`/live-classes/${id}/students`, { params }),
  enrollStudent: (id: number, userId: number) => api.post(`/live-classes/${id}/enroll-student`, { user_id: userId }),
  getTimeline: (params?: any) => api.get('/live-classes/timeline', { params }),
  getClassRecordings: (id: number) => api.get(`/live-classes/${id}/recordings`),
  getClassResources: (id: number) => api.get(`/live-classes/${id}/resources`),
  getClassChat: (id: number, params?: any) => api.get(`/live-classes/${id}/chat`, { params }),
  getClassQA: (id: number, params?: any) => api.get(`/live-classes/${id}/qa`, { params }),
  askQuestion: (id: number, data: any) => api.post(`/live-classes/${id}/qa`, data),
  answerQuestion: (classId: number, qaId: number, data: any) => api.post(`/live-classes/${classId}/qa/${qaId}/answer`, data),
  voteQuestion: (classId: number, qaId: number) => api.post(`/live-classes/${classId}/qa/${qaId}/vote`),
  pinQuestion: (classId: number, qaId: number) => api.post(`/live-classes/${classId}/qa/${qaId}/pin`),
  getPolls: (id: number) => api.get(`/live-classes/${id}/polls`),
  votePoll: (classId: number, pollId: number, data: any) => api.post(`/live-classes/${classId}/polls/${pollId}/vote`, data),
  endPoll: (classId: number, pollId: number) => api.post(`/live-classes/${classId}/polls/${pollId}/end`),
  getNotes: (id: number) => api.get(`/live-classes/${id}/notes`),
  createNote: (id: number, data: any) => api.post(`/live-classes/${id}/notes`, data),
  updateNote: (classId: number, noteId: number, data: any) => api.put(`/live-classes/${classId}/notes/${noteId}`, data),
  deleteNote: (classId: number, noteId: number) => api.delete(`/live-classes/${classId}/notes/${noteId}`),
  getAnnouncements: (id: number) => api.get(`/live-classes/${id}/announcements`),
  createAnnouncement: (id: number, data: any) => api.post(`/live-classes/${id}/announcements`, data),
  updateAnnouncement: (classId: number, announcementId: number, data: any) => api.put(`/live-classes/${classId}/announcements/${announcementId}`, data),
  deleteAnnouncement: (classId: number, announcementId: number) => api.delete(`/live-classes/${classId}/announcements/${announcementId}`),
  getWaitingRoom: (id: number) => api.get(`/live-classes/${id}/waiting-room`),
  approveWaiting: (id: number, userId: number) => api.post(`/live-classes/${id}/waiting-room/${userId}/approve`),
  rejectWaiting: (id: number, userId: number) => api.post(`/live-classes/${id}/waiting-room/${userId}/reject`),
  admitAll: (id: number) => api.post(`/live-classes/${id}/waiting-room/admit-all`),
  endSession: (id: number) => api.post(`/live-classes/${id}/end`),
  pauseSession: (id: number) => api.post(`/live-classes/${id}/pause`),
  resumeSession: (id: number) => api.post(`/live-classes/${id}/resume`),
  duplicateClass: (id: number) => api.post(`/live-classes/${id}/duplicate`),
  favoriteClass: (id: number) => api.post(`/live-classes/${id}/favorite`),
  exportClass: (id: number, format: string) => api.get(`/live-classes/${id}/export`, { params: { format }, responseType: 'blob' }),
}

export const classesAPI = liveClassesAPI

export const studentsAPI = {
  getDashboard: () => api.get('/students/dashboard'),
  getAll: (params?: any) => api.get('/students', { params }),
  getOne: (id: number) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: number, data: any) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  enroll: (data: any) => api.post('/students/enroll', data),
  bulkEnroll: (data: any) => api.post('/students/bulk-enroll', data),
  getAttendanceSummary: (id: number) => api.get(`/students/${id}/attendance/summary`),
  getAttendanceHistory: (id: number, params?: any) => api.get(`/students/${id}/attendance/history`, { params }),
  getAttendanceAnalytics: (id: number) => api.get(`/students/${id}/attendance/analytics`),
  getAttendanceCalendar: (id: number, params?: any) => api.get(`/students/${id}/attendance/calendar`, { params }),
  getProgress: (id: number) => api.get(`/students/${id}/progress`),
  getLearningPath: (id: number) => api.get(`/students/${id}/learning-path`),
  createCourseProject: (id: number, data: any) => api.post(`/students/${id}/projects`, data),
  getGradebook: (id: number) => api.get(`/students/${id}/gradebook`),
  getSkills: (id: number) => api.get(`/students/${id}/skills`),
  getAchievements: (id: number) => api.get(`/students/${id}/achievements`),
  getCertificates: (id: number) => api.get(`/students/${id}/certificates`),
  generateCard: (id: number) => api.get(`/students/${id}/card`),
  printCard: (id: number) => api.get(`/students/${id}/card/print`, { responseType: 'blob' }),
  downloadCard: (id: number) => api.get(`/students/${id}/card/download`, { responseType: 'blob' }),
  getQR: (id: number) => api.get(`/students/${id}/card/qr`),
  getDigitalId: (id: number) => api.get(`/students/${id}/card/digital`),
  getDocuments: (id: number) => api.get(`/students/${id}/documents`),
  uploadDocument: (id: number, data: FormData) => api.post(`/students/${id}/documents`, data),
  deleteDocument: (id: number, docId: number) => api.delete(`/students/${id}/documents/${docId}`),
  previewDocument: (id: number, docId: number) => api.get(`/students/${id}/documents/${docId}/preview`),
  downloadDocument: (id: number, docId: number) => api.get(`/students/${id}/documents/${docId}/download`, { responseType: 'blob' }),
  getActivity: (id: number) => api.get(`/students/${id}/activity`),
  getNotes: (id: number) => api.get(`/students/${id}/notes`),
  addNote: (id: number, data: any) => api.post(`/students/${id}/notes`, data),
  deleteNote: (id: number, noteId: number) => api.delete(`/students/${id}/notes/${noteId}`),
  getProfileBundle: (id: number) => api.get(`/students/${id}/profile-bundle`),
  getPayments: (id: number, params?: any) => api.get(`/students/${id}/payments`, { params }),
  getInvoices: (id: number) => api.get(`/students/${id}/invoices`),
  getScholarships: (id: number) => api.get(`/students/${id}/scholarships`),
  getFeeStatus: (id: number) => api.get(`/students/${id}/fee-status`),
  getAnalytics: (id: number) => api.get(`/students/${id}/analytics`),
  getPerformanceReport: (id: number) => api.get(`/students/${id}/performance-report`),
  getLearningHours: (id: number) => api.get(`/students/${id}/learning-hours`),
  getLearningGoals: (id: number) => api.get(`/students/${id}/learning-goals`),
  getAssignmentCompletion: (id: number) => api.get(`/students/${id}/assignment-completion`),
  getCourseCompletion: (id: number) => api.get(`/students/${id}/course-completion`),
  getLoginFrequency: (id: number) => api.get(`/students/${id}/login-frequency`),
  exportPdf: (id: number) => api.get(`/students/${id}/export/pdf`, { responseType: 'blob' }),
  exportExcel: (id: number) => api.get(`/students/${id}/export/excel`, { responseType: 'blob' }),
  exportCsv: (id: number) => api.get(`/students/${id}/export/csv`, { responseType: 'blob' }),
  sendMessage: (id: number, data: any) => api.post(`/students/${id}/send-message`, data),
  sendEmail: (id: number, data: any) => api.post(`/students/${id}/send-email`, data),
  sendNotification: (id: number, data: any) => api.post(`/students/${id}/send-notification`, data),
  sendAnnouncement: (id: number, data: any) => api.post(`/students/${id}/send-announcement`, data),
}

export const assignmentsAPI = {
  getDashboard: () => api.get('/assignments/dashboard'),
  getAll: (params?: any) => api.get('/assignments', { params }),
  getOne: (id: number) => api.get(`/assignments/${id}`),
  create: (data: any) => api.post('/assignments', data),
  update: (id: number, data: any) => api.put(`/assignments/${id}`, data),
  delete: (id: number) => api.delete(`/assignments/${id}`),
  duplicate: (id: number) => api.post(`/assignments/${id}/duplicate`),
  publishToggle: (id: number, status: 'draft' | 'published') => api.put(`/assignments/${id}/publish`, { status }),
  getQuestions: (id: number) => api.get(`/assignments/${id}/questions`),
  submit: (id: number, data: any) => api.post(`/assignments/${id}/submit`, data),
  getSubmissions: (id: number, params?: any) => api.get(`/assignments/${id}/submissions`, { params }),
  getAllSubmissions: (params?: any) => api.get('/submissions', { params }),
  getSubmission: (id: number) => api.get(`/submissions/${id}`),
  updateSubmission: (id: number, data: any) => api.put(`/submissions/${id}`, data),
  deleteSubmission: (id: number) => api.delete(`/submissions/${id}`),
  getSubmissionHistory: (params?: any) => api.get('/submissions/history', { params }),
  grade: (assignmentId: number, data: any) => api.post(`/assignments/${assignmentId}/grade`, data),
  bulkGrade: (assignmentId: number, data: any) => api.post(`/assignments/${assignmentId}/bulk-grade`, data),
  regrade: (submissionId: number, data: any) => api.post(`/submissions/${submissionId}/regrade`, data),
  getGrades: (params?: any) => api.get('/grades', { params }),
  getGradesByAssignment: (assignmentId: number) => api.get(`/grades/assignment/${assignmentId}`),
  getGradesByStudent: (studentId: number) => api.get(`/grades/student/${studentId}`),
  exportGrades: (params?: any) => api.get('/grades/export', { params, responseType: 'blob' }),
  aiGrade: (id: number) => api.post(`/assignments/${id}/ai-grade`),
  aiFeedback: (id: number) => api.post(`/assignments/${id}/ai-feedback`),
  plagiarismCheck: (id: number) => api.post(`/assignments/${id}/plagiarism-check`),
  getComments: (id: number) => api.get(`/assignments/${id}/comments`),
  addComment: (id: number, data: any) => api.post(`/assignments/${id}/comments`, data),
  deleteComment: (id: number, commentId: number) => api.delete(`/assignments/${id}/comments/${commentId}`),
  getResources: (id: number) => api.get(`/assignments/${id}/resources`),
  addResource: (id: number, data: any) => api.post(`/assignments/${id}/resources`, data),
  deleteResource: (id: number, resourceId: number) => api.delete(`/assignments/${id}/resources/${resourceId}`),
  getAnalytics: (params?: any) => api.get('/assignments/analytics', { params }),
  getCompletionRate: (params?: any) => api.get('/assignments/analytics/completion-rate', { params }),
  getAverageScore: (params?: any) => api.get('/assignments/analytics/average-score', { params }),
  getSubmissionRate: (params?: any) => api.get('/assignments/analytics/submission-rate', { params }),
  getLateSubmissions: (params?: any) => api.get('/assignments/analytics/late-submissions', { params }),
  getTopStudents: (params?: any) => api.get('/assignments/analytics/top-students', { params }),
  getWeakStudents: (params?: any) => api.get('/assignments/analytics/weak-students', { params }),
  getAssignmentReport: (params?: any) => api.get('/assignments/reports/assignment', { params }),
  getMarksReport: (params?: any) => api.get('/assignments/reports/marks', { params }),
  getSubmissionReport: (params?: any) => api.get('/assignments/reports/submissions', { params }),
  exportAssignmentGrades: (params?: any) => api.get('/assignments/reports/export-grades', { params, responseType: 'blob' }),
  sendDueReminder: (id: number) => api.post(`/assignments/${id}/send-due-reminder`),
  sendSubmissionReminder: (id: number) => api.post(`/assignments/${id}/send-submission-reminder`),
  sendGradePublished: (id: number) => api.post(`/assignments/${id}/send-grade-published`),
}

export const reportsAPI = {
  liveClassReport: (params?: any) => api.get('/reports/live-classes', { params }),
  attendanceReport: (params?: any) => api.get('/reports/attendance', { params }),
  studentReport: (params?: any) => api.get('/reports/students', { params }),
  assignmentReport: (params?: any) => api.get('/reports/assignments', { params }),
  performanceReport: (params?: any) => api.get('/reports/performance', { params }),
  exportPdf: (params?: any) => api.get('/reports/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params?: any) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
  exportCsv: (params?: any) => api.get('/reports/export/csv', { params, responseType: 'blob' }),
}

export const projectsAPI = {
  getAll: (params?: any) => api.get('/projects', { params }),
  create: (data: any) => api.post('/projects', data),
  sendProposal: (id: number, data: any) =>
    api.post(`/projects/${id}/proposals`, data),
  acceptProposal: (id: number) =>
    api.post(`/proposals/${id}/accept`),
}

export const aiAPI = {
  generateTool: (prompt: string) =>
    api.post('/ai/generate-tool', { prompt }),
  generateBlog: (prompt: string) =>
    api.post('/ai/generate-blog', { prompt }),
  getGeneratedTools: () => api.get('/ai/tools'),
  getGeneratedBlogs: () => api.get('/ai/blogs'),
}

export const wordpressAPI = {
  connect: (data: any) => api.post('/wordpress/connect', data),
  testConnection: (id: number) => api.post(`/wordpress/${id}/test`),
  sync: (id: number) => api.post(`/wordpress/${id}/sync`),
  disconnect: (id: number) => api.delete(`/wordpress/${id}`),
  getSites: () => api.get('/wordpress/sites'),
  publishTool: (data: any) => api.post('/wordpress/publish-tool', data),
  publishBlog: (data: any) => api.post('/wordpress/publish-blog', data),
}

export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params?: any) => api.get('/wallet/transactions', { params }),
  withdraw: (data: any) => api.post('/wallet/withdraw', data),
  getWallet: () => api.get('/wallet'),
}

export const analyticsAPI = {
  getOverview: () => api.get('/analytics'),
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: () => api.get('/analytics/revenue'),
  getStudents: () => api.get('/analytics/students'),
  getRecommendations: () => api.get('/analytics/recommendations'),
}

export const quotesAPI = {
  getDaily: () => api.get('/quotes/daily'),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
}

export const jobsAPI = {
  getAll: (params?: any) => api.get('/jobs', { params }),
  getOne: (id: number) => api.get(`/jobs/${id}`),
  create: (data: any) => api.post('/jobs', data),
}

export const servicesAPI = {
  getAll: (params?: any) => api.get('/services', { params }),
  getMy: () => api.get('/services/my'),
  getOne: (id: number) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
  updateImages: (id: number, data: FormData) => api.post(`/services/${id}/images`, data),
}

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (id: number, params?: any) => api.get(`/messages/${id}`, { params }),
  send: (data: any) => api.post('/messages', data),
  getAll: () => api.get('/messages'),
  markRead: (conversationId: number) => api.post('/messages/read', { conversation_id: conversationId }),
  typing: (conversationId: number, isTyping: boolean) => api.post('/messages/typing', { conversation_id: conversationId, is_typing: isTyping }),
  getNewMessages: (conversationId: number, afterId?: number) => api.get(`/messages/${conversationId}/new`, { params: { after_id: afterId } }),
  search: (query: string) => api.get('/messages/search/all', { params: { query } }),
  getEligibleUsers: (search?: string) => api.get('/messages/eligible-users', { params: search ? { search } : {} }),
  delete: (id: number) => api.delete(`/messages/${id}`),
  deleteConversation: (id: number) => api.delete(`/messages/conversations/${id}`),
  pinConversation: (id: number) => api.post(`/messages/conversations/${id}/pin`),
  unpinConversation: (id: number) => api.delete(`/messages/conversations/${id}/pin`),
  muteConversation: (id: number, duration?: string) => api.post(`/messages/conversations/${id}/mute`, { duration }),
  unmuteConversation: (id: number) => api.delete(`/messages/conversations/${id}/mute`),
  markUnread: (id: number) => api.post(`/messages/conversations/${id}/unread`),
  searchInConversation: (id: number, query: string) => api.get(`/messages/conversations/${id}/search`, { params: { query } }),
  getSharedMedia: (id: number) => api.get(`/messages/conversations/${id}/media`),
  exportChat: (id: number) => api.get(`/messages/conversations/${id}/export`, { responseType: 'blob' }),
  archiveConversation: (id: number) => api.post(`/messages/conversations/${id}/archive`),
  unarchiveConversation: (id: number) => api.delete(`/messages/conversations/${id}/archive`),
  blockUser: (userId: number) => api.post(`/messages/users/${userId}/block`),
  unblockUser: (userId: number) => api.delete(`/messages/users/${userId}/block`),
  getBlockedUsers: () => api.get('/messages/users/blocked'),
}

export const chatGroupsAPI = {
  getAll: () => api.get('/chat/groups'),
  getOne: (id: number) => api.get(`/chat/groups/${id}`),
  create: (data: any) => api.post('/chat/groups', data),
  update: (id: number, data: any) => api.put(`/chat/groups/${id}`, data),
  delete: (id: number) => api.delete(`/chat/groups/${id}`),
  leave: (id: number) => api.post(`/chat/groups/${id}/leave`),
  addMember: (id: number, userId: number) => api.post(`/chat/groups/${id}/members`, { user_id: userId }),
  removeMember: (id: number, userId: number) => api.delete(`/chat/groups/${id}/members`, { data: { user_id: userId } }),
  sendMessage: (id: number, data: FormData) => api.post(`/chat/groups/${id}/messages`, data),
  getMessages: (id: number, params?: any) => api.get(`/chat/groups/${id}/messages`, { params }),
}

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: any) => api.post('/profile', data),
}

export const chatAPI = {
  updateAvatar: (data: FormData) => api.post('/chat/avatar', data),
}

export const gigsAPI = {
  getAll: (params?: any) => api.get('/gigs', { params }),
  getMy: () => api.get('/gigs/my'),
  getOne: (id: number) => api.get(`/gigs/${id}`),
  create: (data: any) => api.post('/gigs', data),
  update: (id: number, data: any) => api.put(`/gigs/${id}`, data),
  delete: (id: number) => api.delete(`/gigs/${id}`),
  updateImages: (id: number, data: FormData) => api.post(`/gigs/${id}/images`, data),
}

export const ordersAPI = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getOne: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: number, status: string) => api.put(`/orders/${id}/status`, { status }),
}

export const reviewsAPI = {
  getAll: (params?: any) => api.get('/reviews', { params }),
  create: (data: any) => api.post('/reviews', data),
}

export const uploadAPI = {
  upload: (data: FormData) => api.post('/upload', data),
  uploadMultiple: (data: FormData) => api.post('/upload/multiple', data),
}

export const studentAPI = {
  register: (data: any) => api.post('/student/register', data),
  uploadImage: (data: FormData) =>
    api.post('/student/upload-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  profile: () => api.get('/student/profile'),
  dashboard: () => api.get('/student/dashboard'),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
  create: (data: { user_id: number; type: string; title: string; message: string }) => api.post('/notifications', data),
}

export const paymentAPI = {
  history: () => api.get('/payment/history'),
  verify: (transaction_id: string) => api.post('/payment/verify', { transaction_id }),
  courseAccess: (courseId: number) => api.get(`/payment/course-access/${courseId}`),
}

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
}

export const paymentsAPI = {
  checkoutPreview: (courseId: number, couponCode?: string) =>
    api.get('/checkout/preview', { params: { course_id: courseId, ...(couponCode ? { coupon_code: couponCode } : {}) } }),
  createOrder: (courseId: number, couponCode?: string) =>
    api.post('/checkout/orders', { course_id: courseId, ...(couponCode ? { coupon_code: couponCode } : {}) }),
  listOrders: (params?: any) => api.get('/payments/orders', { params }),
  getOrder: (orderNumber: string) => api.get(`/payments/orders/${orderNumber}`),
  payOrder: (orderId: number, paymentMethod: string) =>
    api.post(`/payments/orders/${orderId}/pay`, { payment_method: paymentMethod }),
  checkOrder: (orderId: number) => api.post(`/payments/orders/${orderId}/check`),
  cancelOrder: (orderId: number) => api.post(`/payments/orders/${orderId}/cancel`),
  listInvoices: (params?: any) => api.get('/payments/invoices', { params }),
  getInvoice: (id: number) => api.get(`/payments/invoices/${id}`),
  downloadInvoice: (id: number) => api.get(`/payments/invoices/${id}/download`),
  listRefunds: (params?: any) => api.get('/payments/refunds', { params }),
  requestRefund: (data: { order_number: string; amount?: number; reason: string }) =>
    api.post('/payments/refunds', data),
}

export const financeAPI = {
  payments: {
    list: (params?: any) => api.get('/admin/payments', { params }),
    get: (id: number) => api.get(`/admin/payments/${id}`),
    verify: (id: number) => api.post(`/admin/payments/${id}/verify`),
    refund: (id: number) => api.post(`/admin/payments/${id}/refund`),
  },
  orders: {
    list: (params?: any) => api.get('/admin/payments/orders', { params }),
    get: (id: number) => api.get(`/admin/payments/orders/${id}`),
  },
  transactions: {
    list: (params?: any) => api.get('/admin/payments/transactions', { params }),
  },
  refunds: {
    list: (params?: any) => api.get('/admin/payments/refunds', { params }),
    approve: (id: number) => api.post(`/admin/payments/refunds/${id}/approve`),
    reject: (id: number, note?: string) => api.post(`/admin/payments/refunds/${id}/reject`, { note }),
  },
  invoices: {
    list: (params?: any) => api.get('/admin/payments/invoices', { params }),
    get: (id: number) => api.get(`/admin/payments/invoices/${id}`),
    download: (id: number) => api.get(`/admin/payments/invoices/${id}/download`),
  },
  webhooks: {
    list: (params?: any) => api.get('/admin/payments/webhooks', { params }),
    get: (id: number) => api.get(`/admin/payments/webhooks/${id}`),
    retry: (id: number) => api.post(`/admin/payments/webhooks/${id}/retry`),
  },
  reconciliation: {
    list: (params?: any) => api.get('/admin/payments/reconciliation', { params }),
    get: (id: number) => api.get(`/admin/payments/reconciliation/${id}`),
    run: (gateway?: string) => api.post('/admin/payments/reconciliation/run', gateway ? { gateway } : {}),
  },
  logs: {
    list: (params?: any) => api.get('/admin/payments/logs', { params }),
    audit: (params?: any) => api.get('/admin/payments/audit-logs', { params }),
  },
  settings: {
    get: () => api.get('/admin/payments/settings'),
    update: (data: Record<string, any>) => api.put('/admin/payments/settings', data),
  },
  reports: {
    summary: (params?: any) => api.get('/admin/payments/reports/summary', { params }),
    series: (params?: any) => api.get('/admin/payments/reports/revenue-series', { params }),
    byCourse: (params?: any) => api.get('/admin/payments/reports/by-course', { params }),
  },
  coupons: {
    list: (params?: any) => api.get('/admin/payments/coupons', { params }),
    get: (id: number) => api.get(`/admin/payments/coupons/${id}`),
    create: (data: any) => api.post('/admin/payments/coupons', data),
    update: (id: number, data: any) => api.put(`/admin/payments/coupons/${id}`, data),
    delete: (id: number) => api.delete(`/admin/payments/coupons/${id}`),
  },
  earnings: {
    list: (params?: any) => api.get('/admin/payments/earnings', { params }),
    summary: (params?: any) => api.get('/admin/payments/earnings/summary', { params }),
    instructors: () => api.get('/admin/payments/earnings/instructors'),
  },
  payouts: {
    list: (params?: any) => api.get('/admin/payments/payouts', { params }),
    create: (data: any) => api.post('/admin/payments/payouts', data),
    approve: (id: number, reference?: string) => api.post(`/admin/payments/payouts/${id}/approve`, { reference }),
    reject: (id: number, note?: string) => api.post(`/admin/payments/payouts/${id}/reject`, { note }),
  },
  gateways: {
    list: () => api.get('/admin/payments/gateways'),
    update: (data: any) => api.put('/admin/payments/gateways', data),
  },
  settlements: {
    list: (params?: any) => api.get('/admin/payments/settlements', { params }),
    create: (data: any) => api.post('/admin/payments/settlements', data),
    settle: (id: number, reference?: string) => api.post(`/admin/payments/settlements/${id}/settle`, { reference }),
    destroy: (id: number) => api.delete(`/admin/payments/settlements/${id}`),
  },
  disputes: {
    list: (params?: any) => api.get('/admin/payments/disputes', { params }),
    create: (data: any) => api.post('/admin/payments/disputes', data),
    resolve: (id: number, decision: string, note?: string) => api.post(`/admin/payments/disputes/${id}/resolve`, { decision, admin_note: note }),
  },
  paymentLinks: {
    list: (params?: any) => api.get('/admin/payments/payment-links', { params }),
    create: (data: any) => api.post('/admin/payments/payment-links', data),
    destroy: (id: number) => api.delete(`/admin/payments/payment-links/${id}`),
    resolve: (token: string) => api.get(`/payments/links/${token}`),
  },
  adminNotifications: {
    list: (params?: any) => api.get('/admin/payments/notifications', { params }),
    create: (data: any) => api.post('/admin/payments/notifications', data),
    users: () => api.get('/admin/payments/notifications/users'),
  },
}

export const adminAPI = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  createUser: (data: any) => api.post('/admin/users', data),
  getReports: () => api.get('/admin/reports'),
  manageUser: (id: number, data: any) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getPayments: (params?: any) => api.get('/admin/payments', { params }),
  getPayment: (id: number) => api.get(`/admin/payments/${id}`),
  approvePayment: (id: number) => api.post(`/admin/payments/${id}/approve`),
  refundPayment: (id: number) => api.post(`/admin/payments/${id}/refund`),
  getEnrollments: (params?: any) => api.get('/admin/enrollments', { params }),
  getStudentStats: () => api.get('/admin/student-stats'),
}

export const toolsAPI = {
  getPublic: (params?: any) => api.get('/tools', { params }),
  getPublicBySlug: (slug: string) => api.get(`/tools/${slug}`),
  recordUsage: (slug: string, data?: any) => api.post(`/tools/${slug}/usage`, data),
  getPublicCategories: () => api.get('/tools/categories'),
  getPublicTags: () => api.get('/tools/tags'),
  getAll: (params?: any) => api.get('/admin/tools', { params }),
  getOne: (id: number) => api.get(`/admin/tools/${id}`),
  create: (data: any) => api.post('/admin/tools', data),
  update: (id: number, data: any) => api.put(`/admin/tools/${id}`, data),
  delete: (id: number) => api.delete(`/admin/tools/${id}`),
  duplicate: (id: number) => api.post(`/admin/tools/${id}/duplicate`),
  getVersions: (id: number) => api.get(`/admin/tools/${id}/versions`),
  restoreVersion: (id: number, version: number) => api.post(`/admin/tools/${id}/restore`, { version }),
  getAnalytics: (params?: any) => api.get('/admin/tools/analytics', { params }),
  categories: {
    getAll: (params?: any) => api.get('/admin/tools/categories', { params }),
    create: (data: any) => api.post('/admin/tools/categories', data),
    update: (id: number, data: any) => api.put(`/admin/tools/categories/${id}`, data),
    delete: (id: number) => api.delete(`/admin/tools/categories/${id}`),
  },
  tags: {
    getAll: () => api.get('/admin/tools/tags'),
    create: (data: any) => api.post('/admin/tools/tags', data),
    update: (id: number, data: any) => api.put(`/admin/tools/tags/${id}`, data),
    delete: (id: number) => api.delete(`/admin/tools/tags/${id}`),
  },
}

export const blogAPI = {
  getPublic: (params?: any) => api.get('/blog/posts', { params }),
  getPublicBySlug: (slug: string) => api.get(`/blog/posts/${slug}`),
  getPublicCategories: () => api.get('/blog/categories'),
  getPublicTags: () => api.get('/blog/tags'),
  getPublicAuthors: () => api.get('/blog/authors'),
  getAll: (params?: any) => api.get('/admin/blog/posts', { params }),
  getOne: (id: number) => api.get(`/admin/blog/posts/${id}`),
  create: (data: any) => api.post('/admin/blog/posts', data),
  update: (id: number, data: any) => api.put(`/admin/blog/posts/${id}`, data),
  delete: (id: number) => api.delete(`/admin/blog/posts/${id}`),
  duplicate: (id: number) => api.post(`/admin/blog/posts/${id}/duplicate`),
  getRevisions: (id: number) => api.get(`/admin/blog/posts/${id}/revisions`),
  restoreRevision: (id: number, revision: number) => api.post(`/admin/blog/posts/${id}/restore`, { revision }),
  getAnalytics: (params?: any) => api.get('/admin/blog/analytics', { params }),
  categories: {
    getAll: (params?: any) => api.get('/admin/blog/categories', { params }),
    create: (data: any) => api.post('/admin/blog/categories', data),
    update: (id: number, data: any) => api.put(`/admin/blog/categories/${id}`, data),
    delete: (id: number) => api.delete(`/admin/blog/categories/${id}`),
  },
  tags: {
    getAll: (params?: any) => api.get('/admin/blog/tags', { params }),
    create: (data: any) => api.post('/admin/blog/tags', data),
    update: (id: number, data: any) => api.put(`/admin/blog/tags/${id}`, data),
    delete: (id: number) => api.delete(`/admin/blog/tags/${id}`),
  },
  authors: {
    getAll: (params?: any) => api.get('/admin/blog/authors', { params }),
    create: (data: any) => api.post('/admin/blog/authors', data),
    update: (id: number, data: any) => api.put(`/admin/blog/authors/${id}`, data),
    delete: (id: number) => api.delete(`/admin/blog/authors/${id}`),
  },
  newsletter: {
    subscribe: (data: { email: string; name?: string }) => api.post('/newsletter/subscribe', data),
    unsubscribe: (data: { email: string }) => api.post('/newsletter/unsubscribe', data),
  },
}
