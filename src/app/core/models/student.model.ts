export type StudentGender = 'male' | 'female' | 'other';
export type StudentStatus = 'active' | 'inactive';
export type StudentSortBy = 'created_at' | 'name' | 'admission_date' | 'roll_no';
export type StudentSortOrder = 'ASC' | 'DESC';

export interface StudentClassOption {
  id: string;
  name: string;
  section?: string;
}

export interface StudentListItem {
  id: string | number;
  student_id?: string | number;
  name?: string;
  student_name?: string;
  email?: string;
  login_email?: string;
  class_id?: string;
  class_name?: string;
  section?: string;
  section_name?: string;
  class?: {
    name?: string;
    class_name?: string;
    section?: string;
    section_name?: string;
  };
  roll_no?: string | number;
  parent_name?: string;
  parent_phone?: string;
  admission_date?: string;
  status?: StudentStatus;
}

export interface StudentPage {
  items: StudentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentListQuery {
  page: number;
  limit: number;
  search: string;
  status: StudentStatus | '';
  class_id: string;
  sortBy: StudentSortBy;
  sortOrder: StudentSortOrder;
}

export interface CreateStudentPayload {
  name: string;
  email: string;
  password: string;
  gender: StudentGender;
  dob: string;
  class_id: string;
  roll_no: string;
  admission_date: string;
  status: StudentStatus;
  cnic?: string;
  address?: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
}