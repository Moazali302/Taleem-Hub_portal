export type StatCardVariant = 'default' | 'warning' | 'danger' | 'info' | 'success' | 'purple';

export interface StatCardTrend {
  direction: 'up' | 'down';
  value: string; // e.g. '+3.2%'
}

export interface StatCardData {
  icon: string;
  label: string;
  value: string | number;
  variant?: StatCardVariant;
  trend?: StatCardTrend;
  urgencyLabel?: string; // e.g. '2 urgent', '5 critical'
  accented?: boolean;    // true => left border accent color
}