import { Routes } from '@angular/router';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard';
import { TeacherListingComponent} from './teacher-listing/teacher-listing';
import { TeacherCreatePageComponent } from './add-teacher/teacher-create-page';
import { StudentListingComponent } from './student-listing/student-listing';
import { StudentCreatePageComponent } from './add-student/student-create-page';

export const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'teachers/add', component: TeacherCreatePageComponent },
  {path : 'teachers', component: TeacherListingComponent},
  { path: 'students/add', component: StudentCreatePageComponent },
  { path: 'students', component: StudentListingComponent },
];
