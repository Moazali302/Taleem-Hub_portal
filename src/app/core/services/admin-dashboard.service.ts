import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { AdminDashboardSummary } from '../models/admin-dashboard.model';

const MOCK_DASHBOARD: AdminDashboardSummary = {
  total_students: 612,
  students_trend_percent: '+12%',
  total_teachers: 34,
  teachers_trend_percent: '+4%',
  attendance_today_percent: 94,
  fees_collected_this_month: 340000,
  fees_month_target_percent: 68,
  fees_trend_percent: '+2.1%',
  open_complaints: 5,
  new_complaints: 2,
  pending_approvals: [
    {
      id: 1,
      requester_name: 'John Doe',
      request_type: 'Leave Request',
      created_at: '2026-09-25T10:00:00.000Z',
    },
    {
      id: 2,
      requester_name: 'Sarah Khan',
      request_type: 'Resource Access',
      created_at: '2026-09-25T08:00:00.000Z',
    },
    {
      id: 3,
      requester_name: 'M. Ahmed',
      request_type: 'Grade Correction',
      created_at: '2026-09-24T09:00:00.000Z',
    },
  ],
  announcements: [
    {
      id: 1,
      title: 'Mid-term exams schedule released',
      body: 'Finalized dates for all departments are now available on the portal.',
      published_at: '2026-09-24T12:00:00.000Z',
    },
    {
      id: 2,
      title: 'Parent-Teacher Meeting next Friday',
      body: 'Scheduled for 10th Oct, 2023',
      published_at: '2026-09-22T09:00:00.000Z',
    },
    {
      id: 3,
      title: 'Winter Uniform Update',
      body: 'Revised guidelines for secondary school',
      published_at: '2026-09-20T09:00:00.000Z',
    },
  ],
  upcoming_exams_count: 3,
};

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  // TODO(backend): swap mock for real call — GET /admin/dashboard, response: AdminDashboardSummary
  getSummary(): Observable<ApiResponse<AdminDashboardSummary>> {
    const response: ApiResponse<AdminDashboardSummary> = {
      success: true,
      message: 'Dashboard loaded',
      data: MOCK_DASHBOARD,
      meta: {
        timestamp: new Date().toISOString(),
        path: API.ADMIN.DASHBOARD,
      },
    };
    return of(response).pipe(delay(300));
  }
}
