import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { TeacherLayoutComponent } from './layout/teacher-layout/teacher-layout.component';
import { ParentLayoutComponent } from './layout/parent-layout/parent-layout.component';
import { SuperAdminLayoutComponent } from './layout/super-admin-layout/super-admin-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./modules/auth/auth-routing.module').then(m => m.AuthRoutingModule)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    loadChildren: () => import('./modules/admin/admin-routing.module').then(m => m.AdminRoutingModule)
  },
  {
    path: 'teacher',
    component: TeacherLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'teacher' },
    loadChildren: () => import('./modules/teacher/teacher-routing.module').then(m => m.TeacherRoutingModule)
  },
  {
    path: 'parent',
    component: ParentLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'student' },
    loadChildren: () => import('./modules/parent/parent-routing.module').then(m => m.ParentRoutingModule)
  },
  {
    path: 'super-admin',
    component: SuperAdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'superadmin' },
    loadChildren: () => import('./modules/super-admin/super-admin-routing.module').then(m => m.SuperAdminRoutingModule)
  },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
