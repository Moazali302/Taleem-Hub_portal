import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../core/constants/roles.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
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
      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            const role = res.data.user.role as Role;
            this.navigateByRole(role);
          }
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private navigateByRole(role: Role): void {
    switch (role) {
      case Role.SUPER_ADMIN:
        this.router.navigate(['/super-admin/dashboard']);
        break;
      case Role.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      case Role.TEACHER:
        this.router.navigate(['/teacher/dashboard']);
        break;
      case Role.STUDENT:
        this.router.navigate(['/parent/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
}
