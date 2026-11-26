import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API } from '../constants/api.constants';
import {
  AnnouncementOption,
  AnnouncementPublishOption,
  CreateSchoolAnnouncementPayload,
  SchoolAnnouncementOptions,
  SchoolAnnouncementPage,
  SchoolAnnouncementPriority,
  SchoolAnnouncementRecipient,
} from '../models/school-announcement.model';
import { ApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

const RECIPIENTS: readonly SchoolAnnouncementRecipient[] = [
  'all',
  'students',
  'teachers',
  'staff',
  'parents',
];
const PRIORITIES: readonly SchoolAnnouncementPriority[] = ['NORMAL', 'URGENT', 'IMPORTANT'];

@Injectable({ providedIn: 'root' })
export class SchoolAnnouncementsService {
  constructor(private readonly api: ApiService) {}

  getOptions(): Observable<ApiResponse<SchoolAnnouncementOptions>> {
    return this.api.get<unknown>(API.SCHOOL.ANNOUNCEMENT_OPTIONS).pipe(
      map((response) => ({
        ...response,
        data: this.parseOptions(response.data),
      })),
    );
  }

  getAnnouncements(
    page: number,
    limit: number,
    target?: SchoolAnnouncementRecipient,
  ): Observable<ApiResponse<SchoolAnnouncementPage>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (target) {
      params = params.set('target', target);
    }

    return this.api.get<SchoolAnnouncementPage>(API.SCHOOL.ANNOUNCEMENTS, params).pipe(
      map((response) => {
        if (!response.data || !Array.isArray(response.data.items)) {
          throw new Error('Announcements response did not contain a paginated list.');
        }
        return response;
      }),
    );
  }

  createAnnouncement(
    payload: CreateSchoolAnnouncementPayload,
  ): Observable<ApiResponse<unknown>> {
    return this.api.post<unknown>(API.SCHOOL.ANNOUNCEMENTS, payload);
  }

  private parseOptions(data: unknown): SchoolAnnouncementOptions {
    if (!data || typeof data !== 'object') {
      throw new Error('Announcement options response was invalid.');
    }

    const options = data as Record<string, unknown>;
    return {
      recipients: this.parseOptionList(options['recipients'], this.normalizeRecipient),
      priorities: this.parseOptionList(options['priorities'], this.normalizePriority),
      publishOptions: this.parseOptionList(options['publishOptions'], this.normalizePublishOption),
    };
  }

  private parseOptionList<T extends string>(
    value: unknown,
    normalize: (value: string, label: string) => T | null,
  ): AnnouncementOption<T>[] {
    if (!Array.isArray(value)) {
      throw new Error('Announcement options response contained an invalid option list.');
    }

    return value.map((option: unknown) => {
      const record = typeof option === 'string'
        ? { value: option, label: this.toLabel(option) }
        : option && typeof option === 'object'
          ? option as Record<string, unknown>
          : null;
      const rawValue = record?.['value'];
      const rawLabel = record?.['label'];
      const label = typeof rawLabel === 'string' ? rawLabel : '';
      const normalized = typeof rawValue === 'string' ? normalize(rawValue, label) : null;

      if (!normalized || !label) {
        throw new Error('Announcement options response contained an unsupported option.');
      }

      return { value: normalized, label };
    });
  }

  private normalizeRecipient(value: string): SchoolAnnouncementRecipient | null {
    const normalized = value.toLowerCase() as SchoolAnnouncementRecipient;
    return RECIPIENTS.includes(normalized) ? normalized : null;
  }

  private normalizePriority(value: string): SchoolAnnouncementPriority | null {
    const normalized = value.toUpperCase() as SchoolAnnouncementPriority;
    return PRIORITIES.includes(normalized) ? normalized : null;
  }

  private normalizePublishOption(
    value: string,
    label: string,
  ): AnnouncementPublishOption | null {
    const normalized = `${value} ${label}`.toLowerCase();
    if (normalized.includes('schedul')) {
      return 'schedule';
    }
    if (normalized.includes('now') || normalized.includes('immediate')) {
      return 'now';
    }
    return null;
  }

  private toLabel(value: string): string {
    return value
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
