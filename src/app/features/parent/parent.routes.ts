import { Routes } from '@angular/router';
import { ParentDashboardComponent } from './pages/dashboard/parent-dashboard.component';

export const parentRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ParentDashboardComponent },
];
