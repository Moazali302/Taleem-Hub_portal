import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { TokenService } from './token.service';
import { API } from '../constants/api.constants';
import { User } from '../models/user.model';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Role, ROLE_REDIRECTS } from '@core/constants/roles.constants';


export interface LoginResult {
  success: boolean;
  message?: string;
  requiresOtp?: true;
  token?: string;
  role?: Role;
  redirectTo?: string;
}

/** verifyOtp() result (mirrors backend AuthService.verifyOtp()). */
export interface VerifyOtpResult {
  success: boolean;
  token: string;
  role: Role;
  redirectTo: string;
  user: User;
}

export interface SimpleResult {
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private api: ApiService,
    private tokenService: TokenService,
  ) {}


  private authPost<T>(path: string, body: unknown): Observable<T> {
    return this.api.post(path, body).pipe(map((res) => res as unknown as T));
  }

  login(credentials: {
    email: string;
    password: string;
    schoolId?: string;
  }): Observable<LoginResult> {
    return this.authPost<LoginResult>(API.AUTH.LOGIN, credentials).pipe(
      tap((result) => {
        // Only the cookie-reuse case returns a token straight from login().
        // Role lives inside the JWT itself (TokenService decodes it), so no
        // separate user save is needed or possible here.
        if (result?.success && result.token) {
          this.tokenService.saveToken(result.token);
        }
      }),
    );
  }
    getSchoolId(): string | null {
    return this.tokenService.getSchoolId();
  }

  register(data: any): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.REGISTER, data);
  }

  verifyOtp(data: { email: string; otp: string }): Observable<VerifyOtpResult> {
    return this.authPost<VerifyOtpResult>(API.AUTH.VERIFY_OTP, data).pipe(
      tap((result) => {
        if (result?.success && result.token) {
          this.saveSession(result.token, result.user);
        }
      }),
    );
  }

  resendOtp(data: { email: string; mode: string }): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.RESEND_OTP, data);
  }

  verifyResetOtp(data: { email: string; otp: string }): Observable<SimpleResult> {
    return this.authPost<SimpleResult>(API.AUTH.VERIFY_RESET_OTP, data);
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.FORGOT_PASSWORD, { email });
  }

  resetPassword(data: any): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.RESET_PASSWORD, data);
  }

  logout(): void {
    this.api.post(API.AUTH.LOGOUT, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(), // clear locally regardless of network state
    });
  }

  getCurrentUser(): User | null {
    return this.tokenService.getUser();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !this.tokenService.isTokenExpired();
  }

  /**
   * Used by AuthGuard when the access token looks expired/missing on a
   * fresh page load. The httpOnly session cookie may still be valid even
   * though the short-lived access token in localStorage isn't — this asks
   * the backend for a new access token using that cookie, instead of
   * immediately treating an expired access token as "logged out".
   */
  refreshSession(): Observable<boolean> {
    return this.api
      .post<{ success: boolean; token: string; role: string }>(API.AUTH.REFRESH_TOKEN, {})
      .pipe(
        map((res) => {
          const token = (res as unknown as { token?: string })?.token;
          if (!token) {
            return false;
          }
          this.tokenService.saveToken(token);
          return true;
        }),
        catchError(() => of(false)),
      );
  }

  getRole(): string | null {
    return this.tokenService.getRole();
  }

  getDashboardRoute(role: Role): string[] {
    return [ROLE_REDIRECTS[role] ?? '/auth/login'];
  }

  saveSession(token: string, user: User): void {
    this.tokenService.saveToken(token);
    this.tokenService.saveUser(user);
  }

  clearSession(): void {
    this.tokenService.removeToken();
    this.tokenService.removeUser();
  }
}