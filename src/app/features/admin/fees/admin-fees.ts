import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AdminFeesService,
  FeeListQuery,
  FeePayment,
  FeePaymentMethod,
  FeeRecord,
  FeeStatus,
  FeeSummary,
} from '@app/core/services/admin-fees.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import { downloadCsv } from '@app/shared/utlis/csv-export.util';

@Component({
  selector: 'app-admin-fees',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './admin-fees.html',
  styleUrl: './admin-fees.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFeesComponent implements OnInit {
  readonly fees = signal<FeeRecord[]>([]);
  readonly summary = signal<FeeSummary | null>(null);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<FeeStatus | ''>('');
  readonly month = signal(currentMonthValue());
  readonly page = signal(1);
  readonly pageSize = 20;
  readonly total = signal(0);
  readonly totalPages = signal(0);
  readonly isLoading = signal(false);
  readonly isSummaryLoading = signal(false);
  readonly isExporting = signal(false);
  readonly isGeneratingVouchers = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal('');
  readonly summaryError = signal('');
  readonly voucherError = signal('');
  readonly activeDialog = signal<'payment' | 'history' | null>(null);
  readonly selectedFee = signal<FeeRecord | null>(null);
  readonly isSubmittingPayment = signal(false);
  readonly paymentError = signal('');
  readonly payments = signal<FeePayment[]>([]);
  readonly isLoadingHistory = signal(false);
  readonly historyError = signal('');

  readonly monthLabel = computed(() => {
    const date = new Date(`${this.month()}-01T00:00:00`);
    return Number.isNaN(date.getTime())
      ? this.month()
      : new Intl.DateTimeFormat('en-PK', { month: 'long', year: 'numeric' }).format(date);
  });
  readonly visiblePages = computed(() => {
    const totalPages = this.totalPages();
    const count = Math.min(5, totalPages);
    const start = Math.max(1, Math.min(this.page() - 2, totalPages - count + 1));
    return Array.from({ length: count }, (_, index) => start + index);
  });
  readonly firstResult = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize + 1,
  );
  readonly lastResult = computed(() =>
    Math.min(this.page() * this.pageSize, this.total()),
  );

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feesService = inject(AdminFeesService);
  private readonly toaster = inject(ToastService);
  readonly paymentForm = this.fb.group({
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      maxTwoDecimalPlacesValidator,
    ]),
    method: this.fb.nonNullable.control<FeePaymentMethod>('cash', [Validators.required]),
  });

  private readonly searchChanges = new Subject<string>();
  private listRequest?: Subscription;
  private summaryRequest?: Subscription;
  private paymentRequest?: Subscription;
  private historyRequest?: Subscription;
  private voucherRequest?: Subscription;

  ngOnInit(): void {
    this.searchChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.loadFees();
      });
    this.loadMonthData();
  }

  loadMonthData(): void {
    this.loadSummary();
    this.loadFees();
  }

  loadSummary(): void {
    this.summaryRequest?.unsubscribe();
    this.isSummaryLoading.set(true);
    this.summaryError.set('');
    this.summaryRequest = this.feesService.getSummary(this.month())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.summary.set(response.data);
          this.isSummaryLoading.set(false);
        },
        error: (error: unknown) => {
          this.summary.set(null);
          this.isSummaryLoading.set(false);
          this.summaryError.set(getHttpErrorMessage(error));
          this.toaster.error(`Unable to load fee summary: ${this.summaryError()}`);
        },
      });
  }

  loadFees(): void {
    this.listRequest?.unsubscribe();
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');
    this.listRequest = this.feesService.getFees(this.listQuery())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.fees.set(response.data.items);
          this.page.set(response.data.page);
          this.total.set(response.data.total);
          this.totalPages.set(response.data.totalPages);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.fees.set([]);
          this.total.set(0);
          this.totalPages.set(0);
          this.isLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set(getHttpErrorMessage(error));
          this.toaster.error(this.errorMessage());
        },
      });
  }

  onMonthChange(month: string): void {
    if (!isMonthValue(month) || month === this.month()) return;
    this.month.set(month);
    this.page.set(1);
    this.voucherError.set('');
    this.loadMonthData();
  }

  onSearchChange(search: string): void {
    this.searchTerm.set(search);
    this.searchChanges.next(search.trim());
  }

  onStatusChange(status: FeeStatus | ''): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadFees();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page() || this.isLoading()) return;
    this.page.set(page);
    this.loadFees();
  }

  openPaymentForm(fee: FeeRecord): void {
    this.historyRequest?.unsubscribe();
    this.activeDialog.set('payment');
    this.selectedFee.set(fee);
    this.paymentError.set('');
    this.paymentForm.reset({
      amount: Math.max(fee.amountDue - fee.amountPaid, 0),
      method: 'cash',
    });
  }

  submitPayment(): void {
    const fee = this.selectedFee();
    if (this.isSubmittingPayment() || !fee) return;
    this.paymentError.set('');
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const { amount, method } = this.paymentForm.getRawValue();
    if (amount === null || amount <= 0) return;

    this.isSubmittingPayment.set(true);
    this.paymentRequest?.unsubscribe();
    this.paymentRequest = this.feesService
      .submitPayment(fee.id, amount, method)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.replaceFee(response.data.fee);
          this.isSubmittingPayment.set(false);
          this.activeDialog.set(null);
          this.selectedFee.set(null);
          this.toaster.success('Payment recorded successfully.');
          this.loadMonthData();
        },
        error: (error: unknown) => {
          this.isSubmittingPayment.set(false);
          this.paymentError.set(getHttpErrorMessage(error));
          this.toaster.error(this.paymentError());
        },
      });
  }

  openPaymentHistory(fee: FeeRecord): void {
    this.activeDialog.set('history');
    this.selectedFee.set(fee);
    this.payments.set([]);
    this.historyError.set('');
    this.isLoadingHistory.set(true);
    this.historyRequest?.unsubscribe();
    this.historyRequest = this.feesService.getPaymentHistory(fee.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.payments.set(response.data);
          this.isLoadingHistory.set(false);
        },
        error: (error: unknown) => {
          this.isLoadingHistory.set(false);
          this.historyError.set(getHttpErrorMessage(error));
          this.toaster.error(this.historyError());
        },
      });
  }

  closeDialog(): void {
    if (this.isSubmittingPayment()) return;
    this.historyRequest?.unsubscribe();
    this.activeDialog.set(null);
    this.selectedFee.set(null);
    this.paymentError.set('');
    this.historyError.set('');
  }

  generateVouchers(): void {
    if (this.isGeneratingVouchers()) return;
    this.isGeneratingVouchers.set(true);
    this.voucherError.set('');
    this.voucherRequest?.unsubscribe();
    this.voucherRequest = this.feesService.generateVouchers(this.month())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isGeneratingVouchers.set(false);
          this.toaster.success(`Voucher generation completed for ${this.monthLabel()}.`);
          this.loadMonthData();
        },
        error: (error: unknown) => {
          this.isGeneratingVouchers.set(false);
          const message = isHttpStatus(error, 503)
            ? 'WhatsApp delivery is not configured yet. Vouchers were not sent.'
            : getHttpErrorMessage(error);
          this.voucherError.set(message);
          this.toaster.error(message);
        },
      });
  }

  isPaid(fee: FeeRecord): boolean {
    return fee.status === 'Paid';
  }

  statusClass(fee: FeeRecord): string {
    switch (fee.status) {
      case 'Paid': return 'fee-status--paid';
      case 'Partial': return 'fee-status--partial';
      case 'Overdue': return 'fee-status--overdue';
      case 'Pending': return 'fee-status--pending';
    }
  }

  initials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  formatPkr(amount: number): string {
    return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(value.includes('T') ? { hour: '2-digit', minute: '2-digit' } : {}),
      }).format(date);
  }

  exportFees(): void {
    const fees = this.fees();
    if (this.isExporting() || fees.length === 0) return;
    this.isExporting.set(true);
    try {
      downloadCsv('fees.csv', [
        { header: 'Student', value: (fee) => fee.studentName },
        { header: 'Class', value: (fee) => fee.className },
        { header: 'Net Payable', value: (fee) => fee.amountDue },
        { header: 'Paid', value: (fee) => fee.amountPaid },
        { header: 'Status', value: (fee) => fee.status },
        { header: 'Due Date', value: (fee) => fee.dueDate ?? '' },
        { header: 'Voucher Sent', value: (fee) => fee.voucherSent === true ? 'Yes' : 'No' },
      ], fees);
      this.toaster.success(`${fees.length} fee record${fees.length === 1 ? '' : 's'} exported.`);
    } finally {
      this.isExporting.set(false);
    }
  }

  private listQuery(): FeeListQuery {
    return {
      month: this.month(),
      status: this.statusFilter(),
      search: this.searchTerm().trim(),
      page: this.page(),
      limit: this.pageSize,
    };
  }

  private replaceFee(updatedFee: FeeRecord): void {
    this.fees.update((fees) =>
      fees.map((fee) => fee.id === updatedFee.id ? updatedFee : fee),
    );
  }
}

const maxTwoDecimalPlacesValidator: ValidatorFn = (control): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;
  return /^\d+(?:\.\d{1,2})?$/.test(String(value)) ? null : { maxDecimalPlaces: true };
};

function currentMonthValue(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isMonthValue(value: string): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

function isHttpStatus(error: unknown, status: number): boolean {
  return !!error && typeof error === 'object' &&
    'status' in error && error.status === status;
}
