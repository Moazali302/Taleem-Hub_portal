import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SchoolPlan, SchoolStatus } from '@app/core/models/school.model';
import { SchoolForEdit, SuperAdminService, UpdateSchoolPayload } from '@app/core/services/super-admin.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

@Component({
  selector: 'app-school-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './school-edit.html',
  styleUrl: './school-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly planOptions: { value: SchoolPlan; label: string }[] = [
    { value: 'free_trial', label: 'Free Trial' },
    { value: 'basic', label: 'Basic' },
    { value: 'advance', label: 'Advanced' },
    { value: 'premium', label: 'Premium' },
  ];

  readonly statusOptions: { value: SchoolStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'closed', label: 'Closed' },
  ];

  readonly billingCycleOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Annual' },
  ];

  readonly form = this.fb.group({
    school_name: ['', Validators.required],
    city: ['', Validators.required],
    school_address: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\s()+-]{6,}$/)]],
    status: this.fb.control<SchoolStatus>('pending', Validators.required),
    plan: this.fb.control<SchoolPlan | ''>('', Validators.required),
    billing_cycle: ['', Validators.required],
    start_date: ['', Validators.required],
    student_limit: this.fb.control<number | null>(null, Validators.min(0)),
    owner_name: ['', Validators.required],
    owner_email: ['', [Validators.required, Validators.email]],
    owner_phone: ['', [Validators.required, Validators.pattern(/^[\d\s()+-]{6,}$/)]],
  });

  school: SchoolForEdit | null = null;
  schoolId = 0;
  schoolSlug = '';
  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('schoolSlug') ?? '';
    this.schoolSlug = slug;
    const navigationState = history.state as { schoolId?: unknown; schoolSlug?: unknown };
    const stateId = Number(navigationState.schoolId);
    if (navigationState.schoolSlug === slug && Number.isSafeInteger(stateId) && stateId > 0) {
      this.schoolId = stateId;
      this.loadSchoolForEdit();
      return;
    }

    this.superAdminService.getSchoolIdBySlug(slug).subscribe({
      next: (id) => {
        this.schoolId = id;
        this.loadSchoolForEdit();
      },
      error: (error: HttpErrorResponse) => this.showLoadError(error),
    });
  }

  private loadSchoolForEdit(): void {
    this.superAdminService.getSchoolForEdit(this.schoolId).subscribe({
      next: (response) => {
        this.school = response.data;
        this.form.patchValue({
          school_name: response.data.school_name,
          city: response.data.city ?? '',
          school_address: response.data.school_address,
          phone: response.data.phone ?? '',
          status: response.data.status,
          plan: response.data.plan ?? '',
          billing_cycle: response.data.billing_cycle ?? '',
          start_date: response.data.start_date?.slice(0, 10) ?? '',
          student_limit: this.toStudentLimit(response.data.student_limit),
          owner_name: response.data.owner_name ?? '',
          owner_email: response.data.owner_email ?? '',
          owner_phone: response.data.owner_phone ?? '',
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => this.showLoadError(error),
    });
  }

  private showLoadError(error: HttpErrorResponse): void {
    this.isLoading = false;
    this.errorMessage = getHttpErrorMessage(error);
    this.toaster.error(this.errorMessage);
    this.cdr.markForCheck();
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cancel(): void {
    if (this.schoolId > 0) {
      void this.router.navigate(['/super-admin/schools', this.schoolSlug], {
        state: { schoolId: this.schoolId, schoolSlug: this.schoolSlug },
      });
      return;
    }

    void this.router.navigate(['/super-admin/schools']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    if (!values.plan) {
      this.form.controls.plan.setErrors({ required: true });
      return;
    }

    const payload: UpdateSchoolPayload = {
      school_name: values.school_name ?? '',
      city: values.city ?? '',
      school_address: values.school_address ?? '',
      phone: values.phone ?? '',
      status: values.status ?? this.school?.status ?? 'pending',
      plan: values.plan,
      billing_cycle: values.billing_cycle ?? '',
      start_date: values.start_date ?? '',
      student_limit: values.student_limit,
      owner_name: values.owner_name ?? '',
      owner_email: values.owner_email ?? '',
      owner_phone: values.owner_phone ?? '',
    };

    this.isSaving = true;
    this.superAdminService.updateSchool(this.schoolId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.toaster.success('School updated successfully.');
        void this.router.navigate(['/super-admin/schools', this.schoolSlug], {
          state: { schoolId: this.schoolId, schoolSlug: this.schoolSlug },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.toaster.error(getHttpErrorMessage(error));
        this.cdr.markForCheck();
      },
    });
  }

  private toStudentLimit(limit: number | string | null): number | null {
    if (limit === null || limit === '') return null;
    const parsedLimit = Number(limit);
    return Number.isFinite(parsedLimit) ? parsedLimit : null;
  }
}
