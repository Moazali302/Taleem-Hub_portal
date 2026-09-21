import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
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
 * On a 401, tries once to silently mint a fresh access token via the
 * httpOnly session cookie (POST /auth/refresh-token) before giving up and
 * forcing a logout. If several requests 401 around the same time, only the
 * first triggers a refresh call — the rest wait for it and retry with the
 * new token, instead of firing a refresh call each.
 */
@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshedToken$ = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private http: HttpClient,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Never try to "refresh" in response to the refresh call itself —
    // that would recurse forever.
    if (request.url.includes(API.AUTH.REFRESH_TOKEN)) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401) {
          return throwError(() => error);
        }
        return this.handle401(request, next);
      }),
    );
  }

  private handle401(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshedToken$.next(null);

      const baseUrl = environment.apiUrl.replace(/\/$/, '');

      return this.http
        .post<RefreshResponse>(
          `${baseUrl}${API.AUTH.REFRESH_TOKEN}`,
          {},
          { withCredentials: true },
        )
        .pipe(
          switchMap((res) => {
            this.isRefreshing = false;
            this.tokenService.saveToken(res.token);
            this.refreshedToken$.next(res.token);
            return next.handle(this.attachToken(request, res.token));
          }),
          catchError((refreshError) => {
            // Session cookie itself is gone/expired — nothing left to try.
            this.isRefreshing = false;
            this.tokenService.removeToken();
            this.tokenService.removeUser();
            this.router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          }),
        );
    }

    // A refresh is already in flight for another request — wait for it
    // instead of firing a second one, then retry with the token it produced.
    return this.refreshedToken$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next.handle(this.attachToken(request, token))),
    );
  }

  private attachToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}