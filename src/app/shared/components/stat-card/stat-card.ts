import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardData } from './stat-card-model';
import { ProgressBarComponent } from '../progressBar/progress-bar';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input({ required: true }) data!: StatCardData;

  private readonly ringRadius = 18;

  get ringCircumference(): number {
    return 2 * Math.PI * this.ringRadius;
  }

  get ringOffset(): number {
    const pct = this.data.ring ?? 0;
    return this.ringCircumference * (1 - pct / 100);
  }
}