import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { AdminTeachersService } from '@app/core/services/admin-teachers.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import {
  CreateTeacherPayload,
  TeacherListItem,
  TEACHER_RANK_OPTIONS,
} from '@app/core/models/teacher.model';

export type TeacherFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-add-teacher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-teacher.html',
  styleUrl: './add-teacher.scss',
})
export class AddTeacherComponent implements OnInit {
  @Input() mode: TeacherFormMode = 'create';
  @Input() teacher: TeacherListItem | null = null;

  @Output() closeClicked = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly rankOptions = TEACHER_RANK_OPTIONS;
  isSubmitting = false;

  private readonly fb = new FormBuilder();

  form = this.fb.group({
    teacher_name: ['', [Validators.required]],
    qualification: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\s()-]{6,}$/)]],
    email: ['', [Validators.required, Validators.email]],
    specialty: ['', [Validators.required]],
    rank: this.fb.nonNullable.control(TEACHER_RANK_OPTIONS[0].value, [Validators.required]),
  });

  constructor(
    private readonly teachersService: AdminTeachersService,
    private readonly toaster: ToastService,
  ) {}

  ngOnInit(): void {
    if (this.teacher) {
      this.form.patchValue({
        teacher_name: this.teacher.teacher_name,
        qualification: this.teacher.qualification,
        phone: this.teacher.phone,
        email: this.teacher.email,
        specialty: this.teacher.specialty,
        rank: this.teacher.rank,
      });
    }

    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  get heading(): string {
    if (this.mode === 'edit') return 'Edit Teacher';
    if (this.mode === 'view') return 'Teacher Details';
    return 'Add Teacher';
  }

  get subtitle(): string {
    if (this.mode === 'edit') return 'Update this teacher’s profile';
    if (this.mode === 'view') return 'Read-only staff profile';
    return 'Add a teacher to your school staff';
  }

  get submitLabel(): string {
    if (this.isSubmitting) {
      return this.mode === 'edit' ? 'Saving…' : 'Adding…';
    }
    return this.mode === 'edit' ? 'Save Teacher' : 'Add Teacher';
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onClose(): void {
    this.closeClicked.emit();
  }

  onSubmit(): void {
    if (this.mode === 'view') {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateTeacherPayload = {
      teacher_name: raw.teacher_name ?? '',
      qualification: raw.qualification ?? '',
      phone: raw.phone ?? '',
      email: raw.email ?? '',
      specialty: raw.specialty ?? '',
      rank: raw.rank,
    };

    this.isSubmitting = true;

    const request$ =
      this.mode === 'edit' && this.teacher
        ? this.teachersService.updateTeacher(this.teacher.id, payload)
        : this.teachersService.createTeacher(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toaster.success(
          this.mode === 'edit' ? 'Teacher updated successfully' : 'Teacher added successfully',
        );
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toaster.error(getHttpErrorMessage(err));
      },
    });
  }
}
