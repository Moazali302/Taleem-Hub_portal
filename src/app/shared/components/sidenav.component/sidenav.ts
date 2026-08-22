import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Generic slide-in side panel used across the app for every "Add X" / detail
 * screen (Add School, Add Teacher, Add Student, ...). This component owns
 * only the panel mechanics — backdrop, animation, width, and scroll lock.
 * The actual form/content is projected in by the parent, e.g.:
 *
 *   <app-sidenav [isOpen]="isAddSchoolOpen" (close)="closeAddSchool()">
 *     <app-add-admin-school *ngIf="isAddSchoolOpen"
 *                            (closeClicked)="closeAddSchool()"
 *                            (schoolAdded)="onSchoolAdded($event)" />
 *   </app-sidenav>
 *
 * [panelWidth] accepts any Tailwind width/max-width utility class
 * (defaults to a 720px panel, matching the standard "Add X" form width).
 */
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class SidenavComponent implements OnChanges {
  @Input() isOpen = false;
  /** Real CSS max-width value, e.g. '720px' — NOT a Tailwind class string. */
  @Input() panelWidth = '720px';
  @Output() close = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if ('isOpen' in changes) {
      document.body.style.overflow = this.isOpen ? 'hidden' : 'auto';
    }
  }

  onBackdropClick(): void {
    this.close.emit();
  }
}