import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import {
  AnnouncementOption,
  AnnouncementPublishOption,
  SchoolAnnouncement,
  SchoolAnnouncementOptions,
  SchoolAnnouncementPriority,
  SchoolAnnouncementRecipient,
} from '@app/core/models/school-announcement.model';
import { SchoolAnnouncementsService } from '@app/core/services/school-announcements.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

type OptionsState = 'idle' | 'loading' | 'ready' | 'error';

const RECIPIENT_TABS: { label: string; target: SchoolAnnouncementRecipient | null }[] = [
  { label: 'All', target: null },
  { label: 'Students', target: 'students' },
  { label: 'Teachers', target: 'teachers' },
  { label: 'All Staff', target: 'staff' },
  { label: 'Parents', target: 'parents' },
];

const futureDateValidator: ValidatorFn = (control): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }
  const timestamp = new Date(control.value).getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now() ? null : { futureDate: true };
};

@Component({
  selector: 'app-admin-announcements',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-announcements.html',
  styleUrl: './admin-announcements.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAnnouncementsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly announcementsService = inject(SchoolAnnouncementsService);
  private readonly toaster = inject(ToastService);

  readonly pageSize = 20;
  readonly recipientTabs = RECIPIENT_TABS;
  readonly options = signal<SchoolAnnouncementOptions | null>(null);
  readonly optionsState = signal<OptionsState>('idle');
  readonly optionsError = signal('');
  readonly announcements = signal<SchoolAnnouncement[]>([]);
  readonly currentPage = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly selectedTarget = signal<SchoolAnnouncementRecipient | null>(null);
  readonly isLoading = signal(false);
  readonly listError = signal('');
  readonly isComposerOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly previewDraft = signal({
    title: '',
    message: '',
    target: 'parents' as SchoolAnnouncementRecipient,
    priority: 'NORMAL' as SchoolAnnouncementPriority,
  });

  readonly firstResult = computed(() =>
    this.total() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1,
  );
  readonly lastResult = computed(() => Math.min(this.currentPage() * this.pageSize, this.total()));
  readonly recipientLabel = computed(() => this.findOption(
    this.options()?.recipients,
    this.previewDraft().target,
  )?.label ?? 'Parents');
  readonly priorityLabel = computed(() => this.findOption(
    this.options()?.priorities,
    this.previewDraft().priority,
  )?.label ?? 'Normal');
  readonly minimumScheduleDate = toLocalDateTimeInput(new Date());

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    message: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
    target: ['parents' as SchoolAnnouncementRecipient, Validators.required],
    priority: ['NORMAL' as SchoolAnnouncementPriority, Validators.required],
    publishOption: ['now' as AnnouncementPublishOption, Validators.required],
    scheduledAt: [''],
  });

  private listRequest?: Subscription;

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.previewDraft.set({
        title: value.title ?? '',
        message: value.message ?? '',
        target: value.target ?? 'parents',
        priority: value.priority ?? 'NORMAL',
      });
    });
    this.loadAnnouncements(1);
  }

  loadAnnouncements(page = this.currentPage()): void {
    this.listRequest?.unsubscribe();
    this.isLoading.set(true);
    this.listError.set('');
    this.listRequest = this.announcementsService
      .getAnnouncements(page, this.pageSize, this.selectedTarget() ?? undefined)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: ({ data }) => {
          this.announcements.set(data.items);
          this.currentPage.set(data.page);
          this.total.set(data.total);
          this.totalPages.set(Math.max(1, data.totalPages));
        },
        error: (error: unknown) => this.listError.set(getHttpErrorMessage(error)),
      });
  }

  selectTarget(target: SchoolAnnouncementRecipient | null): void {
    if (target === this.selectedTarget()) {
      return;
    }
    this.selectedTarget.set(target);
    this.loadAnnouncements(1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }
    this.loadAnnouncements(page);
  }

  openComposer(): void {
    this.isComposerOpen.set(true);
    this.resetForm();
    if (this.optionsState() === 'idle' || this.optionsState() === 'error') {
      this.loadOptions();
    }
  }

  closeComposer(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.isComposerOpen.set(false);
    this.resetForm();
  }

  loadOptions(): void {
    this.optionsState.set('loading');
    this.optionsError.set('');
    this.announcementsService
      .getOptions()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.optionsState() === 'loading') {
            this.optionsState.set('idle');
          }
        }),
      )
      .subscribe({
        next: ({ data }) => {
          this.options.set(data);
          this.optionsState.set('ready');
        },
        error: (error: unknown) => {
          this.optionsState.set('error');
          this.optionsError.set(getHttpErrorMessage(error));
        },
      });
  }

  onPublishOptionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as AnnouncementPublishOption;
    const scheduleControl = this.form.controls.scheduledAt;
    if (value === 'schedule') {
      scheduleControl.setValidators([Validators.required, futureDateValidator]);
    } else {
      scheduleControl.clearValidators();
      scheduleControl.reset('');
    }
    scheduleControl.updateValueAndValidity();
  }

  isInvalid(controlName: 'title' | 'message' | 'target' | 'priority' | 'scheduledAt'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  optionLabel<T extends string>(
    options: AnnouncementOption<T>[] | undefined,
    value: T,
    fallback: string,
  ): string {
    return this.findOption(options, value)?.label ?? fallback;
  }

  priorityClass(priority: string | undefined): string {
    switch (priority) {
      case 'URGENT':
        return 'priority--urgent';
      case 'IMPORTANT':
        return 'priority--important';
      default:
        return 'priority--normal';
    }
  }

  audienceLabel(target: string): string {
    return this.options()?.recipients.find((option) => option.value === target)?.label
      ?? RECIPIENT_TABS.find((tab) => tab.target === target)?.label
      ?? (target === 'all' ? 'Everyone' : target);
  }

  announcementDate(announcement: SchoolAnnouncement): string {
    const timestamp = announcement.scheduledAt ?? announcement.publishedAt ?? announcement.createdAt;
    if (!timestamp) {
      return 'Date unavailable';
    }
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
      ? 'Date unavailable'
      : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
  }

  statusLabel(status: string | undefined): string {
    return status?.toLowerCase() === 'scheduled' ? 'Scheduled' : 'Published';
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, message, target, priority, publishOption, scheduledAt } =
      this.form.getRawValue();
    const normalizedTitle = title.trim();
    const normalizedMessage = message.trim();
    if (!normalizedTitle || !normalizedMessage) {
      this.form.controls.title.markAsTouched();
      this.form.controls.message.markAsTouched();
      return;
    }

    const payload = {
      title: normalizedTitle,
      message: normalizedMessage,
      target,
      priority,
      ...(publishOption === 'schedule' ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}),
    };

    this.isSubmitting.set(true);
    this.announcementsService
      .createAnnouncement(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.toaster.success(
            publishOption === 'schedule'
              ? 'Announcement scheduled successfully.'
              : 'Announcement published successfully.',
          );
          this.isComposerOpen.set(false);
          this.resetForm();
          this.loadAnnouncements(1);
        },
        error: (error: unknown) => this.toaster.error(getHttpErrorMessage(error)),
      });
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      message: '',
      target: 'parents',
      priority: 'NORMAL',
      publishOption: 'now',
      scheduledAt: '',
    });
    this.form.controls.scheduledAt.clearValidators();
    this.form.controls.scheduledAt.updateValueAndValidity({ emitEvent: false });
  }

  private findOption<T extends string>(
    options: AnnouncementOption<T>[] | undefined,
    value: T,
  ): AnnouncementOption<T> | undefined {
    return options?.find((option) => option.value === value);
  }
}

function toLocalDateTimeInput(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
