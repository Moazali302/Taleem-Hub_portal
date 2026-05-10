import { Injectable } from '@angular/core';

interface RateLimitState {
  attempts:  number;
  blockedAt: number | null;
}

@Injectable({ providedIn: 'root' })
export class RateLimitService {

  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_MS     = 5 * 60 * 1000; // 5 min

  // ══ PRIVATE HELPERS ════════════════════════════════

  private getState(key: string): RateLimitState {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { attempts: 0, blockedAt: null };
  }

  private saveState(key: string, state: RateLimitState): void {
    localStorage.setItem(key, JSON.stringify(state));
  }

  private clearState(key: string): void {
    localStorage.removeItem(key);
  }

  private isBlocked(key: string): boolean {
    const state = this.getState(key);
    if (state.attempts < this.MAX_ATTEMPTS) return false;
    if (!state.blockedAt) return false;
    if (Date.now() - state.blockedAt >= this.BLOCK_MS) {
      this.clearState(key);
      return false;
    }
    return true;
  }

  private getRemainingSeconds(key: string): number {
    const state = this.getState(key);
    if (!state.blockedAt) return 0;
    const remaining = this.BLOCK_MS - (Date.now() - state.blockedAt);
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  private getAttemptsLeft(key: string): number {
    const state = this.getState(key);
    return Math.max(0, this.MAX_ATTEMPTS - state.attempts);
  }

  private recordFailure(key: string): void {
    const state = this.getState(key);
    state.attempts++;
    if (state.attempts >= this.MAX_ATTEMPTS && !state.blockedAt) {
      state.blockedAt = Date.now();
    }
    this.saveState(key, state);
  }

  private getOtpKey(flow: 'login' | 'reset'): string {
    return flow === 'reset' ? 'reset_otp_rl' : 'login_otp_rl';
  }

  // ══ LOGIN ═══════════════════════════════════════════

  isLoginBlocked       = () => this.isBlocked('login_rl');
  getLoginRemaining    = () => this.getRemainingSeconds('login_rl');
  getLoginAttemptsLeft = () => this.getAttemptsLeft('login_rl');
  recordLoginFailure   = () => this.recordFailure('login_rl');
  resetLogin           = () => this.clearState('login_rl');

  // ══ OTP — login aur reset alag ══════════════════════

  isOtpBlocked(flow: 'login' | 'reset' = 'login'): boolean {
    return this.isBlocked(this.getOtpKey(flow));
  }

  getOtpRemaining(flow: 'login' | 'reset' = 'login'): number {
    return this.getRemainingSeconds(this.getOtpKey(flow));
  }

  getOtpAttemptsLeft(flow: 'login' | 'reset' = 'login'): number {
    return this.getAttemptsLeft(this.getOtpKey(flow));
  }

  recordOtpResend(flow: 'login' | 'reset' = 'login'): void {
    this.recordFailure(this.getOtpKey(flow));
  }

  resetOtp(flow: 'login' | 'reset' = 'login'): void {
    this.clearState(this.getOtpKey(flow));
  }
}