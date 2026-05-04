import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toaster:ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      schoolId: ['', [Validators.required, Validators.maxLength(255)]],
      remember: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      const { email, password, schoolId } = this.loginForm.value;
      this.authService.login({ email, password, schoolId }).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.toaster.success('Login Successfull ')
            this.router.navigate(['/auth/verify-otp'], {
              state: { email: this.loginForm.value.email }
            });
          }

        },
        error: () => {
          this.toaster.warning('inavlid credientals')
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

}
