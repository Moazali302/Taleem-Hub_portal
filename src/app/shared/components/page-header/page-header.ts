import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Standard screen header: title + subtitle on the left, optional primary
 * action on the right (projected). Give the projected <a>/<button> the
 * `page-header__action` class to get the navy primary-button look.
 *
 *   <app-page-header title="Subscriptions" subtitle="Plans, billing and renewals.">
 *     <button type="button" class="page-header__action">Assign Package</button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
}
