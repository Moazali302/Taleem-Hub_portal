import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface GridToolbarFilterOption {
  value: string;
  label: string;
}

/**
 * Search + single dropdown filter + Export, shown above a listing grid.
 * Stateless: it only emits what the user typed/picked — the parent owns the
 * filtering so it stays in control of the grid's rowData.
 *
 *   <app-grid-toolbar
 *     searchPlaceholder="Search by school..."
 *     allLabel="All Plans"
 *     [filterOptions]="planOptions"
 *     [exportDisabled]="rows.length === 0"
 *     (searchChange)="onSearch($event)"
 *     (filterChange)="onFilter($event)"
 *     (exportClick)="export()" />
 */
@Component({
  selector: 'app-grid-toolbar',
  standalone: true,
  templateUrl: './grid-toolbar.html',
  styleUrl: './grid-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridToolbarComponent {
  @Input() searchPlaceholder = 'Search...';
  /** Label of the "no filter" option — its value is always 'all'. */
  @Input() allLabel = 'All';
  /** Leave empty to hide the dropdown. */
  @Input() filterOptions: GridToolbarFilterOption[] = [];
  @Input() exportDisabled = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() exportClick = new EventEmitter<void>();
}