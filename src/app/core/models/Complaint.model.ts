export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ComplaintSortBy = 'created_at' | 'updated_at' | 'status' | 'priority';
export type ComplaintSortOrder = 'ASC' | 'DESC';

export interface ComplaintPerson {
  id: number;
  name: string;
}

export interface Complaint {
  id: string;
  school: { id: number; name: string } | null;
  subject: string;
  description: string;
  raisedBy: ComplaintPerson | null;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintPage {
  items: Complaint[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ComplaintListQuery {
  page: number;
  limit: number;
  search?: string;
  priority?: ComplaintPriority;
  status?: ComplaintStatus;
  sortBy: ComplaintSortBy;
  sortOrder: ComplaintSortOrder;
}

export interface UpdateComplaintPayload {
  status?: ComplaintStatus;
  remarks?: string;
}

export const COMPLAINT_PRIORITY_OPTIONS: { value: ComplaintPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export const COMPLAINT_STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};
