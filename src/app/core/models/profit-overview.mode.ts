export interface RingSegment {
  label: string;
  value: number;
  color: string;
}

export interface ProfitOverviewData {
  centerLabel: string;
  centerValue: string;
  income: number;   // Income = sum of segments; shown as context, not as a 3rd segment
  segments: RingSegment[];
}