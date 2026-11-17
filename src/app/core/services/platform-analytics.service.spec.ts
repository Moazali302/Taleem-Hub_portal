import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SuperAdminAnalyticsDashboard } from '../models/super-admin-analytics.model';
import { PlatformAnalyticsService } from './PlatformAnalyticsService';

describe('PlatformAnalyticsService', () => {
  let service: PlatformAnalyticsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PlatformAnalyticsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the dashboard with the default 30-day range and unwraps the API response', () => {
    let result: SuperAdminAnalyticsDashboard | undefined;
    service.getAnalytics().subscribe((response) => (result = response.data));

    const request = http.expectOne((req) => req.url.endsWith('/super-admin/analytics/dashboard'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('range')).toBe('30D');

    const dashboard = { range: '30D' } as SuperAdminAnalyticsDashboard;
    request.flush({ success: true, message: 'Analytics loaded', data: dashboard });
    expect(result).toEqual(dashboard);
  });

  it('sends the selected dashboard range to the backend', () => {
    service.getAnalytics('12M').subscribe();

    const request = http.expectOne((req) => req.url.endsWith('/super-admin/analytics/dashboard'));
    expect(request.request.params.get('range')).toBe('12M');
    request.flush({ success: true, message: 'Analytics loaded', data: {} });
  });
});
