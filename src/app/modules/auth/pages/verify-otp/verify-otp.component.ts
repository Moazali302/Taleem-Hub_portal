import { Component, signal, ViewChildren, QueryList, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss'
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef>;

  otpForm: FormGroup;
  isSubmitting = signal(false);
  timer = signal(300); // 5 minutes in seconds
  email: string = localStorage.getItem('taleem_email') || '';

  private intervalId: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    const group: any = {};
    for (let i = 0; i < 6; i++) {
      group['digit' + i] = ['', [Validators.required, Validators.pattern(/^\d$/)]];
    }
    this.otpForm = this.fb.group(group);

    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state?.['email']) {
      this.email = state['email'];
    }
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startTimer(): void {
    this.timer.set(300);
    this.intervalId = setInterval(() => {
      this.timer.update(t => {
        if (t <= 0) {
          clearInterval(this.intervalId);
          return 0;
        }
        return t - 1;
      });
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
    console.log('Resending OTP for:', this.email);
    this.startTimer();
  }

  onVerifyOtp(): void {
    if (this.otpForm.valid) {
      this.isSubmitting.set(true);
      const otp = Object.values(this.otpForm.value).join('');
      console.log('Verifying OTP:', otp);

      this.authService.verifyOtp({ email: this.email, otp }).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.router.navigate(['/auth/login']);
          }
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
