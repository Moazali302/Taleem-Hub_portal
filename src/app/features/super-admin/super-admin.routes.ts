import { Routes } from '@angular/router';
import { SuperAdminDashboardComponent } from './pages/dashboard/super-admin-dashboard.component';

export const superAdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SuperAdminDashboardComponent },
];
