import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { PlatformAnalytics } from '../models/Platform analytics.model';

const MOCK_ANALYTICS: PlatformAnalytics = {
  revenue_this_month: 18_400_000,
  revenue_trend_percent: 12.7,
  new_schools: 3,
  new_schools_trend: 1,
  churn_risk_schools: 2,
  avg_daily_logins: 3940,
  avg_daily_logins_trend_percent: 4.8,
  revenue_by_month: [
    { label: 'May', value: 11.2 },
    { label: 'Jun', value: 12.4 },
    { label: 'Jul', value: 13.6 },
    { label: 'Aug', value: 15.1 },
    { label: 'Sep', value: 16.8 },
    { label: 'Oct', value: 18.4 },
  ],
  package_distribution: [
    { plan: 'basic', percent: 38 },
    { plan: 'advanced', percent: 42 },
    { plan: 'premium', percent: 20 },
  ],
  fee_collection_percent: 82,
  attendance_marked_percent: 94,
  results_published_percent: 76,
};

@Injectable({ providedIn: 'root' })
export class PlatformAnalyticsService {
  // TODO(backend): swap mock for real call — GET /super-admin/analytics, response: PlatformAnalytics
  getAnalytics(): Observable<ApiResponse<PlatformAnalytics>> {
    return of({
      success: true,
      message: 'Analytics loaded',
      data: structuredClone(MOCK_ANALYTICS),
      meta: { timestamp: new Date().toISOString(), path: API.SUPER_ADMIN.ANALYTICS },
    }).pipe(delay(300));
  }
}