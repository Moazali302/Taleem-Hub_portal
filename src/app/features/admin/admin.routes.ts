import { Routes } from '@angular/router';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard';
import { TeacherListingComponent} from './teacher-listing/teacher-listing';

export const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  {path : 'teachers', component: TeacherListingComponent},
];
