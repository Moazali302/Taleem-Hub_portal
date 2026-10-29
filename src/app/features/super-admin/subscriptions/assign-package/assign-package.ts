import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AssignPackagePayload,
  BILLING_CYCLE_OPTIONS,
  PLAN_PRICING_PKR,
  SUBSCRIPTION_PLAN_OPTIONS,
  SubscriptionListItem,
} from '@app/core/models/subscription.model';
import { SubscriptionsService } from '@app/core/services/subscriptions.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

@Component({
  selector: 'app-assign-package',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assign-package.html',
  styleUrl: './assign-package.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignPackageComponent implements OnInit {
  /** Schools that can be assigned a package. */
  @Input({ required: true }) schools: SubscriptionListItem[] = [];
  /** When set, the school is fixed and its current plan is pre-selected ("change package"). */
  @Input() subscription: SubscriptionListItem | null = null;

  @Output() closeClicked = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly planOptions = SUBSCRIPTION_PLAN_OPTIONS;
  readonly cycleOptions = BILLING_CYCLE_OPTIONS;
  isSubmitting = false;

  private readonly fb = new FormBuilder();

  readonly form = this.fb.nonNullable.group({
    school_id: [0, [Validators.required, Validators.min(1)]],
    plan: [SUBSCRIPTION_PLAN_OPTIONS[0].value, [Validators.required]],
    billing_cycle: [BILLING_CYCLE_OPTIONS[0].value, [Validators.required]],
  });

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.subscription) {
      this.form.patchValue({
        school_id: this.subscription.school_id,
        plan: this.subscription.plan,
        billing_cycle: this.subscription.billing_cycle,
      });
      this.form.controls.school_id.disable();
    }
  }

  get heading(): string {
    return this.subscription ? 'Change Package' : 'Assign Package';
  }

  get subtitle(): string {
    return this.subscription
      ? `Update the plan for ${this.subscription.school_name}`
      : 'Pick a school and the plan it should be billed on';
  }

  /** Live price preview for the selected plan + billing cycle. */
  get amount(): number {
    const { plan, billing_cycle } = this.form.getRawValue();
    return PLAN_PRICING_PKR[plan][billing_cycle];
  }

  isInvalid(controlName: 'school_id' | 'plan' | 'billing_cycle'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
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
    const payload: AssignPackagePayload = {
      school_id: Number(raw.school_id),
      plan: raw.plan,
      billing_cycle: raw.billing_cycle,
    };

    this.isSubmitting = true;
    this.subscriptionsService.assignPackage(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toaster.success('Package updated successfully');
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toaster.error(getHttpErrorMessage(err));
        this.cdr.markForCheck();
      },
    });
  }
}
