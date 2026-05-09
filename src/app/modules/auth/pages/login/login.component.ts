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
  readonly isSubmitting = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly loginForm: FormGroup;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toaster: ToastrService,
  ) {
    this.loginForm = this.buildForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

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
            this.toaster.success('Login successful! Please verify the OTP sent to your email.');
            this.router.navigate(['/auth/verify-otp'], {
              state: { email },
            });
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const raw = err?.error?.message?.message
            || err?.error?.message
            || null;
          const message = Array.isArray(raw)
            ? raw[0]
            : typeof raw === 'string'
            ? raw
            : 'Invalid credentials! Please check your email, password, or School ID.';
          this.toaster.warning(message);
        },
      });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      schoolId: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false],
    });
  }
}
