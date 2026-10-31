import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AnalyticsPoint } from '@app/core/models/analytics.model';
import { PlatformAnalytics } from '@app/core/models/Platform analytics.model';
import { SUBSCRIPTION_PLAN_OPTIONS, SubscriptionPlan } from '@app/core/models/subscription.model';
import { SummaryCardData } from '@app/core/models/summary-card.model';
import { PlatformAnalyticsService } from '@app/core/services/PlatformAnalyticsService';
import { BarChartComponent } from '@app/shared/components/BarChart/bar-chart';
import { CardComponent } from '@app/shared/components/Card/card';
import { DonutChartComponent } from '@app/shared/components/DonutChart/donut-chart';
import { PageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { ProgressBarComponent } from '@app/shared/components/progressBar/progress-bar';
import { SummaryCardComponent } from '@app/shared/components/summary-card/summary-card';
import { downloadCsv } from '@app/shared/utlis/csv-export.util';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

interface PackageBar {
  label: string;
  percent: number;
  color: 'navy' | 'gold' | 'green';
}

interface HealthMetric {
  title: string;
  caption: string;
  percent: number;
}

const PACKAGE_COLORS: Record<SubscriptionPlan, PackageBar['color']> = {
  basic: 'navy',
  advanced: 'gold',
  premium: 'green',
};

const PLAN_LABELS = Object.fromEntries(
  SUBSCRIPTION_PLAN_OPTIONS.map((option) => [option.value, option.label]),
) as Record<SubscriptionPlan, string>;

const formatPkrMillions = (amount: number): string => `PKR ${(amount / 1_000_000).toFixed(1)}M`;
const formatSigned = (value: number, suffix = ''): string => `${value >= 0 ? '+' : ''}${value}${suffix}`;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    PageHeaderComponent,
    SummaryCardComponent,
    CardComponent,
    BarChartComponent,
    DonutChartComponent,
    ProgressBarComponent,
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit {
  analytics: PlatformAnalytics | null = null;
  summaryCards: SummaryCardData[] = [];
  packageBars: PackageBar[] = [];
  healthMetrics: HealthMetric[] = [];

  isLoading = false;
  hasError = false;
  errorMessage = '';

  readonly formatRevenueMonth = (value: number): string => `PKR ${value}M`;

  constructor(
    private readonly analyticsService: PlatformAnalyticsService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get revenueByMonth(): AnalyticsPoint[] {
    return this.analytics?.revenue_by_month ?? [];
  }

  load(): void {
    this.isLoading = true;
    this.hasError = false;

    this.analyticsService.getAnalytics().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.analytics = res.data;
        this.summaryCards = this.buildSummaryCards(res.data);
        this.packageBars = this.buildPackageBars(res.data);
        this.healthMetrics = this.buildHealthMetrics(res.data);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = getHttpErrorMessage(err);
        this.cdr.markForCheck();
      },
    });
  }

  exportReport(): void {
    const data = this.analytics;
    if (!data) return;

    const rows: { metric: string; value: string | number }[] = [
      { metric: 'Revenue this month (PKR)', value: data.revenue_this_month },
      { metric: 'New schools', value: data.new_schools },
      { metric: 'Churn-risk schools', value: data.churn_risk_schools },
      { metric: 'Avg. daily logins', value: data.avg_daily_logins },
      ...data.revenue_by_month.map((point) => ({ metric: `Revenue ${point.label} (PKR M)`, value: point.value })),
      ...data.package_distribution.map((share) => ({ metric: `${PLAN_LABELS[share.plan]} schools (%)`, value: share.percent })),
      { metric: 'Fee collection (%)', value: data.fee_collection_percent },
      { metric: 'Attendance marked (%)', value: data.attendance_marked_percent },
      { metric: 'Results published (%)', value: data.results_published_percent },
    ];

    downloadCsv('platform-analytics.csv', [
      { header: 'Metric', value: (row) => row.metric },
      { header: 'Value', value: (row) => row.value },
    ], rows);
  }

  private buildSummaryCards(data: PlatformAnalytics): SummaryCardData[] {
    return [
      {
        label: 'This Month Revenue',
        value: formatPkrMillions(data.revenue_this_month),
        caption: formatSigned(data.revenue_trend_percent, '%'),
        captionTone: data.revenue_trend_percent >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'New Schools',
        value: data.new_schools,
        caption: formatSigned(data.new_schools_trend),
        captionTone: data.new_schools_trend >= 0 ? 'positive' : 'negative',
      },
      { label: 'Churn-risk Schools', value: data.churn_risk_schools, caption: 'attention', accent: 'warning' },
      {
        label: 'Avg. Daily Logins',
        value: data.avg_daily_logins.toLocaleString('en-US'),
        caption: formatSigned(data.avg_daily_logins_trend_percent, '%'),
        captionTone: data.avg_daily_logins_trend_percent >= 0 ? 'positive' : 'negative',
      },
    ];
  }

  private buildPackageBars(data: PlatformAnalytics): PackageBar[] {
    return data.package_distribution.map((share) => ({
      label: PLAN_LABELS[share.plan],
      percent: share.percent,
      color: PACKAGE_COLORS[share.plan],
    }));
  }

  private buildHealthMetrics(data: PlatformAnalytics): HealthMetric[] {
    return [
      { title: 'Fee Collection', caption: 'This month', percent: data.fee_collection_percent },
      { title: 'Attendance Marked', caption: 'Platform-wide', percent: data.attendance_marked_percent },
      { title: 'Results Published', caption: 'This term', percent: data.results_published_percent },
    ];
  }
}