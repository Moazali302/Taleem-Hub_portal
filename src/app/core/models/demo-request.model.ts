export type DemoRequestStatus =
  | 'new'
  | 'contacted'
  | 'converted'
  | 'rejected';

export interface DemoRequest {
  id: number;
  full_name: string;
  school_name: string;
  email: string;
  phone: string;
  message?: string | null;
  status: DemoRequestStatus;
  created_at: string;
}