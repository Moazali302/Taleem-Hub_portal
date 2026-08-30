export type ActivityType =
  | 'school_added'
  | 'status_changed'
  | 'subscription_upgraded'
  | 'user_added'
  | 'complaint_raised';

export interface ActivityItem {
  type: ActivityType;
  description: string;
  timestamp: string; // ISO date string
}