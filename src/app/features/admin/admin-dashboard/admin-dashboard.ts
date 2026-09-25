import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { AdminDashboardService } from '@app/core/services/admin-dashboard.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import {
  AdminDashboardAnnouncement,
  AdminDashboardApproval,
  AdminDashboardSummary,
} from '@app/core/models/admin-dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, LoaderComponent, ButtonComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';
  summary: AdminDashboardSummary | null = null;
  statCards: StatCardData[] = [];

  constructor(
    private readonly dashboardService: AdminDashboardService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  get pendingApprovals(): AdminDashboardApproval[] {
    return this.summary?.pending_approvals ?? [];
  }

  get announcements(): AdminDashboardAnnouncement[] {
    return this.summary?.announcements ?? [];
  }

  get latestAnnouncement(): AdminDashboardAnnouncement | null {
    return this.announcements[0] ?? null;
  }

  get olderAnnouncements(): AdminDashboardAnnouncement[] {
    return this.announcements.slice(1);
  }

  loadSummary(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.summary = res.data;
        this.statCards = this.buildStatCards(res.data);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = getHttpErrorMessage(err);
        this.toaster.error(this.errorMessage);
        this.cdr.markForCheck();
      },
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  timeAgo(isoDate: string): string {
    const then = new Date(isoDate).getTime();
    const diffMs = Date.now() - then;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  formatPkr(amount: number): string {
    return `PKR ${amount.toLocaleString('en-PK')}`;
  }

  private buildStatCards(data: AdminDashboardSummary): StatCardData[] {
    return [
      {
        icon: '/svg/student.svg',
        label: 'Total Students',
        value: data.total_students,
        variant: 'info',
        trend: this.trendFromPercent(data.students_trend_percent),
      },
      {
        icon: '/svg/teacher.svg',
        label: 'Total Teachers',
        value: data.total_teachers,
        variant: 'info',
        trend: this.trendFromPercent(data.teachers_trend_percent),
      },
      {
        icon: '/svg/attendence.svg',
        label: "Today's Attendance",
        value: `${data.attendance_today_percent}%`,
        variant: 'success',
        ring: data.attendance_today_percent,
      },
      {
        icon: '/svg/fees.svg',
        label: 'Fees Collected (This Month)',
        value: this.formatCompactPkr(data.fees_collected_this_month),
        variant: 'warning',
        trend: this.trendFromPercent(data.fees_trend_percent),
        progress: {
          percent: data.fees_month_target_percent,
          caption: `${data.fees_month_target_percent}% of Monthly Target`,
        },
      },
      {
        icon: '/svg/complaint.svg',
        label: 'Open Complaints',
        value: data.open_complaints,
        variant: 'danger',
        accented: true,
        urgencyLabel: `${data.new_complaints} new`,
      },
    ];
  }

  private trendFromPercent(value: string): { direction: 'up' | 'down'; value: string } {
    return {
      direction: value.trim().startsWith('-') ? 'down' : 'up',
      value,
    };
  }

  private formatCompactPkr(amount: number): string {
    if (amount >= 1000) {
      return `PKR ${(amount / 1000).toFixed(0)}k`;
    }
    return this.formatPkr(amount);
  }
}
