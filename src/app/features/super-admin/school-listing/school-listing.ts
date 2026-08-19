import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DataGridComponent } from '@app/shared/components/ag-Grid/data-grid.component';
import { StatusBadgeCellRendererComponent } from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { RowActionsCellRendererComponent, RowActionsParams } from '@app/shared/components/data-grid/rowaction';
import { School, SchoolStatus } from '../../../core/models/school.model';

@Component({
  selector: 'app-school-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatCardComponent, ButtonComponent, DataGridComponent],
  templateUrl: './school-listing.html',
  styleUrl: './school-listing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolsListingComponent {
  @ViewChild('dataGrid') private dataGrid?: DataGridComponent<School>;

  // TODO: replace with data from a SchoolsService (API call) once backend endpoint is ready
  statCards: StatCardData[] = [
    { icon: '/svg/school.svg', label: 'Total Schools', value: 24, variant: 'purple' },
    { icon: '/svg/school.svg', label: 'Active Schools', value: 20, variant: 'success' },
    { icon: '/svg/complaint.svg', label: 'Pending Requests', value: 4, variant: 'warning' },
  ];

  // Dummy data shaped exactly like the future API response — swapping this
  // array for an HTTP call later requires no other changes on this screen.
  schools: School[] = [
    { id: 1, school_id: 'TH-001', school_name: 'Crescent International Academy', owner_name: 'Sarah Jenkins', email: 'sarah@crescent.edu', phone: '+923001234567', status: 'active', created_at: '2023-10-12' },
    { id: 2, school_id: 'TH-002', school_name: 'Oakridge Public School', owner_name: 'Michael Chen', email: 'michael@oakridge.edu', phone: '+923001234568', status: 'active', created_at: '2023-10-15' },
    { id: 3, school_id: 'TH-003', school_name: 'Pinnacle Excellence High', owner_name: 'David Osei', email: 'david@pinnacle.edu', phone: '+923001234569', status: 'pending', created_at: '2023-11-02' },
    { id: 4, school_id: 'TH-004', school_name: 'Riverdale Elementary', owner_name: 'Emma Watson', email: 'emma@riverdale.edu', phone: '+923001234570', status: 'active', created_at: '2023-11-18' },
    { id: 5, school_id: 'TH-005', school_name: 'Summit Preparatory', owner_name: 'James Rodriguez', email: 'james@summit.edu', phone: '+923001234571', status: 'inactive', created_at: '2023-12-05' },
    { id: 6, school_id: 'TH-006', school_name: 'Global Vision School', owner_name: 'Aisha Patel', email: 'aisha@globalvision.edu', phone: '+923001234572', status: 'active', created_at: '2024-01-10' },
    { id: 7, school_id: 'TH-007', school_name: 'Harmony Montessori', owner_name: 'Robert Fox', email: 'robert@harmony.edu', phone: '+923001234573', status: 'pending', created_at: '2024-01-22' },
    { id: 8, school_id: 'TH-008', school_name: 'Beacon High Institute', owner_name: 'Linda Smith', email: 'linda@beacon.edu', phone: '+923001234574', status: 'active', created_at: '2024-02-01' },
  ];

  columnDefs: ColDef<School>[] = [
    { field: 'school_name', headerName: 'School Name', flex: 2, minWidth: 220 },
    { field: 'school_id', headerName: 'School ID', flex: 1, minWidth: 110 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      sortable: false, // categorical — use the status dropdown filter above instead
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
      pinned: 'right', // stays reachable even when the grid scrolls horizontally
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
}