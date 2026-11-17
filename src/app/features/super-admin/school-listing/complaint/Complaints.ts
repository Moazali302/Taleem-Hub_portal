import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AgGridTableComponent, COMPACT_ROW_HEIGHT } from '@app/shared/components/ag-grid-table/ag-grid-table';
import { GridIconsComponent } from '@app/shared/components/ag-Grid/grid-icons/grid-icons';
import {
  StatusBadgeColor,
  StatusBadgeCellRendererComponent,
} from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { GridToolbarComponent } from '@app/shared/grid-tool-bar/grid-toolbar';
import { PageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';
import {
  COMPLAINT_PRIORITY_OPTIONS,
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_STATUS_OPTIONS,
  Complaint,
  ComplaintListQuery,
  ComplaintPriority,
  ComplaintSortBy,
  ComplaintSortOrder,
  ComplaintStatus,
  UpdateComplaintPayload,
} from '@app/core/models/Complaint.model';
import { ComplaintsService } from '@app/core/services/complaint.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import { downloadCsv } from '@app/shared/utlis/csv-export.util';

const PRIORITY_COLORS: Record<string, StatusBadgeColor> = {
  LOW: { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
  MEDIUM: { bg: '#e0e7fb', text: '#17306f', dot: '#17306f' },
  HIGH: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  CRITICAL: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
};

const STATUS_COLORS: Record<string, StatusBadgeColor> = {
  OPEN: { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
  IN_PROGRESS: { bg: '#e0e7fb', text: '#17306f', dot: '#17306f' },
  RESOLVED: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  CLOSED: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' },
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    GridToolbarComponent,
    AgGridTableComponent,
    SidenavComponent,
  ],
  templateUrl: './Complaints.html',
  styleUrl: './Complaints.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintsComponent implements OnInit, OnDestroy {
  readonly rowHeight = COMPACT_ROW_HEIGHT;
  readonly priorityOptions = COMPLAINT_PRIORITY_OPTIONS.map((option) => ({ ...option }));
  readonly statusOptions = COMPLAINT_STATUS_OPTIONS;
  readonly statusLabels = COMPLAINT_STATUS_LABELS;
  readonly pageSizeOptions = [10, 20, 50];
  readonly sortOptions: { value: ComplaintSortBy; label: string }[] = [
    { value: 'created_at', label: 'Created date' },
    { value: 'updated_at', label: 'Updated date' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
  ];

  complaints: Complaint[] = [];
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  searchTerm = '';
  priorityFilter: ComplaintPriority | '' = '';
  statusFilter: ComplaintStatus | '' = '';
  sortBy: ComplaintSortBy = 'created_at';
  sortOrder: ComplaintSortOrder = 'DESC';

  isSidenavOpen = false;
  selectedComplaint: Complaint | null = null;
  isDetailLoading = false;
  detailError = '';
  isSaving = false;

  readonly form = new FormGroup({
    status: new FormControl<ComplaintStatus>('OPEN', { nonNullable: true }),
    remarks: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(5000)],
    }),
  });

  private readonly searchChanges = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private listRequest?: Subscription;
  private detailRequest?: Subscription;
  private saveRequest?: Subscription;
  private detailTarget: Complaint | null = null;

  readonly columnDefs: ColDef<Complaint>[] = [
    { field: 'id', headerName: 'ID', minWidth: 250, flex: 1.5, sortable: false },
    {
      headerName: 'School',
      minWidth: 150,
      flex: 1,
      sortable: false,
      valueGetter: (params) => params.data?.school?.name ?? '—',
    },
    { field: 'subject', headerName: 'Subject', minWidth: 190, flex: 1.5, sortable: false },
    {
      headerName: 'Raised By',
      minWidth: 140,
      flex: 1,
      sortable: false,
      valueGetter: (params) => params.data?.raisedBy?.name ?? '—',
    },
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 120,
      sortable: false,
      cellRenderer: StatusBadgeCellRendererComponent,
      cellRendererParams: { colorMap: PRIORITY_COLORS, showDot: false },
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 130,
      sortable: false,
      valueFormatter: (params) => this.statusLabel(params.value as ComplaintStatus),
      cellRenderer: StatusBadgeCellRendererComponent,
      cellRendererParams: { colorMap: STATUS_COLORS, showDot: false },
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      minWidth: 170,
      flex: 1,
      sortable: false,
      valueFormatter: (params) => params.value ? this.formatDateTime(params.value) : '—',
    },
    {
      colId: 'actions',
      headerName: 'Action',
      width: 88,
      sortable: false,
      resizable: false,
      pinned: 'right',
      cellRenderer: GridIconsComponent,
      cellRendererParams: {
        onEdit: (event: CustomCellEvent<Complaint>) => this.openEdit(event.rowData),
      } as Partial<ICustomCellRenderer<Complaint>>,
    },
  ];

  constructor(
    private readonly complaintsService: ComplaintsService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.searchChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => {
        this.searchTerm = search;
        this.page = 1;
        this.load();
      });
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.listRequest?.unsubscribe();
    this.detailRequest?.unsubscribe();
    this.saveRequest?.unsubscribe();
  }

  load(): void {
    this.listRequest?.unsubscribe();
    this.isLoading = true;
    this.hasError = false;

    this.listRequest = this.complaintsService.getComplaints(this.listQuery()).subscribe({
      next: (response) => {
        this.complaints = response.data.items;
        this.total = response.data.total;
        this.page = response.data.page;
        this.limit = response.data.limit;
        this.totalPages = response.data.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = getHttpErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchChanges.next(value.trim());
  }

  onPriorityFilterChange(value: string): void {
    this.priorityFilter = value === 'all' ? '' : value as ComplaintPriority;
    this.resetAndLoad();
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter = value as ComplaintStatus | '';
    this.resetAndLoad();
  }

  onSortByChange(value: string): void {
    this.sortBy = value as ComplaintSortBy;
    this.resetAndLoad();
  }

  onSortOrderChange(value: string): void {
    this.sortOrder = value as ComplaintSortOrder;
    this.resetAndLoad();
  }

  onLimitChange(value: string): void {
    this.limit = Number(value);
    this.page = 1;
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page || this.isLoading) {
      return;
    }

    this.page = page;
    this.load();
  }

  exportCsv(): void {
    downloadCsv('complaints.csv', [
      { header: 'ID', value: (row) => row.id },
      { header: 'School', value: (row) => row.school?.name ?? '' },
      { header: 'Subject', value: (row) => row.subject },
      { header: 'Raised By', value: (row) => row.raisedBy?.name ?? '' },
      { header: 'Priority', value: (row) => row.priority },
      { header: 'Status', value: (row) => this.statusLabel(row.status) },
      { header: 'Created At', value: (row) => row.createdAt },
    ], this.complaints);
  }

  openEdit(complaint: Complaint): void {
    this.detailRequest?.unsubscribe();
    this.detailTarget = complaint;
    this.selectedComplaint = null;
    this.detailError = '';
    this.isDetailLoading = true;
    this.isSidenavOpen = true;
    this.form.disable({ emitEvent: false });
    this.cdr.markForCheck();

    this.detailRequest = this.complaintsService.getComplaint(complaint.id).subscribe({
      next: (response) => {
        this.selectedComplaint = response.data;
        this.form.reset({
          status: response.data.status,
          remarks: response.data.remarks ?? '',
        });
        this.form.enable({ emitEvent: false });
        this.isDetailLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.isDetailLoading = false;
        this.detailError = getHttpErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  retryDetail(): void {
    if (this.detailTarget) {
      this.openEdit(this.detailTarget);
    }
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
    this.selectedComplaint = null;
    this.detailTarget = null;
    this.detailError = '';
    this.detailRequest?.unsubscribe();
  }

  saveChanges(): void {
    if (!this.selectedComplaint || this.isSaving || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const status = this.form.controls.status.value;
    const remarks = this.form.controls.remarks.value.trim();
    const previousRemarks = this.selectedComplaint.remarks ?? '';
    const payload: UpdateComplaintPayload = {};

    if (status !== this.selectedComplaint.status) {
      payload.status = status;
    }
    if (remarks !== previousRemarks) {
      if (!remarks) {
        this.form.controls.remarks.setErrors({ blank: true });
        this.cdr.markForCheck();
        return;
      }
      payload.remarks = remarks;
    }

    if (!Object.keys(payload).length) {
      this.toaster.show('No changes to save.', 'info');
      return;
    }

    this.isSaving = true;
    this.form.disable({ emitEvent: false });
    this.saveRequest = this.complaintsService
      .updateComplaint(this.selectedComplaint.id, payload)
      .subscribe({
        next: (response) => {
          this.selectedComplaint = response.data;
          this.form.reset({
            status: response.data.status,
            remarks: response.data.remarks ?? '',
          });
          this.form.enable({ emitEvent: false });
          this.isSaving = false;
          this.toaster.success('Complaint updated successfully.');
          this.load();
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.form.enable({ emitEvent: false });
          this.isSaving = false;
          this.toaster.error(getHttpErrorMessage(error));
          this.cdr.markForCheck();
        },
      });
  }

  get firstResult(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get lastResult(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  statusLabel(status: ComplaintStatus): string {
    return COMPLAINT_STATUS_LABELS[status] ?? status;
  }

  formatDateTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
  }

  private listQuery(): ComplaintListQuery {
    return {
      page: this.page,
      limit: this.limit,
      search: this.searchTerm.trim() || undefined,
      priority: this.priorityFilter || undefined,
      status: this.statusFilter || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };
  }

  private resetAndLoad(): void {
    this.page = 1;
    this.load();
  }
}
