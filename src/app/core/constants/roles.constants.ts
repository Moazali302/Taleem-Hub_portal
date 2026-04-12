export enum Role {
  SUPER_ADMIN = 'superadmin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export const ROLE_REDIRECTS = {
  superadmin: '/super-admin/dashboard',
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/parent/dashboard'
};
