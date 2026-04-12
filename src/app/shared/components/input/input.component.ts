import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-1.5">
      <label *ngIf="label" class="text-[10px] md:text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">{{ label }}</label>
      <input [formControl]="control" [type]="type" [placeholder]="placeholder" 
             class="w-full h-12 md:h-14 px-4 bg-surface-container-high border-none rounded-xl text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm md:text-base">
    </div>
  `,
})
export class InputComponent {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() control = new FormControl();
}
