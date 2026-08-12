import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { TokenService } from './token.service';
import { API } from '../constants/api.constants';
import { User } from '../models/user.model';
import { Observable, map, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Role } from '@core/constants/roles.constants';

/**
 * login() result (mirrors backend AuthService.login()):
 * - OTP required (first-time login / no valid cookie): { success, message, requiresOtp: true }
 * - Valid session cookie reused: { success, token, role, redirectTo } — no `user` object.
 */
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
  /** Role -> dashboard route, shared by login (cookie-reuse) and verify-otp flows. */
  private readonly roleDashboardRoutes: Record<Role, string[]> = {
    [Role.SUPER_ADMIN]: ['/super-admin/dashboard'],
    [Role.ADMIN]: ['/admin/dashboard'],
    [Role.TEACHER]: ['/teacher/dashboard'],
    [Role.STUDENT]: ['/student/dashboard'],
  };

  constructor(
    private api: ApiService,
    private tokenService: TokenService,
  ) {}

  /**
   * The auth endpoints (login/verifyOtp/verifyResetOtp) return their payload
   * FLAT — confirmed from the actual network response, no `data` wrapper.
   * `ApiService.post<T>()` is typed generically as `ApiResponse<T>` for every
   * endpoint in the app, so that mismatch is reinterpreted right here, in one
   * place, instead of leaking `as any` casts into every caller.
   */
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
    this.clearSession();
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

  getRole(): string | null {
    return this.tokenService.getRole();
  }

  /** Resolves the dashboard route for a role. Used after login (cookie-reuse) and verify-otp. */
  getDashboardRoute(role: Role): string[] {
    return this.roleDashboardRoutes[role] ?? ['/auth/login'];
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