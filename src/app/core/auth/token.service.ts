import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { User } from '../models/user.model';

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

  saveUser(user: User): void {
    this.storage.saveItem(APP_CONSTANTS.STORAGE_KEYS.USER, user);
  }

  getUser(): User | null {
    return this.storage.getItem<User>(APP_CONSTANTS.STORAGE_KEYS.USER);
  }

  removeUser(): void {
    this.storage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    // Simple check, in production use jwt-decode
    return false;
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
}
