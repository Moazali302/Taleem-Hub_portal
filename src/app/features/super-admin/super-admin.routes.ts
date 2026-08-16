import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard';
import {SchoolsListingComponent} from './school-listing/school-listing';
import { Routes } from '@angular/router';


export const superAdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SuperAdminDashboardComponent },
  {path : 'schools', component: SchoolsListingComponent},

];