import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="admin-layout flex h-screen overflow-hidden"><main class="flex-grow p-6 bg-surface overflow-auto"><ng-content></ng-content></main></div>`,
})
export class AdminLayoutComponent {}
