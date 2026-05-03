import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.role === requiredRole) return true;

    this.router.navigate(['/auth/login']);
    return false;
  }
}
