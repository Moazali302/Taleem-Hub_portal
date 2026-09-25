export interface AdminDashboardApproval {
  id: number;
  requester_name: string;
  request_type: string;
  created_at: string;
}

export interface AdminDashboardAnnouncement {
  id: number;
  title: string;
  body: string;
  published_at: string;
}

/**
 * School-admin home payload.
 * Field names follow backend snake_case (decision.md §2.4).
 */
export interface AdminDashboardSummary {
  total_students: number;
  students_trend_percent: string;
  total_teachers: number;
  teachers_trend_percent: string;
  attendance_today_percent: number;
  fees_collected_this_month: number;
  fees_month_target_percent: number;
  fees_trend_percent: string;
  open_complaints: number;
  new_complaints: number;
  pending_approvals: AdminDashboardApproval[];
  announcements: AdminDashboardAnnouncement[];
  upcoming_exams_count: number;
}
