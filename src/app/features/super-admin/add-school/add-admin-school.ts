import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '@shared/components/button/button.component';
import {
  SuperAdminService,
  CreateSchoolPlan,
  CreateSchoolStatus,
  CreateSchoolData,
  CreateSchoolPayload,
  SchoolDropdownOptions,
} from '../../../core/services/super-admin.service';
import { ApiResponse } from '@app/core/models/api-response.model';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface PlanOption extends SelectOption<CreateSchoolPlan> {
  student_limit: number | null;
}

interface DropdownOptionSets {
  statuses: SelectOption<CreateSchoolStatus>[];
  plans: PlanOption[];
  billingCycles: SelectOption[];
}

const EMPTY_DROPDOWN_OPTIONS: DropdownOptionSets = {
  statuses: [],
  plans: [],
  billingCycles: [],
};

@Component({
  selector: 'app-add-admin-school',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-admin-school.html',
  styleUrl: './add-admin-school.scss',
})
export class AddAdminSchoolComponent implements OnInit, OnDestroy {
  @Output() closeClicked = new EventEmitter<void>();
  @Output() schoolAdded = new EventEmitter<ApiResponse<CreateSchoolData>>();

  readonly dropdownOptions = signal(EMPTY_DROPDOWN_OPTIONS);
  readonly isOptionsLoading = signal(false);
  readonly optionsError = signal<string | null>(null);

  showPassword = false;
  isSubmitting = false;

  // UI-only state (not part of the submitted payload)
  studentLimitLabel = signal('Select a plan');
  duplicateEmailError = signal<string | null>(null);

  private readonly destroy$ = new Subject<void>();
  private readonly fb = new FormBuilder();
  private optionsLoaded = false;

  form = this.fb.group({
    school_name: ['', [Validators.required]],
    city: ['', [Validators.required]],
    school_address: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\s()-]{6,}$/)]],
    status: this.fb.control<CreateSchoolStatus | ''>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    plan: this.fb.control<CreateSchoolPlan | ''>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    billing_cycle: ['', [Validators.required]],
    start_date: [this.today(), [Validators.required]],
    owner_name: ['', [Validators.required]],
    owner_email: ['', [Validators.required, Validators.email]],
    owner_phone: ['', [Validators.required, Validators.pattern(/^[\d\s()-]{6,}$/)]],
    owner_password: ['', [Validators.required, Validators.minLength(8)]],
    student_limit: this.fb.control<number | null>({ value: null, disabled: true }),
  });

  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form.get('plan')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((plan) => this.setPlanStudentLimit(plan));

    // Clear the duplicate-email banner as soon as the user edits the email again
    this.form.get('owner_email')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.duplicateEmailError()) {
          this.duplicateEmailError.set(null);
        }
      });
  }

  loadSchoolOptions(): void {
    if (this.optionsLoaded || this.isOptionsLoading()) return;

    this.isOptionsLoading.set(true);
    this.optionsError.set(null);
    this.superAdminService.getSchoolDropdownOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const options = this.toDropdownOptions(response.data);
          if (!options.statuses.length || !options.plans.length || !options.billingCycles.length) {
            const message = 'School dropdown options are currently unavailable.';
            this.isOptionsLoading.set(false);
            this.optionsError.set(message);
            this.toaster.error(message);
            this.cdr.markForCheck();
            return;
          }

          this.dropdownOptions.set(options);
          this.optionsLoaded = true;
          this.isOptionsLoading.set(false);

          const currentStatus = this.form.controls.status.value;
          const defaultStatus = response.data.statuses.includes('pending')
            ? 'pending'
            : (response.data.statuses[0] ?? '');
          if (!currentStatus && defaultStatus) {
            this.form.controls.status.setValue(defaultStatus);
          }

          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          const message = getHttpErrorMessage(error);
          this.isOptionsLoading.set(false);
          this.optionsError.set(message);
          this.toaster.error(message);
          this.cdr.markForCheck();
        },
      });
  }

  onDropdownOpened(isOpen: boolean): void {
    if (isOpen) this.loadSchoolOptions();
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

    const raw = this.form.getRawValue();
    if (!this.isCreateSchoolPlan(raw.plan)) {
      this.form.controls.plan.setErrors({ required: true });
      return;
    }
    if (!this.isCreateSchoolStatus(raw.status)) {
      this.form.controls.status.setErrors({ required: true });
      return;
    }
    if (!this.isBillingCycle(raw.billing_cycle ?? '')) {
      this.form.controls.billing_cycle.setErrors({ required: true });
      return;
    }

    this.isSubmitting = true;
    this.duplicateEmailError.set(null);

    const payload: CreateSchoolPayload = {
      school_name: raw.school_name!,
      city: raw.city!,
      school_address: raw.school_address!,
      phone: raw.phone!,
      plan: raw.plan!,
      student_limit: raw.student_limit,
      billing_cycle: raw.billing_cycle!,
      start_date: raw.start_date!,
      status: raw.status,
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

  private setPlanStudentLimit(plan: string | null): void {
    const option = this.dropdownOptions().plans.find((item) => item.value === plan);
    this.form.controls.student_limit.setValue(option?.student_limit ?? null);
    this.studentLimitLabel.set(
      !option
        ? 'Select a plan'
        : option.student_limit === null
          ? 'Unlimited'
          : option.student_limit.toLocaleString('en-US'),
    );
  }

  private isCreateSchoolPlan(plan: string): plan is CreateSchoolPlan {
    return this.dropdownOptions().plans.some((option) => option.value === plan);
  }

  private isCreateSchoolStatus(status: string): status is CreateSchoolStatus {
    return this.dropdownOptions().statuses.some((option) => option.value === status);
  }

  isBillingCycle(value: string): boolean {
    return this.dropdownOptions().billingCycles.some((option) => option.value === value);
  }

  optionLabel(options: readonly SelectOption[], value: string | null): string {
    if (value === null) return '';
    return options.find((option) => option.value === value)?.label ?? '';
  }

  private toDropdownOptions(data: SchoolDropdownOptions): DropdownOptionSets {
    return {
      statuses: data.statuses.map((value) => ({ value, label: this.toOptionLabel(value) })),
      plans: data.plans.map((plan) => ({
        ...plan,
        label: this.toOptionLabel(plan.value),
      })),
      billingCycles: data.billing_cycles.map((value) => ({
        value,
        label: this.toOptionLabel(value),
      })),
    };
  }

  private toOptionLabel(value: string): string {
    return value
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
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