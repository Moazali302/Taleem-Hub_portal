import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `<button class="px-4 py-2 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all"><ng-content></ng-content></button>`,
})
export class ButtonComponent {}
