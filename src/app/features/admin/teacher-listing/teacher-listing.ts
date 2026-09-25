import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { ButtonComponent } from '@shared/components/button/button.component';
// ⚠️ VERIFY these two import paths against the actual project structure
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { AgGridTableComponent } from '@app/shared/components/ag-grid-table/ag-grid-table';
import { GridIconsComponent } from '@app/shared/components/ag-Grid/grid-icons/grid-icons';
import { StatusBadgeCellRendererComponent } from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { AddTeacherComponent, TeacherFormMode } from '../add-teacher/add-teacher';
import { AdminTeachersService } from '@app/core/services/admin-teachers.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import { TeacherListItem, TeacherStatus } from '@app/core/models/teacher.model';

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
    LoaderComponent,
  ],
  templateUrl: './teacher-listing.html',
  styleUrl: './teacher-listing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherListingComponent implements OnInit {
  statCards: StatCardData[] = [
    { icon: '/svg/users-plus.svg', label: 'Total Teachers', value: 0, variant: 'purple' },
    { icon: '/svg/users-plus.svg', label: 'Active', value: 0, variant: 'success' },
    { icon: '/svg/complaint.svg', label: 'On Leave', value: 0, variant: 'warning' },
  ];

  teachers: TeacherListItem[] = [];
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
      cellRendererParams: {
        // ⚠️ assumed input name — confirm against StatusBadgeCellRendererComponent
        colorMap: { active: 'success', on_leave: 'warning' },
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

  constructor(
    private readonly teachersService: AdminTeachersService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.isLoading = true;
    this.hasError = false;

    this.teachersService.getAllTeachers().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.teachers = res.data;
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

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (t) =>
          t.teacher_name.toLowerCase().includes(term) ||
          t.school_name.toLowerCase().includes(term) ||
          t.specialty.toLowerCase().includes(term),
      );
    }

    return result;
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  onStatusFilterChange(value: TeacherStatus | 'all'): void {
    this.statusFilter = value;
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
    const total = this.teachers.length;
    const active = this.teachers.filter((t) => t.status === 'active').length;
    const onLeave = this.teachers.filter((t) => t.status === 'on_leave').length;

    this.statCards = this.statCards.map((card) => {
      if (card.label === 'Total Teachers') return { ...card, value: total };
      if (card.label === 'Active') return { ...card, value: active };
      if (card.label === 'On Leave') return { ...card, value: onLeave };
      return card;
    });
  }
}