import { Role } from '@core/constants/roles.constants';
import {SidebarConfig} from '@core/models/sidbar-menu.model';

/**
 * Single source of truth for every role's sidebar.
 * Add a new role by adding a new key here — SidebarComponent needs no changes.
 */
export const SIDEBAR_MENUS: Record<Role, SidebarConfig> = {
  [Role.SUPER_ADMIN]: {
    basePath: '/super-admin',
    roleLabel: 'Super Admin',
    items: [
      { label: 'Dashboard', icon: '/svg/sidnav-dashboard.svg', route: 'dashboard' },
      { label: 'Schools', icon: '/svg/school.svg', route: 'schools' },
      { label: 'Subscriptions', icon: '/svg/subscription.svg', route: 'subscriptions' },
      { label: 'Students', icon: '/svg/students.svg', route: 'students' },
      { label: 'Teachers', icon: '/svg/teacher.svg', route: 'teachers' },
      { label: 'Announcements', icon: '/svg/announcement.svg', route: 'announcements' },
      { label: 'Complaints', icon: '/svg/complaint.svg', route: 'complaints' },
      { label: 'Analytics', icon: '/svg/analytics.svg', route: 'analytics' },
      { label: 'Setting', icon: '/svg/setting.svg', route: 'settings' },
    ],
    footerAction:{ label: 'Add New School', icon: '/svg/add.svg', route: 'schools/new' },
  },

  [Role.ADMIN]: {
    basePath: '/admin',
    roleLabel: 'Admin',
    items: [
      { label: 'Dashboard', icon: '/svg/sidnav-dashboard.svg', route: 'dashboard' },
      { label: 'Schools', icon: '/svg/school.svg', route: 'schools' },
      { label: 'Teachers', icon: '/svg/teacher.svg', route: 'teachers' },
      { label: 'Students', icon: '/svg/students.svg', route: 'students' },
      { label: 'Fees', icon: '/svg/fee.svg', route: 'fees' },
      { label: 'Exams', icon: '/svg/exam.svg', route: 'exams' },
      { label: 'Attendance', icon: '/svg/attendance.svg', route: 'attendance' },
      { label: 'Announcements', icon: '/svg/announcement.svg', route: 'announcements' },
      { label: 'Complaints', icon: '/svg/complaint.svg', route: 'complaints' },
      { label: 'Setting', icon: '/svg/setting.svg', route: 'settings' },
    ],
  },

  [Role.TEACHER]: {
    basePath: '/teacher',
    roleLabel: 'Teacher',
    items: [
      { label: 'Dashboard', icon: '/svg/sidnav-dashboard.svg', route: 'dashboard' },
      { label: 'Students', icon: '/svg/students.svg', route: 'students' },
      { label: 'Classes', icon: '/svg/class.svg', route: 'classes' },
      { label: 'Attendance', icon: '/svg/attendance.svg', route: 'attendance' },
      { label: 'Exams', icon: '/svg/exam.svg', route: 'exams' },
      { label: 'Announcements', icon: '/svg/announcement.svg', route: 'announcements' },
      { label: 'Leaves', icon: '/svg/leave.svg', route: 'leaves' },
      { label: 'Setting', icon: '/svg/setting.svg', route: 'settings' },
    ],
  },

  // NOTE: app.routes.ts currently mounts the student portal at path 'parent'
  // (data: { role: 'student' } but path: 'parent'). basePath below matches
  // that existing route so links don't 404 — rename together in both places
  // if that was unintentional.
  [Role.STUDENT]: {
    basePath: '/parent',
    roleLabel: 'Student',
    items: [
      { label: 'Dashboard', icon: '/svg/sidnav-dashboard.svg', route: 'dashboard' },
      { label: 'Schedule', icon: '/svg/calendar.svg', route: 'schedule' },
      { label: 'Exams', icon: '/svg/exam.svg', route: 'exams' },
      { label: 'Attendance', icon: '/svg/attendance.svg', route: 'attendance' },
      { label: 'Fees', icon: '/svg/fee.svg', route: 'fees' },
      { label: 'Complaints', icon: '/svg/complaint.svg', route: 'complaints' },
      { label: 'Setting', icon: '/svg/setting.svg', route: 'settings' },
    ],
  },
};