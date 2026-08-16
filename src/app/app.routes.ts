import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '@shared/layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from '@shared/layouts/admin-layout/admin-layout.component';
import { TeacherLayoutComponent } from '@shared/layouts/teacher-layout/teacher-layout.component';
import { ParentLayoutComponent } from '@shared/layouts/parent-layout/parent-layout.component';
import { superAdminRoutes } from '@features/super-admin/super-admin.routes';
import {SuperAdminDashboardComponent} from '@features/super-admin/super-admin-dashboard/super-admin-dashboard';
import { AuthGuard } from '@core/guards/auth.guard';
import { RoleGuard } from '@core/guards/role.guard';
import {SchoolsListingComponent} from '@features/super-admin/school-listing/school-listing';
import {SuperAdminLayoutComponent} from '@shared/layouts/super-admin-layout/super-admin-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    loadChildren: () => import('@features/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
  path: 'schools',
  loadComponent: () => import ('@features/super-admin/school-listing/school-listing')
    .then(m => m.SchoolsListingComponent),
}
  {
    path: 'teacher',
    component: TeacherLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'teacher' },
    loadChildren: () => import('@features/teacher/teacher.routes').then(m => m.teacherRoutes)
  },
  {
    path: 'parent',
    component: ParentLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'student' },
    loadChildren: () => import('@features/parent/parent.routes').then(m => m.parentRoutes)
  },
  {
  path: 'super-admin',
  component: SuperAdminLayoutComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'superadmin' },
  loadChildren: () => import('@features/super-admin/super-admin.routes').then(m => m.superAdminRoutes)
},
  { path: '**', redirectTo: 'auth/login' }
];
