import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AddStudentComponent } from './add-student';

@Component({
  selector: 'app-student-create-page',
  standalone: true,
  imports: [AddStudentComponent],
  template: '<app-add-student />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCreatePageComponent {
  constructor(private readonly router: Router) {}

  returnToStudents(): void {
    void this.router.navigate(['/admin/students']);
  }
}
