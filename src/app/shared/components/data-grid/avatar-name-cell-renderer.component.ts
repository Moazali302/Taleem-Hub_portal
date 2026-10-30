import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-avatar-name-cell',
  standalone: true,
  template: `
    <div class="avatar-name">
      <span class="avatar-name__avatar">{{ initials }}</span>
      <span class="avatar-name__text">{{ name }}</span>
    </div>
  `,
  styles: [
    `
      .avatar-name {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .avatar-name__avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e6ebfa;
        color: #1a3270;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .avatar-name__text {
        font-weight: 700;
        color: #0f1b3d;
      }
    `,
  ],
})
export class AvatarNameCellRendererComponent implements ICellRendererAngularComp {
  name = '';
  initials = '';

  agInit(params: ICellRendererParams): void {
    this.setValue(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setValue(params);
    return true;
  }

  private setValue(params: ICellRendererParams): void {
    this.name = (params.value ?? '').toString().trim();
    this.initials = this.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
}