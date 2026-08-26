import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfitOverviewData,RingSegment } from '@app/core/models/profit-overview.mode';

interface RingGeometry extends RingSegment {
  dashArray: string;
  dashOffset: number;
  displayValue: string;
}

@Component({
  selector: 'app-profit-overview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profit-overview-card.html',
  styleUrl: './profit-overview-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfitOverviewCardComponent implements OnChanges {
  @Input({ required: true }) data!: ProfitOverviewData;
  /** Optional: overall trend shown next to the title, e.g. +12.7 */
  @Input() trendPercent: number | null = null;

  readonly radius = 70;
  readonly strokeWidth = 16;
  private readonly gapDegrees = 6; // visual gap between segments
  private readonly circumference = 2 * Math.PI * this.radius;

  rings: RingGeometry[] = [];

  ngOnChanges(): void {
    this.buildRings();
  }

  get absTrend(): string {
    return this.trendPercent !== null ? Math.abs(this.trendPercent).toFixed(1) : '';
  }

  private buildRings(): void {
    const total = this.data.segments.reduce((sum, s) => sum + s.value, 0) || 1;
    const gapLength = (this.gapDegrees / 360) * this.circumference;
    let cumulativeOffset = 0;

    this.rings = this.data.segments.map((segment) => {
      const rawLength = (segment.value / total) * this.circumference;
      const arcLength = Math.max(rawLength - gapLength, 0);

      const geometry: RingGeometry = {
        ...segment,
        dashArray: `${arcLength} ${this.circumference - arcLength}`,
        dashOffset: -cumulativeOffset,
        displayValue: this.formatValue(segment.value),
      };

      cumulativeOffset += rawLength;
      return geometry;
    });
  }

  private formatValue(value: number): string {
    return `PKR ${value.toLocaleString('en-PK')}`;
  }
}