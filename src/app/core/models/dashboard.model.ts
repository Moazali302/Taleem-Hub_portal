export interface ApprovalItem {
  icon: string;
  title: string;
  timeAgo: string;
}

export interface ExamItem {
  title: string;
  date: string;
  dotColor: string;
}
export interface ExpiringSubscriptionItem {
  schoolName: string;
  expiresIn: string; // e.g. "3 days"
}
export interface ApprovaladminItem {
  initials: string;
  name: string;
  type: string;
  timeAgo: string;
}
export interface AnnouncementItem {
  title: string;
  subtitle: string;
}
export interface FeeCollectionSummary {
  ratePercent: number;
  trendPercent: number;
  trendDirection: 'up' | 'down';
  collectedAmount: string;
  billedAmount: string;
  pendingAmount: string;
  overdueCount: number;
}