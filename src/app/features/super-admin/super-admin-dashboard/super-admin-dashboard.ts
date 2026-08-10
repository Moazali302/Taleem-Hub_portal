import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@app/header/header';
import {StatCardComponent} from '@app/shared/components/stat-card/stat-card';
import {StatCardData} from '@app/shared/components/stat-card/stat-card-model';
import {User, LanguageOption } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StatCardComponent],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminDashboardComponent {
  // TODO: replace with data from AuthService once login/session is wired up
  currentUser:User = {
    id: '1',
    name: 'Muaz Ali',
    email: 'muaz.ali@example.com',
    role: 'Super Admin',
    avatarUrl: '/assets/images/users/muaz-ali.jpg',
    initials: 'MA',
  };

  languages: LanguageOption[] = [{ code: 'en', label: 'English' }];
  activeLanguage = 'en';

  // TODO: replace with data from a DashboardService (API call) once backend endpoint is ready
  statCards: StatCardData[] = [
    { icon: 'ti-building', label: 'Total Schools/Institutes', value: 24 },
    { icon: 'ti-user', label: 'Active Students', value: '5,842' },
    { icon: 'ti-users', label: 'Total Teachers', value: 412 },
    { icon: 'ti-credit-card', label: 'Expiring Subscriptions', value: 6, variant: 'warning' },
    { icon: 'ti-alert-triangle', label: 'Open Complaints', value: 18, variant: 'danger' },
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