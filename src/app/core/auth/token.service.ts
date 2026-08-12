import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { StorageService } from '../services/storage.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { User } from '../models/user.model';

/** Mirrors backend TaleemJwtPayload + standard JWT claims (iat/exp added by jsonwebtoken on sign). */
interface DecodedTaleemToken {
  sub: string;
  email: string;
  role: string;
  schoolId: string;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  constructor(private storage: StorageService) {}

  saveToken(token: string): void {
    this.storage.saveItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, token);
  }

  getToken(): string | null {
    return this.storage.getItem<string>(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
  }

  removeToken(): void {
    this.storage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
  }

  /** Stored purely for display (name/email in UI) — never used for auth/role decisions. */
  saveUser(user: User): void {
    this.storage.saveItem(APP_CONSTANTS.STORAGE_KEYS.USER, user);
  }

  getUser(): User | null {
    return this.storage.getItem<User>(APP_CONSTANTS.STORAGE_KEYS.USER);
  }

  removeUser(): void {
    this.storage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
  }

  /** Decodes the stored JWT. Never throws — malformed/missing token just yields null. */
  private getDecodedToken(): DecodedTaleemToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<DecodedTaleemToken>(token);
    } catch(err) {
          console.error('JWT decode failed:', err);   // <-- temporary debug line
        return null;
    }
  }

  /** Real expiry check against the JWT's `exp` claim (seconds since epoch). */
  isTokenExpired(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded?.exp) {
      return true;
    }

    return decoded.exp * 1000 <= Date.now();
  }

  /**
   * Role always comes from the token itself. This is what fixes the
   * cookie-reuse login case, where the backend returns `token + role` but
   * no `user` object — role resolution no longer depends on a separate
   * storage write that might not have happened.
   */
  getRole(): string | null {
    return this.getDecodedToken()?.role ?? null;
  }
}