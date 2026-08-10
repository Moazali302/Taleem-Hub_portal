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
      { label: 'Dashboard', icon: 'ti-layout-grid', route: 'dashboard' },
      { label: 'Schools', icon: 'ti-building', route: 'schools' },
      { label: 'Subscriptions', icon: 'ti-credit-card', route: 'subscriptions' },
      { label: 'Students', icon: 'ti-user', route: 'students' },
      { label: 'Teachers', icon: 'ti-users', route: 'teachers' },
      { label: 'Announcements', icon: 'ti-speakerphone', route: 'announcements' },
      { label: 'Complaints', icon: 'ti-alert-triangle', route: 'complaints' },
      { label: 'Analytics', icon: 'ti-chart-bar', route: 'analytics' },
      { label: 'Setting', icon: 'ti-settings', route: 'settings' },
    ],
    footerAction: { label: 'Add New School', icon: 'ti-plus', route: 'schools/new' },
  },

  [Role.ADMIN]: {
    basePath: '/admin',
    roleLabel: 'Admin',
    items: [
      { label: 'Dashboard', icon: 'ti-layout-grid', route: 'dashboard' },
      { label: 'Schools', icon: 'ti-building', route: 'schools' },
      { label: 'Teachers', icon: 'ti-users', route: 'teachers' },
      { label: 'Students', icon: 'ti-user', route: 'students' },
      { label: 'Fees', icon: 'ti-cash', route: 'fees' },
      { label: 'Exams', icon: 'ti-file-text', route: 'exams' },
      { label: 'Attendance', icon: 'ti-calendar-stats', route: 'attendance' },
      { label: 'Announcements', icon: 'ti-speakerphone', route: 'announcements' },
      { label: 'Complaints', icon: 'ti-alert-triangle', route: 'complaints' },
      { label: 'Setting', icon: 'ti-settings', route: 'settings' },
    ],
  },

  [Role.TEACHER]: {
    basePath: '/teacher',
    roleLabel: 'Teacher',
    items: [
      { label: 'Dashboard', icon: 'ti-layout-grid', route: 'dashboard' },
      { label: 'Students', icon: 'ti-user', route: 'students' },
      { label: 'Classes', icon: 'ti-chalkboard', route: 'classes' },
      { label: 'Attendance', icon: 'ti-calendar-stats', route: 'attendance' },
      { label: 'Exams', icon: 'ti-file-text', route: 'exams' },
      { label: 'Announcements', icon: 'ti-speakerphone', route: 'announcements' },
      { label: 'Leaves', icon: 'ti-calendar-off', route: 'leaves' },
      { label: 'Setting', icon: 'ti-settings', route: 'settings' },
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
      { label: 'Dashboard', icon: 'ti-layout-grid', route: 'dashboard' },
      { label: 'Schedule', icon: 'ti-calendar', route: 'schedule' },
      { label: 'Exams', icon: 'ti-file-text', route: 'exams' },
      { label: 'Attendance', icon: 'ti-calendar-stats', route: 'attendance' },
      { label: 'Fees', icon: 'ti-cash', route: 'fees' },
      { label: 'Complain', icon: 'ti-alert-triangle', route: 'complain' },
      { label: 'Setting', icon: 'ti-settings', route: 'settings' },
    ],
  },
};