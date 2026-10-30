import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DataGridComponent } from '@app/shared/components/ag-Grid/data-grid.component';
import { StatusBadgeCellRendererComponent, StatusBadgeParams } from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { RowActionsCellRendererComponent, RowActionsParams } from '@app/shared/components/data-grid/rowaction';
import { School, SchoolStatus } from '../../../core/models/school.model';
import { AddAdminSchoolComponent } from '../add-school/add-admin-school';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { SuperAdminService, SchoolListItem, CreateSchoolData } from '../../../core/services/super-admin.service';
import { ToastService } from '@app/core/services/toast.service';
import { ApiResponse } from '@app/core/models/api-response.model';
import { PlanBadgeCellRendererComponent } from '@app/shared/components/data-grid/plan-badge-cell-renderer.component';
import { AvatarNameCellRendererComponent } from '@app/shared/components/data-grid/avatar-name-cell-renderer.component';
import { schoolRouteSlug } from '@app/core/utils/school-route.util';
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
  {
    field: 'school_name',
    headerName: 'School Name',
    flex: 2,
    minWidth: 240,
    cellRenderer: AvatarNameCellRendererComponent,
  },
  { field: 'school_id', headerName: 'School ID', flex: 1.5, minWidth: 160 },
  { field: 'city', headerName: 'City', flex: 1, minWidth: 110 },
  {
    field: 'plan',
    headerName: 'Plan',
    flex: 1,
    minWidth: 120,
    cellRenderer: PlanBadgeCellRendererComponent,
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    minWidth: 120,
    sortable: false,
    cellRenderer: StatusBadgeCellRendererComponent,
    cellRendererParams: {
      colorMap: {
        pending: { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
        approved: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
        rejected: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
        inactive: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' },
        closed: { bg: '#e0e7ff', text: '#4338ca', dot: '#6366f1' },
      },
    } as Partial<StatusBadgeParams>,
  },
  { field: 'owner_name', headerName: 'Owner', flex: 1, minWidth: 150 },
  
    {
      colId: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      resizable: false,
      pinned: 'right',
      cellRenderer: RowActionsCellRendererComponent,
      cellRendererParams: {
        viewLabel: 'View Details',
        onView: (row: School) => {
          const slug = schoolRouteSlug(row, this.schools);
          void this.router.navigate(['/super-admin/schools', slug], {
            state: { schoolId: row.id, schoolSlug: slug },
          });
        },
        onEdit: (row: School) => {
          const slug = schoolRouteSlug(row, this.schools);
          void this.router.navigate(['/super-admin/schools', slug, 'edit'], {
            state: { schoolId: row.id, schoolSlug: slug },
          });
        },
        onDelete: (row: School) => console.log('delete', row),
      } as Partial<RowActionsParams<School>>,
    },
  ];

  searchTerm = '';
  statusFilter: SchoolStatus | 'all' = 'all';
  readonly statusOptions: SchoolStatus[] = [
    'pending',
    'approved',
    'rejected',
    'inactive',
    'closed',
  ];
  isAddSchoolOpen = false;

  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
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
    city: item.city ?? '',
    plan: item.plan ?? null,
    owner_name: item.owner_name ?? '',
    email: item.owner_email ?? '',
    phone: item.owner_phone ?? '',
    status: item.status,
    created_at: item.created_at,
  };
}

 private refreshStatCards(): void {
  const total = this.schools.length;
  const active = this.schools.filter((s) => s.status === 'approved').length;
  const pending = this.schools.filter((s) => s.status === 'pending').length;

  this.statCards = this.statCards.map((card) => {
    if (card.label === 'Total Schools') return { ...card, value: total };
    if (card.label === 'Active Schools') return { ...card, value: active };
    if (card.label === 'Pending Requests') return { ...card, value: pending };
    return card;
  });
}

}