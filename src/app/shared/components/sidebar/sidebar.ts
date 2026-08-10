import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { Role } from '@core/constants/roles.constants';
import { SIDEBAR_MENUS } from './sidbar-menu.config';
import {SidebarConfig} from '@core/models/sidbar-menu.model';

/**
 * Drop this into any layout: <app-sidebar />
 * It resolves the current user's role via AuthService and renders that
 * role's menu from SIDEBAR_MENUS. No per-layout wiring needed.
 *
 * `role` input is optional — only use it to force a specific role
 * (e.g. Storybook/preview), normal app usage should leave it unset.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() role: Role | null = null;

  readonly logoSrc = '/images/side-logo.png';

  config: SidebarConfig | null = null;

  constructor(private readonly authService: AuthService) {
    const resolvedRole = this.role ?? (this.authService.getRole() as Role | null);
    this.config = resolvedRole ? (SIDEBAR_MENUS[resolvedRole] ?? null) : null;
  }
}