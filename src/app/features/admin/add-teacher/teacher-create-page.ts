import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AddTeacherComponent } from './add-teacher';

@Component({
  selector: 'app-teacher-create-page',
  standalone: true,
  imports: [AddTeacherComponent],
  template: `
    <app-add-teacher
      mode="create"
      [showCloseButton]="false"
      (closeClicked)="returnToTeachers()"
      (saved)="returnToTeachers()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherCreatePageComponent {
  constructor(private readonly router: Router) {}

  returnToTeachers(): void {
    void this.router.navigate(['/admin/teachers']);
  }
}
