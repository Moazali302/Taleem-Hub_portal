import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '@shared/components/button/button.component';
import {
  SuperAdminService,
  CreateSchoolData,
  CreateSchoolPayload,
} from '../../../core/services/super-admin.service';
import { ApiResponse } from '@app/core/models/api-response.model';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

interface SelectOption {
  value: string;
  label: string;
}

interface PlanOption extends SelectOption {
  studentLimit: number | null; // null = unlimited
}

const PLAN_OPTIONS: PlanOption[] = [
  { value: 'free_trial', label: 'Free Trial', studentLimit: null },
  { value: 'basic', label: 'Basic', studentLimit: 500 },
  { value: 'advanced', label: 'Advanced', studentLimit: 1500 },
  { value: 'premium', label: 'Premium', studentLimit: 4000 },
];

const BILLING_CYCLE_OPTIONS: SelectOption[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Annual' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

@Component({
  selector: 'app-add-admin-school',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-admin-school.html',
  styleUrl: './add-admin-school.scss',
})
export class AddAdminSchoolComponent implements OnInit, OnDestroy {
  @Output() closeClicked = new EventEmitter<void>();
  @Output() schoolAdded = new EventEmitter<ApiResponse<CreateSchoolData>>();

  readonly planOptions = PLAN_OPTIONS;
  readonly billingCycleOptions = BILLING_CYCLE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  showPassword = false;
  isSubmitting = false;

  // UI-only state (not part of the submitted payload)
  studentLimitLabel = signal('Select a plan');
  duplicateEmailError = signal<string | null>(null);

  private readonly destroy$ = new Subject<void>();
  private readonly fb = new FormBuilder();

  form = this.fb.group({
    school_name: ['', [Validators.required]],
    city: ['', [Validators.required]],
    school_address: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\s()-]{6,}$/)]],
    status: ['active', [Validators.required]],
    plan: ['', [Validators.required]],
    billing_cycle: ['yearly', [Validators.required]],
    start_date: [this.today(), [Validators.required]],
    owner_name: ['', [Validators.required]],
    owner_email: ['', [Validators.required, Validators.email]],
    owner_phone: ['', [Validators.required, Validators.pattern(/^[\d\s()-]{6,}$/)]],
    owner_password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastrService,
  ) {}

  ngOnInit(): void {
    this.form.get('plan')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((plan) => this.studentLimitLabel.set(this.getStudentLimitLabel(plan)));

    // Clear the duplicate-email banner as soon as the user edits the email again
    this.form.get('owner_email')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.duplicateEmailError()) {
          this.duplicateEmailError.set(null);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
    this.duplicateEmailError.set(null);

    const raw = this.form.getRawValue();
    const payload: CreateSchoolPayload = {
      school_name: raw.school_name!,
      city: raw.city!,
      school_address: raw.school_address!,
      phone: raw.phone!,
      plan: raw.plan!,
      billing_cycle: raw.billing_cycle!,
      start_date: raw.start_date!,
      status: raw.status!,
      owner_name: raw.owner_name!,
      owner_email: raw.owner_email!,
      owner_phone: raw.owner_phone!,
      owner_password: raw.owner_password!,
    };

    this.superAdminService.createSchool(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toaster.success('School added successfully!');
        this.schoolAdded.emit(res);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;

        if (this.isDuplicateEmailError(err)) {
          this.duplicateEmailError.set('This email is already registered to another school account.');
          this.form.get('owner_email')?.markAsTouched();
          return;
        }

        this.toaster.error(getHttpErrorMessage(err));
      },
    });
  }

  private getStudentLimitLabel(plan: string | null): string {
    const option = PLAN_OPTIONS.find((p) => p.value === plan);
    if (!option) return 'Select a plan';
    return option.studentLimit === null ? 'Unlimited' : option.studentLimit.toLocaleString('en-US');
  }

  private today(): string {
    return new Date().toLocaleDateString('en-CA'); // yyyy-MM-dd in local time
  }

  /**
   * NOTE: Confirm this against your actual API error contract.
   * Currently checks HTTP 409 (Conflict) or a message containing "email" + "already/exist".
   */
  private isDuplicateEmailError(err: HttpErrorResponse): boolean {
    if (err.status === 409) return true;
    const message = (err.error?.message ?? '').toString().toLowerCase();
    return message.includes('email') && (message.includes('already') || message.includes('exist'));
  }
}