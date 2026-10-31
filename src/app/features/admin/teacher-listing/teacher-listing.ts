import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { ButtonComponent } from '@shared/components/button/button.component';
// ⚠️ VERIFY these two import paths against the actual project structure
import { AgGridTableComponent } from '@app/shared/components/ag-grid-table/ag-grid-table';
import { GridIconsComponent } from '@app/shared/components/ag-Grid/grid-icons/grid-icons';
import {
  StatusBadgeCellRendererComponent,
  StatusBadgeColor,
} from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { AddTeacherComponent, TeacherFormMode } from '../add-teacher/add-teacher';
import { AdminTeachersService } from '@app/core/services/admin-teachers.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import { TeacherListItem, TeacherStatus } from '@app/core/models/teacher.model';

const TEACHER_STATUS_COLORS: Record<string, StatusBadgeColor> = {
  active: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  on_leave: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
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
  statCards: StatCardData[] = [
    { icon: '/svg/users-plus.svg', label: 'Total Teachers', value: 0, variant: 'purple' },
    { icon: '/svg/users-plus.svg', label: 'Active (current page)', value: 0, variant: 'success' },
    { icon: '/svg/complaint.svg', label: 'On Leave (current page)', value: 0, variant: 'warning' },
  ];

  teachers: TeacherListItem[] = [];
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  columnDefs: ColDef<TeacherListItem>[] = [
    { field: 'school_id', headerName: 'School ID', flex: 1, minWidth: 110 },
    { field: 'school_name', headerName: 'School Name', flex: 1.5, minWidth: 180 },
    { field: 'teacher_name', headerName: 'Teacher Name', flex: 1.5, minWidth: 180 },
    { field: 'specialty', headerName: 'Specialty', flex: 1, minWidth: 140 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      sortable: false,
      cellRenderer: StatusBadgeCellRendererComponent,
      valueFormatter: (params) => params.value === 'on_leave' ? 'On Leave' : 'Active',
      cellRendererParams: {
        colorMap: TEACHER_STATUS_COLORS,
      },
    },
    {
      colId: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      resizable: false,
      pinned: 'right',
      cellRenderer: GridIconsComponent,
      cellRendererParams: {
        onView: (e: CustomCellEvent) => this.onViewTeacher(e.rowData as TeacherListItem),
        onEdit: (e: CustomCellEvent) => this.onEditTeacher(e.rowData as TeacherListItem),
      } as Partial<ICustomCellRenderer>,
    },
  ];

  searchTerm = '';
  statusFilter: TeacherStatus | 'all' = 'all';

  isSidenavOpen = false;
  formMode: TeacherFormMode = 'create';
  selectedTeacher: TeacherListItem | null = null;
  private readonly searchChanges = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private listRequest?: Subscription;

  constructor(
    private readonly teachersService: AdminTeachersService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.listRequest?.unsubscribe();
  }

  loadTeachers(): void {
    this.listRequest?.unsubscribe();
    this.isLoading = true;
    this.hasError = false;

    this.listRequest = this.teachersService.getAllTeachers({
      page: this.page,
      limit: this.limit,
      search: this.searchTerm.trim() || undefined,
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.teachers = res.data.items;
        this.page = res.data.page;
        this.limit = res.data.limit;
        this.total = res.data.total;
        this.totalPages = res.data.totalPages;
        this.refreshStatCards();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = getHttpErrorMessage(err);
        this.cdr.markForCheck();
      },
    });
  }

  get filteredTeachers(): TeacherListItem[] {
    let result = this.teachers;

    if (this.statusFilter !== 'all') {
      result = result.filter((t) => t.status === this.statusFilter);
    }

    return result;
  }

  get firstResult(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get lastResult(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchChanges.next(value.trim());
  }

  onStatusFilterChange(value: TeacherStatus | 'all'): void {
    this.statusFilter = value;
  }

  onLimitChange(value: string): void {
    this.limit = Number(value);
    this.page = 1;
    this.loadTeachers();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page || this.isLoading) return;
    this.page = page;
    this.loadTeachers();
  }

  openAddTeacher(): void {
    this.formMode = 'create';
    this.selectedTeacher = null;
    this.isSidenavOpen = true;
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

  onTeacherSaved(): void {
    this.closeSidenav();
    this.loadTeachers();
  }

  private refreshStatCards(): void {
    const total = this.total;
    const active = this.teachers.filter((t) => t.status === 'active').length;
    const onLeave = this.teachers.filter((t) => t.status === 'on_leave').length;

    this.statCards = this.statCards.map((card) => {
      if (card.label === 'Total Teachers') return { ...card, value: total };
      if (card.label === 'Active (current page)') return { ...card, value: active };
      if (card.label === 'On Leave (current page)') return { ...card, value: onLeave };
      return card;
    });
  }
}