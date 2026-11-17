export type TeacherStatus = 'active' | 'on_leave';
export type TeacherAccountStatus = 'active' | 'inactive';
export type TeacherGender = 'male' | 'female' | 'other';

export type TeacherRank = 'junior_teacher' | 'senior_teacher' | 'head_of_department';

export interface TeacherListItem {
  id: number;
  school_id: string;
  school_name: string;
  teacher_name: string;
  qualification: string;
  phone: string;
  email: string;
  subject: string;
  specialty: string;
  rank: TeacherRank;
  status: TeacherStatus;
  account_status: TeacherAccountStatus;
  is_active?: boolean;
  gender?: TeacherGender | null;
  cnic?: string;
  address?: string;
  joining_date?: string;
  experience_years?: number;
  monthly_salary?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTeacherPayload {
  teacher_name: string;
  qualification: string;
  phone: string;
  email: string;
  specialty: string;
  rank: TeacherRank;
  password: string;
  status: TeacherStatus;
  gender?: TeacherGender | null;
  cnic?: string | null;
  address?: string | null;
  joining_date: string;
  experience_years?: number | null;
  monthly_salary?: number | null;
}

export type UpdateTeacherPayload = Partial<CreateTeacherPayload>;

export interface TeacherPage {
  summary: {
    totalTeachers: number;
    activeTeachers: number;
    inactiveTeachers: number;
  };
  items: TeacherListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TeacherListQuery {
  page: number;
  limit: number;
  search?: string;
  subject?: string;
  status?: TeacherAccountStatus;
}

export const TEACHER_RANK_OPTIONS: { value: TeacherRank; label: string }[] = [
  { value: 'junior_teacher', label: 'Junior Teacher' },
  { value: 'senior_teacher', label: 'Senior Teacher' },
  { value: 'head_of_department', label: 'Head of Department (HOD)' },
];
