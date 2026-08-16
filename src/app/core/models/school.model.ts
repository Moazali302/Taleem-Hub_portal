export type SchoolStatus = 'active' | 'pending' | 'inactive' | 'rejected';

/** Mirrors backend School entity — only the fields the UI actually displays. */
export interface School {
  id: number;
  school_id: string;
  school_name: string;
  owner_name: string;
  email: string;
  phone: string;
  status: SchoolStatus;
  created_at: string;
}