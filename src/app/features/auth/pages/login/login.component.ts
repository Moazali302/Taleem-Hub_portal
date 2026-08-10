import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RateLimitService } from '@core/services/rate-limit.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy, OnInit {
  readonly isSubmitting = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  isBlocked = signal(false);
  blockTimer = signal(0);
  attemptsLeft = signal(5);

  private timerInterval: any;

  readonly loginForm: FormGroup;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toaster: ToastrService,
    private readonly ratelimiting: RateLimitService,
  ) {
    this.loginForm = this.buildForm();
  }

  ngOnInit(): void {
    this.syncBlockState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.timerInterval);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  private syncBlockState(): void {
    if (this.ratelimiting.isLoginBlocked()) {
      this.isBlocked.set(true);
      this.blockTimer.set(this.ratelimiting.getLoginRemaining());
      this.startTimer();
    } else {
      this.attemptsLeft.set(this.ratelimiting.getLoginAttemptsLeft());
    }
  }

  // Countdown timer
  private startTimer(): void {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const rem = this.ratelimiting.getLoginRemaining();
      this.blockTimer.set(rem);
      if (rem <= 0) {
        clearInterval(this.timerInterval);
        this.isBlocked.set(false);
        this.attemptsLeft.set(5);
      }
    }, 1000);
  }

  formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  }

  onSubmit(): void {
    if (this.ratelimiting.isLoginBlocked()) {
      this.syncBlockState();
      return;
    }
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { email, password, schoolId } = this.loginForm.getRawValue() as {
      email: string;
      password: string;
      schoolId: string;
      remember: boolean;
    };

    this.authService
      .login({ email, password, schoolId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        // authService.login() now emits LoginResult directly (backend sends a
        // flat body, not { data: LoginResult } ) — do NOT read `.data` here.
        next: (result) => {
          this.isSubmitting.set(false);

          if (!result?.success) {
            return;
          }

          this.ratelimiting.resetLogin();

          // Case 1: OTP required (normal login on this device/session)
          if (result.requiresOtp) {
            this.toaster.success('Login successful! Please verify the OTP sent to your email.');
            this.router.navigate(['/auth/verify-otp'], {
              state: { email },
            });
            return;
          }

          // Case 2: valid session cookie already existed -> backend skipped OTP
          if (result.token && result.role) {
            this.toaster.success('Login successful!');
            this.router.navigate(this.authService.getDashboardRoute(result.role));
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);

          if (err.status === 429) {
            this.ratelimiting.recordLoginFailure();
            this.isBlocked.set(true);
            this.blockTimer.set(900);
            this.startTimer();
            this.toaster.warning('Too many login attempts. Please try again later.');
            return;
          }

          this.ratelimiting.recordLoginFailure();
          this.attemptsLeft.set(this.ratelimiting.getLoginAttemptsLeft());

          if (this.ratelimiting.isLoginBlocked()) {
            this.isBlocked.set(true);
            this.blockTimer.set(this.ratelimiting.getLoginRemaining());
            this.startTimer();
          } else {
            const raw = err?.error?.message?.message || err?.error?.message || null;
            const message = Array.isArray(raw)
              ? raw[0]
              : typeof raw === 'string'
                ? raw
                : 'Invalid credentials! Please check your email, password, or School ID.';
            this.toaster.warning(message);
          }
        },
      });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      schoolId: ['', [Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false],
    });
  }
}