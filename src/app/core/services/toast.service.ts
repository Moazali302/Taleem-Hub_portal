import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastrService as NgxToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<{ message: string, type: 'success' | 'error' | 'info' | 'warning' }>();
  toast$ = this.toastSubject.asObservable();
  private readonly ngxToastr = inject(NgxToastrService);

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.toastSubject.next({ message, type });
    switch (type) {
      case 'success':
        this.ngxToastr.success(message);
        break;
      case 'error':
        this.ngxToastr.error(message);
        break;
      case 'warning':
        this.ngxToastr.warning(message);
        break;
      default:
        this.ngxToastr.info(message);
        break;
    }
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }
}
