import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

const VIEW_BOX_SIZE = 140;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Single-value progress donut with the percentage in the centre. */
@Component({
  selector: 'app-donut-chart',
  standalone: true,
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
  /** 0–100; out-of-range values are clamped. */
  @Input({ required: true }) value = 0;
  /** Rendered size in px. */
  @Input() size = 140;
  @Input() ariaLabel = '';

  readonly viewBoxSize = VIEW_BOX_SIZE;
  readonly center = VIEW_BOX_SIZE / 2;
  readonly radius = RADIUS;
  readonly circumference = CIRCUMFERENCE;

  get percent(): number {
    return Math.min(100, Math.max(0, this.value));
  }

  get dashOffset(): number {
    return CIRCUMFERENCE * (1 - this.percent / 100);
  }

  get labelFontSize(): number {
    return Math.round(this.size * 0.19);
  }
}