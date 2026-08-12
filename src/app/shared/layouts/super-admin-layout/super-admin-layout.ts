import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@shared/components/sidebar/sidebar';
import { HeaderComponent } from '@app/header/header';
import { User, LanguageOption } from '../../../core/models/user.model';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './super-admin-layout.html',
  styleUrl: './super-admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminLayoutComponent {
  // TODO: replace with data from AuthService once login/session is wired up.
  // Moved here from the dashboard component — header now renders once for
  // the whole role, not duplicated per page.
  currentUser: User = {
    id: '1',
    name: 'Muaz Ali',
    email: 'muaz.ali@example.com',
    role: 'Super Admin',
    avatarUrl: '/svg/user-round.svg',
    initials: 'MA',
  };

  languages: LanguageOption[] = [{ code: 'en', label: 'English' }];
  activeLanguage = 'en';

  onSearch(term: string): void {
    // TODO: wire up to search service
  }

  onLanguageChange(code: string): void {
    // TODO: wire up to i18n service
  }
}