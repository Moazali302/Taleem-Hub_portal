import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DataGridComponent } from '@app/shared/components/ag-Grid/data-grid.component';
import { StatusBadgeCellRendererComponent } from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { RowActionsCellRendererComponent, RowActionsParams } from '@app/shared/components/data-grid/rowaction';
import { School, SchoolStatus } from '../../../core/models/school.model';
import { AddAdminSchoolComponent } from '../add-school/add-admin-school';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { SuperAdminService, SchoolListItem, CreateSchoolData } from '../../../core/services/super-admin.service';
import { ToastService } from '@app/core/services/toast.service';
import { ApiResponse } from '@app/core/models/api-response.model';
@Component({
  selector: 'app-school-listing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCardComponent,
    ButtonComponent,
    DataGridComponent,
    AddAdminSchoolComponent,
    SidenavComponent,
  ],
  templateUrl: './school-listing.html',
  styleUrl: './school-listing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolsListingComponent implements OnInit {
  @ViewChild('dataGrid') private dataGrid?: DataGridComponent<School>;

  statCards: StatCardData[] = [
    { icon: '/svg/school.svg', label: 'Total Schools', value: 0, variant: 'purple' },
    { icon: '/svg/school.svg', label: 'Active Schools', value: 0, variant: 'success' },
    { icon: '/svg/complaint.svg', label: 'Pending Requests', value: 0, variant: 'warning' },
  ];

  schools: School[] = [];
  isLoading = false;

  columnDefs: ColDef<School>[] = [
    { field: 'school_name', headerName: 'School Name', flex: 2, minWidth: 220 },
    { field: 'school_id', headerName: 'School ID', flex: 1, minWidth: 110 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      sortable: false,
      cellRenderer: StatusBadgeCellRendererComponent,
    },
    { field: 'owner_name', headerName: 'Owner Name', flex: 1, minWidth: 160 },
    { field: 'created_at',
       headerName: 'Created Date',
        flex: 1, 
        minWidth: 140,
        valueFormatter: (params) =>
       new Date(params.value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
       },
    {
      colId: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      resizable: false,
      pinned: 'right',
      cellRenderer: RowActionsCellRendererComponent,
      cellRendererParams: {
        onView: (row: School) => console.log('view', row),
        onEdit: (row: School) => console.log('edit', row),
        onDelete: (row: School) => console.log('delete', row),
      } as Partial<RowActionsParams<School>>,
    },
  ];

  searchTerm = '';
  statusFilter: SchoolStatus | 'all' = 'all';
  isAddSchoolOpen = false;

  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools(): void {
    this.isLoading = true;

    this.superAdminService.getAllSchools().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.schools = res.data.map((s: SchoolListItem) => this.toSchoolRow(s));
        this.refreshStatCards();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.toaster.error(err);
        this.cdr.markForCheck();
      },
    });
  }

  get filteredSchools(): School[] {
    if (this.statusFilter === 'all') return this.schools;
    return this.schools.filter((school) => school.status === this.statusFilter);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  onStatusFilterChange(value: SchoolStatus | 'all'): void {
    this.statusFilter = value;
  }

  onExport(): void {
    this.dataGrid?.exportCsv('schools.csv');
  }

  openAddSchool(): void {
    this.isAddSchoolOpen = true;
  }

  closeAddSchool(): void {
    this.isAddSchoolOpen = false;
  }

  onSchoolAdded(_res: ApiResponse<CreateSchoolData>): void {
    this.closeAddSchool();
    this.loadSchools();
  }

  private toSchoolRow(item: SchoolListItem): School {
    return {
      id: item.id,
      school_id: item.school_id,
      school_name: item.school_name,
      owner_name: item.owner_name ?? '',
      email: item.owner_email ?? '',
      phone: item.owner_phone ?? '',
      status: this.normalizeStatus(item.status),
      created_at: item.created_at,
      // package: item.package ?? null,
    };
  }

 private refreshStatCards(): void {
  const total = this.schools.length;
  const active = this.schools.filter((s) => s.status === 'active').length;
  const pending = this.schools.filter((s) => s.status === 'pending').length;

  this.statCards = this.statCards.map((card) => {
    if (card.label === 'Total Schools') return { ...card, value: total };
    if (card.label === 'Active Schools') return { ...card, value: active };
    if (card.label === 'Pending Requests') return { ...card, value: pending };
    return card;
  });
}

  private normalizeStatus(status: string): SchoolStatus {
    if (status === 'approved') return 'active';
    return status as SchoolStatus;
  }
}