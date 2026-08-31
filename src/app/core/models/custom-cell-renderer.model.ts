import { ICellRendererParams } from 'ag-grid-community';
import { CustomCellEvent } from './custom-cell-event.model';

export interface ICustomCellRenderer<T = any> extends ICellRendererParams<T> {
  hideMenu?: boolean;

  tagLabel?: string;
  tagCount?: number;
  onTagClick?: (e: CustomCellEvent<T>) => void;

  onView?: (e: CustomCellEvent<T>) => void;
  onEdit?: (e: CustomCellEvent<T>) => void;
  onDelete?: (e: CustomCellEvent<T>) => void;
  onDownload?: (e: CustomCellEvent<T>) => void;
  onHistory?: (e: CustomCellEvent<T>) => void;
  onViewUsers?: (e: CustomCellEvent<T>) => void;
  usersCount?: number;
  onMobileConfig?: (e: CustomCellEvent<T>) => void;
  onLicenses?: (e: CustomCellEvent<T>) => void;
  onCloseTicket?: (e: CustomCellEvent<T>) => void;
  onNotifyPartner?: (e: CustomCellEvent<T>) => void;
  onNotifyClient?: (e: CustomCellEvent<T>) => void;
  onAddLog?: (e: CustomCellEvent<T>) => void;
  onsendtoemail?: (e: CustomCellEvent<T>) => void;
  acceptTimeOff?: (e: CustomCellEvent<T>) => void;
  rejectTimeOff?: (e: CustomCellEvent<T>) => void;
  onApprove?: (e: CustomCellEvent<T>) => void;
}