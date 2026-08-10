import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard';
import { Routes } from '@angular/router';


export const superAdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SuperAdminDashboardComponent },
];