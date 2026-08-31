import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import { StatCardComponent } from '@app/shared/components/stat-card/stat-card';
import { StatCardData } from '@app/shared/components/stat-card/stat-card-model';
import { AgGridTableComponent } from '@app/shared/components/ag-grid-table/ag-grid-table';
import { GridIconsComponent } from '@app/shared/components/ag-Grid/grid-icons/grid-icons';
import { StatusBadgeCellRendererComponent } from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';
import { SuperAdminService } from '@app/core/services/super-admin.service';
import { ToastService } from '@app/core/services/toast.service';
import { DemoRequest } from '@app/core/models/demo-request.model';


@Component({
  selector: 'app-demo-requests',
  standalone: true,
  imports: [CommonModule, StatCardComponent, AgGridTableComponent],
  templateUrl: './demo-requests.html',
  styleUrl: './demo-requests.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoRequestsComponent implements OnInit {
  statCards: StatCardData[] = [
    { icon: '/svg/user-plus.svg', label: 'New Requests', value: 0, variant: 'info' },
    { icon: '/svg/user-plus.svg', label: 'Contacted', value: 0, variant: 'warning' },
    { icon: '/svg/user-plus.svg', label: 'Converted', value: 0, variant: 'success' },
  ];

  requests: DemoRequest[] = [];
  isLoading = false;

  columnDefs: ColDef<DemoRequest>[] = [
    { field: 'full_name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'school_name', headerName: 'School', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 140 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 130,
      sortable: false,
      cellRenderer: StatusBadgeCellRendererComponent,
    },
    { field: 'created_at', headerName: 'Received', flex: 1, minWidth: 130 },
    {
      colId: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      resizable: false,
      pinned: 'right',
      cellRenderer: GridIconsComponent,
      // Note: GridIconsComponent's action props keep the reference's exact
      // names (this is a faithful port) — `rejectTimeOff` is reused here to
      // mean "reject this demo request", not literal time-off. Kept as-is
      // rather than renamed, per "same to same" reuse of the component.
      cellRendererParams: (params: { data: DemoRequest }): Partial<ICustomCellRenderer<DemoRequest>> => ({
        onView: (e: CustomCellEvent<DemoRequest>) => this.onView(e.rowData),
        ...(params.data.status !== 'converted' && {
          onApprove: (e: CustomCellEvent<DemoRequest>) => this.onMarkConverted(e.rowData),
        }),
        ...(params.data.status === 'new' && {
          onEdit: (e: CustomCellEvent<DemoRequest>) => this.onMarkContacted(e.rowData),
        }),
        ...(params.data.status !== 'rejected' &&
          params.data.status !== 'converted' && {
            rejectTimeOff: (e: CustomCellEvent<DemoRequest>) => this.onReject(e.rowData),
          }),
      }),
    },
  ];

  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.superAdminService.getDemoRequests().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.requests = res.data;
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

  onView(row: DemoRequest): void {
    this.toaster.success(`${row.full_name} — ${row.message ?? 'No message'}`);
  }

  onMarkContacted(row: DemoRequest): void {
    this.updateStatus(row, 'contacted');
  }

  onMarkConverted(row: DemoRequest): void {
    this.updateStatus(row, 'converted');
  }

  onReject(row: DemoRequest): void {
    this.updateStatus(row, 'rejected');
  }

  private updateStatus(row: DemoRequest, status: DemoRequest['status']): void {
    this.superAdminService.updateDemoRequestStatus(row.id,status).subscribe({
      next: () => {
        this.toaster.success(`${row.school_name} marked as ${status}`);
        this.loadRequests();
      },
      error: (err) => this.toaster.error(err),
    });
  }

  private refreshStatCards(): void {
    const newCount = this.statCards.find((c) => c.label === 'New Requests');
    const contacted = this.statCards.find((c) => c.label === 'Contacted');
    const converted = this.statCards.find((c) => c.label === 'Converted');

    if (newCount) newCount.value = this.requests.filter((r) => r.status === 'new').length;
    if (contacted) contacted.value = this.requests.filter((r) => r.status === 'contacted').length;
    if (converted) converted.value = this.requests.filter((r) => r.status === 'converted').length;
  }
}