export type SchoolAnnouncementRecipient =
  | 'all'
  | 'students'
  | 'teachers'
  | 'staff'
  | 'parents';

export type SchoolAnnouncementPriority = 'NORMAL' | 'URGENT' | 'IMPORTANT';
export type AnnouncementPublishOption = 'now' | 'schedule';

export interface AnnouncementOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SchoolAnnouncementOptions {
  recipients: AnnouncementOption<SchoolAnnouncementRecipient>[];
  priorities: AnnouncementOption<SchoolAnnouncementPriority>[];
  publishOptions: AnnouncementOption<AnnouncementPublishOption>[];
}

export interface SchoolAnnouncement {
  id: string | number;
  title: string;
  message: string;
  target: SchoolAnnouncementRecipient;
  priority?: SchoolAnnouncementPriority;
  status?: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt?: string | null;
}

export interface SchoolAnnouncementPage {
  items: SchoolAnnouncement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSchoolAnnouncementPayload {
  title: string;
  message: string;
  target: SchoolAnnouncementRecipient;
  priority: SchoolAnnouncementPriority;
  scheduledAt?: string;
}
