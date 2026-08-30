import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { ProgressBarComponent } from '@app/shared/components/progressBar/progress-bar';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { AnalyticsCardComponent } from '@app/shared/components/analytics-card/analytics-card';
import { ActivityFeedComponent } from '../activity-feed/activity-feed';
import { ActivityItem } from '@app/core/models/activity.model';
import { AnalyticsRange,AnalyticsSeries } from '@app/core/models/analytics.model';
import { ProfitOverviewCardComponent } from '@app/shared/components/profit-overview-card/profit-overview-card';
import { ProfitOverviewData } from '@app/core/models/profit-overview.mode';
import { FeeCollectionSummary } from '@app/core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, 
    ProgressBarComponent,AnalyticsCardComponent,ProfitOverviewCardComponent,
     ActivityFeedComponent],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminDashboardComponent {
  // TODO: replace with data from a DashboardService (API call) once backend endpoint is ready

  statCards: StatCardData[] = [
    { icon: '/svg/school.svg', label: 'Total Schools/Institutes', value: 24, variant: 'purple', trend: { direction: 'up', value: '+3.2%' } },
    { icon: '/svg/student.svg', label: 'Active Students', value: '5,842', variant: 'info', trend: { direction: 'up', value: '+1.1%' } },
    { icon: '/svg/teacher.svg', label: 'Total Teachers', value: 412, variant: 'success', trend: { direction: 'down', value: '-0.5%' } },
    { icon: '/svg/subscription.svg', label: 'Expiring Subscriptions', value: 6, variant: 'warning', accented: true, urgencyLabel: '2 urgent' },
    { icon: '/svg/complaint.svg', label: 'Open Complaints', value: 18, variant: 'danger', accented: true, urgencyLabel: '5 critical' },
  ];

   profitOverview: ProfitOverviewData = {
  centerLabel: 'Profit',
  centerValue: 'PKR 3,000',
  income: 65000,               // total income (shown separately, e.g. in header/subtitle)
  segments: [
    { label: 'Profit', value: 18000, color: '#16a34a' },
    { label: 'Expense', value: 47000, color: '#f97316' },
  ],
};

   analyticsData: Record<AnalyticsRange, AnalyticsSeries> = {
  '7D': {
    trendPercent: 4.2,
    trendDirection: 'up',
    trendCaption: 'this week',
    points: [
      { label: 'Mon', value: 420 },
      { label: 'Tue', value: 440 },
      { label: 'Wed', value: 435 },
      { label: 'Thu', value: 460 },
      { label: 'Fri', value: 455 },
      { label: 'Sat', value: 470 },
      { label: 'Sun', value: 480 },
    ],
  },
  '30D': {
    trendPercent: 12.7,
    trendDirection: 'up',
    trendCaption: 'this month',
    points: [
      { label: '1 Jun', value: 380 },
      { label: '5 Jun', value: 400 },
      { label: '10 Jun', value: 395 },
      { label: '15 Jun', value: 430 },
      { label: '20 Jun', value: 420 },
      { label: '25 Jun', value: 450 },
      { label: '30 Jun', value: 445 },
      { label: '4 Jul', value: 470 },
    ],
  },
  '90D': {
    trendPercent: 21.3,
    trendDirection: 'up',
    trendCaption: 'last 90 days',
    points: [
      { label: 'Apr', value: 320 },
      { label: 'May', value: 360 },
      { label: 'Jun', value: 400 },
      { label: 'Jul', value: 470 },
    ],
  },
};
  feeCollection: FeeCollectionSummary = {
  ratePercent: 82,
  trendPercent: 2.4,
  trendDirection: 'up',
  collectedAmount: 'PKR 42.3M',
  billedAmount: 'PKR 51.6M',
  pendingAmount: 'PKR 9.3M',
  overdueCount: 14,
};

  recentActivities: ActivityItem[] = [
  { type: 'school_added', description: 'Oakridge School was added to the platform', timestamp: '2026-08-29T13:00:00' },
  { type: 'status_changed', description: 'Beaconhouse status changed to Active', timestamp: '2026-08-29T10:00:00' },
  { type: 'subscription_upgraded', description: 'City School upgraded to Premium plan', timestamp: '2026-08-28T09:00:00' },
  { type: 'complaint_raised', description: 'New complaint raised by Riverdale Elementary', timestamp: '2026-08-28T06:30:00' },
  { type: 'user_added', description: 'New Support Agent "Ali Raza" added to the team', timestamp: '2026-08-27T15:20:00' },
  { type: 'school_added', description: 'Summit Preparatory was added to the platform', timestamp: '2026-08-27T11:10:00' },
  { type: 'status_changed', description: 'Global Vision School status changed to Inactive', timestamp: '2026-08-26T17:45:00' },
  { type: 'subscription_upgraded', description: 'Harmony Montessori upgraded to Pro plan', timestamp: '2026-08-26T08:00:00' },
  { type: 'complaint_raised', description: 'Complaint resolved for Beacon High Institute', timestamp: '2026-08-25T14:35:00' },
  { type: 'user_added', description: 'New Sales Manager "Hina Fatima" added to the team', timestamp: '2026-08-25T09:50:00' },
  { type: 'school_added', description: 'Crescent International Academy was added to the platform', timestamp: '2026-08-24T12:15:00' },
  { type: 'status_changed', description: 'Pinnacle Excellence High status changed to Active', timestamp: '2026-08-24T07:40:00' },
  { type: 'subscription_upgraded', description: 'Riverdale Elementary upgraded to Premium plan', timestamp: '2026-08-23T16:00:00' },
  { type: 'complaint_raised', description: 'New complaint raised by Oakridge School', timestamp: '2026-08-23T10:20:00' },
  { type: 'user_added', description: 'New Support Agent "Bilal Khan" added to the team', timestamp: '2026-08-22T13:30:00' },
  { type: 'school_added', description: 'Beacon High Institute was added to the platform', timestamp: '2026-08-22T09:05:00' },
  { type: 'status_changed', description: 'City School status changed to Active', timestamp: '2026-08-21T18:15:00' },
  { type: 'subscription_upgraded', description: 'Summit Preparatory upgraded to Pro plan', timestamp: '2026-08-21T11:00:00' },
  { type: 'complaint_raised', description: 'Complaint resolved for Global Vision School', timestamp: '2026-08-20T15:50:00' },
  { type: 'user_added', description: 'New Sales Manager "Usman Tariq" added to the team', timestamp: '2026-08-20T08:25:00' },
  { type: 'school_added', description: 'Harmony Montessori was added to the platform', timestamp: '2026-08-19T14:00:00' },
  { type: 'status_changed', description: 'Crescent International Academy status changed to Inactive', timestamp: '2026-08-19T10:10:00' },
  { type: 'subscription_upgraded', description: 'Pinnacle Excellence High upgraded to Premium plan', timestamp: '2026-08-18T16:40:00' },
];

  onSearch(term: string): void {
    // TODO: wire up to search service
  }

  onLanguageChange(code: string): void {
    // TODO: wire up to i18n service
  }
}