import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminFeesService, FeeRecord } from '@app/core/services/admin-fees.service';
import { ToastService } from '@app/core/services/toast.service';
import { AdminFeesComponent } from './admin-fees';

const FEE: FeeRecord = {
  id: 'fee-17',
  studentName: 'Hamza Sheikh',
  className: '9-B',
  amountDue: 7200,
  amountPaid: 0,
  dueDate: '2026-11-30',
  voucherSent: true,
  status: 'Overdue',
};

const PAGE = {
  items: [FEE],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

describe('AdminFeesComponent', () => {
  let fixture: ComponentFixture<AdminFeesComponent>;
  let component: AdminFeesComponent;
  let feesService: {
    getSummary: ReturnType<typeof vi.fn>;
    getFees: ReturnType<typeof vi.fn>;
    submitPayment: ReturnType<typeof vi.fn>;
    getPaymentHistory: ReturnType<typeof vi.fn>;
    generateVouchers: ReturnType<typeof vi.fn>;
  };
  let toastService: { error: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    feesService = {
      getSummary: vi.fn(() => of({
        data: { month: '2026-11', collected: 0, pending: 7200, overdue_count: 1, vouchers_sent: 1 },
      })),
      getFees: vi.fn(() => of({ data: PAGE })),
      submitPayment: vi.fn(() => of({ data: { fee: { ...FEE, amountPaid: 1500, status: 'Partial' } } })),
      getPaymentHistory: vi.fn(() => of({ data: [] })),
      generateVouchers: vi.fn(() => of({ data: null })),
    };
    toastService = { error: vi.fn(), success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AdminFeesComponent],
      providers: [
        { provide: AdminFeesService, useValue: feesService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('submits the selected amount and method, then uses the API status and refreshes data', () => {
    feesService.getFees.mockReturnValue(of({
      data: { ...PAGE, items: [{ ...FEE, amountPaid: 1500, status: 'Partial' }] },
    }));
    component.openPaymentForm(FEE);
    component.paymentForm.controls.amount.setValue(1500);
    component.paymentForm.controls.method.setValue('bank_transfer');

    component.submitPayment();

    expect(feesService.submitPayment).toHaveBeenCalledWith(FEE.id, 1500, 'bank_transfer');
    expect(component.fees[0].status).toBe('Partial');
    expect(feesService.getSummary).toHaveBeenCalledTimes(2);
    expect(toastService.success).toHaveBeenCalled();
  });

  it('rejects payment amounts with more than two decimal places before submitting', () => {
    component.openPaymentForm(FEE);
    component.paymentForm.controls.amount.setValue(10.123);

    component.submitPayment();

    expect(component.paymentForm.controls.amount.hasError('maxDecimalPlaces')).toBe(true);
    expect(feesService.submitPayment).not.toHaveBeenCalled();
  });

  it('renders the payment date in the payment history table', () => {
    feesService.getPaymentHistory.mockReturnValue(of({
      data: [{
        id: 'payment-5',
        amount: 1000,
        method: 'cash',
        paidAt: '2026-11-24T10:30:00.000Z',
        reference: 'R-5',
      }],
    }));

    component.openPaymentHistory(FEE);
    fixture.detectChanges();

    const dateCell = fixture.nativeElement.querySelector('.fees__history-table tbody tr td:nth-child(3)');
    expect(dateCell.textContent.trim()).not.toBe('—');
    expect(dateCell.textContent.trim()).toContain('Nov');
  });

  it('does not report voucher success when WhatsApp delivery returns 503', () => {
    feesService.generateVouchers.mockReturnValue(throwError(() => ({ status: 503 })));

    component.generateVouchers();

    expect(toastService.error).toHaveBeenCalledWith(
      'WhatsApp delivery is not configured yet. Vouchers were not sent.',
    );
    expect(toastService.success).not.toHaveBeenCalled();
    expect(feesService.getFees).toHaveBeenCalledTimes(1);
  });
});
