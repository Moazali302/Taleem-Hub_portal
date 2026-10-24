import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  ANNOUNCEMENT_AUDIENCE_OPTIONS,
  AnnouncementAudienceOption,
  AnnouncementListItem,
  CreateAnnouncementPayload,
} from '../models/announcement.model';

const MOCK_ANNOUNCEMENTS: AnnouncementListItem[] = [
  { id: 1, title: 'Scheduled maintenance', message: 'The platform will be unavailable from 2:00 to 3:00 AM.', audience: 'all', recipients_count: 24, sent_at: '2026-10-14T09:00:00', status: 'delivered' },
  { id: 2, title: 'Parent portal launch', message: 'Parents can now view fees, attendance and results from the new Parent Portal.', audience: 'premium', recipients_count: 5, sent_at: '2026-10-06T11:30:00', status: 'delivered' },
  { id: 3, title: 'Fee module update', message: 'Fee vouchers now support partial payments and instalment plans.', audience: 'custom', recipients_count: 12, sent_at: '2026-10-01T10:15:00', status: 'delivered' },
  { id: 4, title: 'Eid holiday notice', message: 'Support will be limited during the Eid holidays. Urgent issues can still be raised as complaints.', audience: 'all', recipients_count: 24, sent_at: '2026-10-25T08:00:00', status: 'scheduled' },
];

// Recipients per audience — the backend will derive these from live subscriptions.
const MOCK_AUDIENCE_RECIPIENTS: Record<CreateAnnouncementPayload['audience'], number> = {
  all: 24,
  basic: 9,
  advanced: 10,
  premium: 5,
};

const MOCK_LATENCY_MS = 300;

function toResponse<T>(data: T, message: string, path: string): ApiResponse<T> {
  return { success: true, message, data, meta: { timestamp: new Date().toISOString(), path } };
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  // Kept in memory so a sent announcement shows up in the next list load while mocked.
  private announcements: AnnouncementListItem[] = MOCK_ANNOUNCEMENTS.map((item) => ({ ...item }));

  // TODO(backend): swap mock for real call — GET /super-admin/announcements, response: AnnouncementListItem[]
  getAnnouncements(): Observable<ApiResponse<AnnouncementListItem[]>> {
    return of(
      toResponse(
        this.announcements.map((item) => ({ ...item })),
        'Announcements loaded',
        API.SUPER_ADMIN.ANNOUNCEMENTS,
      ),
    ).pipe(delay(MOCK_LATENCY_MS));
  }

  // TODO(backend): swap mock for real call — GET /super-admin/announcements/audiences, response: AnnouncementAudienceOption[]
  getAudienceOptions(): Observable<ApiResponse<AnnouncementAudienceOption[]>> {
    const options = ANNOUNCEMENT_AUDIENCE_OPTIONS.map((option) => ({
      ...option,
      recipients_count: MOCK_AUDIENCE_RECIPIENTS[option.value],
    }));
    return of(
      toResponse(options, 'Audiences loaded', `${API.SUPER_ADMIN.ANNOUNCEMENTS}/audiences`),
    ).pipe(delay(MOCK_LATENCY_MS));
  }

  // TODO(backend): swap mock for real call — POST /super-admin/announcements, body: CreateAnnouncementPayload
  sendAnnouncement(payload: CreateAnnouncementPayload): Observable<ApiResponse<AnnouncementListItem>> {
    const created: AnnouncementListItem = {
      id: Math.max(0, ...this.announcements.map((item) => item.id)) + 1,
      title: payload.title,
      message: payload.message,
      audience: payload.audience,
      recipients_count: MOCK_AUDIENCE_RECIPIENTS[payload.audience],
      sent_at: new Date().toISOString(),
      status: 'delivered',
    };
    this.announcements = [created, ...this.announcements];

    return of(toResponse({ ...created }, 'Announcement sent', API.SUPER_ADMIN.ANNOUNCEMENTS)).pipe(
      delay(MOCK_LATENCY_MS),
    );
  }
}
