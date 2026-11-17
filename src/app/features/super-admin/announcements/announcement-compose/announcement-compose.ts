import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ANNOUNCEMENT_MESSAGE_MAX_LENGTH,
  ANNOUNCEMENT_TITLE_MAX_LENGTH,
  AnnouncementAudience,
  AnnouncementAudienceOption,
  CreateAnnouncementPayload,
} from '@app/core/models/announcement.model';
import { AnnouncementsService } from '@app/core/services/announcements.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

@Component({
  selector: 'app-announcement-compose',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './announcement-compose.html',
  styleUrl: './announcement-compose.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementComposeComponent {
  @Input({ required: true }) audienceOptions: AnnouncementAudienceOption[] = [];

  /** Emits after the announcement was sent, so the parent can refresh its history. */
  @Output() sent = new EventEmitter<void>();

  @ViewChild('titleInput') private titleInput?: ElementRef<HTMLInputElement>;

  readonly titleMaxLength = ANNOUNCEMENT_TITLE_MAX_LENGTH;
  readonly messageMaxLength = ANNOUNCEMENT_MESSAGE_MAX_LENGTH;
  isSubmitting = false;

  private readonly fb = new FormBuilder();

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(ANNOUNCEMENT_TITLE_MAX_LENGTH)]],
    message: ['', [Validators.required, Validators.maxLength(ANNOUNCEMENT_MESSAGE_MAX_LENGTH)]],
    audience: ['all' as AnnouncementAudience, [Validators.required]],
  });

  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  /** Clears the form and puts the cursor in the title — used by "+ New Announcement". */
  startNew(): void {
    this.form.reset({ title: '', message: '', audience: 'all' });
    this.titleInput?.nativeElement.focus();
  }

  isInvalid(controlName: 'title' | 'message' | 'audience'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  optionLabel(option: AnnouncementAudienceOption): string {
    return `${option.label} (${option.recipients_count})`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, message, audience } = this.form.getRawValue();
    const selectedOption = this.audienceOptions.find((option) => option.value === audience);
    if (!selectedOption) {
      this.toaster.error('Please select a valid audience.');
      return;
    }

    const payload: CreateAnnouncementPayload = {
      title: title.trim(),
      message: message.trim(),
      audienceType: selectedOption.type ?? (audience === 'all' ? 'ALL' : 'PLAN'),
      targetPlan: selectedOption.plan ?? this.toApiPlan(audience),
      target: audience === 'all' ? 'all' : selectedOption.plan ?? audience,
    };
    this.isSubmitting = true;

    this.announcementsService
      .sendAnnouncement(payload)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toaster.success('Announcement sent');
          this.form.reset({ title: '', message: '', audience: 'all' });
          this.sent.emit();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toaster.error(getHttpErrorMessage(err));
          this.cdr.markForCheck();
        },
      });
  }

  private toApiPlan(audience: AnnouncementAudience): string | null {
    switch (audience) {
      case 'basic':
        return 'basic';
      case 'advanced':
        return 'advance';
      case 'premium':
        return 'premium';
      default:
        return null;
    }
  }
}
