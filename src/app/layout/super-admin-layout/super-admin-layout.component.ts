import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="super-admin-layout min-h-screen bg-surface"><ng-content></ng-content></div>`,
})
export class SuperAdminLayoutComponent {}
