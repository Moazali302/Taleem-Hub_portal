import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      schoolName: ['', [Validators.required, Validators.maxLength(255)]],
      ownerName: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+92[0-9]{10}$/)]],
      schoolAddress: ['', [Validators.required, Validators.maxLength(500)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.router.navigate(['/auth/verify-registration'], {
            queryParams: {
              email: this.registerForm.value.email,
              school: this.registerForm.value.schoolName
            }
          });
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.message?.message ||
          err?.error?.message ||
          'Registration failed. Please try again.'
        );
      }
    });
  }
}
