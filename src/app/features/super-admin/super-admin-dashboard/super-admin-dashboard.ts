import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { ProgressBarComponent } from '@app/shared/components/progressBar/progress-bar';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { ApprovalItem,ExpiringSubscriptionItem,ExamItem} from '@app/core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, ProgressBarComponent],
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

  pendingApprovals = 156;

  approvalItems: ApprovalItem[] = [
    { icon: '/svg/school.svg', title: 'Oakridge School Request', timeAgo: '2h ago' },
    { icon: '/svg/subscription.svg', title: 'Beaconhouse License renewal', timeAgo: '5h ago' },
    { icon: '/svg/teacher.svg', title: 'City School Teacher Batch', timeAgo: 'Yesterday' },
  ];

  subscription = {
    renewalDate: '2026-08-23',
    usagePercent: 80,
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