export type ComplaintPriority = 'critical' | 'high' | 'normal';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

/** One row of the super-admin Complaints listing (snake_case, like every API response). */
export interface ComplaintListItem {
  id: number;
  school_name: string;
  subject: string;
  description: string;
  raised_by: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  created_at: string; // ISO date-time
}

/** Platform-wide counters shown above the listing — computed by the backend, not from the page's rows. */
export interface ComplaintsSummary {
  open: number;
  in_progress: number;
  resolved_this_month: number;
  resolved_trend_percent: number;
  avg_response_hours: number;
}

export interface UpdateComplaintStatusPayload {
  status: ComplaintStatus;
}

export const COMPLAINT_PRIORITY_OPTIONS: { value: ComplaintPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
];

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

/** Status transitions the super admin can trigger from the detail panel. */
export const COMPLAINT_NEXT_STATUS: Record<ComplaintStatus, ComplaintStatus[]> = {
  open: ['in_progress', 'resolved'],
  in_progress: ['resolved'],
  resolved: [],
};