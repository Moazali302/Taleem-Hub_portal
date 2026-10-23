export interface SummaryCardData {
  label: string;
  value: string | number;
  caption?: string;
  captionTone?: 'positive' | 'negative' | 'neutral';
  /** Coloured top border — flags cards that need attention. */
  accent?: 'warning' | 'danger';
}
