import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isSubmitting.set(true);
      const email = this.forgotPasswordForm.value.email;
      console.log('Forgot Password for:', email);

      this.authService.forgotPassword(email).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.router.navigate(['/auth/verify-otp'], { state: { email, mode: 'reset' } });
          }
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
