import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loading = signal(false);
  isLoading = this.loading.asReadonly();

  show(): void {
    this.loading.set(true);
  }

  hide(): void {
    this.loading.set(false);
  }
}
