import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

const PLAN_LABELS: Record<string, string> = {
  free_trial: 'Free Trial',
  basic: 'Basic',
  advance: 'Advanced',
  advanced: 'Advanced',
  premium: 'Premium',
};

interface PlanBadgeColor {
  bg: string;
  text: string;
  border: string;
}

const PLAN_COLORS: Record<string, PlanBadgeColor> = {
  free_trial: { bg: '#ccfbf1', text: '#0f766e', border: '#99f6e4' },
  basic: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  advance: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  advanced: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  premium: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
};

const FALLBACK_COLOR: PlanBadgeColor = {
  bg: '#f3f4f6',
  text: '#4b5563',
  border: '#e5e7eb',
};

@Component({
  selector: 'app-plan-badge-cell',
  standalone: true,
  template: `
    @if (label) {
      <span
        class="plan-badge"
        [style.background]="color.bg"
        [style.color]="color.text"
        [style.border-color]="color.border"
      >
        {{ label }}
      </span>
    }
  `,
  styles: [
    `
      .plan-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border: 1px solid;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.4;
        white-space: nowrap;
      }
    `,
  ],
})
export class PlanBadgeCellRendererComponent implements ICellRendererAngularComp {
  label = '';
  color = FALLBACK_COLOR;

  agInit(params: ICellRendererParams): void {
    this.setValue(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setValue(params);
    return true;
  }

  private setValue(params: ICellRendererParams): void {
    const value = (params.value ?? '').toString();
    this.label = PLAN_LABELS[value] ?? value;
    this.color = PLAN_COLORS[value] ?? FALLBACK_COLOR;
  }
}