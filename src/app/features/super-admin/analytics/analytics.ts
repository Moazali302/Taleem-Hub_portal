import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AnalyticsDashboardRange, SuperAdminAnalyticsDashboard } from '@app/core/models/super-admin-analytics.model';
import { SummaryCardData } from '@app/core/models/summary-card.model';
import { PlatformAnalyticsService } from '@app/core/services/PlatformAnalyticsService';
import { CardComponent } from '@app/shared/components/Card/card';
import { PageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { SummaryCardComponent } from '@app/shared/components/summary-card/summary-card';
import { downloadCsv } from '@app/shared/utlis/csv-export.util';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

interface NewSchoolBar {
  label: string;
  count: number;
  height: number;
  showLabel: boolean;
}

interface AnalyticsShareRow {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [PageHeaderComponent, SummaryCardComponent, CardComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  readonly ranges: { value: AnalyticsDashboardRange; label: string }[] = [
    { value: '7D', label: '7D' },
    { value: '30D', label: '30D' },
    { value: '90D', label: '90D' },
    { value: '12M', label: '12M' },
  ];

  range: AnalyticsDashboardRange = '30D';
  dashboard: SuperAdminAnalyticsDashboard | null = null;
  isLoading = false;
  isRefreshing = false;
  hasError = false;
  errorMessage = '';
  lastUpdated: Date | null = null;

  private readonly destroy$ = new Subject<void>();
  private request?: Subscription;

  constructor(
    private readonly analyticsService: PlatformAnalyticsService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.request?.unsubscribe();
  }

  get summaryCards(): SummaryCardData[] {
    if (!this.dashboard) return [];

    const data = this.dashboard.summary;
    const collectionChange = data.feeCollection.percentageChange;
    const rateChange = data.feeCollection.collectionRate.percentagePointChange;

    return [
      {
        label: 'Active Schools',
        value: this.formatNumber(data.activeSchools.current),
        caption: 'Currently approved',
      },
      {
        label: 'Total Students',
        value: this.formatNumber(data.totalStudents.current),
        caption: 'Active student records',
      },
      {
        label: 'Fee Collection',
        value: this.formatCurrency(data.feeCollection.current, data.feeCollection.currency),
        caption: collectionChange === null
          ? 'No comparable collection data'
          : `${this.formatSigned(collectionChange)} vs previous period`,
        captionTone: collectionChange === null ? 'neutral' : collectionChange >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Collection Rate',
        value: this.formatPercentage(data.feeCollection.collectionRate.currentPercentage),
        caption: rateChange === null
          ? 'Rate comparison unavailable'
          : `${this.formatSigned(rateChange, ' pp')} vs previous period`,
        captionTone: rateChange === null ? 'neutral' : rateChange >= 0 ? 'positive' : 'negative',
      },
    ];
  }

  get newSchoolBars(): NewSchoolBar[] {
    const points = this.dashboard?.newSchools ?? [];
    const maximum = Math.max(0, ...points.map((point) => point.count));
    const labelInterval = Math.max(1, Math.ceil(points.length / 8));

    return points.map((point, index) => ({
      label: point.label,
      count: point.count,
      height: maximum === 0 ? 0 : (point.count / maximum) * 100,
      showLabel: points.length <= 10 || index === 0 || index === points.length - 1 || index % labelInterval === 0,
    }));
  }

  get maxNewSchools(): number {
    return Math.max(0, ...(this.dashboard?.newSchools ?? []).map((point) => point.count));
  }

  get subscriptionHealth(): AnalyticsShareRow[] {
    const health = this.dashboard?.subscriptionHealth;
    if (!health) return [];
    return [
      { label: 'Active', ...health.active, color: 'green' },
      { label: 'Expiring soon', ...health.expiringSoon, color: 'gold' },
      { label: 'Expired', ...health.expired, color: 'red' },
    ];
  }

  get demoStages(): AnalyticsShareRow[] {
    const funnel = this.dashboard?.demoFunnel;
    if (!funnel) return [];
    return [
      { label: 'Demo requests', ...funnel.demoRequests, color: 'navy' },
      { label: 'Contacted', ...funnel.contacted, color: 'blue' },
      { label: 'Converted', ...funnel.converted, color: 'green' },
    ];
  }

  load(): void {
    this.request?.unsubscribe();
    this.isLoading = !this.dashboard;
    this.isRefreshing = !!this.dashboard;
    this.hasError = false;
    this.errorMessage = '';

    this.request = this.analyticsService.getAnalytics(this.range)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dashboard = response.data;
          this.isLoading = false;
          this.isRefreshing = false;
          this.lastUpdated = new Date();
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.isLoading = false;
          this.isRefreshing = false;
          this.hasError = true;
          this.errorMessage = getHttpErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  selectRange(range: AnalyticsDashboardRange): void {
    if (range === this.range) return;
    this.range = range;
    this.dashboard = null;
    this.load();
  }

  formatNumber(value: number | null): string {
    if (value === null || !Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(value);
  }

  formatCurrency(value: number | null, currency = 'PKR'): string {
    if (value === null || !Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatPercentage(value: number | null): string {
    if (value === null || !Number.isFinite(value)) return '—';
    return `${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(value)}%`;
  }

  formatSigned(value: number, suffix = '%'): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(value)}${suffix}`;
  }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
  }

  formatPeriodEnd(exclusiveEnd: string): string {
    const date = new Date(exclusiveEnd);
    if (Number.isNaN(date.getTime())) return '—';
    date.setUTCDate(date.getUTCDate() - 1);
    return this.formatDate(date.toISOString());
  }

  formatTime(value: Date): string {
    return new Intl.DateTimeFormat('en-PK', { hour: 'numeric', minute: '2-digit' }).format(value);
  }

  exportReport(): void {
    if (!this.dashboard) return;
    const data = this.dashboard;
    const rows: { metric: string; value: string | number }[] = [
      { metric: 'Date range', value: data.range },
      { metric: 'Active schools', value: data.summary.activeSchools.current },
      { metric: 'Total students', value: data.summary.totalStudents.current },
      { metric: 'Fee collection (PKR)', value: data.summary.feeCollection.current },
      {
        metric: 'Fee collection change (%)',
        value: data.summary.feeCollection.percentageChange ?? 'Unavailable',
      },
      {
        metric: 'Collection rate (%)',
        value: data.summary.feeCollection.collectionRate.currentPercentage ?? 'Unavailable',
      },
      ...data.newSchools.map((point) => ({ metric: `New schools · ${point.label}`, value: point.count })),
      { metric: 'Subscriptions · Active', value: data.subscriptionHealth.active.count },
      { metric: 'Subscriptions · Expiring soon', value: data.subscriptionHealth.expiringSoon.count },
      { metric: 'Subscriptions · Expired', value: data.subscriptionHealth.expired.count },
      { metric: 'Demo requests', value: data.demoFunnel.demoRequests.count },
      { metric: 'Contacted', value: data.demoFunnel.contacted.count },
      { metric: 'Converted', value: data.demoFunnel.converted.count },
      ...data.schoolsByCity.map((city) => ({ metric: `Schools · ${city.city}`, value: city.count })),
    ];

    downloadCsv('super-admin-analytics.csv', [
      { header: 'Metric', value: (row) => row.metric },
      { header: 'Value', value: (row) => row.value },
    ], rows);
  }
}
