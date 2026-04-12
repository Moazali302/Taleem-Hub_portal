import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="teacher-layout min-h-screen bg-surface"><ng-content></ng-content></div>`,
})
export class TeacherLayoutComponent {}
