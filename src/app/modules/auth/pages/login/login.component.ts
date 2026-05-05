import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {

  // ─── Signals ────────────────────────────────────────────────────────────────
  readonly isSubmitting = signal<boolean>(false);
  readonly showPassword  = signal<boolean>(false);

  // ─── Form ───────────────────────────────────────────────────────────────────
  readonly loginForm: FormGroup;

  // ─── Lifecycle Management ───────────────────────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  // ─── Constructor ────────────────────────────────────────────────────────────
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toaster: ToastrService,
  ) {
    this.loginForm = this.buildForm();
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Public Methods ─────────────────────────────────────────────────────────

  /**
   * Toggles password field visibility.
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  /**
   * Navigates to the Forgot Password route.
   */
  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Handles form submission.
   * - Validates form before submission.
   * - Marks all fields as touched to trigger validation messages if invalid.
   * - Navigates to OTP verification on success.
   * - Shows toastr feedback on both success and error.
   */
  onSubmit(): void {
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
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.toaster.success(
              'Login Successful! Please verify the OTP sent to your email.',
            );
            this.router.navigate(['/auth/verify-otp'], {
              state: { email },
            });
          }
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toaster.warning(
            'Invalid credentials! Please check your email, password, or School ID.',
          );
        },
      });
  }

  /**
   * Returns whether a form field should display its validation error.
   * A field is considered invalid if it has errors AND has been touched.
   */
  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  // ─── Private Methods ─────────────────────────────────────────────────────────

  private buildForm(): FormGroup {
    return this.fb.group({
      schoolId: [
        '',
        [Validators.required, Validators.maxLength(255)],
      ],
      email: [
        '',
        [Validators.required, Validators.email],
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(8)],
      ],
      remember: [false],
    });
  }
}
