import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@shared/components/sidebar/sidebar';
import { HeaderComponent } from '@app/header/header';
import { User, LanguageOption } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  // TODO: replace with data from AuthService once login/session is wired up.
  // Header renders once for the whole role here, not duplicated per page —
  // same pattern as SuperAdminLayoutComponent.
  currentUser: User = {
    id: '1',
    name: 'Muaz Ali',
    email: 'muaz.ali@example.com',
    role: 'Admin',
    avatarUrl: '',
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