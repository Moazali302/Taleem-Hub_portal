import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '@shared/components/button/button.component';
import { SuperAdminService, CreateSchoolResponse } from '../../../core/services/super-admin.service';
export interface AddSchoolPayload {
  school_name: string;
  school_address: string;
  owner_name: string;
  owner_number: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-add-admin-school',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-admin-school.html',
  styleUrl: './add-admin-school.scss',
})
export class AddAdminSchoolComponent {
  @Output() closeClicked = new EventEmitter<void>();
  @Output() schoolAdded = new EventEmitter<CreateSchoolResponse>();

  showPassword = false;
  isSubmitting = false;

  private readonly fb = new FormBuilder();

  form = this.fb.group({
    school_name: ['', [Validators.required]],
    school_address: ['', [Validators.required]],
    owner_name: ['', [Validators.required]],
    owner_number: ['', [Validators.required, Validators.pattern(/^[+\d][\d\s()-]{6,}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastrService,
  ) {}

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onClose(): void {
    this.closeClicked.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.form.getRawValue() as AddSchoolPayload;

    this.superAdminService.createSchool(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toaster.success('School added successfully!');
        this.schoolAdded.emit(res);
      },
      error: (err) => {
        this.isSubmitting = false;
       this.toaster.error(err);
      },
    });
  }
}