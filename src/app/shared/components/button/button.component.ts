import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
  ghost: 'bg-transparent text-primary hover:bg-primary/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
};

/**
 * Shared button for every "Add X" / primary action across the app.
 * To add a new look, add one entry to VARIANT_CLASSES (or SIZE_CLASSES) —
 * every screen using <app-button> picks it up automatically, no per-page CSS.
 *
 * Usage:
 *   <app-button icon="ti-plus">Add New School</app-button>
 *   <app-button variant="outline" size="sm">Cancel</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [type]="type" [disabled]="disabled" [class]="classes">
      @if (icon) {
        <i class="ti {{ icon }}" aria-hidden="true"></i>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() icon?: string;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;

  private readonly base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  get classes(): string {
    return [
      this.base,
      VARIANT_CLASSES[this.variant],
      SIZE_CLASSES[this.size],
      this.fullWidth ? 'w-full' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}