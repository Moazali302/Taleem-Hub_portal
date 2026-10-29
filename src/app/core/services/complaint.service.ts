import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { ComplaintListItem,ComplaintStatus,ComplaintsSummary } from '../models/Complaint.model';


const MOCK_COMPLAINTS: ComplaintListItem[] = [
  { id: 1042, school_name: 'Punjab High School', subject: 'Fee vouchers not generating', description: 'Monthly fee vouchers are not being generated for classes 6 to 8 since yesterday. Parents are asking for their vouchers.', raised_by: 'Mian Ahad', priority: 'critical', status: 'open', created_at: '2026-10-24T09:20:00' },
  { id: 1041, school_name: 'AGE High School', subject: 'Cannot add new teacher', description: 'The Add Teacher form shows a validation error even when all fields are filled in correctly.', raised_by: 'Qasim', priority: 'high', status: 'in_progress', created_at: '2026-10-23T14:05:00' },
  { id: 1039, school_name: 'Hafiz School System', subject: 'Result PDF formatting', description: 'The result card PDF cuts off the last subject row when a student has more than 9 subjects.', raised_by: 'Hafiz Ahmad', priority: 'normal', status: 'resolved', created_at: '2026-10-21T11:40:00' },
  { id: 1036, school_name: 'DJ School System', subject: 'Request invoice copy', description: 'Please share a copy of the last three subscription invoices for our accounts department.', raised_by: 'Danish Jutt', priority: 'normal', status: 'resolved', created_at: '2026-10-19T16:30:00' },
  { id: 1040, school_name: 'City School', subject: 'Attendance report not loading', description: 'The monthly attendance report keeps loading and never shows the data for Grade 5.', raised_by: 'Sana Malik', priority: 'high', status: 'open', created_at: '2026-10-22T08:15:00' },
  { id: 1038, school_name: 'Kips Academy', subject: 'Parent portal login issue', description: 'Several parents report that they cannot log in to the Parent Portal after resetting their password.', raised_by: 'Bilal Khan', priority: 'critical', status: 'in_progress', created_at: '2026-10-20T10:00:00' },
  { id: 1037, school_name: 'Oakridge School', subject: 'Change school logo', description: 'We would like to update our school logo shown on report cards and vouchers.', raised_by: 'Ayesha Noor', priority: 'normal', status: 'resolved', created_at: '2026-10-20T09:10:00' },
  { id: 1035, school_name: 'Test School', subject: 'Timetable clash warning', description: 'Timetable shows a clash for two teachers who are assigned to different classes.', raised_by: 'Usman Tariq', priority: 'normal', status: 'open', created_at: '2026-10-18T13:45:00' },
  { id: 1034, school_name: 'Pakistan School System', subject: 'Bulk student import fails', description: 'Uploading the student CSV fails at row 120 without a clear error message.', raised_by: 'Hina Fatima', priority: 'high', status: 'in_progress', created_at: '2026-10-17T15:20:00' },
  { id: 1033, school_name: 'Beaconhouse Gulberg', subject: 'Announcement not delivered', description: 'Yesterday’s announcement did not reach parents of Grade 3.', raised_by: 'Zain Ali', priority: 'normal', status: 'resolved', created_at: '2026-10-16T12:00:00' },
  { id: 1032, school_name: 'Al-Noor Grammar School', subject: 'Subscription renewal reminder', description: 'We did not receive any reminder before our subscription was about to expire.', raised_by: 'Farah Naz', priority: 'normal', status: 'open', created_at: '2026-10-15T17:25:00' },
  { id: 1031, school_name: 'Roots Millennium', subject: 'Slow dashboard', description: 'The admin dashboard takes more than ten seconds to load during school hours.', raised_by: 'Omar Siddiqui', priority: 'high', status: 'resolved', created_at: '2026-10-14T08:50:00' },
];

const MOCK_SUMMARY: ComplaintsSummary = {
  open: 18,
  in_progress: 7,
  resolved_this_month: 42,
  resolved_trend_percent: 12,
  avg_response_hours: 3.2,
};

const MOCK_LATENCY_MS = 300;

function toResponse<T>(data: T, message: string, path: string): ApiResponse<T> {
  return { success: true, message, data, meta: { timestamp: new Date().toISOString(), path } };
}

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  // Kept in memory so a status change is reflected on the next list load while mocked.
  private complaints: ComplaintListItem[] = MOCK_COMPLAINTS.map((item) => ({ ...item }));

  // TODO(backend): swap mock for real call — GET /super-admin/complaints, response: ComplaintListItem[]
  getComplaints(): Observable<ApiResponse<ComplaintListItem[]>> {
    return of(
      toResponse(
        this.complaints.map((item) => ({ ...item })),
        'Complaints loaded',
        API.SUPER_ADMIN.COMPLAINTS,
      ),
    ).pipe(delay(MOCK_LATENCY_MS));
  }

  // TODO(backend): swap mock for real call — GET /super-admin/complaints/summary, response: ComplaintsSummary
  getSummary(): Observable<ApiResponse<ComplaintsSummary>> {
    return of(
      toResponse({ ...MOCK_SUMMARY }, 'Summary loaded', API.SUPER_ADMIN.COMPLAINTS_SUMMARY),
    ).pipe(delay(MOCK_LATENCY_MS));
  }

  // TODO(backend): swap mock for real call — PATCH /super-admin/complaints/:id/status, body: UpdateComplaintStatusPayload
  updateStatus(id: number, status: ComplaintStatus): Observable<ApiResponse<ComplaintListItem>> {
    return of(null).pipe(
      delay(MOCK_LATENCY_MS),
      map(() => {
        const complaint = this.complaints.find((item) => item.id === id);
        if (!complaint) {
          throw new Error('Complaint not found');
        }
        complaint.status = status;
        return toResponse({ ...complaint }, 'Status updated', API.SUPER_ADMIN.COMPLAINT_STATUS(String(id)));
      }),
    );
  }
}