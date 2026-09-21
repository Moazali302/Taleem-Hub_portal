import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../auth/token.service';

/**
 * Attaches the access token to outgoing requests. 401 handling (silent
 * refresh, and forced logout if refresh also fails) now lives entirely in
 * RefreshInterceptor — keeping that in one place instead of split across
 * two interceptors avoids the two of them racing/duplicating the same
 * "remove token, redirect to login" cleanup.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}