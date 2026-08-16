import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface StatusBadgeColor {
  bg: string;
  text: string;
}

/** Pass a custom colorMap via colDef.cellRendererParams for non-default statuses. */
export interface StatusBadgeParams extends ICellRendererParams {
  colorMap?: Record<string, StatusBadgeColor>;
}

const DEFAULT_COLOR_MAP: Record<string, StatusBadgeColor> = {
  active: { bg: '#dcfce7', text: '#16a34a' },
  open: { bg: '#dcfce7', text: '#16a34a' },
  approved: { bg: '#dcfce7', text: '#16a34a' },
  pending: { bg: '#fef3c7', text: '#d97706' },
  'in progress': { bg: '#fef3c7', text: '#d97706' },
  inactive: { bg: '#f3f4f6', text: '#6b7280' },
  closed: { bg: '#f3f4f6', text: '#6b7280' },
  rejected: { bg: '#fee2e2', text: '#dc2626' },
};

/**
 * Generic status-pill cell renderer for AG Grid — reused by every grid that
 * shows a status column (Schools, Tickets, etc). Add new status colors via
 * DEFAULT_COLOR_MAP, or override per-grid with cellRendererParams.colorMap.
 */
@Component({
  selector: 'app-status-badge-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [style.background]="color.bg" [style.color]="color.text">
      {{ label }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
        line-height: 1.4;
      }
    `,
  ],
})
export class StatusBadgeCellRendererComponent implements ICellRendererAngularComp {
  label = '';
  color: StatusBadgeColor = { bg: '#f3f4f6', text: '#6b7280' };

  agInit(params: StatusBadgeParams): void {
    this.setValue(params);
  }

  refresh(params: StatusBadgeParams): boolean {
    this.setValue(params);
    return true;
  }

  private setValue(params: StatusBadgeParams): void {
    const value = (params.value ?? '').toString();
    this.label = value;

    const map = { ...DEFAULT_COLOR_MAP, ...(params.colorMap ?? {}) };
    this.color = map[value.toLowerCase()] ?? { bg: '#f3f4f6', text: '#6b7280' };
  }
}