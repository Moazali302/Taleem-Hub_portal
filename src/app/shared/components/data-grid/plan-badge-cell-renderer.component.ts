import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

const PLAN_LABELS: Record<string, string> = {
  free_trial: 'Free Trial',
  basic: 'Basic',
  advanced: 'Advanced',
  premium: 'Premium',
};

@Component({
  selector: 'app-plan-badge-cell',
  standalone: true,
  template: `@if (label) { <span class="plan-badge">{{ label }}</span> }`,
  styles: [
    `
      .plan-badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 10px;
        border-radius: 999px;
        background: #e6ebfa;
        color: #1a3270;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }
    `,
  ],
})
export class PlanBadgeCellRendererComponent implements ICellRendererAngularComp {
  label = '';

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
  }
}