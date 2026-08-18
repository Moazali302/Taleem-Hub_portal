import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  @Input({ required: true }) value = 0; // 0-100
  @Input() color: 'navy' | 'green' | 'orange' | 'red' = 'navy';
  @Input() label?: string;
  @Input() showPercentage = true;
}