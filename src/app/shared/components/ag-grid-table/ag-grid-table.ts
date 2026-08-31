import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, SelectionChangedEvent } from 'ag-grid-community';

/**
 * Generic, reusable AG Grid table wrapper — manages rows/columns/pagination
 * for every listing screen. Faithful port of an existing, battle-tested
 * pattern (AgGridTableComponent) — same inputs, same outputs, same
 * gridOptions shape. Made `standalone: true` since this project's Angular
 * version uses standalone components throughout (this project doesn't use
 * NgModules) — everything else matches the reference 1:1.
 */
@Component({
  selector: 'app-ag-grid-table',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './ag-grid-table.html',
})
export class AgGridTableComponent<T = any> implements OnChanges {
  @Input() rowData: T[] = [];
  @Input() columnDefs: ColDef<T>[] = [];
  // enable/disable column resizing globally (columns can still override with colDef.resizable)
  @Input() allowColResize: boolean = true;
  @Input() tabId: string = '';
  @Input() rowSelection: 'single' | 'multiple' = 'single';
  @Input() dashboard: boolean = true;
  @Output() rowClickedEvent = new EventEmitter<T>();
  @Output() selectionChangedEvent = new EventEmitter<SelectionChangedEvent<T>>();
  @Output() gridReadyEvent = new EventEmitter<{ api: GridApi<T>; tabId: string }>();

  defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
  };

  public gridOptions = {
    rowHeight: 80,
    rowStyle: { 'max-height': '72px' },
    rowSelection: this.rowSelection,
    pagination: true,
    paginationPageSize: 10,
    suppressRowClickSelection: true,
  };

  private gridApi?: GridApi<T>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allowColResize']) {
      // update defaultColDef so newly created columns pick this up; individual colDefs can override
      this.defaultColDef = { ...this.defaultColDef, resizable: !!this.allowColResize };
      // if grid already initialized, re-apply column defs to ensure change takes effect
      if (this.gridApi) {
        try {
          this.gridApi.setGridOption('columnDefs', this.columnDefs || []);
        } catch {
          // ignore
        }
      }
    }
    // if columnDefs changed, push them to grid if ready
    if (changes['columnDefs'] && this.gridApi) {
      try {
        this.gridApi.setGridOption('columnDefs', this.columnDefs || []);
      } catch {
        // ignore
      }
    }
  }

  onGridReady(params: GridReadyEvent<T>): void {
    this.gridApi = params.api;
    // ensure default/resizable state applied
    this.gridReadyEvent.emit({ api: params.api, tabId: this.tabId });
    try {
      this.gridApi.setGridOption('columnDefs', this.columnDefs || []);
    } catch {
      // ignore
    }
  }

  onRowClicked(event: RowClickedEvent<T>): void {
    this.rowClickedEvent.emit(event.data);
  }

  onSelectionChanged(event: SelectionChangedEvent<T>): void {
    this.selectionChangedEvent.emit(event);
  }
}