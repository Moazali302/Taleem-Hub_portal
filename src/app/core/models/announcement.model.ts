export type AnnouncementAudience = 'all' | 'basic' | 'advanced' | 'premium' | 'custom';
export type AnnouncementStatus = string;

/** One row of the super-admin Announcements history (snake_case, like every API response). */
export interface AnnouncementListItem {
  id: string | number;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  audience_label?: string;
  /** Number of schools targeted — shown as "N schools" for a custom selection. */
  recipients_count: number;
  sent_at: string; // ISO date-time
  status: AnnouncementStatus;
}

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  audienceType: string;
  targetPlan: string | null;
  target: string;
}

export const ANNOUNCEMENT_AUDIENCE_OPTIONS: {
  value: AnnouncementAudience;
  label: string;
}[] = [
  { value: 'all', label: 'All schools' },
  { value: 'basic', label: 'Basic plan schools' },
  { value: 'advanced', label: 'Advanced plan schools' },
  { value: 'premium', label: 'Premium plan schools' },
];

export interface AnnouncementAudienceOption {
  value: AnnouncementAudience;
  label: string;
  recipients_count: number;
  type?: string;
  plan?: string | null;
}

export const ANNOUNCEMENT_TITLE_MAX_LENGTH = 120;
export const ANNOUNCEMENT_MESSAGE_MAX_LENGTH = 1000;

/** Short audience text for the history grid, e.g. "All schools", "Premium", "12 schools". */
export function getAudienceLabel(
  item: Pick<AnnouncementListItem, 'audience' | 'recipients_count'> &
    Partial<Pick<AnnouncementListItem, 'audience_label'>>,
): string {
  if (item.audience_label) {
    return item.audience_label;
  }
  switch (item.audience) {
    case 'all':
      return 'All schools';
    case 'custom':
      return `${item.recipients_count} schools`;
    default:
      return item.audience.charAt(0).toUpperCase() + item.audience.slice(1);
  }
}
