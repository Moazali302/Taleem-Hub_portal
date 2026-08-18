import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { ApprovaladminItem,AnnouncementItem } from '@app/core/models/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  // TODO: replace with data from a DashboardService (API call) once backend endpoint is ready

  statCards: StatCardData[] = [
    { icon: '/svg/student.svg', label: 'Total Students', value: 612, variant: 'purple', trend: { direction: 'up', value: '+12%' } },
    { icon: '/svg/teacher.svg', label: 'Total Teachers', value: 34, variant: 'info', trend: { direction: 'up', value: '+4%' } },
    { icon: '/svg/attendence.svg', label: "Today's Attendance", value: '94%', variant: 'success', ring: 94 },
    { icon: '/svg/fees.svg', label: 'Fees Collected (This Month)', value: 'PKR 340k', variant: 'warning', trend: { direction: 'up', value: '+2.1%' }, progress: { percent: 68, caption: '68% of Monthly Target' } },
    { icon: '/svg/complaint.svg', label: 'Open Complaints', value: 5, variant: 'danger', accented: true, urgencyLabel: '2 new' },
  ];

  pendingApprovalsCount = 12;

  approvalItems: ApprovaladminItem[] = [
    { initials: 'JD', name: 'John Doe', type: 'Leave Request', timeAgo: '2h ago' },
    { initials: 'SK', name: 'Sarah Khan', type: 'Resource Access', timeAgo: '4h ago' },
    { initials: 'MA', name: 'M. Ahmed', type: 'Grade Correction', timeAgo: '1d ago' },
  ];

  announcement = {
    latestTitle: 'Mid-term exams schedule released',
    latestDescription: 'Finalized dates for all departments are now available on the portal.',
  };

  announcementItems: AnnouncementItem[] = [
    { title: 'Parent-Teacher Meeting next Friday', subtitle: 'Scheduled for 10th Oct, 2023' },
    { title: 'Winter Uniform Update', subtitle: 'Revised guidelines for secondary school' },
  ];

  feeCollection = {
    amount: 'PKR 340,000',
  };

  upcomingExamsCount = 3;
}