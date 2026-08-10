import { Routes } from '@angular/router';
import { SuperAdminLayoutComponent } from '@app/shared/layouts/super-admin-layout/super-admin-layout.component';

export const superAdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SuperAdminLayoutComponent },
];
