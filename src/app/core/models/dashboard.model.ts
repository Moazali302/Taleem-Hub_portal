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