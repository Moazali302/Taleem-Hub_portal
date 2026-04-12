export const API = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  STUDENTS: {
    LIST: '/students',
    CREATE: '/students',
    GET: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
    RESTORE: (id: string) => `/students/restore/${id}`,
    FEE_HISTORY: (id: string) => `/students/${id}/fee-history`,
    ATTENDANCE: (id: string) => `/students/${id}/attendance`
  },
  TEACHERS: {
    LIST: '/teachers',
    CREATE: '/teachers',
    GET: (id: string) => `/teachers/${id}`,
    UPDATE: (id: string) => `/teachers/${id}`,
    DELETE: (id: string) => `/teachers/${id}`
  },
  CLASSES: {
    LIST: '/classes',
    CREATE: '/classes',
    GET: (id: string) => `/classes/${id}`,
    UPDATE: (id: string) => `/classes/${id}`,
    DELETE: (id: string) => `/classes/${id}`,
    STUDENTS: (id: string) => `/classes/${id}/students`
  },
  FEES: {
    LIST: '/fees',
    STUDENT: (id: string) => `/fees/student/${id}`,
    MARK_PAID: (id: string) => `/fees/${id}/mark-paid`,
    CHALLAN: (id: string) => `/fees/${id}/challan`,
    OVERDUE: '/fees/overdue'
  },
  ATTENDANCE: {
    MARK_STUDENT: '/attendance/student',
    CLASS: (id: string) => `/attendance/student/class/${id}`,
    MONTHLY: (id: string) => `/attendance/student/${id}/monthly`,
    TEACHER: '/attendance/teacher',
    ALL_TEACHERS: '/attendance/teacher/all'
  },
  EXAMS: {
    LIST: '/exams',
    CREATE: '/exams',
    UPDATE: (id: string) => `/exams/${id}`,
    DELETE: (id: string) => `/exams/${id}`
  },
  RESULTS: {
    CLASS: (id: string) => `/results/class/${id}`,
    CREATE: '/results',
    STUDENT: (id: string) => `/results/student/${id}`,
    PDF: (id: string) => `/results/student/${id}/pdf`,
    LOCK: (id: string) => `/results/lock/${id}`,
    UNLOCK: (id: string) => `/results/unlock/${id}`
  },
  COMPLAINTS: {
    LIST: '/complaints',
    CREATE: '/complaints',
    GET: (id: string) => `/complaints/${id}`,
    STATUS: (id: string) => `/complaints/${id}/status`
  },
  LEAVES: {
    LIST: '/leaves',
    CREATE: '/leaves',
    APPROVE: (id: string) => `/leaves/${id}/approve`,
    REJECT: (id: string) => `/leaves/${id}/reject`,
    MY: '/leaves/my'
  },
  ANNOUNCEMENTS: {
    LIST: '/announcements',
    CREATE: '/announcements',
    UPDATE: (id: string) => `/announcements/${id}`,
    DELETE: (id: string) => `/announcements/${id}`
  },
  SUPER_ADMIN: {
    SCHOOLS: '/super-admin/schools',
    SCHOOL: (id: string) => `/super-admin/schools/${id}`,
    BLOCK: (id: string) => `/super-admin/schools/${id}/block`,
    UNBLOCK: (id: string) => `/super-admin/schools/${id}/unblock`,
    REVENUE: '/super-admin/revenue',
    AUDIT_LOGS: '/super-admin/audit-logs'
  }
};
