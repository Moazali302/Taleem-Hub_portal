import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { SuperAdminDashboard } from '@app/core/models/super-admin-dashboard.model';
import { SummaryCardData } from '@app/core/models/summary-card.model';
import { SuperAdminDashboardService } from '@app/core/services/super-admin-dashboard.service';
import { CardComponent } from '@app/shared/components/Card/card';
import { PageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { SummaryCardComponent } from '@app/shared/components/summary-card/summary-card';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SummaryCardComponent,
    PageHeaderComponent,
    CardComponent,
  ],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  dashboard: SuperAdminDashboard | null = null;
  isLoading = false;
  isRefreshing = false;
  hasError = false;
  errorMessage = '';
  lastUpdated: Date | null = null;

  private readonly destroy$ = new Subject<void>();
  private request?: Subscription;

  constructor(
    private readonly dashboardService: SuperAdminDashboardService,
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
    const summary = this.dashboard?.summary;
    if (!summary) return [];

    const schoolChange = summary.totalSchools.percentageChange;
    return [
      {
        label: 'Total Schools',
        value: this.formatNumber(summary.totalSchools.total),
        caption: schoolChange === null
          ? 'Comparison unavailable'
          : `${this.formatSigned(schoolChange)} vs previous period`,
        captionTone: schoolChange === null ? 'neutral' : schoolChange >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Active Students',
        value: this.formatNumber(summary.activeStudents.total),
        caption: this.comparisonCaption(summary.activeStudents),
        captionTone: this.comparisonTone(summary.activeStudents.percentageChange),
      },
      {
        label: 'Total Teachers',
        value: this.formatNumber(summary.totalTeachers.total),
        caption: this.comparisonCaption(summary.totalTeachers),
        captionTone: this.comparisonTone(summary.totalTeachers.percentageChange),
      },
      {
        label: 'Expiring Subscriptions',
        value: this.formatNumber(summary.expiringSubscriptions.total),
        caption: `${this.formatNumber(summary.expiringSubscriptions.urgent)} urgent · within ${summary.expiringSubscriptions.urgentWithinDays} days`,
        accent: summary.expiringSubscriptions.urgent > 0 ? 'warning' : undefined,
      },
      {
        label: 'Open Complaints',
        value: this.formatNumber(summary.openComplaints.total),
        caption: `${this.formatNumber(summary.openComplaints.critical)} critical`,
        accent: summary.openComplaints.critical > 0 ? 'danger' : undefined,
      },
    ];
  }

  get expiringSubscriptions(): SuperAdminDashboard['expiringSubscriptions'] {
    return [...(this.dashboard?.expiringSubscriptions ?? [])].sort((a, b) => {
      const byDaysRemaining = a.daysRemaining - b.daysRemaining;
      return byDaysRemaining || a.schoolId - b.schoolId;
    });
  }

  load(): void {
    this.request?.unsubscribe();
    this.isLoading = !this.dashboard;
    this.isRefreshing = !!this.dashboard;
    this.hasError = false;
    this.errorMessage = '';

    this.request = this.dashboardService.getDashboard()
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

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(value);
  }

  formatCurrency(value: number | null, currency: string): string {
    if (value === null || !Number.isFinite(value)) return 'Not available';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatPercentage(value: number | null): string {
    if (value === null || !Number.isFinite(value)) return 'Not available';
    return `${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(value)}%`;
  }

  formatSigned(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(value)}%`;
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  formatPeriod(from: string, toExclusive: string): string {
    const start = new Date(from);
    const end = new Date(toExclusive);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Current month';
    end.setUTCDate(end.getUTCDate() - 1);
    const formatter = new Intl.DateTimeFormat('en-PK', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    });
    return `${formatter.format(start)} – ${formatter.format(end)}`;
  }

  trendHeight(
    amount: number,
    trend: SuperAdminDashboard['revenueAnalytics']['trend'],
  ): number {
    const maximum = Math.max(0, ...trend.map((point) => point.amount));
    return maximum === 0 ? 0 : Math.max(4, (amount / maximum) * 100);
  }

  private comparisonCaption(metric: { percentageChange?: number | null }): string {
    if (metric.percentageChange === null || metric.percentageChange === undefined) {
      return 'Comparison unavailable';
    }
    return `${this.formatSigned(metric.percentageChange)} vs previous period`;
  }

  private comparisonTone(value: number | null | undefined): SummaryCardData['captionTone'] {
    if (value === null || value === undefined) return 'neutral';
    return value >= 0 ? 'positive' : 'negative';
  }
}
