import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * White surface with an optional title — the container for every chart / list
 * block on the super-admin screens. Content is projected.
 *
 *   <app-card title="Fee Collection" [centered]="true"> ... </app-card>
 */
@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title = '';
  /** Centres the projected content horizontally (donuts, single metrics). */
  @Input() centered = false;
}