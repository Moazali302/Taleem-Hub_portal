import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../auth/token.service';
import { API } from '../constants/api.constants';
import { environment } from '@env/environment';

interface RefreshResponse {
  success: boolean;
  token: string;
  role: string;
}

/**
 * On a 401 from a protected endpoint, tries once to silently mint a fresh access token via
 * the httpOnly refresh cookie (POST /auth/refresh-token), then retries the original request.
 *
 * - /auth/* endpoints (login, verify-otp, resend-otp, forgot/reset-password, logout, refresh)
 *   are never refreshed: a 401 there means "wrong credentials/OTP" or "no session", not
 *   "access token expired" — refreshing would wrongly bounce the user to the login page.
 * - Concurrent 401s share ONE in-flight refresh call. If it fails, every waiting request
 *   fails with it (no request is left hanging, so the global loader can't get stuck).
 */
@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private refresh$: Observable<string> | null = null;

  constructor(
    private tokenService: TokenService,
    private http: HttpClient,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.includes('/auth/')) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401) {
          return throwError(() => error);
        }

        return this.refreshAccessToken().pipe(
          switchMap((token) => next.handle(this.attachToken(request, token))),
        );
      }),
    );
  }

  private refreshAccessToken(): Observable<string> {
    if (!this.refresh$) {
      const baseUrl = environment.apiUrl.replace(/\/$/, '');

      this.refresh$ = this.http
        .post<RefreshResponse>(`${baseUrl}${API.AUTH.REFRESH_TOKEN}`, {}, { withCredentials: true })
        .pipe(
          map((res) => res.token),
          tap((token) => this.tokenService.saveToken(token)),
          catchError((refreshError: HttpErrorResponse) => {
            // A failed refresh must not end a still-valid access-token session.
            if (
              (refreshError.status === 401 || refreshError.status === 403) &&
              this.tokenService.isTokenExpired()
            ) {
              this.tokenService.removeToken();
              this.tokenService.removeUser();
              this.router.navigate(['/auth/login']);
            }
            return throwError(() => refreshError);
          }),
          finalize(() => (this.refresh$ = null)),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }

    return this.refresh$;
  }

  private attachToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}