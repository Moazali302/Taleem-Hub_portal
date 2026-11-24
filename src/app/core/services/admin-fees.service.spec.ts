import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { API } from '../constants/api.constants';
import { ApiService } from './api.service';
import {
  AdminFeesService,
  FeePaymentResult,
  InvalidFeeResponseError,
} from './admin-fees.service';

describe('AdminFeesService', () => {
  it('maps the payment date returned by the payment history API', () => {
    const api = {
      get: vi.fn(() => of({
        data: {
          fee: {},
          items: [{
            id: 'payment-5',
            amount: '1000.00',
            method: 'cash',
            received_at: '2026-11-24T10:30:00.000Z',
          }],
        },
      })),
    };
    TestBed.configureTestingModule({
      providers: [
        AdminFeesService,
        { provide: ApiService, useValue: api },
      ],
    });

    let payments: { paidAt: string | null }[] = [];
    TestBed.inject(AdminFeesService).getPaymentHistory('fee-5').subscribe((response) => {
      payments = response.data;
    });

    expect(api.get).toHaveBeenCalled();
    expect(payments[0].paidAt).toBe('2026-11-24T10:30:00.000Z');
  });

  it('sends payment data without tenant identifiers and maps the returned fee status', () => {
    const updatedFee = {
      id: 'fee-5',
      net_payable: '6900.00',
      paid_amount: '1000.00',
      due_date: '2026-11-10',
      voucher_sent: false,
      status: 'Partial',
      student: { id: 'student-5', student_id: 'STU-5', name: 'Student Name', class: null },
    };
    const api = {
      post: vi.fn(() => of({
        data: {
          payment: {
            id: 'payment-5',
            amount: '1000.00',
            method: 'cash',
            received_at: '2026-11-24T10:30:00.000Z',
          },
          fee: updatedFee,
        },
      })),
    };
    TestBed.configureTestingModule({
      providers: [
        AdminFeesService,
        { provide: ApiService, useValue: api },
      ],
    });

    let result: FeePaymentResult | undefined;
    TestBed.inject(AdminFeesService).submitPayment('fee-5', 1000, 'cash').subscribe((response) => {
      result = response.data;
    });

    expect(api.post).toHaveBeenCalledWith(API.FEES.PAYMENTS('fee-5'), {
      amount: 1000,
      method: 'cash',
    });
    expect(JSON.stringify(api.post.mock.calls[0])).not.toContain('school_id');
    expect(result?.fee.status).toBe('Partial');
    expect(result?.payment.paidAt).toBe('2026-11-24T10:30:00.000Z');
  });

  it('rejects a successful payment response missing updated fee or payment data', () => {
    const api = { post: vi.fn(() => of({ data: { message: 'Payment recorded' } })) };
    TestBed.configureTestingModule({
      providers: [
        AdminFeesService,
        { provide: ApiService, useValue: api },
      ],
    });

    let error: unknown;
    TestBed.inject(AdminFeesService).submitPayment('fee-5', 1000, 'cash').subscribe({
      error: (requestError: unknown) => { error = requestError; },
    });

    expect(error).toBeInstanceOf(InvalidFeeResponseError);
  });
});
