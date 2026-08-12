export type StatCardVariant = 'default' | 'warning' | 'danger' | 'info' | 'success' | 'purple';

export interface StatCardData {
  icon: string; // tabler icon class name, e.g. 'ti-building'
  label: string;
  value: string | number;
  variant?: StatCardVariant;
}