import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, PaginationChangedEvent } from 'ag-grid-community';
import { compactGridTheme } from '../data-grid/compact-grid-theme';

/**
 * Generic, reusable AG Grid wrapper used across all listing screens
 * (Schools, Students, Teachers, etc.). Parent screens only provide
 * rowData + columnDefs — pagination footer, search wiring, and export
 * are handled here so every listing page behaves identically.
 */
@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './data-grid.component.html',
  styleUrl: './data-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridComponent<T = unknown> implements OnChanges {
  @Input({ required: true }) rowData: T[] = [];
  @Input({ required: true }) columnDefs: ColDef<T>[] = [];

  /** Rows per page shown in the footer */
  @Input() pageSize = 10;

  /** Options shown in the "Page Size" dropdown */
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  /** Wire this to a search input in the parent's toolbar */
  @Input() quickFilterText = '';

  /** Fixed viewport height — grid scrolls internally (vertical + horizontal) beyond this */
  @Input() height = '520px';

  @Output() gridReady = new EventEmitter<GridReadyEvent<T>>();

  @ViewChild(AgGridAngular) private agGrid?: AgGridAngular<T>;

  readonly theme = compactGridTheme;

  readonly defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    suppressMovable: true,
  };

  currentPage = 0;
  totalPages = 0;
  totalRows = 0;

  private gridApi?: GridApi<T>;

  ngOnChanges(changes: SimpleChanges): void {
    // keep the grid's internal page size in sync if the parent changes the @Input later
    if (changes['pageSize'] && this.gridApi) {
      this.gridApi.setGridOption('paginationPageSize', this.pageSize);
    }
  }

  onGridReady(event: GridReadyEvent<T>): void {
    this.gridApi = event.api;
    this.gridReady.emit(event);
  }

  onPaginationChanged(_: PaginationChangedEvent<T>): void {
    if (!this.gridApi) return;
    this.currentPage = this.gridApi.paginationGetCurrentPage();
    this.totalPages = this.gridApi.paginationGetTotalPages();
    this.totalRows = this.gridApi.paginationGetRowCount();
  }

  get rangeStart(): number {
    return this.totalRows === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalRows);
  }

  goToFirstPage(): void {
    this.gridApi?.paginationGoToFirstPage();
  }

  goToPrevPage(): void {
    this.gridApi?.paginationGoToPreviousPage();
  }

  goToNextPage(): void {
    this.gridApi?.paginationGoToNextPage();
  }

  goToLastPage(): void {
    this.gridApi?.paginationGoToLastPage();
  }

  onPageSizeChange(size: string): void {
    this.pageSize = Number(size);
    this.gridApi?.setGridOption('paginationPageSize', this.pageSize);
  }

  /** Exposed so a parent toolbar's "Export" button can trigger this via @ViewChild */
  exportCsv(fileName = 'export.csv'): void {
    this.gridApi?.exportDataAsCsv({ fileName });
  }
}