export interface CustomCellEvent<T = any> {
  event: MouseEvent;
  rowData: T;
}