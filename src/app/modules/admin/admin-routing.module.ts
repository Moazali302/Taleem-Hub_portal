import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentListComponent } from './students/pages/student-list/student-list.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'students', component: StudentListComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
