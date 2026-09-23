import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '@shared/components/button/button.component';
import { SuperAdminService, CreateSchoolData } from '../../../core/services/super-admin.service';
import { ApiResponse } from '@app/core/models/api-response.model';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

export interface AddSchoolPayload {
  school_name: string;
  school_address: string;
  owner_name: string;
  owner_number: string;
  email: string;
  password: string;
}

interface DialCode {
  code: string;
  flag: string;
  label: string;
}

type PasswordStrength = 'weak' | 'medium' | 'strong' | '';
type SectionId = 'school-info' | 'owner-info' | 'credentials';

const DIAL_CODES: DialCode[] = [
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+92', flag: '🇵🇰', label: 'PK' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+49', flag: '🇩🇪', label: 'DE' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
];

@Component({
  selector: 'app-add-admin-school',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-admin-school.html',
  styleUrl: './add-admin-school.scss',
})
export class AddAdminSchoolComponent implements AfterViewInit, OnDestroy {
  @Output() closeClicked = new EventEmitter<void>();
  @Output() schoolAdded = new EventEmitter<ApiResponse<CreateSchoolData>>();

  @ViewChild('scrollContainer') private scrollContainerRef?: ElementRef<HTMLElement>;
  @ViewChildren('sectionRef') private sectionRefs?: QueryList<ElementRef<HTMLElement>>;

  showPassword = false;
  isSubmitting = false;

  readonly sections: { id: SectionId; label: string }[] = [
    { id: 'school-info', label: 'School Info' },
    { id: 'owner-info', label: 'Owner Info' },
    { id: 'credentials', label: 'Credentials' },
  ];
  readonly dialCodes = DIAL_CODES;

  // UI-only state (not part of the submitted payload)
  activeSectionIndex = signal(0);
  passwordStrength = signal<PasswordStrength>('');
  duplicateEmailError = signal<string | null>(null);

  private observer?: IntersectionObserver;
  private readonly destroy$ = new Subject<void>();

  private readonly fb = new FormBuilder();

  form = this.fb.group({
    school_name: ['', [Validators.required]],
    school_address: ['', [Validators.required]],
    owner_name: ['', [Validators.required]],
    owner_dial_code: ['+1', [Validators.required]],
    owner_number: ['', [Validators.required, Validators.pattern(/^[\d\s()-]{6,}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastrService,
  ) {}

  ngAfterViewInit(): void {
    this.setupStepperObserver();

    this.form.get('password')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.passwordStrength.set(this.calculatePasswordStrength(value ?? '')));

    // Clear the duplicate-email banner as soon as the user edits the email again
    this.form.get('email')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.duplicateEmailError()) {
          this.duplicateEmailError.set(null);
        }
      });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  isValidTouched(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.valid && (control.dirty || control.touched);
  }

  onClose(): void {
    this.closeClicked.emit();
  }

  scrollToSection(index: number): void {
    this.sectionRefs?.get(index)?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.duplicateEmailError.set(null);

    const raw = this.form.getRawValue();
    const payload: AddSchoolPayload = {
      school_name: raw.school_name!,
      school_address: raw.school_address!,
      owner_name: raw.owner_name!,
      owner_number: `${raw.owner_dial_code} ${raw.owner_number}`.trim(),
      email: raw.email!,
      password: raw.password!,
    };

    this.superAdminService.createSchool(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toaster.success('School added successfully!');
        this.schoolAdded.emit(res);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;

        if (this.isDuplicateEmailError(err)) {
          this.duplicateEmailError.set('This email is already registered to another school account.');
          this.form.get('email')?.markAsTouched();
          this.scrollToSection(2);
          return;
        }

        this.toaster.error(getHttpErrorMessage(err));
      },
    });
  }

  /**
   * NOTE: Confirm this against your actual API error contract.
   * Currently checks HTTP 409 (Conflict) or a message containing "email" + "already/exist".
   */
  private isDuplicateEmailError(err: HttpErrorResponse): boolean {
    if (err.status === 409) return true;
    const message = (err.error?.message ?? '').toString().toLowerCase();
    return message.includes('email') && (message.includes('already') || message.includes('exist'));
  }

  private calculatePasswordStrength(value: string): PasswordStrength {
    if (!value) return '';
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  private setupStepperObserver(): void {
    const root = this.scrollContainerRef?.nativeElement;
    if (!root || !this.sectionRefs) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!mostVisible) return;

        const index = this.sectionRefs!.toArray().findIndex((ref) => ref.nativeElement === mostVisible.target);
        if (index !== -1) this.activeSectionIndex.set(index);
      },
      { root, threshold: [0.3, 0.6] },
    );

    this.sectionRefs.forEach((ref) => this.observer!.observe(ref.nativeElement));
  }
}