import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivityItem } from '@app/core/models/activity.model';
import { AnalyticsPoint } from '@app/core/models/analytics.model';
import {
  DashboardStat,
  ExpiringSubscriptionItem,
  FeeCollectionSummary,
} from '@app/core/models/dashboard.model';
import { TimeAgoPipe } from '@app/pipe/time-ago.pipe';

interface ChartPoint {
  x: number;
  y: number;
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const CHART_PADDING_Y = 16;
const DONUT_RADIUS = 52;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TimeAgoPipe],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminDashboardComponent {
  // TODO(backend): replace the mock data below with a DashboardService call
  // once the super-admin dashboard endpoint is ready.

  readonly stats: DashboardStat[] = [
    { label: 'Total Schools', value: 24, caption: '+3.2% this month', captionTone: 'positive' },
    { label: 'Active Students', value: '5,842', caption: '+1.1%', captionTone: 'positive' },
    { label: 'Total Teachers', value: 412, caption: '-0.5%', captionTone: 'negative' },
    { label: 'Expiring Subscriptions', value: 6, caption: '2 urgent', captionTone: 'neutral', accent: 'warning' },
    { label: 'Open Complaints', value: 18, caption: '5 critical', captionTone: 'neutral', accent: 'danger' },
  ];

  readonly revenueTotalLabel = 'PKR 18.4M this month';

  readonly revenuePoints: AnalyticsPoint[] = [
    { label: 'Jan', value: 8.2 },
    { label: 'Feb', value: 9.6 },
    { label: 'Mar', value: 9.1 },
    { label: 'Apr', value: 11.4 },
    { label: 'May', value: 12.3 },
    { label: 'Jun', value: 12.0 },
    { label: 'Jul', value: 13.9 },
    { label: 'Aug', value: 15.2 },
    { label: 'Sep', value: 14.8 },
    { label: 'Oct', value: 16.9 },
    { label: 'Nov', value: 17.6 },
    { label: 'Dec', value: 18.4 },
  ];

  readonly feeCollection: FeeCollectionSummary = {
    ratePercent: 82,
    trendPercent: 2.4,
    trendDirection: 'up',
    collectedAmount: 'PKR 42.3M',
    billedAmount: 'PKR 51.6M',
    pendingAmount: 'PKR 9.3M',
    overdueCount: 14,
  };

  readonly recentActivities: ActivityItem[] = [
    { type: 'school_added', description: 'Oakridge School added to the platform', timestamp: '2026-09-15T13:00:00' },
    { type: 'status_changed', description: 'Beaconhouse status changed to Active', timestamp: '2026-09-14T10:00:00' },
    { type: 'subscription_upgraded', description: 'City School upgraded to Premium plan', timestamp: '2026-09-12T09:00:00' },
    { type: 'subscription_upgraded', description: 'Hafiz School System renewed Advanced plan', timestamp: '2026-08-20T15:20:00' },
  ];

  readonly expiringSubscriptions: ExpiringSubscriptionItem[] = [
    { schoolName: 'AGE High School', plan: 'Basic', expiresIn: '2 days' },
    { schoolName: 'Hafiz School System', plan: 'Advanced', expiresIn: '8 days' },
    { schoolName: 'Test School', plan: 'Basic', expiresIn: '12 days' },
    { schoolName: 'Kips Academy', plan: 'Advanced', expiresIn: '15 days' },
  ];

  // ---------- Revenue chart (inline SVG) ----------
  readonly chartViewBox = `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`;
  readonly chartLinePath: string;
  readonly chartAreaPath: string;

  // ---------- Fee collection donut ----------
  readonly donutRadius = DONUT_RADIUS;
  readonly donutCircumference = 2 * Math.PI * DONUT_RADIUS;
  readonly donutOffset: number;

  constructor() {
    const points = this.toChartPoints(this.revenuePoints);
    this.chartLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    this.chartAreaPath = points.length
      ? `${this.chartLinePath} L${points[points.length - 1].x},${CHART_HEIGHT} L${points[0].x},${CHART_HEIGHT} Z`
      : '';
    this.donutOffset = this.donutCircumference * (1 - this.feeCollection.ratePercent / 100);
  }

  private toChartPoints(data: AnalyticsPoint[]): ChartPoint[] {
    if (!data.length) return [];

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const range = Math.max(...values) - min || 1; // avoid divide-by-zero on flat data
    const plotHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
    const stepX = data.length > 1 ? CHART_WIDTH / (data.length - 1) : 0;

    return data.map((d, i) => ({
      x: stepX * i,
      y: CHART_PADDING_Y + plotHeight - ((d.value - min) / range) * plotHeight,
    }));
  }
}