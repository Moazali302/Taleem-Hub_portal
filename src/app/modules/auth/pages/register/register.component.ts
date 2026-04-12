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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      schoolName: ['', [Validators.required]],
      ownerName: ['', [Validators.required]],
      phone: ['', [
        Validators.required, 
        Validators.pattern(/^\+92\d{10}$/)
      ]],
      address: ['', [Validators.required]],
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

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting.set(true);
      console.log('Register Data:', this.registerForm.value);
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.router.navigate(['/auth/verify-otp'], { state: { email: this.registerForm.value.email } });
          }
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
