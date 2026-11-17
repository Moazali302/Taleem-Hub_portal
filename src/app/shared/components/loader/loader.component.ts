import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" role="status" aria-live="polite" aria-label="Loading">
      <div class="loader-card">
        <div class="loader-emblem" aria-hidden="true">
          <span class="loader-ring"></span>
          <span class="loader-ring loader-ring--inner"></span>
          <svg class="loader-mark" viewBox="0 0 32 32" fill="none">
            <path d="M5 10.5 16 5l11 5.5L16 16 5 10.5Z" />
            <path d="M9 13v7.5c4.2 3.2 9.8 3.2 14 0V13M27 11v9" />
          </svg>
        </div>
        <p class="loader-brand">Taleem<span>Hub</span></p>
        <p class="loader-caption">Preparing your workspace</p>
        <div class="loader-progress" aria-hidden="true"><span></span></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      z-index: 9999;
      inset: 0;
      display: block;
    }

    .loader-overlay {
      display: grid;
      width: 100%;
      height: 100%;
      place-items: center;
      padding: 24px;
      background: rgba(12, 28, 77, 0.18);
      backdrop-filter: blur(7px);
      -webkit-backdrop-filter: blur(7px);
    }

    .loader-card {
      display: flex;
      width: min(280px, 100%);
      flex-direction: column;
      align-items: center;
      padding: 30px 32px 26px;
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 24px 70px rgba(12, 28, 77, 0.18), 0 4px 14px rgba(12, 28, 77, 0.06);
    }

    .loader-emblem {
      position: relative;
      display: grid;
      width: 76px;
      height: 76px;
      place-items: center;
      margin-bottom: 18px;
    }

    .loader-ring {
      position: absolute;
      inset: 0;
      border: 2px solid transparent;
      border-top-color: #17306f;
      border-right-color: #17306f;
      border-radius: 50%;
      animation: loader-spin 1.15s cubic-bezier(0.55, 0.1, 0.45, 0.9) infinite;
    }

    .loader-ring--inner {
      inset: 8px;
      border-top-color: #f5b700;
      border-right-color: transparent;
      border-bottom-color: #f5b700;
      animation-direction: reverse;
      animation-duration: 1.65s;
    }

    .loader-mark {
      width: 32px;
      height: 32px;
      stroke: #17306f;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.8;
    }

    .loader-brand {
      margin: 0;
      color: #0c1c4d;
      font: 800 17px/1.3 'Manrope', 'Inter', sans-serif;
      letter-spacing: -0.035em;
    }

    .loader-brand span {
      color: #d99f00;
    }

    .loader-caption {
      margin: 5px 0 18px;
      color: #6b7694;
      font: 500 12px/1.4 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      letter-spacing: 0.015em;
    }

    .loader-progress {
      overflow: hidden;
      width: 116px;
      height: 3px;
      border-radius: 999px;
      background: #e9edf5;
    }

    .loader-progress span {
      display: block;
      width: 42%;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #17306f, #f5b700);
      animation: loader-progress 1.3s ease-in-out infinite;
    }

    @keyframes loader-spin {
      to { transform: rotate(360deg); }
    }

    @keyframes loader-progress {
      0% { transform: translateX(-110%); }
      100% { transform: translateX(260%); }
    }

    @media (prefers-reduced-motion: reduce) {
      .loader-ring, .loader-progress span { animation-duration: 3s; }
    }
  `],
})
export class LoaderComponent {}
