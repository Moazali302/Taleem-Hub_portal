import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean | Observable<boolean> {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    return this.authService.refreshSession().pipe(
      map((refreshed) => {
        if (refreshed) {
          return true;
        }
        this.router.navigate(['/auth/login']);
        return false;
      }),
    );
  }
}