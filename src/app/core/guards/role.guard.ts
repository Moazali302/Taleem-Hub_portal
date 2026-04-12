import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ROLE_REDIRECTS } from '../constants/roles.constants';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getRole();

    if (userRole === expectedRole) {
      return true;
    }

    const redirectUrl = userRole ? (ROLE_REDIRECTS as any)[userRole] : '/auth/login';
    this.router.navigate([redirectUrl]);
    return false;
  }
}
