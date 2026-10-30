export type SchoolStatus = 'active' | 'pending' | 'inactive' | 'rejected' | 'trial';
export type SchoolPlan = 'free_trial' | 'basic' | 'advanced' | 'premium';

export interface School {
  id: number;
  school_id: string;
  school_name: string;
  city: string;
  plan: SchoolPlan | null;
  owner_name: string;
  email: string;
  phone: string;
  status: SchoolStatus;
  created_at: string;
}