import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="auth-layout min-h-screen bg-surface"><ng-content></ng-content></div>`,
})
export class AuthLayoutComponent {}
