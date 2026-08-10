import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { TokenService } from './token.service';
import { API } from '../constants/api.constants';
import { User } from '../models/user.model';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Role } from '@core/constants/roles.constants';

/**
 * login() result shapes (mirrors backend AuthService.login()):
 * - OTP required (first-time / expired cookie): { success, message, requiresOtp: true }
 * - Valid session cookie reused: { success, token, role, redirectTo } (no OTP, no user object)
 */
export interface LoginResult {
  success: boolean;
  message?: string;
  requiresOtp?: true;
  token?: string;
  role?: Role;
  redirectTo?: string;
}

/** verifyOtp() result shape (mirrors backend AuthService.verifyOtp()). */
export interface VerifyOtpResult {
  success: boolean;
  token: string;
  role: Role;
  redirectTo: string;
  user: User;
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

  login(credentials: {
    email: string;
    password: string;
    schoolId?: string;
  }): Observable<ApiResponse<LoginResult>> {
    return this.api.post<LoginResult>(API.AUTH.LOGIN, credentials).pipe(
      tap((res) => {
        const result = res.data;

        // Only the cookie-reuse case returns a token directly from login().
        // requiresOtp case has no token yet — session is saved after verifyOtp().
        if (result?.success && result.token) {
          this.tokenService.saveToken(result.token);
        }
      }),
    );
  }

  register(data: any): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.REGISTER, data);
  }

  verifyOtp(data: { email: string; otp: string }): Observable<ApiResponse<VerifyOtpResult>> {
    return this.api.post<VerifyOtpResult>(API.AUTH.VERIFY_OTP, data).pipe(
      tap((res) => {
        const result = res.data;

        if (result?.success && result.token) {
          this.saveSession(result.token, result.user);
        }
      }),
    );
  }

  resendOtp(data: { email: string; mode: string }): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.RESEND_OTP, data);
  }

  verifyResetOtp(data: { email: string; otp: string }): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.VERIFY_RESET_OTP, data);
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