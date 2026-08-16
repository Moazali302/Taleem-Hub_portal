import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { compactGridTheme } from './compact-grid-theme';

/**
 * Generic data table used across the app — drop in with rowData + columnDefs.
 * Pagination is client-side for now (AG Grid paginates the array in memory).
 * To switch to server-side later: swap this to the server-side row model and
 * wire onGridReady to your API — consumers only pass rowData/columnDefs, so
 * no screen using <app-data-grid> needs to change.
 */
@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <ag-grid-angular
      class="data-grid"
      [theme]="theme"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [pagination]="true"
      [paginationPageSize]="pageSize"
      [paginationPageSizeSelector]="pageSizeOptions"
      [domLayout]="'autoHeight'"
      [suppressCellFocus]="true"
    />
  `,
  styles: [
    `
      .data-grid {
        width: 100%;
      }

      /* AG Grid renders cell content outside Angular's view encapsulation for
         plain-HTML cellRenderer functions, so this needs ::ng-deep. */
      :host ::ng-deep .grid-action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: #6b7280;
        cursor: pointer;
      }

      :host ::ng-deep .grid-action-btn:hover {
        background: #f3f4f6;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridComponent<T = unknown> {
  @Input() rowData: T[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  readonly theme = compactGridTheme;

  readonly defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    suppressMovable: true,
  };
}