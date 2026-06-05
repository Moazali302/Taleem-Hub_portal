import { Routes } from '@angular/router';
import { TeacherDashboardComponent } from './pages/dashboard/teacher-dashboard.component';

export const teacherRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: TeacherDashboardComponent },
];
