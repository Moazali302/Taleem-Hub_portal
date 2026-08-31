import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { ICustomCellRenderer } from '@app/core/models/custom-cell-renderer.model';
import { CustomCellEvent } from '@app/core/models/custom-cell-event.model';

/**
 * Generic grid actions renderer — every button is an OPTIONAL callback
 * passed via cellRendererParams, so the menu only shows what a given grid
 * actually wired up. One shared component, reused by every listing screen
 * (Schools, Demo Requests, Teachers, ...).
 *
 * Faithful port of an existing, battle-tested pattern (GridIconsComponent)
 * — same params shape, same method names, same hideMenu inline-icons
 * fallback. Icons are inline SVG here instead of <img src="assets/Icons/...">
 * because those specific icon files don't exist in this project yet;
 * everything else matches 1:1.
 */
@Component({
  selector: 'app-grid-icons',
  standalone: true,
  imports: [CommonModule, MatMenuModule],
  templateUrl: './grid-icons.html',
  styleUrls: ['./grid-icons.scss'],
})
export class GridIconsComponent implements ICellRendererAngularComp {
  params!: ICustomCellRenderer;
  @ViewChild('menuTrigger', { read: MatMenuTrigger }) menuTrigger!: MatMenuTrigger;

  @Output() view = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() delete = new EventEmitter();

  agInit(params: ICellRendererParams): void {
    this.params = params as ICustomCellRenderer;
    if (this.params.hideMenu == null) {
      this.params.hideMenu = false;
    }
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params as ICustomCellRenderer;
    return false;
  }

  private emit(
    handler: ((e: CustomCellEvent) => void) | undefined,
    event: MouseEvent,
  ): void {
    event.stopPropagation();
    handler?.({ event, rowData: this.params.node.data });
  }

  View(event: MouseEvent) { this.emit(this.params.onView, event); }
  OnHistory(event: MouseEvent) { this.emit(this.params.onHistory, event); }
  OnViewUsers(event: MouseEvent) { this.emit(this.params.onViewUsers, event); }
  Edit(event: MouseEvent) { this.emit(this.params.onEdit, event); }
  Delete(event: MouseEvent) { this.emit(this.params.onDelete, event); }
  Download(event: MouseEvent) { this.emit(this.params.onDownload, event); }
  TagClick(event: MouseEvent) { this.emit(this.params.onTagClick, event); }
  CloseTicket(event: MouseEvent) { this.emit(this.params.onCloseTicket, event); }
  NotifyPartner(event: MouseEvent) { this.emit(this.params.onNotifyPartner, event); }
  NotifyClient(event: MouseEvent) { this.emit(this.params.onNotifyClient, event); }
  AddLog(event: MouseEvent) { this.emit(this.params.onAddLog, event); }
  SendToEmail(event: MouseEvent) { this.emit(this.params.onsendtoemail, event); }
  AcceptTimeOff(event: MouseEvent) { this.emit(this.params.acceptTimeOff, event); }
  RejectTimeOff(event: MouseEvent) { this.emit(this.params.rejectTimeOff, event); }
  Approve(event: MouseEvent) { this.emit(this.params.onApprove, event); }
}