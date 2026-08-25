export interface AnalyticsPoint {
  label: string;
  value: number;
}

export type AnalyticsRange = '7D' | '30D' | '90D';

export interface AnalyticsSeries {
  trendPercent: number;       // e.g. 12.7
  trendDirection: 'up' | 'down';
  trendCaption: string;       // e.g. 'this month'
  points: AnalyticsPoint[];
}