import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const superAdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
];
