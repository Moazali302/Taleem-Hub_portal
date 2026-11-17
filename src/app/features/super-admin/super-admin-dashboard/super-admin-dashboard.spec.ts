import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SuperAdminDashboard } from '@app/core/models/super-admin-dashboard.model';
import { SuperAdminDashboardService } from '@app/core/services/super-admin-dashboard.service';
import { SuperAdminDashboardComponent } from './super-admin-dashboard';

const DASHBOARD: SuperAdminDashboard = {
  summary: {
    totalSchools: { total: 14, previousPeriodTotal: 10, percentageChange: 40 },
    activeStudents: { total: 120, previousPeriodTotal: null, percentageChange: null },
    totalTeachers: { total: 18, previousPeriodTotal: null, percentageChange: null },
    expiringSubscriptions: { total: 3, urgent: 1, expiringWithinDays: 30, urgentWithinDays: 7 },
    openComplaints: { total: 5, critical: 2 },
  },
  revenueAnalytics: {
    available: false,
    currentMonthRevenue: null,
    currency: 'PKR',
    trend: [],
    reason: 'No payment ledger.',
  },
  feeCollection: {
    available: true,
    rate: null,
    collected: 100,
    expected: 0,
    currency: 'PKR',
    period: { from: '2026-10-01', toExclusive: '2026-11-01' },
    definition: 'Fee records due this month.',
  },
  recentActivity: [{
    id: 'activity-1',
    type: 'PLATFORM_ACTIVITY',
    message: 'A platform record was updated',
    createdAt: '2026-10-31T12:00:00.000Z',
    metadata: { privateValue: 'must not render' },
  }],
  expiringSubscriptions: [
    { schoolId: 2, schoolName: 'Later School', plan: 'basic', planName: 'Basic', expiresAt: '2026-11-10T00:00:00.000Z', daysRemaining: 10, isUrgent: false },
    { schoolId: 1, schoolName: 'Soon School', plan: 'premium', planName: 'Premium', expiresAt: '2026-11-02T00:00:00.000Z', daysRemaining: 2, isUrgent: true },
  ],
  definitions: { revenue: 'No payment ledger.' },
};

describe('SuperAdminDashboardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SuperAdminDashboardComponent],
      providers: [provideRouter([]), {
        provide: SuperAdminDashboardService,
        useValue: { getDashboard: () => of({ data: DASHBOARD }) },
      }],
    });
  });

  it('renders real summary data without treating null comparisons as zero', () => {
    const fixture = TestBed.createComponent(SuperAdminDashboardComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('14');
    expect(text).toContain('120');
    expect(text).toContain('Comparison unavailable');
    expect(text).toContain('Not available');
    expect(text).not.toContain('NaN');
  });

  it('orders subscriptions by nearest expiry', () => {
    const component = TestBed.createComponent(SuperAdminDashboardComponent).componentInstance;
    component.dashboard = DASHBOARD;

    expect(component.expiringSubscriptions.map((item) => item.schoolName))
      .toEqual(['Soon School', 'Later School']);
  });

  it('does not expose activity metadata in the rendered activity list', () => {
    const fixture = TestBed.createComponent(SuperAdminDashboardComponent);
    fixture.detectChanges();

    const activityList = fixture.nativeElement.querySelector('.dashboard-list') as HTMLElement;
    expect(activityList.textContent).toContain('A platform record was updated');
    expect(activityList.textContent).not.toContain('must not render');
  });
});
