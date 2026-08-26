import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { ProgressBarComponent } from '@app/shared/components/progressBar/progress-bar';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { AnalyticsCardComponent } from '@app/shared/components/analytics-card/analytics-card';
import { AnalyticsRange,AnalyticsSeries } from '@app/core/models/analytics.model';
import { ProfitOverviewCardComponent } from '@app/shared/components/profit-overview-card/profit-overview-card';
import { ProfitOverviewData } from '@app/core/models/profit-overview.mode';
import {ExamItem} from '@app/core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, 
    ProgressBarComponent,AnalyticsCardComponent,ProfitOverviewCardComponent],
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

  feeCollection = {
    amount: 'PKR 1,240,500',
    collectedPercent: 72,
  };

  upcomingExamsCount = 8;

  examItems: ExamItem[] = [
    { title: 'Mid-term Exams', date: 'Oct 12', dotColor: '#f97316' },
    { title: 'Final Year Project', date: 'Oct 20', dotColor: '#0f2a5e' },
  ];

  onSearch(term: string): void {
    // TODO: wire up to search service
  }

  onLanguageChange(code: string): void {
    // TODO: wire up to i18n service
  }
}