import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
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
import { CreateSchoolResponse } from '../../../core/services/super-admin.service';

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
export class SchoolsListingComponent {
  @ViewChild('dataGrid') private dataGrid?: DataGridComponent<School>;

  // TODO: replace with data from a real "list schools" API call once backend endpoint is ready
  statCards: StatCardData[] = [
    { icon: '/svg/school.svg', label: 'Total Schools', value: 24, variant: 'purple' },
    { icon: '/svg/school.svg', label: 'Active Schools', value: 20, variant: 'success' },
    { icon: '/svg/complaint.svg', label: 'Pending Requests', value: 4, variant: 'warning' },
  ];

  schools: School[] = [];

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
    { field: 'created_at', headerName: 'Created Date', flex: 1, minWidth: 140 },
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

  /** Receives the server-confirmed school record after AddAdminSchoolComponent's own API call succeeds. */
  onSchoolAdded(res: CreateSchoolResponse): void {
    const newSchool: School = {
      id: res.data.school.id,
      school_id: res.data.school.school_id,
      school_name: res.data.school.school_name,
      owner_name: res.data.admin.name,
      email: res.data.admin.email,
      phone: res.data.admin.phone,
      status: res.data.school.status as SchoolStatus,
      created_at: res.data.school.created_at,
    };

    this.schools = [newSchool, ...this.schools];
    this.refreshStatCardsLocally(newSchool.status);
    this.closeAddSchool();
  }

  private refreshStatCardsLocally(status: SchoolStatus): void {
    const total = this.statCards.find((c) => c.label === 'Total Schools');
    if (total) total.value = (total.value as number) + 1;

    if (status === 'active') {
      const active = this.statCards.find((c) => c.label === 'Active Schools');
      if (active) active.value = (active.value as number) + 1;
    } else if (status === 'pending') {
      const pending = this.statCards.find((c) => c.label === 'Pending Requests');
      if (pending) pending.value = (pending.value as number) + 1;
    }
  }
}