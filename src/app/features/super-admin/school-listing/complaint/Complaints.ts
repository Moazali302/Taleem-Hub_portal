import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ColDef } from 'ag-grid-community';
import { AgGridTableComponent, COMPACT_ROW_HEIGHT } from '@app/shared/components/ag-grid-table/ag-grid-table';
import { GridIconsComponent } from '@app/shared/components/ag-Grid/grid-icons/grid-icons';
import {
  StatusBadgeColor,
  StatusBadgeCellRendererComponent,
} from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { GridToolbarComponent } from '@app/shared/grid-tool-bar/grid-toolbar';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { PageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { SummaryCardComponent } from '@app/shared/components/summary-card/summary-card';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';
import { SummaryCardData } from '@app/core/models/summary-card.model';
import { 
      COMPLAINT_NEXT_STATUS,
      COMPLAINT_PRIORITY_OPTIONS,
      COMPLAINT_STATUS_LABELS,
      ComplaintListItem,
      ComplaintPriority,
      ComplaintStatus,
      ComplaintsSummary
     } from '@app/core/models/Complaint.model';
import { ComplaintsService } from '@app/core/services/complaint.service';
import { ToastService } from '@app/core/services/toast.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import { downloadCsv } from '@app/shared/utlis/csv-export.util';

const PRIORITY_COLORS: Record<string, StatusBadgeColor> = {
  critical: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
  high: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  normal: { bg: '#e0e7fb', text: '#17306f', dot: '#17306f' },
};

const STATUS_COLORS: Record<string, StatusBadgeColor> = {
  open: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  in_progress: { bg: '#e0e7fb', text: '#17306f', dot: '#17306f' },
  resolved: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    SummaryCardComponent,
    GridToolbarComponent,
    AgGridTableComponent,
    SidenavComponent,
    LoaderComponent,
  ],
  templateUrl: './complaints.html',
  styleUrl: './complaints.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintsComponent implements OnInit {
  readonly rowHeight = COMPACT_ROW_HEIGHT;
  readonly priorityOptions = COMPLAINT_PRIORITY_OPTIONS.map((option) => ({ ...option }));
  readonly statusLabels = COMPLAINT_STATUS_LABELS;

  summaryCards: SummaryCardData[] = [];
  complaints: ComplaintListItem[] = [];
  filteredComplaints: ComplaintListItem[] = [];

  isLoading = false;
  hasError = false;
  errorMessage = '';

  searchTerm = '';
  priorityFilter: ComplaintPriority | 'all' = 'all';

  isSidenavOpen = false;
  selectedComplaint: ComplaintListItem | null = null;
  isUpdatingStatus = false;

  readonly columnDefs: ColDef<ComplaintListItem>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      valueFormatter: (params) => `#${params.value}`,
    },
    { field: 'school_name', headerName: 'School', flex: 1.5, minWidth: 170 },
    { field: 'subject', headerName: 'Subject', flex: 2, minWidth: 200 },
    { field: 'raised_by', headerName: 'Raised By', flex: 1, minWidth: 130 },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      minWidth: 120,
      cellRenderer: StatusBadgeCellRendererComponent,
      cellRendererParams: { colorMap: PRIORITY_COLORS, showDot: false },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 130,
      sortable: false,
      valueFormatter: (params) => COMPLAINT_STATUS_LABELS[params.value as ComplaintStatus] ?? '',
      cellRenderer: StatusBadgeCellRendererComponent,
      cellRendererParams: { colorMap: STATUS_COLORS, showDot: false },
    },
    {
      colId: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      resizable: false,
      pinned: 'right',
      cellRenderer: GridIconsComponent,
      cellRendererParams: {
        onView: (e: CustomCellEvent<ComplaintListItem>) => this.openDetail(e.rowData),
      } as Partial<ICustomCellRenderer<ComplaintListItem>>,
    },
  ];

  constructor(
    private readonly complaintsService: ComplaintsService,
    private readonly toaster: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      complaints: this.complaintsService.getComplaints(),
      summary: this.complaintsService.getSummary(),
    }).subscribe({
      next: ({ complaints, summary }) => {
        this.isLoading = false;
        this.complaints = complaints.data;
        this.summaryCards = this.buildSummaryCards(summary.data);
        this.applyFilters();
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

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onPriorityFilterChange(value: string): void {
    this.priorityFilter = value as ComplaintPriority | 'all';
    this.applyFilters();
  }

  exportCsv(): void {
    downloadCsv('complaints.csv', [
      { header: 'ID', value: (row) => `#${row.id}` },
      { header: 'School', value: (row) => row.school_name },
      { header: 'Subject', value: (row) => row.subject },
      { header: 'Raised By', value: (row) => row.raised_by },
      { header: 'Priority', value: (row) => capitalize(row.priority) },
      { header: 'Status', value: (row) => COMPLAINT_STATUS_LABELS[row.status] },
      { header: 'Raised On', value: (row) => row.created_at },
    ], this.filteredComplaints);
  }

  openDetail(complaint: ComplaintListItem): void {
    this.selectedComplaint = complaint;
    this.isSidenavOpen = true;
    this.cdr.markForCheck();
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }

  nextStatuses(complaint: ComplaintListItem): ComplaintStatus[] {
    return COMPLAINT_NEXT_STATUS[complaint.status];
  }

  formatDateTime(iso: string): string {
    return dateTimeFormatter.format(new Date(iso));
  }

  priorityLabel(priority: ComplaintPriority): string {
    return capitalize(priority);
  }

  changeStatus(complaint: ComplaintListItem, status: ComplaintStatus): void {
    this.isUpdatingStatus = true;

    this.complaintsService.updateStatus(complaint.id, status).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        this.toaster.success(`Complaint #${complaint.id} marked as ${COMPLAINT_STATUS_LABELS[status]}`);
        this.closeSidenav();
        this.load();
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        this.toaster.error(getHttpErrorMessage(err));
        this.cdr.markForCheck();
      },
    });
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredComplaints = this.complaints.filter(
      (row) =>
        (this.priorityFilter === 'all' || row.priority === this.priorityFilter) &&
        (!term ||
          `#${row.id}`.includes(term) ||
          row.school_name.toLowerCase().includes(term) ||
          row.subject.toLowerCase().includes(term) ||
          row.raised_by.toLowerCase().includes(term)),
    );
  }

  private buildSummaryCards(summary: ComplaintsSummary): SummaryCardData[] {
    return [
      { label: 'Open', value: summary.open, accent: 'danger' },
      { label: 'In Progress', value: summary.in_progress },
      {
        label: 'Resolved This Month',
        value: summary.resolved_this_month,
        caption: `+${summary.resolved_trend_percent}%`,
        captionTone: 'positive',
      },
      { label: 'Avg. Response', value: `${summary.avg_response_hours} hrs` },
    ];
  }
}