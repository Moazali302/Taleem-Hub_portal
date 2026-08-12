import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const token = this.authService.getToken();
    const loggedIn = this.authService.isLoggedIn();

    // TEMPORARY DEBUG LOG — remove once the redirect bug is confirmed fixed
    console.log('AuthGuard ->', { token, loggedIn });

    if (loggedIn) {
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;
  }
}