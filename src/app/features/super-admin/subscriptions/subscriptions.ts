import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import { AgGridTableComponent, COMPACT_ROW_HEIGHT } from '@app/shared/components/ag-grid-table/ag-grid-table';
import { GridIconsComponent } from '@app/shared/components/ag-Grid/grid-icons/grid-icons';
import {
  StatusBadgeColor,
  StatusBadgeCellRendererComponent,
} from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { AvatarNameCellRendererComponent } from '@shared/components/data-grid/avatar-name-cell-renderer.component';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { PageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { SummaryCardComponent } from '@app/shared/components/summary-card/summary-card';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';
import { SummaryCardData } from '@app/core/models/summary-card.model';
import {
  SUBSCRIPTION_LIST_PLAN_OPTIONS,
  SUBSCRIPTION_PLAN_OPTIONS,
  SubscriptionListItem,
  SubscriptionListPlan,
} from '@app/core/models/subscription.model';
import { SubscriptionsService } from '@app/core/services/subscriptions.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import { downloadCsv } from '@app/shared/utlis/csv-export.util';
import { AssignPackageComponent } from './assign-package/assign-package';
import { GridToolbarComponent as GridToolbarComponent } from '@app/shared/grid-tool-bar/grid-toolbar';

const PLAN_COLORS: Record<string, StatusBadgeColor> = {
  basic: { bg: '#eef1f8', text: '#3b4a73', dot: '#3b4a73' },
  advanced: { bg: '#e0e7fb', text: '#17306f', dot: '#17306f' },
  premium: { bg: '#fdf1cc', text: '#8a5a00', dot: '#8a5a00' },
  free_trial: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
};

const STATUS_COLORS: Record<string, StatusBadgeColor> = {
  expiring: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  urgent: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC', // expires_at is a calendar date — avoid local-timezone day shifts
});

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
const formatAmount = (amount: number): string => `PKR ${amount.toLocaleString('en-US')}`;
const formatDate = (iso?: string): string => (iso ? dateFormatter.format(new Date(iso)) : '-');

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    SummaryCardComponent,
    GridToolbarComponent,
    AgGridTableComponent,
    SidenavComponent,
    AssignPackageComponent,
    LoaderComponent,
    GridToolbarComponent
],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionsComponent implements OnInit {
  readonly rowHeight = COMPACT_ROW_HEIGHT;
  readonly planOptions = SUBSCRIPTION_LIST_PLAN_OPTIONS;

  summaryCards: SummaryCardData[] = [];
  subscriptions: SubscriptionListItem[] = [];
  filteredSubscriptions: SubscriptionListItem[] = [];

  isLoading = false;
  hasError = false;
  errorMessage = '';

  searchTerm = '';
  planFilter: SubscriptionListPlan | 'all' = 'all';

  isSidenavOpen = false;
  selectedSubscription: SubscriptionListItem | null = null;

  readonly columnDefs: ColDef<SubscriptionListItem>[] = [
    {
      field: 'school_name',
      headerName: 'School',
      flex: 2,
      minWidth: 220,
      cellRenderer: AvatarNameCellRendererComponent,
    },
    {
      field: 'plan',
      headerName: 'Plan',
      flex: 1,
      minWidth: 120,
      cellRenderer: StatusBadgeCellRendererComponent,
      cellRendererParams: { colorMap: PLAN_COLORS, showDot: false },
    },
    {
      field: 'billing_cycle',
      headerName: 'Billing',
      flex: 1,
      minWidth: 110,
      valueFormatter: (params) => capitalize(params.value ?? ''),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 130,
      valueFormatter: (params) => formatAmount(params.value ?? 0),
    },
    {
      field: 'expires_at',
      headerName: 'Expires',
      flex: 1,
      minWidth: 130,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      sortable: false,
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
        onEdit: (e: CustomCellEvent<SubscriptionListItem>) => this.openChangePackage(e.rowData),
      } as Partial<ICustomCellRenderer<SubscriptionListItem>>,
    },
  ];

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    this.hasError = false;

    this.subscriptionsService.getSubscriptions().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.subscriptions = res.data;
        this.summaryCards = this.buildSummaryCards();
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage =
          err instanceof Error && !('error' in err) ? err.message : getHttpErrorMessage(err);
        this.cdr.markForCheck();
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onPlanFilterChange(value: string): void {
    this.planFilter = value as SubscriptionListPlan | 'all';
    this.applyFilters();
  }

  exportCsv(): void {
    downloadCsv('subscriptions.csv', [
      { header: 'School', value: (row) => row.school_name },
      { header: 'Plan', value: (row) => capitalize(row.plan) },
      { header: 'Billing', value: (row) => capitalize(row.billing_cycle) },
      { header: 'Amount (PKR)', value: (row) => row.amount },
      { header: 'Expires', value: (row) => row.expires_at ?? '-' },
      { header: 'Status', value: (row) => capitalize(row.status ?? '-') },
    ], this.filteredSubscriptions);
  }

  openAssignPackage(): void {
    this.selectedSubscription = null;
    this.isSidenavOpen = true;
  }

  openChangePackage(subscription: SubscriptionListItem): void {
    this.selectedSubscription = subscription;
    this.isSidenavOpen = true;
    this.cdr.markForCheck();
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }

  onPackageSaved(): void {
    this.closeSidenav();
    this.loadSubscriptions();
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredSubscriptions = this.subscriptions.filter(
      (row) =>
        (this.planFilter === 'all' || row.plan === this.planFilter) &&
        (!term || row.school_name.toLowerCase().includes(term)),
    );
  }

  private buildSummaryCards(): SummaryCardData[] {
    const countByPlan = (plan: SubscriptionListPlan) =>
      this.subscriptions.filter((row) => row.plan === plan).length;

    return [
      ...SUBSCRIPTION_LIST_PLAN_OPTIONS.map((option) => ({
        label: option.label,
        value: countByPlan(option.value),
      })),
      {
        label: 'Expiring Soon',
        value: this.subscriptions.filter((row) => row.status && row.status !== 'active').length,
        accent: 'warning' as const,
      },
    ];
  }
}