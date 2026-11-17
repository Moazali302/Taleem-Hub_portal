import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { AgGridTableComponent, COMPACT_ROW_HEIGHT } from '@app/shared/components/ag-grid-table/ag-grid-table';
import { GridIconsComponent } from '@app/shared/components/ag-Grid/grid-icons/grid-icons';
import {
  StatusBadgeCellRendererComponent,
  StatusBadgeColor,
} from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { AddTeacherComponent, TeacherFormMode } from '../add-teacher/add-teacher';
import {
  AdminTeachersService,
  InvalidTeacherListResponseError,
} from '@app/core/services/admin-teachers.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import {
  TeacherAccountStatus,
  TeacherListItem,
  TeacherPage,
} from '@app/core/models/teacher.model';
import { downloadCsv } from '@app/shared/utlis/csv-export.util';

const ACCOUNT_STATUS_COLORS: Record<string, StatusBadgeColor> = {
  active: { bg: '#e1f6ec', text: '#07844d', dot: '#16a36a' },
  inactive: { bg: '#ffebeb', text: '#d14343', dot: '#e05252' },
};

@Component({
  selector: 'app-teacher-listing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCardComponent,
    ButtonComponent,
    AgGridTableComponent,
    SidenavComponent,
    AddTeacherComponent,
  ],
  templateUrl: './teacher-listing.html',
  styleUrl: './teacher-listing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherListingComponent implements OnInit, OnDestroy {
  readonly rowHeight = COMPACT_ROW_HEIGHT;

  statCards: StatCardData[] = [
    { icon: '/svg/users-plus.svg', label: 'Total Teachers', value: '—', variant: 'purple' },
    { icon: '/svg/users-plus.svg', label: 'Active', value: '—', variant: 'success' },
    { icon: '/svg/complaint.svg', label: 'Inactive', value: '—', variant: 'warning' },
  ];

  teachers: TeacherListItem[] = [];
  availableSubjects: string[] = [];
  schoolName = '';
  page = 1;
  limit = 5;
  total = 0;
  totalPages = 0;
  isLoading = false;
  isExporting = false;
  hasError = false;
  errorMessage = '';

  searchTerm = '';
  subjectFilter = 'all';
  statusFilter: TeacherAccountStatus | 'all' = 'all';

  readonly columnDefs: ColDef<TeacherListItem>[] = [
    {
      field: 'school_name',
      headerName: 'School',
      flex: 1.2,
      minWidth: 150,
    },
    {
      field: 'teacher_name',
      headerName: 'Teacher',
      flex: 1.25,
      minWidth: 150,
    },
    {
      field: 'qualification',
      headerName: 'Qualification',
      flex: 1.2,
      minWidth: 145,
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 0.9,
      minWidth: 110,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 190,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 125,
    },
    {
      field: 'account_status',
      headerName: 'Status',
      flex: 0.75,
      minWidth: 100,
      sortable: false,
      cellRenderer: StatusBadgeCellRendererComponent,
      cellRendererParams: { colorMap: ACCOUNT_STATUS_COLORS, showDot: false },
      valueFormatter: (params) => this.accountStatusLabel(params.value),
    },
    {
      colId: 'actions',
      headerName: '',
      width: 58,
      sortable: false,
      resizable: false,
      pinned: 'right',
      cellRenderer: GridIconsComponent,
      cellRendererParams: {
        onView: (event: CustomCellEvent<TeacherListItem>) => this.onViewTeacher(event.rowData),
        onEdit: (event: CustomCellEvent<TeacherListItem>) => this.onEditTeacher(event.rowData),
      } as Partial<ICustomCellRenderer<TeacherListItem>>,
    },
  ];

  isSidenavOpen = false;
  formMode: TeacherFormMode = 'create';
  selectedTeacher: TeacherListItem | null = null;
  private readonly searchChanges = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private listRequest?: Subscription;
  private subjectRequest?: Subscription;
  private exportRequest?: Subscription;

  constructor(
    private readonly teachersService: AdminTeachersService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.searchChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => {
        this.searchTerm = search;
        this.page = 1;
        this.loadTeachers();
      });
    this.loadTeachers();
    this.loadAvailableSubjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.listRequest?.unsubscribe();
    this.subjectRequest?.unsubscribe();
    this.exportRequest?.unsubscribe();
  }

  loadTeachers(): void {
    this.listRequest?.unsubscribe();
    this.isLoading = true;
    this.hasError = false;

    this.listRequest = this.teachersService.getAllTeachers({
      page: this.page,
      limit: this.limit,
      ...this.activeFilters,
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.teachers = res.data.items;
        this.schoolName = res.data.items.find((teacher) => teacher.school_name)?.school_name ?? this.schoolName;
        this.page = res.data.page;
        this.limit = res.data.limit;
        this.total = res.data.total;
        this.totalPages = res.data.totalPages;
        this.refreshStatCards(res.data.summary);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = this.errorMessageFor(err);
        this.teachers = [];
        this.total = 0;
        this.totalPages = 0;
        this.clearStatCards();
        this.toaster.error(this.errorMessage);
        this.cdr.markForCheck();
      },
    });
  }

  get activeFilters(): { search?: string; subject?: string; status?: TeacherAccountStatus } {
    return {
      search: this.searchTerm.trim() || undefined,
      subject: this.subjectFilter === 'all' ? undefined : this.subjectFilter,
      status: this.statusFilter === 'all' ? undefined : this.statusFilter,
    };
  }

  get firstResult(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get lastResult(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  get visiblePages(): number[] {
    const count = Math.min(3, this.totalPages);
    const start = Math.max(1, Math.min(this.page - 1, this.totalPages - count + 1));
    return Array.from({ length: count }, (_, index) => start + index);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchChanges.next(value);
  }

  onSubjectFilterChange(value: string): void {
    this.subjectFilter = value;
    this.page = 1;
    this.loadTeachers();
  }

  onStatusFilterChange(value: TeacherAccountStatus | 'all'): void {
    this.statusFilter = value;
    this.page = 1;
    this.loadTeachers();
  }

  onLimitChange(event: Event): void {
    this.limit = Number((event.target as HTMLSelectElement).value);
    this.page = 1;
    this.loadTeachers();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page || this.isLoading) return;
    this.page = page;
    this.loadTeachers();
  }

  openAddTeacher(): void {
    void this.router.navigate(['/admin/teachers/add']);
  }

  onViewTeacher(teacher: TeacherListItem): void {
    this.formMode = 'view';
    this.selectedTeacher = teacher;
    this.isSidenavOpen = true;
  }

  onEditTeacher(teacher: TeacherListItem): void {
    this.formMode = 'edit';
    this.selectedTeacher = teacher;
    this.isSidenavOpen = true;
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }

  exportTeachers(): void {
    if (this.isExporting) return;
    this.exportRequest?.unsubscribe();
    this.isExporting = true;
    this.cdr.markForCheck();
    this.exportRequest = this.teachersService.getAllMatchingTeachers(this.activeFilters).subscribe({
      next: (rows) => {
        downloadCsv('teachers.csv', [
          { header: 'Teacher', value: (teacher) => teacher.teacher_name },
          { header: 'Qualification', value: (teacher) => teacher.qualification },
          { header: 'Subject', value: (teacher) => teacher.subject },
          { header: 'Email', value: (teacher) => teacher.email },
          { header: 'Phone', value: (teacher) => teacher.phone },
          { header: 'Status', value: (teacher) => this.accountStatusLabel(teacher.account_status) },
        ], rows);
        this.isExporting = false;
        this.toaster.success(`${rows.length} teacher${rows.length === 1 ? '' : 's'} exported.`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isExporting = false;
        this.toaster.error(this.errorMessageFor(err));
        this.cdr.markForCheck();
      },
    });
  }

  accountStatusLabel(status: TeacherAccountStatus): string {
    return status === 'active' ? 'Active' : 'Inactive';
  }

  onTeacherSaved(): void {
    this.closeSidenav();
    this.loadTeachers();
  }

  private loadAvailableSubjects(): void {
    this.subjectRequest?.unsubscribe();
    this.subjectRequest = this.teachersService.getAllMatchingTeachers().subscribe({
      next: (rows) => {
        this.availableSubjects = [...new Set(rows.map((teacher) => teacher.subject).filter(Boolean))]
          .sort((left, right) => left.localeCompare(right));
        this.schoolName = rows.find((teacher) => teacher.school_name)?.school_name ?? this.schoolName;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toaster.error(`Unable to load teacher subjects: ${this.errorMessageFor(err)}`);
      },
    });
  }

  private errorMessageFor(error: unknown): string {
    return error instanceof InvalidTeacherListResponseError
      ? error.message
      : getHttpErrorMessage(error);
  }

  private refreshStatCards(summary: TeacherPage['summary']): void {
    this.statCards = this.statCards.map((card) => {
      if (card.label === 'Total Teachers') return { ...card, value: summary.totalTeachers };
      if (card.label === 'Active') return { ...card, value: summary.activeTeachers };
      if (card.label === 'Inactive') return { ...card, value: summary.inactiveTeachers };
      return card;
    });
  }

  private clearStatCards(): void {
    this.statCards = this.statCards.map((card) => ({ ...card, value: '—' }));
  }
}