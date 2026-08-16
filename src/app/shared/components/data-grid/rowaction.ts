import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatMenuModule } from '@angular/material/menu';

/** Pass whichever handlers a given grid needs via cellRendererParams — omit one to hide that option. */
export interface RowActionsParams<T = unknown> extends ICellRendererParams<T> {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

/**
 * Generic row-actions (⋮) cell renderer for AG Grid — reused by every grid
 * that needs View/Edit/Delete on a row (Schools, Teachers, Students, etc.).
 * Configure per column via cellRendererParams: { onView, onEdit, onDelete }.
 */
@Component({
  selector: 'app-row-actions-cell',
  standalone: true,
  imports: [CommonModule, MatMenuModule],
  template: `
    <button
      type="button"
      class="row-actions-trigger"
      [matMenuTriggerFor]="menu"
      aria-label="Row actions"
    >
      <i class="ti ti-dots-vertical" aria-hidden="true"></i>
    </button>

    <mat-menu #menu="matMenu" xPosition="before">
      @if (params.onView) {
        <button mat-menu-item (click)="params.onView!(params.data!)">
          <i class="ti ti-eye" aria-hidden="true"></i>
          <span>View</span>
        </button>
      }
      @if (params.onEdit) {
        <button mat-menu-item (click)="params.onEdit!(params.data!)">
          <i class="ti ti-pencil" aria-hidden="true"></i>
          <span>Edit</span>
        </button>
      }
      @if (params.onDelete) {
        <button mat-menu-item class="row-actions__danger" (click)="params.onDelete!(params.data!)">
          <i class="ti ti-trash" aria-hidden="true"></i>
          <span>Delete</span>
        </button>
      }
    </mat-menu>
  `,
  styles: [
    `
      .row-actions-trigger {
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
      .row-actions-trigger:hover {
        background: #f3f4f6;
      }
      :host ::ng-deep .row-actions__danger {
        color: #dc2626;
      }
    `,
  ],
})
export class RowActionsCellRendererComponent<T = unknown> implements ICellRendererAngularComp {
  params!: RowActionsParams<T>;

  agInit(params: RowActionsParams<T>): void {
    this.params = params;
  }

  refresh(params: RowActionsParams<T>): boolean {
    this.params = params;
    return true;
  }
}