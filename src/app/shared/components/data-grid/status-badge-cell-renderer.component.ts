import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface StatusBadgeColor {
  bg: string;
  text: string;
  dot: string;
}

/** Pass a custom colorMap via colDef.cellRendererParams for non-default statuses. */
export interface StatusBadgeParams extends ICellRendererParams {
  colorMap?: Record<string, StatusBadgeColor>;
}

const DEFAULT_COLOR_MAP: Record<string, StatusBadgeColor> = {
  active: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  open: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  approved: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  paid: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },

  pending: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  'in progress': { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  'in-progress': { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  'awaiting review': { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },

  inactive: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' },
  closed: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' },
  draft: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' },

  rejected: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
  suspended: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
  overdue: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
};

const FALLBACK_COLOR: StatusBadgeColor = { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' };

/**
 * Generic status-pill cell renderer for AG Grid — reused by every grid that
 * shows a status column (Schools, Tickets, Fees, etc). Add new status colors
 * via DEFAULT_COLOR_MAP, or override per-grid with cellRendererParams.colorMap.
 */
@Component({
  selector: 'app-status-badge-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [style.background]="color.bg" [style.color]="color.text">
      <span class="status-badge__dot" [style.background]="color.dot"></span>
      {{ label }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px 4px 10px;
        border-radius: 999px;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 600;
        letter-spacing: 0.01em;
        text-transform: capitalize;
        line-height: 1.4;
        white-space: nowrap;
      }

      .status-badge__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    `,
  ],
})
export class StatusBadgeCellRendererComponent implements ICellRendererAngularComp {
  label = '';
  color: StatusBadgeColor = FALLBACK_COLOR;

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
    this.color = map[value.toLowerCase()] ?? FALLBACK_COLOR;
  }
}