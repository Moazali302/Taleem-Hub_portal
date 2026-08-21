import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';

export interface AddSchoolPayload {
  school_name: string;
  school_address: string;
  owner_name: string;
  owner_number: string;
  email: string;
  password: string;
}

/**
 * Right-side slide-in panel for onboarding a new school (Super Admin flow).
 * Controlled by the parent via [isOpen] — the parent (e.g. the schools
 * listing page) owns when this opens/closes.
 *
 * Usage:
 *   <app-add-admin-school
 *     [isOpen]="isAddSchoolOpen"
 *     (closed)="isAddSchoolOpen = false"
 *     (schoolAdded)="onSchoolAdded($event)"
 *   />
 */
@Component({
  selector: 'app-add-admin-school',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-admin-school.html',
  styleUrl: './add-admin-school.scss',
})
export class AddAdminSchoolComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() schoolAdded = new EventEmitter<AddSchoolPayload>();

  showPassword = false;

  private readonly fb = new FormBuilder();

  form = this.fb.group({
    school_name: ['', [Validators.required]],
    school_address: ['', [Validators.required]],
    owner_name: ['', [Validators.required]],
    owner_number: ['', [Validators.required, Validators.pattern(/^[+\d][\d\s()-]{6,}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onClose(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.schoolAdded.emit(this.form.getRawValue() as AddSchoolPayload);
  }
}