import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<{ message: string, type: 'success' | 'error' | 'info' | 'warning' }>();
  toast$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.toastSubject.next({ message, type });
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }
}
