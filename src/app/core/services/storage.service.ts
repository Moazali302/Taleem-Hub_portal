import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../constants/app.constants';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor() {}

  saveItem(key: string, value: any): void {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
