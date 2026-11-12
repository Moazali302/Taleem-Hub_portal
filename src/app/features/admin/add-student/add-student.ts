import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { AdminStudentsService } from '@app/core/services/admin-students.service';
import { StudentClassOption, StudentGender, StudentStatus } from '@app/core/models/student.model';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-student.html',
  styleUrl: './add-student.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStudentComponent implements OnInit, OnDestroy {
  classes: StudentClassOption[] = [];
  isLoadingClasses = false;
  classLoadError = '';
  classSearchText = '';
  dobCalendarValue = '';
  isSubmitting = false;
  showPassword = false;
  submitted = false;
  requestError = '';
  backendFieldErrors: Record<string, string> = {};

  private readonly fb = new FormBuilder();
  private readonly destroy$ = new Subject<void>();
  private classRequest?: Subscription;
  private createRequest?: Subscription;
  @ViewChild('dobPicker') private dobPicker?: ElementRef<HTMLInputElement>;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    gender: this.fb.nonNullable.control<StudentGender | ''>('', [Validators.required]),
    dob: ['', [Validators.required, dateOnlyValidator, notFutureDateValidator]],
    cnic: ['', [Validators.pattern(/^(?:\d{13}|\d{5}-\d{7}-\d)$/)]],
    class_id: ['', [Validators.required]],
    roll_no: ['', [Validators.required, Validators.maxLength(50)]],
    admission_date: ['', [Validators.required, dateOnlyValidator]],
    status: this.fb.nonNullable.control<StudentStatus>('active', [Validators.required]),
    address: [''],
    parent_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    parent_phone: ['', [Validators.required, pakistanPhoneValidator]],
    parent_email: ['', [Validators.email, Validators.maxLength(255)]],
  }, { validators: admissionAfterDobValidator });

  constructor(
    private readonly studentsService: AdminStudentsService,
    private readonly toaster: ToastService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.backendFieldErrors = {};
      this.requestError = '';
      this.cdr.markForCheck();
    });
    this.loadClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.classRequest?.unsubscribe();
    this.createRequest?.unsubscribe();
  }

  get maxDobDate(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!this.backendFieldErrors[name]
      || (!!control && control.invalid && (control.touched || this.submitted))
      || (name === 'admission_date'
        && this.form.hasError('admissionBeforeDob')
        && (control?.touched || this.submitted || this.form.get('dob')?.touched === true));
  }

  fieldError(name: string): string {
    if (this.backendFieldErrors[name]) return this.backendFieldErrors[name];

    if (name === 'class_id' && this.classSearchText.trim()) {
      return 'Choose a class from the suggestions so the class ID can be assigned.';
    }

    const control = this.form.get(name);
    if (!control || !this.isInvalid(name)) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('minlength')) {
      return name === 'password' ? 'Password must be at least 8 characters.' : 'Enter at least 2 characters.';
    }
    if (control.hasError('maxlength')) return 'This value is too long.';
    if (control.hasError('pattern')) return 'Enter CNIC in XXXXX-XXXXXXX-X or 13-digit format.';
    if (control.hasError('dateOnly')) return 'Enter a valid date.';
    if (control.hasError('futureDate')) return 'Date of birth cannot be in the future.';
    if (control.hasError('pakistanPhone')) {
      return 'Use a Pakistan mobile number, e.g. 03XX-XXXXXXX or +923XXXXXXXXX.';
    }
    if (name === 'admission_date' && this.form.hasError('admissionBeforeDob')) {
      return 'Admission date cannot be before the date of birth.';
    }
    return 'Check this value and try again.';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  classOptionLabel(classOption: StudentClassOption): string {
    return classOption.section ? `${classOption.name} / ${classOption.section}` : classOption.name;
  }

  onClassSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.classSearchText = value;
    const match = this.classes.find(
      (option) => this.classOptionLabel(option).toLocaleLowerCase() === value.trim().toLocaleLowerCase(),
    );
    this.form.controls.class_id.setValue(match?.id ?? '');
    this.form.controls.class_id.markAsTouched();
  }

  onDobInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dobCalendarValue = normalizeDate(value) ?? '';
  }

  normalizeDobInput(): void {
    const value = this.form.controls.dob.value;
    const normalized = normalizeDate(value);
    if (normalized) {
      this.form.controls.dob.setValue(normalized);
      this.dobCalendarValue = normalized;
    }
  }

  openDobPicker(): void {
    const picker = this.dobPicker?.nativeElement;
    if (!picker) return;
    if (typeof picker.showPicker === 'function') picker.showPicker();
    else picker.click();
  }

  onDobCalendarChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    this.form.controls.dob.setValue(value);
    this.form.controls.dob.markAsTouched();
    this.dobCalendarValue = value;
  }

  generatePassword(): void {
    if (this.isSubmitting || !globalThis.crypto?.getRandomValues) {
      this.requestError = 'Secure password generation is unavailable. Enter a password manually.';
      this.cdr.markForCheck();
      return;
    }

    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const passwordChars = [
      ...this.randomCharacters('ABCDEFGHJKLMNPQRSTUVWXYZ', 1),
      ...this.randomCharacters('abcdefghijkmnopqrstuvwxyz', 1),
      ...this.randomCharacters('23456789', 1),
      ...this.randomCharacters('!@#$%', 1),
      ...this.randomCharacters(characters, 12),
    ];

    for (let index = passwordChars.length - 1; index > 0; index--) {
      const swapIndex = this.secureRandomIndex(index + 1);
      [passwordChars[index], passwordChars[swapIndex]] = [passwordChars[swapIndex], passwordChars[index]];
    }

    this.form.controls.password.setValue(passwordChars.join(''));
    this.form.controls.password.markAsDirty();
  }

  loadClasses(): void {
    this.classRequest?.unsubscribe();
    this.isLoadingClasses = true;
    this.classLoadError = '';
    this.classRequest = this.studentsService.getClassOptions().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.isLoadingClasses = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.isLoadingClasses = false;
        this.classLoadError = `Unable to load classes: ${getHttpErrorMessage(error)}`;
        this.toaster.error(this.classLoadError);
        this.cdr.markForCheck();
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/admin/students']);
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.submitted = true;
    this.requestError = '';
    this.backendFieldErrors = {};

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      password: raw.password,
      gender: raw.gender as StudentGender,
      dob: normalizeDate(raw.dob) ?? raw.dob,
      class_id: raw.class_id,
      roll_no: raw.roll_no.trim(),
      admission_date: raw.admission_date,
      status: raw.status,
      parent_name: raw.parent_name.trim(),
      parent_phone: normalizePakistanPhone(raw.parent_phone),
      ...(raw.cnic.trim() ? { cnic: raw.cnic.replace(/\D/g, '') } : {}),
      ...(raw.address.trim() ? { address: raw.address.trim() } : {}),
      ...(raw.parent_email.trim() ? { parent_email: raw.parent_email.trim() } : {}),
    };

    this.isSubmitting = true;
    this.form.disable({ emitEvent: false });
    this.createRequest = this.studentsService.createStudent(payload).subscribe({
      next: () => {
        this.form.controls.password.setValue('', { emitEvent: false });
        this.isSubmitting = false;
        this.toaster.success('Student account created. Login details are being emailed.');
        void this.router.navigate(['/admin/students']);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.form.enable({ emitEvent: false });
        this.backendFieldErrors = extractFieldErrors(error);
        this.requestError = sanitizeErrorMessage(getHttpErrorMessage(error), raw.password);
        this.cdr.markForCheck();
      },
    });
  }

  private randomCharacters(characters: string, count: number): string[] {
    return Array.from({ length: count }, () => characters[this.secureRandomIndex(characters.length)]);
  }

  private secureRandomIndex(max: number): number {
    const randomByte = new Uint8Array(1);
    const cutoff = 256 - (256 % max);
    do {
      globalThis.crypto.getRandomValues(randomByte);
    } while (randomByte[0] >= cutoff);
    return randomByte[0] % max;
  }
}

const dateOnlyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;
  return typeof value === 'string' && normalizeDate(value) ? null : { dateOnly: true };
};

const notFutureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  const normalized = typeof value === 'string' ? normalizeDate(value) : null;
  if (!normalized) return null;
  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return normalized > todayValue ? { futureDate: true } : null;
};

const pakistanPhoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;
  const normalized = String(value).replace(/[\s()-]/g, '');
  return /^(?:(?:\+|00)92|0)3\d{9}$/.test(normalized) ? null : { pakistanPhone: true };
};

const admissionAfterDobValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const dob = control.get('dob')?.value;
  const admissionDate = control.get('admission_date')?.value;
  const normalizedDob = typeof dob === 'string' ? normalizeDate(dob) : null;
  const normalizedAdmission = typeof admissionDate === 'string' ? normalizeDate(admissionDate) : null;
  return normalizedDob && normalizedAdmission && normalizedAdmission < normalizedDob
    ? { admissionBeforeDob: true }
    : null;
};

function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  let year: number;
  let month: number;
  let day: number;
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  const localMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (localMatch) {
    day = Number(localMatch[1]);
    month = Number(localMatch[2]);
    year = Number(localMatch[3]);
  } else {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizePakistanPhone(value: string): string {
  const normalized = value.replace(/[\s()-]/g, '');
  if (normalized.startsWith('03')) return `+92${normalized.slice(1)}`;
  if (normalized.startsWith('0092')) return `+${normalized.slice(2)}`;
  return normalized;
}

function extractFieldErrors(error: unknown): Record<string, string> {
  const body = isRecord(error) ? error['error'] : null;
  if (!isRecord(body)) return {};
  const errors = isRecord(body['errors']) ? body['errors'] : isRecord(body['message']) ? body['message'] : null;
  if (!errors) return {};

  const result: Record<string, string> = {};
  for (const [field, value] of Object.entries(errors)) {
    if (typeof value === 'string') result[field] = value;
    else if (Array.isArray(value) && typeof value[0] === 'string') result[field] = value[0];
  }
  return result;
}

function sanitizeErrorMessage(message: string, password: string): string {
  return password ? message.split(password).join('[redacted]') : message;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
