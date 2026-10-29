export type AnnouncementAudience = 'all' | 'basic' | 'advanced' | 'premium' | 'custom';
export type AnnouncementStatus = 'delivered' | 'scheduled';

/** One row of the super-admin Announcements history (snake_case, like every API response). */
export interface AnnouncementListItem {
  id: number;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  /** Number of schools targeted — shown as "N schools" for a custom selection. */
  recipients_count: number;
  sent_at: string; // ISO date-time
  status: AnnouncementStatus;
}

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  audience: Exclude<AnnouncementAudience, 'custom'>;
}

export const ANNOUNCEMENT_AUDIENCE_OPTIONS: {
  value: CreateAnnouncementPayload['audience'];
  label: string;
}[] = [
  { value: 'all', label: 'All schools' },
  { value: 'basic', label: 'Basic plan schools' },
  { value: 'advanced', label: 'Advanced plan schools' },
  { value: 'premium', label: 'Premium plan schools' },
];

export interface AnnouncementAudienceOption {
  value: CreateAnnouncementPayload['audience'];
  label: string;
  recipients_count: number;
}

export const ANNOUNCEMENT_TITLE_MAX_LENGTH = 120;
export const ANNOUNCEMENT_MESSAGE_MAX_LENGTH = 1000;

/** Short audience text for the history grid, e.g. "All schools", "Premium", "12 schools". */
export function getAudienceLabel(item: Pick<AnnouncementListItem, 'audience' | 'recipients_count'>): string {
  switch (item.audience) {
    case 'all':
      return 'All schools';
    case 'custom':
      return `${item.recipients_count} schools`;
    default:
      return item.audience.charAt(0).toUpperCase() + item.audience.slice(1);
  }
}
