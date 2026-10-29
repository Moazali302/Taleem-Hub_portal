import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SummaryCardData } from '@app/core/models/summary-card.model';

/** KPI tile used at the top of super-admin screens (Dashboard, Subscriptions, ...). */
@Component({
  selector: 'app-summary-card',
  standalone: true,
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCardComponent {
  @Input({ required: true }) data!: SummaryCardData;
}
