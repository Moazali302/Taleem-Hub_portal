import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatMenuModule } from '@angular/material/menu';

/** Pass whichever handlers a given grid needs via cellRendererParams — omit one to hide that option. */
export interface RowActionsParams<T = unknown> extends ICellRendererParams<T> {
  onView?: (row: T) => void;
  viewLabel?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

/**
 * Generic row-actions (⋮) cell renderer for AG Grid — reused by every grid
 * that needs View/Edit/Delete on a row (Schools, Teachers, Students, etc.).
 * Configure per column via cellRendererParams: { onView, onEdit, onDelete }.
 *
 * Icons are inline SVG (Tabler outline set, hand-copied) — no icon-font or
 * icon-package dependency, so nothing to install, register, or tree-shake,
 * and no risk of icons silently failing to render because a font/module
 * wasn't loaded.
 */
@Component({
  selector: 'app-row-actions-cell',
  standalone: true,
  imports: [CommonModule, MatMenuModule],
  template: `
    <button
      type="button"
      class="row-actions-trigger"
      [class.row-actions-trigger--open]="menuTrigger.menuOpen"
      [matMenuTriggerFor]="menu"
      #menuTrigger="matMenuTrigger"
      aria-label="Row actions"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
        <circle cx="12" cy="5" r="1" />
      </svg>
    </button>

    <mat-menu #menu="matMenu" xPosition="before" class="app-action-menu-panel">
      @if (params.onView) {
        <button mat-menu-item class="row-actions__view" (click)="params.onView!(params.data!)">
          <svg class="row-actions__icon row-actions__icon--view" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
          </svg>
          <span>{{ params.viewLabel || 'View' }}</span>
        </button>
      }
      @if (params.onEdit) {
        <button mat-menu-item class="row-actions__edit" (click)="params.onEdit!(params.data!)">
          <svg class="row-actions__icon row-actions__icon--edit" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
            <path d="M13.5 6.5l4 4" />
          </svg>
          <span>Edit</span>
        </button>
      }
      @if (params.onDelete) {
        <button mat-menu-item class="row-actions__danger" (click)="params.onDelete!(params.data!)">
          <svg class="row-actions__icon row-actions__icon--danger" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
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
        width: 36px;
        height: 36px;
        border: 1px solid transparent;
        border-radius: 8px;
        background: #fff;
        color: #64748b;
        cursor: pointer;
        transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease,
          box-shadow 140ms ease;
      }
      .row-actions-trigger:hover,
      .row-actions-trigger--open {
        background: #f1f5fb;
        border-color: #dce4f2;
        color: #14307a;
      }
      .row-actions-trigger:focus-visible {
        outline: none;
        border-color: #8da6df;
        box-shadow: 0 0 0 3px rgb(20 48 122 / 14%);
      }
      @media (prefers-reduced-motion: reduce) {
        .row-actions-trigger {
          transition: none;
        }
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