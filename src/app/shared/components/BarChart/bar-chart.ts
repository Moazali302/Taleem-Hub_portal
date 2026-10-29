import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { AnalyticsPoint } from '@app/core/models/analytics.model';

interface Bar {
  label: string;
  heightPercent: number;
  highlighted: boolean;
  tooltip: string;
}

const MIN_BAR_HEIGHT_PERCENT = 4;

/**
 * Zero-based vertical bar chart. The most recent (last) bar is highlighted in
 * gold by default. Pure HTML/CSS — no chart library needed for this shape.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements OnChanges {
  @Input({ required: true }) data: AnalyticsPoint[] = [];
  @Input() highlightLast = true;
  @Input() ariaLabel = 'Bar chart';
  /** Formats a value for the hover tooltip, e.g. (v) => `PKR ${v}M`. */
  @Input() valueFormatter: (value: number) => string = (value) => String(value);

  bars: Bar[] = [];

  ngOnChanges(): void {
    const max = Math.max(0, ...this.data.map((point) => point.value));

    this.bars = this.data.map((point, index) => ({
      label: point.label,
      heightPercent: max ? Math.max(MIN_BAR_HEIGHT_PERCENT, (point.value / max) * 100) : MIN_BAR_HEIGHT_PERCENT,
      highlighted: this.highlightLast && index === this.data.length - 1,
      tooltip: `${point.label}: ${this.valueFormatter(point.value)}`,
    }));
  }
}