export type TeacherStatus = 'active' | 'on_leave';

export type TeacherRank = 'junior_teacher' | 'senior_teacher' | 'head_of_department';

export interface TeacherListItem {
  id: number;
  school_id: string;
  school_name: string;
  teacher_name: string;
  qualification: string;
  phone: string;
  email: string;
  specialty: string;
  rank: TeacherRank;
  status: TeacherStatus;
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
}

export const TEACHER_RANK_OPTIONS: { value: TeacherRank; label: string }[] = [
  { value: 'junior_teacher', label: 'Junior Teacher' },
  { value: 'senior_teacher', label: 'Senior Teacher' },
  { value: 'head_of_department', label: 'Head of Department (HOD)' },
];
