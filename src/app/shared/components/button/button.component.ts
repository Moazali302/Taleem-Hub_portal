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
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
};

/**
 * Shared button for every "Add X" / primary action across the app.
 * Add a new look by adding one entry to VARIANT_CLASSES/SIZE_CLASSES —
 * every screen using <app-button> picks it up automatically.
 *
 * `icon` accepts either format used across the app:
 *   - An SVG asset path, e.g. "/svg/plus.svg"  -> rendered as <img>
 *   - A Tabler class suffix, e.g. "ti-plus"     -> rendered as <i class="ti ti-plus">
 * The component detects which one it got, so callers don't need to care.
 *
 * Usage:
 *   <app-button icon="/svg/plus.svg">Add New School</app-button>
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
        @if (isSvgPath) {
          <img [src]="icon" alt="" class="button-icon" aria-hidden="true" />
        } @else {
          <i class="ti {{ icon }}" aria-hidden="true"></i>
        }
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [
    `
      .button-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() icon?: string;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;

  private readonly base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';

  get isSvgPath(): boolean {
    return !!this.icon && (this.icon.includes('/') || this.icon.endsWith('.svg'));
  }

  get classes(): string {
    return [this.base, VARIANT_CLASSES[this.variant], SIZE_CLASSES[this.size], this.fullWidth ? 'w-full' : '']
      .filter(Boolean)
      .join(' ');
  }
}