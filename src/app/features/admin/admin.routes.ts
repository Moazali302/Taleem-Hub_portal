import { Routes } from '@angular/router';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard';

export const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
];
