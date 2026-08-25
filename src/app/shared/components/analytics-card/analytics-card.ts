import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsRange,AnalyticsPoint,AnalyticsSeries } from '@app/core/models/analytics.model';

interface ChartPoint {
  x: number;
  y: number;
}

let instanceCounter = 0;

@Component({
  selector: 'app-analytics-card',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './analytics-card.html',
  styleUrl: './analytics-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsCardComponent implements OnChanges {
  @Input({ required: true }) title = 'Analytics Overview';
  @Input({ required: true }) dataByRange!: Record<AnalyticsRange, AnalyticsSeries>;
  @Input() viewFullReportLink = '/analytics';

  readonly ranges: AnalyticsRange[] = ['7D', '30D', '90D'];
  activeRange: AnalyticsRange = '30D';

  readonly gradientId = `analytics-gradient-${instanceCounter++}`;

  private readonly viewBoxWidth = 600;
  private readonly viewBoxHeight = 180;
  private readonly paddingX = 8;
  private readonly paddingTop = 12;
  private readonly paddingBottom = 30;

  linePath = '';
  areaPath = '';
  points: ChartPoint[] = [];
  xLabels: { x: number; text: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataByRange'] || changes['activeRange']) {
      this.buildChart();
    }
  }

  selectRange(range: AnalyticsRange): void {
    if (this.activeRange === range) return;
    this.activeRange = range;
    this.buildChart();
  }

  get activeSeries(): AnalyticsSeries | undefined {
    return this.dataByRange?.[this.activeRange];
  }

  private buildChart(): void {
    const series = this.activeSeries;
    if (!series || series.points.length === 0) {
      this.linePath = '';
      this.areaPath = '';
      this.points = [];
      this.xLabels = [];
      return;
    }

    const values = series.points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1; // avoid divide-by-zero on flat data

    const plotWidth = this.viewBoxWidth - this.paddingX * 2;
    const plotHeight = this.viewBoxHeight - this.paddingTop - this.paddingBottom;
    const stepX = series.points.length > 1 ? plotWidth / (series.points.length - 1) : 0;

    this.points = series.points.map((point, i) => ({
      x: this.paddingX + stepX * i,
      y: this.paddingTop + plotHeight - ((point.value - min) / range) * plotHeight,
    }));

    this.linePath = this.buildSmoothPath(this.points);
    const baseline = this.viewBoxHeight - this.paddingBottom;
    this.areaPath = `${this.linePath} L${this.points[this.points.length - 1].x},${baseline} L${this.points[0].x},${baseline} Z`;

    this.xLabels = this.pickEvenLabels(series.points);
  }

  /** Catmull-Rom → cubic Bézier smoothing so the line curves instead of zig-zagging between points. */
  private buildSmoothPath(pts: ChartPoint[]): string {
    if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;

    let path = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  }

  /** Show at most 5 x-axis labels, evenly spaced, regardless of how many data points exist. */
  private pickEvenLabels(points: AnalyticsPoint[]): { x: number; text: string }[] {
    const maxLabels = 5;
    const total = points.length;
    if (total <= maxLabels) {
      return points.map((p, i) => ({ x: this.points[i].x, text: p.label }));
    }

    const step = (total - 1) / (maxLabels - 1);
    const labels: { x: number; text: string }[] = [];
    for (let i = 0; i < maxLabels; i++) {
      const idx = Math.round(i * step);
      labels.push({ x: this.points[idx].x, text: points[idx].label });
    }
    return labels;
  }
}