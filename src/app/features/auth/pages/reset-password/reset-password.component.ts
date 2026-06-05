import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  isSubmitting = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  private email: string = '';
  private otp: string = '';
  private newPassword: string = '';
  private confirmPassword: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toaster: ToastrService,
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    console.log('OTP from state:', state?.['otp']);
    this.email = state?.['email'] || '';
    this.otp = state?.['otp'] || '';
    if (!state?.['email'] || !state?.['otp']) {
      this.router.navigate(['/auth/forgot-password']);
    }
    this.email = state?.['email'] || '';
    this.otp = state?.['otp'] || '';

    this.resetPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    return newPassword && confirmPassword && newPassword.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      this.isSubmitting.set(true);
      console.log('Resetting Password:', this.resetPasswordForm.value);

      this.authService
        .resetPassword({
          email: this.email,
          otp: this.otp,
          newPassword: this.resetPasswordForm.value.newPassword,
        })
        .subscribe({
          next: (res) => {
            this.isSubmitting.set(false);
            if (res.success) {
              this.toaster.success(' your password has been Changed successfully');
              this.router.navigate(['/auth/login']);
            }
          },
          error: (err) => {
            this.isSubmitting.set(false);
            const message = err?.error?.message;
            if (message) {
              this.toaster.error(message);
            } else {
              this.toaster.error('Something went wrong! Please try again');
            }
            console.log('Full error:', err);
            console.log('Error body:', err?.error);
            console.log('Message:', err?.error?.message);
            console.log('Submitting with OTP:', this.otp);
          },
        });
    } else {
      this.resetPasswordForm.markAllAsTouched();
      const pwd = this.resetPasswordForm.get('newPassword');
      const confirm = this.resetPasswordForm.get('confirmPassword');

      if (pwd?.errors?.['required']) {
        this.toaster.error('Password is required');
      } else if (pwd?.errors?.['minlength']) {
        this.toaster.error('Password must be at least 8 characters');
      } else if (pwd?.errors?.['pattern']) {
        this.toaster.error('Password must have uppercase, lowercase and number');
      } else if (this.resetPasswordForm.errors?.['passwordMismatch']) {
        this.toaster.error('Passwords do not match');
      } else {
        this.toaster.error('Please fill all fields correctly');
      }
    }
  }
}
