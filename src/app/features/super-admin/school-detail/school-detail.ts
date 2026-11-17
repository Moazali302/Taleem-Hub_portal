import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SchoolDetail, SchoolDropdownOptions, SuperAdminService } from '@app/core/services/super-admin.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

@Component({
  selector: 'app-school-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './school-detail.html',
  styleUrl: './school-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolDetailComponent implements OnInit {
  readonly schoolOptions = signal<SchoolDropdownOptions | null>(null);
  school: SchoolDetail | null = null;
  private schoolSlug = '';
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.superAdminService.getSchoolDropdownOptions().subscribe({
      next: (response) => {
        this.schoolOptions.set(response.data);
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.toaster.error(getHttpErrorMessage(error));
      },
    });

    const slug = this.route.snapshot.paramMap.get('schoolSlug') ?? '';
    this.schoolSlug = slug;
    const navigationState = history.state as { schoolId?: unknown; schoolSlug?: unknown };
    const stateId = Number(navigationState.schoolId);
    if (navigationState.schoolSlug === slug && Number.isSafeInteger(stateId) && stateId > 0) {
      this.loadSchoolDetail(stateId);
      return;
    }

    this.superAdminService.getSchoolIdBySlug(slug).subscribe({
      next: (id) => this.loadSchoolDetail(id),
      error: (error: HttpErrorResponse) => this.showLoadError(error),
    });
  }

  private loadSchoolDetail(id: number): void {
    this.superAdminService.getSchoolDetail(id).subscribe({
      next: (response) => {
        this.school = response.data;
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

  backToSchools(): void {
    void this.router.navigate(['/super-admin/schools']);
  }

  editSchool(): void {
    if (this.school) {
      void this.router.navigate(['/super-admin/schools', this.schoolSlug, 'edit'], {
        state: { schoolId: this.school.id, schoolSlug: this.schoolSlug },
      });
    }
  }

  get schoolInitials(): string {
    const name = this.school?.school_name.trim();
    if (!name) return 'SC';

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  get studentUsagePercent(): number | null {
    const limit = this.school?.student_limit;
    if (!this.school || limit === null || limit === undefined || limit <= 0) return null;

    return Math.round((this.school.students_count / limit) * 100);
  }

  get statusLabel(): string {
    const status = this.school?.status;
    if (!status) return '';

    const apiStatus = this.schoolOptions()?.statuses.find((option) => option === status);
    return apiStatus ? this.optionLabel(apiStatus) : 'Status unavailable';
  }

  get planLabel(): string {
    const plan = this.school?.plan;
    if (!plan) return 'Not provided';

    const apiPlan = this.schoolOptions()?.plans.find((option) => option.value === plan);
    return apiPlan ? this.optionLabel(apiPlan.value) : 'Plan unavailable';
  }

  get billingCycleLabel(): string {
    const billingCycle = this.school?.billing_cycle;
    if (!billingCycle) return 'Not provided';

    const apiBillingCycle = this.schoolOptions()?.billing_cycles.find((option) => option === billingCycle);
    return apiBillingCycle ? this.optionLabel(apiBillingCycle) : 'Billing cycle unavailable';
  }

  optionLabel(value: string | null): string {
    if (!value) return '';

    return value
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  get renewalDays(): number | null {
    const endDate = this.school?.end_date;
    if (!endDate) return null;

    const [year, month, day] = endDate.slice(0, 10).split('-').map(Number);
    const renewalDate = Date.UTC(year, month - 1, day);
    const parsedDate = new Date(renewalDate);
    if (
      !Number.isFinite(renewalDate) ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      return null;
    }

    const today = new Date();
    const todayDate = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    return Math.ceil((renewalDate - todayDate) / 86_400_000);
  }
}
