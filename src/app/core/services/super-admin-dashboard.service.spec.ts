import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SuperAdminDashboard } from '../models/super-admin-dashboard.model';
import { SuperAdminDashboardService } from './super-admin-dashboard.service';

describe('SuperAdminDashboardService', () => {
  let service: SuperAdminDashboardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SuperAdminDashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the dashboard with default list limits and returns wrapped data', () => {
    let result: SuperAdminDashboard | undefined;
    service.getDashboard().subscribe((response) => (result = response.data));

    const request = http.expectOne((req) => req.url.endsWith('/super-admin/dashboard'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('activityLimit')).toBe('10');
    expect(request.request.params.get('expiringLimit')).toBe('10');

    const dashboard: SuperAdminDashboard = {
      summary: {
        totalSchools: { total: 0, previousPeriodTotal: 0, percentageChange: null },
        activeStudents: { total: 0 },
        totalTeachers: { total: 0 },
        expiringSubscriptions: { total: 0, urgent: 0, expiringWithinDays: 30, urgentWithinDays: 7 },
        openComplaints: { total: 0, critical: 0 },
      },
      revenueAnalytics: { available: false, currentMonthRevenue: null, currency: 'PKR', trend: [], reason: null },
      feeCollection: {
        available: true,
        rate: null,
        collected: 0,
        expected: 0,
        currency: 'PKR',
        period: { from: '', toExclusive: '' },
        definition: '',
      },
      recentActivity: [],
      expiringSubscriptions: [],
      definitions: {},
    };
    request.flush({ success: true, message: 'Dashboard loaded', data: dashboard });
    expect(result).toEqual(dashboard);
  });

  it('allows supported custom activity and expiry limits', () => {
    service.getDashboard({ activityLimit: 25, expiringLimit: 50 }).subscribe();

    const request = http.expectOne((req) => req.url.endsWith('/super-admin/dashboard'));
    expect(request.request.params.get('activityLimit')).toBe('25');
    expect(request.request.params.get('expiringLimit')).toBe('50');
    request.flush({ success: true, message: 'Dashboard loaded', data: {} });
  });
});
