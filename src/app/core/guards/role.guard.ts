import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const currentRole = this.authService.getRole();
      console.log('RoleGuard -> required:', requiredRole, 'current:', currentRole);

    if (currentRole === requiredRole) {
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;
  }
}