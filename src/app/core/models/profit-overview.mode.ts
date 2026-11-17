export interface RingSegment {
  label: string;
  value: number;
  color: string;
}

export interface ProfitOverviewData {
  centerLabel: string;
  centerValue: string;
  income: number;  
  segments: RingSegment[];
}
