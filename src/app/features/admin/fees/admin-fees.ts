import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
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
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-fees.html',
  styleUrl: './admin-fees.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFeesComponent implements OnInit, OnDestroy {
  fees: FeeRecord[] = [];
  summary: FeeSummary | null = null;
  searchTerm = '';
  statusFilter: FeeStatus | '' = '';
  month = currentMonthValue();
  page = 1;
  readonly pageSize = 20;
  total = 0;
  totalPages = 0;
  isLoading = false;
  isSummaryLoading = false;
  isExporting = false;
  isGeneratingVouchers = false;
  hasError = false;
  errorMessage = '';
  summaryError = '';
  voucherError = '';
  activeDialog: 'payment' | 'history' | null = null;
  selectedFee: FeeRecord | null = null;
  isSubmittingPayment = false;
  paymentError = '';
  payments: FeePayment[] = [];
  isLoadingHistory = false;
  historyError = '';

  private readonly fb = new FormBuilder();
  readonly paymentForm = this.fb.group({
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      maxTwoDecimalPlacesValidator,
    ]),
    method: this.fb.nonNullable.control<FeePaymentMethod>('cash', [Validators.required]),
  });

  private readonly searchChanges = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private listRequest?: Subscription;
  private summaryRequest?: Subscription;
  private paymentRequest?: Subscription;
  private historyRequest?: Subscription;
  private voucherRequest?: Subscription;

  constructor(
    private readonly feesService: AdminFeesService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.searchChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        this.loadFees();
      });
    this.loadMonthData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.listRequest?.unsubscribe();
    this.summaryRequest?.unsubscribe();
    this.paymentRequest?.unsubscribe();
    this.historyRequest?.unsubscribe();
    this.voucherRequest?.unsubscribe();
  }

  get monthLabel(): string {
    const date = new Date(`${this.month}-01T00:00:00`);
    return Number.isNaN(date.getTime())
      ? this.month
      : new Intl.DateTimeFormat('en-PK', { month: 'long', year: 'numeric' }).format(date);
  }

  get visiblePages(): number[] {
    const count = Math.min(5, this.totalPages);
    const start = Math.max(1, Math.min(this.page - 2, this.totalPages - count + 1));
    return Array.from({ length: count }, (_, index) => start + index);
  }

  get firstResult(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get lastResult(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  loadMonthData(): void {
    this.loadSummary();
    this.loadFees();
  }

  loadSummary(): void {
    this.summaryRequest?.unsubscribe();
    this.isSummaryLoading = true;
    this.summaryError = '';
    this.summaryRequest = this.feesService.getSummary(this.month).subscribe({
      next: (response) => {
        this.summary = response.data;
        this.isSummaryLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.summary = null;
        this.isSummaryLoading = false;
        this.summaryError = getHttpErrorMessage(error);
        this.toaster.error(`Unable to load fee summary: ${this.summaryError}`);
        this.cdr.markForCheck();
      },
    });
  }

  loadFees(): void {
    this.listRequest?.unsubscribe();
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.listRequest = this.feesService.getFees(this.listQuery()).subscribe({
      next: (response) => {
        this.fees = response.data.items;
        this.page = response.data.page;
        this.total = response.data.total;
        this.totalPages = response.data.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.fees = [];
        this.total = 0;
        this.totalPages = 0;
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = getHttpErrorMessage(error);
        this.toaster.error(this.errorMessage);
        this.cdr.markForCheck();
      },
    });
  }

  onMonthChange(month: string): void {
    if (!/^\d{4}-\d{2}$/.test(month) || month === this.month) return;
    this.month = month;
    this.page = 1;
    this.voucherError = '';
    this.loadMonthData();
  }

  onSearchChange(search: string): void {
    this.searchTerm = search;
    this.searchChanges.next(search.trim());
  }

  onStatusChange(status: FeeStatus | ''): void {
    this.statusFilter = status;
    this.page = 1;
    this.loadFees();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page || this.isLoading) return;
    this.page = page;
    this.loadFees();
  }

  openPaymentForm(fee: FeeRecord): void {
    this.historyRequest?.unsubscribe();
    this.activeDialog = 'payment';
    this.selectedFee = fee;
    this.paymentError = '';
    this.paymentForm.reset({
      amount: Math.max(fee.amountDue - fee.amountPaid, 0),
      method: 'cash',
    });
    this.cdr.markForCheck();
  }

  submitPayment(): void {
    if (this.isSubmittingPayment || !this.selectedFee) return;
    this.paymentError = '';
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const { amount, method } = this.paymentForm.getRawValue();
    if (amount === null || amount <= 0) return;

    this.isSubmittingPayment = true;
    this.paymentRequest?.unsubscribe();
    this.paymentRequest = this.feesService
      .submitPayment(this.selectedFee.id, amount, method)
      .subscribe({
        next: (response) => {
          if (response.data.fee) this.replaceFee(response.data.fee);
          this.isSubmittingPayment = false;
          this.activeDialog = null;
          this.selectedFee = null;
          this.toaster.success('Payment recorded successfully.');
          this.loadMonthData();
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.isSubmittingPayment = false;
          this.paymentError = getHttpErrorMessage(error);
          this.toaster.error(this.paymentError);
          this.cdr.markForCheck();
        },
      });
  }

  openPaymentHistory(fee: FeeRecord): void {
    this.activeDialog = 'history';
    this.selectedFee = fee;
    this.payments = [];
    this.historyError = '';
    this.isLoadingHistory = true;
    this.historyRequest?.unsubscribe();
    this.historyRequest = this.feesService.getPaymentHistory(fee.id).subscribe({
      next: (response) => {
        this.payments = response.data;
        this.isLoadingHistory = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.isLoadingHistory = false;
        this.historyError = getHttpErrorMessage(error);
        this.toaster.error(this.historyError);
        this.cdr.markForCheck();
      },
    });
  }

  closeDialog(): void {
    if (this.isSubmittingPayment) return;
    this.historyRequest?.unsubscribe();
    this.activeDialog = null;
    this.selectedFee = null;
    this.paymentError = '';
    this.historyError = '';
  }

  generateVouchers(): void {
    if (this.isGeneratingVouchers) return;
    this.isGeneratingVouchers = true;
    this.voucherError = '';
    this.voucherRequest?.unsubscribe();
    this.voucherRequest = this.feesService.generateVouchers(this.month).subscribe({
      next: () => {
        this.isGeneratingVouchers = false;
        this.toaster.success(`Voucher generation completed for ${this.monthLabel}.`);
        this.loadMonthData();
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.isGeneratingVouchers = false;
        this.voucherError = isHttpStatus(error, 503)
          ? 'WhatsApp delivery is not configured yet. Vouchers were not sent.'
          : getHttpErrorMessage(error);
        this.toaster.error(this.voucherError);
        this.cdr.markForCheck();
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
    if (this.isExporting || this.fees.length === 0) return;
    this.isExporting = true;
    try {
      downloadCsv('fees.csv', [
        { header: 'Student', value: (fee) => fee.studentName },
        { header: 'Class', value: (fee) => fee.className },
        { header: 'Net Payable', value: (fee) => fee.amountDue },
        { header: 'Paid', value: (fee) => fee.amountPaid },
        { header: 'Status', value: (fee) => fee.status },
        { header: 'Due Date', value: (fee) => fee.dueDate ?? '' },
        { header: 'Voucher Sent', value: (fee) => fee.voucherSent === true ? 'Yes' : 'No' },
      ], this.fees);
      this.toaster.success(`${this.fees.length} fee record${this.fees.length === 1 ? '' : 's'} exported.`);
    } finally {
      this.isExporting = false;
      this.cdr.markForCheck();
    }
  }

  private listQuery(): FeeListQuery {
    return {
      month: this.month,
      status: this.statusFilter,
      search: this.searchTerm.trim(),
      page: this.page,
      limit: this.pageSize,
    };
  }

  private replaceFee(updatedFee: FeeRecord): void {
    this.fees = this.fees.map((fee) => fee.id === updatedFee.id ? updatedFee : fee);
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

function isHttpStatus(error: unknown, status: number): boolean {
  return !!error && typeof error === 'object' &&
    'status' in error && error.status === status;
}
