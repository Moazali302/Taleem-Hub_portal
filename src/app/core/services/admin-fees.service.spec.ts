import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { AdminFeesService } from './admin-fees.service';

describe('AdminFeesService', () => {
  it('maps the payment date returned by the payment history API', () => {
    const api = {
      get: vi.fn(() => of({
        data: [{
          id: 'payment-5',
          amount: 1000,
          method: 'cash',
          received_at: '2026-11-24T10:30:00.000Z',
        }],
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
});
