import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AdminStudentsService } from '@app/core/services/admin-students.service';
import {
  StudentClassOption,
  StudentListItem,
  StudentPage,
  StudentSortBy,
  StudentSortOrder,
  StudentStatus,
} from '@app/core/models/student.model';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';

@Component({
  selector: 'app-student-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-listing.html',
  styleUrl: './student-listing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentListingComponent implements OnInit, OnDestroy {
  students: StudentListItem[] = [];
  classes: StudentClassOption[] = [];
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  classLoadError = '';

  searchTerm = '';
  statusFilter: StudentStatus | '' = '';
  classFilter = '';
  sortBy: StudentSortBy = 'created_at';
  sortOrder: StudentSortOrder = 'DESC';

  readonly sortOptions: { value: StudentSortBy; label: string }[] = [
    { value: 'created_at', label: 'Recently added' },
    { value: 'name', label: 'Name' },
    { value: 'admission_date', label: 'Admission date' },
    { value: 'roll_no', label: 'Roll number' },
  ];

  private readonly searchChanges = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private listRequest?: Subscription;
  private classRequest?: Subscription;

  constructor(
    private readonly studentsService: AdminStudentsService,
    private readonly toaster: ToastService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.searchChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => {
        this.searchTerm = search;
        this.page = 1;
        this.loadStudents();
      });
    this.loadStudents();
    this.loadClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.listRequest?.unsubscribe();
    this.classRequest?.unsubscribe();
  }

  get firstResult(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get lastResult(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  get visiblePages(): number[] {
    const count = Math.min(5, this.totalPages);
    const start = Math.max(1, Math.min(this.page - 2, this.totalPages - count + 1));
    return Array.from({ length: count }, (_, index) => start + index);
  }

  loadStudents(): void {
    this.listRequest?.unsubscribe();
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.listRequest = this.studentsService.getStudents({
      page: this.page,
      limit: this.limit,
      search: this.searchTerm.trim(),
      status: this.statusFilter,
      class_id: this.classFilter,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    }).subscribe({
      next: (response) => {
        this.students = response.data.items;
        this.page = response.data.page;
        this.limit = response.data.limit;
        this.total = response.data.total;
        this.totalPages = response.data.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = getHttpErrorMessage(error);
        this.students = [];
        this.total = 0;
        this.totalPages = 0;
        this.toaster.error(this.errorMessage);
        this.cdr.markForCheck();
      },
    });
  }

  loadClasses(): void {
    this.classRequest?.unsubscribe();
    this.classLoadError = '';
    this.classRequest = this.studentsService.getClassOptions().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.classLoadError = `Unable to load class filters: ${getHttpErrorMessage(error)}`;
        this.toaster.error(this.classLoadError);
        this.cdr.markForCheck();
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page = 1;
    this.searchChanges.next(value);
  }

  onStatusFilterChange(value: StudentStatus | ''): void {
    this.statusFilter = value;
    this.page = 1;
    this.loadStudents();
  }

  onClassFilterChange(value: string): void {
    this.classFilter = value;
    this.page = 1;
    this.loadStudents();
  }

  onSortByChange(value: StudentSortBy): void {
    this.sortBy = value;
    this.page = 1;
    this.loadStudents();
  }

  onSortOrderChange(value: StudentSortOrder): void {
    this.sortOrder = value;
    this.page = 1;
    this.loadStudents();
  }

  onLimitChange(value: string): void {
    this.limit = Number(value);
    this.page = 1;
    this.loadStudents();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page || this.isLoading) return;
    this.page = page;
    this.loadStudents();
  }

  openAddStudent(): void {
    void this.router.navigate(['/admin/students/add']);
  }

  studentId(student: StudentListItem): string {
    return String(student.student_id ?? student.id ?? '—');
  }

  studentName(student: StudentListItem): string {
    return student.name ?? student.student_name ?? '—';
  }

  studentEmail(student: StudentListItem): string {
    return student.email ?? student.login_email ?? '—';
  }

  classLabel(student: StudentListItem): string {
    const selectedClass = this.classes.find((option) => option.id === student.class_id);
    const name =
      student.class_name ??
      student.class?.class_name ??
      student.class?.name ??
      selectedClass?.name ??
      '—';
    const section =
      student.section ??
      student.section_name ??
      student.class?.section_name ??
      student.class?.section ??
      selectedClass?.section;
    return section ? `${name} / ${section}` : name;
  }

  parentContact(student: StudentListItem): string {
    const name = student.parent_name?.trim();
    const phone = student.parent_phone?.trim();
    if (name && phone) return `${name} · ${phone}`;
    return name ?? phone ?? '—';
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  statusLabel(status: StudentStatus | undefined): string {
    return status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : '—';
  }
}
