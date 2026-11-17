import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard';
import {SchoolsListingComponent} from './school-listing/school-listing';
import { AddAdminSchoolComponent } from './add-school/add-admin-school';
import { DemoRequestsComponent } from './demo-requests/demo-requests';
import { SubscriptionsComponent } from './subscriptions/subscriptions';
import { AnnouncementsComponent } from './announcements/announcements';
import { ComplaintsComponent } from './school-listing/complaint/Complaints';
import { AnalyticsComponent } from './analytics/analytics';
import { SchoolDetailComponent } from './school-detail/school-detail';
import { SchoolEditComponent } from './school-edit/school-edit';
import { Routes } from '@angular/router';


export const superAdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SuperAdminDashboardComponent },
  {path : 'schools', component: SchoolsListingComponent},
  { path: 'schools/:schoolSlug/edit', component: SchoolEditComponent },
  { path: 'schools/:schoolSlug', component: SchoolDetailComponent },
  {path: 'add-school', component: AddAdminSchoolComponent},
  {path: 'subscriptions', component: SubscriptionsComponent},
  {path: 'announcements', component: AnnouncementsComponent},
  {path: 'complaints', component: ComplaintsComponent},
  {path: 'analytics', component: AnalyticsComponent},
  {path: 'demo-requests', component: DemoRequestsComponent}
];