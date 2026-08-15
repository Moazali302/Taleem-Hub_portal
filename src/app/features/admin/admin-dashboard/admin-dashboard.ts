import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  // TODO: replace with data from a DashboardService (API call) once backend endpoint is ready
  statCards: StatCardData[] = [
    { icon: '/svg/student.svg', label: 'Total Students', value: 612, variant: 'purple' },
    { icon: '/svg/teacher.svg', label: 'Total Teachers', value: 34, variant: 'info' },
    { icon: '/svg/attendence.svg', label: "Today's Attendance", value: '94%', variant: 'success' },
    { icon: '/svg/fees.svg', label: 'Fees Collected (This Month)', value: 'PKR 340,000', variant: 'warning' },
    { icon: '/svg/complaint.svg', label: 'Open Complaints', value: 5, variant: 'danger' },
  ];

  pendingApprovals = 12;
  pendingApprovalsCaption = 'Leave requests awaiting review';

  announcement = {
    latestTitle: 'Mid-term exams schedule released',
    postedOn: '2026-08-10',
  };

  feeCollectionAmount = 'PKR 340,000';
  upcomingExamsCount = 3;
}