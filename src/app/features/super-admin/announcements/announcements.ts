import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ColDef } from 'ag-grid-community';
import { AgGridTableComponent, COMPACT_ROW_HEIGHT } from '@app/shared/components/ag-grid-table/ag-grid-table';
import { GridIconsComponent } from '@app/shared/components/ag-Grid/grid-icons/grid-icons';
import {
  StatusBadgeColor,
  StatusBadgeCellRendererComponent,
} from '@shared/components/data-grid/status-badge-cell-renderer.component';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { PageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { SidenavComponent } from '@app/shared/components/sidenav.component/sidenav';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';
import {
  AnnouncementAudienceOption,
  AnnouncementListItem,
  getAudienceLabel,
} from '@app/core/models/announcement.model';
import { AnnouncementsService } from '@app/core/services/announcements.service';
import { getHttpErrorMessage } from '@app/shared/utlis/http-error.util';
import { AnnouncementComposeComponent } from './announcement-compose/announcement-compose';

const STATUS_COLORS: Record<string, StatusBadgeColor> = {
  delivered: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  scheduled: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
};

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    AnnouncementComposeComponent,
    AgGridTableComponent,
    SidenavComponent,
    LoaderComponent,
  ],
  templateUrl: './announcements.html',
  styleUrl: './announcements.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementsComponent implements OnInit {
  @ViewChild(AnnouncementComposeComponent) private compose?: AnnouncementComposeComponent;

  readonly rowHeight = COMPACT_ROW_HEIGHT;

  announcements: AnnouncementListItem[] = [];
  audienceOptions: AnnouncementAudienceOption[] = [];

  isLoading = false;
  hasError = false;
  errorMessage = '';

  isSidenavOpen = false;
  selectedAnnouncement: AnnouncementListItem | null = null;

  readonly columnDefs: ColDef<AnnouncementListItem>[] = [
    { field: 'title', headerName: 'Title', flex: 2, minWidth: 180 },
    {
      colId: 'audience',
      headerName: 'Audience',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => (params.data ? getAudienceLabel(params.data) : ''),
    },
    {
      field: 'sent_at',
      headerName: 'Sent',
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => dateFormatter.format(new Date(params.value)),
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
        onView: (e: CustomCellEvent<AnnouncementListItem>) => this.openDetail(e.rowData),
      } as Partial<ICustomCellRenderer<AnnouncementListItem>>,
    },
  ];

  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      announcements: this.announcementsService.getAnnouncements(),
      audiences: this.announcementsService.getAudienceOptions(),
    }).subscribe({
      next: ({ announcements, audiences }) => {
        this.isLoading = false;
        this.announcements = announcements.data;
        this.audienceOptions = audiences.data;
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

  startNewAnnouncement(): void {
    this.compose?.startNew();
  }

  onAnnouncementSent(): void {
    this.announcementsService.getAnnouncements().subscribe({
      next: (res) => {
        this.announcements = res.data;
        this.cdr.markForCheck();
      },
    });
  }

  audienceLabel(item: AnnouncementListItem): string {
    return getAudienceLabel(item);
  }

  formatDateTime(iso: string): string {
    return dateTimeFormatter.format(new Date(iso));
  }

  openDetail(announcement: AnnouncementListItem): void {
    this.selectedAnnouncement = announcement;
    this.isSidenavOpen = true;
    this.cdr.markForCheck();
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }
}
