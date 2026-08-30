import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivityItem,ActivityType } from '@app/core/models/activity.model';
import { TimeAgoPipe } from '@app/pipe/time-ago.pipe';

interface ActivityStyle {
  icon: string;
  bg: string;
}

const ACTIVITY_STYLE_MAP: Record<ActivityType, ActivityStyle> = {
  school_added: { icon: '/svg/building.svg', bg: '#ede9fe' },
  status_changed: { icon: '/svg/toggle-right.svg', bg: '#ffedd5' },
  subscription_upgraded: { icon: '/svg/crown.svg', bg: '#fef3c7' },
  user_added: { icon: '/svg/user-plus.svg', bg: '#dbeafe' },
  complaint_raised: { icon: '/svg/triangle-alert.svg', bg: '#fee2e2' },
};

const FALLBACK_STYLE: ActivityStyle = { icon: '/svg/circle.svg', bg: '#f3f4f6' };

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, TimeAgoPipe],
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeedComponent {
  @Input({ required: true }) items: ActivityItem[] = [];
  @Input() viewAllLink = '/activity';
  @Input() maxHeight = '260px';

  getStyle(type: ActivityType): ActivityStyle {
    return ACTIVITY_STYLE_MAP[type] ?? FALLBACK_STYLE;
  }
}