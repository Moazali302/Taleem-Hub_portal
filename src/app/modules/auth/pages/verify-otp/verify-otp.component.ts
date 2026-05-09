import { Component, signal, ViewChildren, QueryList, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../core/constants/roles.constants';
import { ToastrService } from 'ngx-toastr';

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
  timer = signal(90);
  email: string = '';
  mode: string = 'login';
  otp: string = '';


  private intervalId: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster:ToastrService
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
    if (state?.['mode']) {
      this.mode = state['mode'];
    }
  }

  ngOnInit(): void {
    this.getRoleFromRoute()
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  role!: string;

  getRoleFromRoute(): void {
    this.route.queryParams.subscribe(params => {
      this.role = params['role'];
    });
  }

  startTimer(): void {
    this.timer.set(90);
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
  this.authService.resendOtp({ email: this.email }).subscribe({
    next: () => {
      this.toaster.success('OTP Resend Successfully');
      this.startTimer();
    },
    error: () => {
      this.toaster.error('OTP resend failed. Please try again.');
    }
  });
}
    onVerifyOtp(): void {
  if (this.otpForm.valid) {
    this.isSubmitting.set(true);
    const otp = Object.values(this.otpForm.value).join('');

    if (this.mode === 'reset') {
      this.authService.verifyOtp({ email: this.email, otp }).subscribe({
        next: (res: any) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.toaster.success('OTP verified successfully');
            this.router.navigate(['/auth/reset-password'], {
              state: { email: this.email, otp }
            });
          }
        },
        error: () => {
          this.toaster.error('Invalid or expired OTP! Try Again');
          this.isSubmitting.set(false);
        }
      });
    } else {
      // login flow — pehle se theek hai
      this.authService.verifyOtp({ email: this.email, otp }).subscribe({
        next: (res: any) => {
          this.isSubmitting.set(false);
          if (res.success && res.role) {
            this.toaster.success('OTP verification successful');
            this.navigateByRole(res.role as Role);
          }
        },
        error: () => {
          this.toaster.error('Enter a valid OTP! Try Again');
          this.isSubmitting.set(false);
        }
      });
    }
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
