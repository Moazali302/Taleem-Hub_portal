import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { Role } from '@core/constants/roles.constants';

@Injectable({ providedIn: 'root' })
export class TenantGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const role = this.authService.getRole();

    if (role === Role.SUPER_ADMIN) {
      return true;
    }

    const schoolId = this.authService.getSchoolId();

    if (schoolId) {
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;
  }
}