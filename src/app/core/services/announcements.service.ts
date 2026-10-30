import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  AnnouncementAudienceOption,
  AnnouncementListItem,
  CreateAnnouncementPayload,
} from '../models/announcement.model';
import { ApiService } from './api.service';

interface AnnouncementApiItem {
  id: string | number;
  title: string;
  message: string;
  audienceType: string;
  audienceLabel?: string | null;
  targetPlan?: string | { name?: string; value?: string } | null;
  status: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  recipientCount?: number;
  schoolCount?: number;
}

interface AnnouncementAudienceApiItem {
  type: string;
  label: string;
  schoolCount: number;
  plan?: string | null;
  planName?: string | null;
}

interface AnnouncementApiPayload {
  title: string;
  message: string;
  audienceType: string;
  targetPlan: string | null;
  status: 'PUBLISHED';
  target: string;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  constructor(private readonly api: ApiService) {}

  getAnnouncements(): Observable<ApiResponse<AnnouncementListItem[]>> {
    return this.api.get<unknown>(API.SUPER_ADMIN.ANNOUNCEMENTS).pipe(
      map((response) => ({
        ...response,
        data: this.extractItems<AnnouncementApiItem>(response.data).map((item) =>
          this.toAnnouncement(item),
        ),
      })),
    );
  }

  getAudienceOptions(): Observable<ApiResponse<AnnouncementAudienceOption[]>> {
    return this.api.get<AnnouncementAudienceApiItem[]>(
      API.SUPER_ADMIN.ANNOUNCEMENT_AUDIENCES,
    ).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((item) => {
          const plan = item.plan ?? null;
          const value = item.type.toUpperCase() === 'ALL'
            ? 'all'
            : this.toUiAudience(plan, item.planName);

          return {
            value,
            label: item.label,
            recipients_count: item.schoolCount,
            type: item.type,
            plan,
          };
        }),
      })),
    );
  }

  sendAnnouncement(payload: CreateAnnouncementPayload): Observable<ApiResponse<AnnouncementApiItem>> {
    const body: AnnouncementApiPayload = {
      title: payload.title,
      message: payload.message,
      audienceType: payload.audienceType,
      targetPlan: payload.targetPlan,
      status: 'PUBLISHED',
      target: payload.target,
    };

    return this.api.post<AnnouncementApiItem>(API.SUPER_ADMIN.ANNOUNCEMENTS, body);
  }

  private extractItems<T>(data: unknown): T[] {
    if (Array.isArray(data)) {
      return data as T[];
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (Array.isArray(record['items'])) {
        return record['items'] as T[];
      }
    }

    throw new Error('Announcements response did not contain a list.');
  }

  private toAnnouncement(item: AnnouncementApiItem): AnnouncementListItem {
    const plan = this.planValue(item.targetPlan);
    const audience = item.audienceType.toUpperCase() === 'ALL'
      ? 'all'
      : this.toUiAudience(plan, item.audienceLabel);
    const sentAt = item.publishedAt ?? item.scheduledAt ?? item.createdAt;

    return {
      id: item.id,
      title: item.title,
      message: item.message,
      audience,
      audience_label: item.audienceLabel ?? undefined,
      recipients_count: item.recipientCount ?? item.schoolCount ?? 0,
      sent_at: sentAt,
      status: this.toUiStatus(item.status),
    };
  }

  private planValue(plan: AnnouncementApiItem['targetPlan']): string | null {
    if (typeof plan === 'string') {
      return plan;
    }

    return plan?.value ?? plan?.name ?? null;
  }

  private toUiAudience(plan: string | null, label?: string | null): 'basic' | 'advanced' | 'premium' | 'custom' {
    const normalizedPlan = plan?.toLowerCase();
    if (normalizedPlan === 'free_trial') {
      return label?.toLowerCase().includes('premium') ? 'premium' : 'basic';
    }
    if (normalizedPlan === 'advance' || normalizedPlan === 'advanced') {
      return 'advanced';
    }
    if (normalizedPlan === 'basic' || normalizedPlan === 'premium') {
      return normalizedPlan;
    }

    const normalizedLabel = label?.toLowerCase() ?? '';
    if (normalizedLabel.includes('premium')) {
      return 'premium';
    }
    if (normalizedLabel.includes('advanced')) {
      return 'advanced';
    }
    if (normalizedLabel.includes('basic')) {
      return 'basic';
    }
    return 'custom';
  }

  private toUiStatus(status: string): string {
    switch (status.toUpperCase()) {
      case 'PUBLISHED':
        return 'delivered';
      case 'SCHEDULED':
        return 'scheduled';
      default:
        return status.toLowerCase();
    }
  }
}
