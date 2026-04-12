import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="flex items-center justify-center p-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>`,
})
export class LoaderComponent {}
