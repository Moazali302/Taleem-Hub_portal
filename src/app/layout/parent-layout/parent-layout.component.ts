import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parent-layout',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="parent-layout min-h-screen bg-surface"><ng-content></ng-content></div>`,
})
export class ParentLayoutComponent {}
