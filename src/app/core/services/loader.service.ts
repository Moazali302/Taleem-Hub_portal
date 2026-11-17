import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loading = signal(false);
  isLoading = this.loading.asReadonly();

  private activeRequests = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private visibleSince = 0;

  show(): void {
    this.activeRequests += 1;
    this.clearHideTimer();

    if (this.activeRequests === 1 && !this.loading()) {
      this.showTimer = setTimeout(() => {
        this.showTimer = null;
        if (this.activeRequests > 0) {
          this.visibleSince = Date.now();
          this.loading.set(true);
        }
      }, 180);
    }
  }

  hide(): void {
    if (this.activeRequests === 0) {
      return;
    }

    this.activeRequests -= 1;
    if (this.activeRequests > 0) {
      return;
    }

    this.clearShowTimer();
    if (!this.loading()) {
      return;
    }

    const remainingDisplayTime = Math.max(0, 360 - (Date.now() - this.visibleSince));
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (this.activeRequests === 0) {
        this.loading.set(false);
      }
    }, remainingDisplayTime);
  }

  private clearShowTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
