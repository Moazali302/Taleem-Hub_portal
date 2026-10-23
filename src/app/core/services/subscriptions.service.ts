import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  AssignPackagePayload,
  PLAN_PRICING_PKR,
  SubscriptionListItem,
} from '../models/subscription.model';

const MOCK_SUBSCRIPTIONS: SubscriptionListItem[] = [
  { id: 1, school_id: 1, school_name: 'Punjab High School', plan: 'premium', billing_cycle: 'annual', amount: 240000, expires_at: '2026-12-01', status: 'active' },
  { id: 2, school_id: 2, school_name: 'Hafiz School System', plan: 'advanced', billing_cycle: 'annual', amount: 150000, expires_at: '2026-10-28', status: 'expiring' },
  { id: 3, school_id: 3, school_name: 'AGE High School', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2026-10-22', status: 'urgent' },
  { id: 4, school_id: 4, school_name: 'Pakistan School System', plan: 'premium', billing_cycle: 'annual', amount: 240000, expires_at: '2027-03-14', status: 'active' },
  { id: 5, school_id: 5, school_name: 'Test School', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2026-11-02', status: 'expiring' },
  { id: 6, school_id: 6, school_name: 'Kips Academy', plan: 'advanced', billing_cycle: 'annual', amount: 150000, expires_at: '2026-11-07', status: 'expiring' },
  { id: 7, school_id: 7, school_name: 'City School', plan: 'premium', billing_cycle: 'annual', amount: 240000, expires_at: '2027-01-20', status: 'active' },
  { id: 8, school_id: 8, school_name: 'Beaconhouse Gulberg', plan: 'advanced', billing_cycle: 'annual', amount: 150000, expires_at: '2027-02-11', status: 'active' },
  { id: 9, school_id: 9, school_name: 'Oakridge School', plan: 'advanced', billing_cycle: 'monthly', amount: 15000, expires_at: '2026-11-18', status: 'active' },
  { id: 10, school_id: 10, school_name: 'Al-Noor Grammar School', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2026-10-25', status: 'urgent' },
  { id: 11, school_id: 11, school_name: 'Roots Millennium', plan: 'premium', billing_cycle: 'annual', amount: 240000, expires_at: '2027-04-02', status: 'active' },
  { id: 12, school_id: 12, school_name: 'Allied School Model Town', plan: 'advanced', billing_cycle: 'annual', amount: 150000, expires_at: '2027-01-05', status: 'active' },
  { id: 13, school_id: 13, school_name: 'Lahore Grammar School', plan: 'advanced', billing_cycle: 'annual', amount: 150000, expires_at: '2026-12-19', status: 'active' },
  { id: 14, school_id: 14, school_name: 'Fauji Foundation School', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2026-11-12', status: 'expiring' },
  { id: 15, school_id: 15, school_name: 'Bloomfield Hall', plan: 'advanced', billing_cycle: 'annual', amount: 150000, expires_at: '2027-02-28', status: 'active' },
  { id: 16, school_id: 16, school_name: 'Crescent Model School', plan: 'premium', billing_cycle: 'annual', amount: 240000, expires_at: '2027-05-10', status: 'active' },
  { id: 17, school_id: 17, school_name: 'Dar-e-Arqam Schools', plan: 'advanced', billing_cycle: 'monthly', amount: 15000, expires_at: '2026-11-24', status: 'active' },
  { id: 18, school_id: 18, school_name: 'Headstart School', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2026-12-08', status: 'active' },
  { id: 19, school_id: 19, school_name: 'Iqra Public School', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2026-12-10', status: 'active' },
  { id: 20, school_id: 20, school_name: 'Salamat Academy', plan: 'advanced', billing_cycle: 'annual', amount: 150000, expires_at: '2027-03-01', status: 'active' },
  { id: 21, school_id: 21, school_name: 'Knowledge Hub School', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2026-12-22', status: 'active' },
  { id: 22, school_id: 22, school_name: 'Riverside Elementary', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2027-01-09', status: 'active' },
  { id: 23, school_id: 23, school_name: 'Summit Preparatory', plan: 'advanced', billing_cycle: 'monthly', amount: 15000, expires_at: '2026-12-30', status: 'active' },
  { id: 24, school_id: 24, school_name: 'Harmony Montessori', plan: 'basic', billing_cycle: 'monthly', amount: 8000, expires_at: '2027-01-15', status: 'active' },
];

const MOCK_LATENCY_MS = 300;

function toResponse<T>(data: T, message: string, path: string): ApiResponse<T> {
  return { success: true, message, data, meta: { timestamp: new Date().toISOString(), path } };
}

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  // Kept in memory so "Assign package" is reflected on the next list load while mocked.
  private subscriptions: SubscriptionListItem[] = MOCK_SUBSCRIPTIONS.map((row) => ({ ...row }));

  // TODO(backend): swap mock for real call — GET /super-admin/subscriptions, response: SubscriptionListItem[]
  getSubscriptions(): Observable<ApiResponse<SubscriptionListItem[]>> {
    return of(
      toResponse(
        this.subscriptions.map((row) => ({ ...row })),
        'Subscriptions loaded',
        API.SUPER_ADMIN.SUBSCRIPTIONS,
      ),
    ).pipe(delay(MOCK_LATENCY_MS));
  }

  // TODO(backend): swap mock for real call — PATCH /super-admin/schools/:id/package, body: AssignPackagePayload
  assignPackage(payload: AssignPackagePayload): Observable<ApiResponse<SubscriptionListItem>> {
    return of(null).pipe(
      delay(MOCK_LATENCY_MS),
      map(() => {
        const row = this.subscriptions.find((item) => item.school_id === payload.school_id);
        if (!row) {
          throw new Error('School not found');
        }
        row.plan = payload.plan;
        row.billing_cycle = payload.billing_cycle;
        row.amount = PLAN_PRICING_PKR[payload.plan][payload.billing_cycle];
        return toResponse({ ...row }, 'Package assigned', API.SUPER_ADMIN.ASSIGN_PACKAGE(String(row.school_id)));
      }),
    );
  }
}
