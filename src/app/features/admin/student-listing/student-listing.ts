import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AdminStudentsService, StudentSummary } from '@app/core/services/admin-students.service';
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
import { downloadCsv } from '@app/shared/utlis/csv-export.util';

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
  summary: StudentSummary | null = null;
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  classLoadError = '';
  isExporting = false;

  searchTerm = '';
  classFilter = '';
  sortBy: StudentSortBy = 'created_at';
  sortOrder: StudentSortOrder = 'DESC';

  private readonly searchChanges = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private listRequest?: Subscription;
  private classRequest?: Subscription;
  private summaryRequest?: Subscription;
  private exportRequest?: Subscription;

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
    this.loadSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.listRequest?.unsubscribe();
    this.classRequest?.unsubscribe();
    this.summaryRequest?.unsubscribe();
    this.exportRequest?.unsubscribe();
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
      status: '',
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

  loadSummary(): void {
    this.summaryRequest?.unsubscribe();
    this.summaryRequest = this.studentsService.getStudentSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.summary = null;
        this.toaster.error(`Unable to load student summary: ${getHttpErrorMessage(error)}`);
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

  onClassFilterChange(value: string): void {
    this.classFilter = value;
    this.page = 1;
    this.loadStudents();
  }

  toggleSort(field: StudentSortBy): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = field;
      this.sortOrder = 'ASC';
    }
    this.page = 1;
    this.loadStudents();
  }

  sortIndicator(field: StudentSortBy): string {
    return this.sortBy !== field ? '' : this.sortOrder === 'ASC' ? '↑' : '↓';
  }

  sortDirection(field: StudentSortBy): 'ascending' | 'descending' | 'none' {
    if (this.sortBy !== field) return 'none';
    return this.sortOrder === 'ASC' ? 'ascending' : 'descending';
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

  studentInitials(student: StudentListItem): string {
    const words = this.studentName(student).trim().split(/\s+/).filter(Boolean);
    if (!words.length || words[0] === '—') return '—';
    return words.length === 1
      ? words[0].slice(0, 2).toUpperCase()
      : `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
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

  parentName(student: StudentListItem): string {
    return student.parent_name?.trim() || '—';
  }

  parentPhone(student: StudentListItem): string {
    return student.parent_phone?.trim() || '—';
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

  exportStudents(): void {
    if (this.isExporting) return;
    this.isExporting = true;
    this.exportRequest?.unsubscribe();
    this.exportRequest = this.studentsService.getAllMatchingStudents({
      search: this.searchTerm.trim(),
      status: '',
      class_id: this.classFilter,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    }).subscribe({
      next: (rows) => {
        downloadCsv('students.csv', [
          { header: 'Student', value: (student) => this.studentName(student) },
          { header: 'Class', value: (student) => this.classLabel(student) },
          { header: 'Roll No', value: (student) => student.roll_no ?? '' },
          { header: 'Parent', value: (student) => this.parentName(student) },
          { header: 'Phone', value: (student) => this.parentPhone(student) },
          { header: 'Email', value: (student) => this.studentEmail(student) },
          { header: 'Status', value: (student) => this.statusLabel(student.status) },
        ], rows);
        this.isExporting = false;
        this.toaster.success(`${rows.length} student${rows.length === 1 ? '' : 's'} exported.`);
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.isExporting = false;
        this.toaster.error(getHttpErrorMessage(error));
        this.cdr.markForCheck();
      },
    });
  }
}
