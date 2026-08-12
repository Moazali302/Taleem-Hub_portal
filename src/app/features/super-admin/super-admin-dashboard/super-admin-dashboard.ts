import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StatCardComponent} from '@app/shared/components/stat-card/stat-card';
import {StatCardData} from '@app/shared/components/stat-card/stat-card-model';
import {User, LanguageOption } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,StatCardComponent],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminDashboardComponent {
  // TODO: replace with data from a DashboardService (API call) once backend endpoint is ready
statCards: StatCardData[] = [
  { icon: '/svg/school.svg', label: 'Total Schools/Institutes', value: 24, variant: 'purple' },
  { icon: '/svg/student.svg', label: 'Active Students', value: '5,842', variant: 'info' },
  { icon: '/svg/teacher.svg', label: 'Total Teachers', value: 412, variant: 'success' },
  { icon: '/svg/subscription.svg', label: 'Expiring Subscriptions', value: 6, variant: 'warning' },
  { icon: '/svg/complaint.svg', label: 'Open Complaints', value: 18, variant: 'danger' },
];
  pendingApprovals = 156;

  subscription = {
    renewalDate: '2026-08-23',
  };

  feeCollectionAmount = 'PKR 1,240,500';
  upcomingExamsCount = 8;

  onSearch(term: string): void {
    // TODO: wire up to search service
  }

  onLanguageChange(code: string): void {
    // TODO: wire up to i18n service
  }
}