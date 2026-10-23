import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

const MAX_INITIALS = 2;

/**
 * Generic AG Grid cell: round initials avatar + name. Reused wherever a row
 * is identified by a school / person / organisation name.
 */
@Component({
  selector: 'app-avatar-name-cell',
  standalone: true,
  template: `
    <span class="avatar-name">
      <span class="avatar-name__avatar" aria-hidden="true">{{ initials }}</span>
      <span class="avatar-name__text">{{ name }}</span>
    </span>
  `,
  styles: [
    `
      .avatar-name {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .avatar-name__avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e6ebfa;
        color: #17306f;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .avatar-name__text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
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
    this.name = (params.value ?? '').toString();
    this.initials = this.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, MAX_INITIALS)
      .map((word) => word[0].toUpperCase())
      .join('');
  }
}
