import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { TokenService } from './token.service';
import { API } from '../constants/api.constants';
import { User } from '../models/user.model';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private api: ApiService,
    private tokenService: TokenService,
  ) {}

  login(credentials: any): Observable<ApiResponse<{ token: string; user: User }>> {
    return this.api.post<{ token: string; user: User }>(API.AUTH.LOGIN, credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.saveSession(res.data.token, res.data.user);
        }
      }),
    );
  }

  register(data: any): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.REGISTER, data);
  }

  verifyOtp(data: any): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.VERIFY_OTP, data).pipe(
      tap((res: any) => {
        if (res.success && res.token) {
          this.tokenService.saveToken(res.token);
          if (res.user) {
            this.tokenService.saveUser(res.user);
          }
        }
      }),
    );
  }
  resendOtp(data: { email: string }): Observable<ApiResponse<any>> {
    return this.api.post(API.AUTH.RESEND_OTP, data);
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

  saveSession(token: string, user: User): void {
    this.tokenService.saveToken(token);
    this.tokenService.saveUser(user);
  }

  clearSession(): void {
    this.tokenService.removeToken();
    this.tokenService.removeUser();
  }
}
