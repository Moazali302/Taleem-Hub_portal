import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard';
import {SchoolsListingComponent} from './school-listing/school-listing';
import { AddAdminSchoolComponent } from './add-school/add-admin-school';
import { DemoRequestsComponent } from './demo-requests/demo-requests';
import { SubscriptionsComponent } from './subscriptions/subscriptions';
import { Routes } from '@angular/router';


export const superAdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SuperAdminDashboardComponent },
  {path : 'schools', component: SchoolsListingComponent},
  {path: 'add-school', component: AddAdminSchoolComponent},
  {path: 'subscriptions', component: SubscriptionsComponent},
  {path: 'demo-requests', component: DemoRequestsComponent}
];