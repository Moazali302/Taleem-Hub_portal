import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminTeachersService } from '@app/core/services/admin-teachers.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import {
  CreateTeacherPayload,
  TeacherListItem,
  TEACHER_RANK_OPTIONS,
  TeacherStatus,
  UpdateTeacherPayload,
} from '@app/core/models/teacher.model';
import { Subscription } from 'rxjs';

export type TeacherFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-add-teacher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-teacher.html',
  styleUrl: './add-teacher.scss',
})
export class AddTeacherComponent implements OnInit, OnDestroy {
  @Input() mode: TeacherFormMode = 'create';
  @Input() teacher: TeacherListItem | null = null;
  @Input() showCloseButton = true;

  @Output() closeClicked = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly rankOptions = TEACHER_RANK_OPTIONS;
  readonly statusOptions: { value: TeacherStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'on_leave', label: 'On Leave' },
  ];
  isSubmitting = false;

  private readonly fb = new FormBuilder();
  private saveRequest?: Subscription;

  form = this.fb.group({
    teacher_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    qualification: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+92[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    gender: [''],
    cnic: ['', [Validators.pattern(/^\d{5}-\d{7}-\d$/)]],
    address: [''],
    specialty: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    joining_date: ['', [Validators.required]],
    experience_years: [null as number | null, [Validators.min(0)]],
    monthly_salary: [null as number | null, [Validators.min(0)]],
    rank: this.fb.nonNullable.control(TEACHER_RANK_OPTIONS[0].value, [Validators.required]),
    status: this.fb.nonNullable.control<TeacherStatus>('active', [Validators.required]),
    password: [''],
  });

  constructor(
    private readonly teachersService: AdminTeachersService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.mode === 'create') {
      this.form.controls.password.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25),
      ]);
    } else {
      this.form.controls.password.setValidators([
        Validators.minLength(8),
        Validators.maxLength(25),
      ]);
    }
    this.form.controls.password.updateValueAndValidity({ emitEvent: false });

    if (this.teacher) {
      this.populateForm(this.teacher);
    }

    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  ngOnDestroy(): void {
    this.saveRequest?.unsubscribe();
  }

  get heading(): string {
    if (this.mode === 'edit') return 'Edit Teacher';
    if (this.mode === 'view') return 'Teacher Details';
    return 'Add Teacher';
  }

  get submitLabel(): string {
    if (this.isSubmitting) {
      return this.mode === 'edit' ? 'Saving…' : 'Adding…';
    }
    return 'Save Teacher';
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onClose(): void {
    this.closeClicked.emit();
  }

  generatePassword(): void {
    if (this.mode !== 'create' || this.isSubmitting) return;
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const randomValues = new Uint32Array(14);
    globalThis.crypto.getRandomValues(randomValues);
    const password = Array.from(randomValues, (value) => characters[value % characters.length]).join('');
    this.form.controls.password.setValue(password);
    this.form.controls.password.markAsDirty();
  }

  onSubmit(): void {
    if (this.mode === 'view' || this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const fields = {
      teacher_name: raw.teacher_name ?? '',
      qualification: raw.qualification ?? '',
      phone: raw.phone ?? '',
      email: raw.email ?? '',
      ...(raw.gender ? { gender: raw.gender } : {}),
      ...(raw.cnic ? { cnic: raw.cnic } : {}),
      ...(raw.address ? { address: raw.address } : {}),
      specialty: raw.specialty ?? '',
      joining_date: raw.joining_date ?? '',
      ...(raw.experience_years !== null ? { experience_years: raw.experience_years } : {}),
      ...(raw.monthly_salary !== null ? { monthly_salary: raw.monthly_salary } : {}),
      rank: raw.rank,
      status: raw.status,
    };

    this.isSubmitting = true;
    this.form.disable({ emitEvent: false });

    const request$ = this.mode === 'edit' && this.teacher
      ? this.teachersService.updateTeacher(this.teacher.id, {
          ...fields,
          ...(raw.password ? { password: raw.password } : {}),
        } satisfies UpdateTeacherPayload)
      : this.teachersService.createTeacher({
          ...fields,
          password: raw.password ?? '',
        } satisfies CreateTeacherPayload);

    this.saveRequest = request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toaster.success(
          this.mode === 'edit' ? 'Teacher updated successfully' : 'Teacher added successfully',
        );
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.form.enable({ emitEvent: false });
        this.toaster.error(getHttpErrorMessage(err));
        this.cdr.markForCheck();
      },
    });
  }

  private populateForm(teacher: TeacherListItem): void {
    this.form.patchValue({
      teacher_name: teacher.teacher_name,
      qualification: teacher.qualification,
      phone: teacher.phone,
      email: teacher.email,
      gender: teacher.gender ?? '',
      cnic: teacher.cnic ?? '',
      address: teacher.address ?? '',
      specialty: teacher.specialty,
      joining_date: teacher.joining_date ?? '',
      experience_years: teacher.experience_years ?? null,
      monthly_salary: teacher.monthly_salary ?? null,
      rank: teacher.rank,
      status: teacher.status ?? 'active',
      password: '',
    });
  }

}
