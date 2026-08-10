import {
  Component,
  signal,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RateLimitService } from '@core/services/rate-limit.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss',
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef>;

  otpForm: FormGroup;
  isSubmitting = signal(false);
  timer = signal(90);
  isOtpBlocked = signal(false);
  otpBlockTimer = signal(0);
  otpResendLeft = signal(5);

  email: string = '';
  mode: string = 'login';
  flow: 'login' | 'reset' = 'login';
  role!: string;

  private intervalId: any;
  private blockInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private rateLimiting: RateLimitService,
  ) {
    const group: any = {};
    for (let i = 0; i < 6; i++) {
      group['digit' + i] = ['', [Validators.required, Validators.pattern(/^\d$/)]];
    }
    this.otpForm = this.fb.group(group);

    const state = this.router.getCurrentNavigation()?.extras.state;

    if (!state?.['email']) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.email = state['email'];
    this.mode = state['mode'] || 'login';
    this.flow = this.mode === 'reset' ? 'reset' : 'login';
  }

  ngOnInit(): void {
    this.getRoleFromRoute();

    if (this.rateLimiting.isOtpBlocked(this.flow)) {
      this.isOtpBlocked.set(true);
      this.otpBlockTimer.set(this.rateLimiting.getOtpRemaining(this.flow));
      this.otpResendLeft.set(0);
      this.startOtpBlockTimer();
    } else {
      this.otpResendLeft.set(this.rateLimiting.getOtpAttemptsLeft(this.flow));
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.blockInterval);
  }

  getRoleFromRoute(): void {
    this.route.queryParams.subscribe((params) => {
      this.role = params['role'];
    });
  }

  startTimer(): void {
    clearInterval(this.intervalId);
    this.timer.set(90);

    this.intervalId = setInterval(() => {
      this.timer.update((t) => {
        if (t <= 0) {
          clearInterval(this.intervalId);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private startOtpBlockTimer(): void {
    clearInterval(this.blockInterval);

    this.blockInterval = setInterval(() => {
      const rem = this.rateLimiting.getOtpRemaining(this.flow);
      this.otpBlockTimer.set(rem);

      if (rem <= 0) {
        clearInterval(this.blockInterval);
        this.isOtpBlocked.set(false);
        this.otpResendLeft.set(5);
        this.startTimer();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onInput(event: any, index: number): void {
    const value = event.target.value;
    if (value && index < 5) {
      this.inputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onBackspace(event: any, index: number): void {
    if (!event.target.value && index > 0) {
      this.inputs.get(index - 1)?.nativeElement.focus();
    }
  }

  onResendOtp(): void {
    if (this.rateLimiting.isOtpBlocked(this.flow)) return;

    this.rateLimiting.recordOtpResend(this.flow);
    this.otpResendLeft.set(this.rateLimiting.getOtpAttemptsLeft(this.flow));

    if (this.rateLimiting.isOtpBlocked(this.flow)) {
      this.isOtpBlocked.set(true);
      this.otpBlockTimer.set(this.rateLimiting.getOtpRemaining(this.flow));
      clearInterval(this.intervalId);
      this.startOtpBlockTimer();
      this.toaster.error('Too many resend attempts. Try again in 5 minutes.');
      return;
    }
    this.authService
      .resendOtp({
        email: this.email,
        mode: this.flow,
      })
      .subscribe({
        next: () => {
          this.toaster.success('OTP Resend Successfully');
          this.startTimer();
        },
        error: (err) => {
          if (err.status === 429) {
            this.isOtpBlocked.set(true);
            this.otpBlockTimer.set(300);
            clearInterval(this.intervalId);
            this.startOtpBlockTimer();
          } else {
            this.toaster.error('OTP resend failed. Please try again.');
          }
        },
      });
  }

  onVerifyOtp(): void {
    if (this.otpForm.invalid) {
      this.toaster.error('Please enter a valid 6-digit OTP');
      return;
    }

    this.isSubmitting.set(true);
    const otp = Object.values(this.otpForm.value).join('');

    if (this.flow === 'reset') {
      this.authService.verifyResetOtp({ email: this.email, otp }).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);

          if (res.data?.success) {
            this.toaster.success('OTP verified successfully');
            this.rateLimiting.resetOtp('reset');
            this.router.navigate(['/auth/reset-password'], {
              state: { email: this.email, otp },
            });
          }
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toaster.error('Invalid or expired OTP! Try Again');
        },
      });
    } else {
      this.authService.verifyOtp({ email: this.email, otp }).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);

          const result = res.data;
          if (result?.success && result.role) {
            this.toaster.success('OTP verification successful');
            this.rateLimiting.resetOtp('login');
            this.router.navigate(this.authService.getDashboardRoute(result.role));
          }
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toaster.error('Enter a valid OTP! Try Again');
        },
      });
    }
  }
}