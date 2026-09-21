export enum Role {
  SUPER_ADMIN = 'superadmin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export const ROLE_REDIRECTS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '/super-admin/dashboard',
  [Role.ADMIN]: '/admin/dashboard',
  [Role.TEACHER]: '/teacher/dashboard',
  [Role.STUDENT]: '/parent/dashboard'
};