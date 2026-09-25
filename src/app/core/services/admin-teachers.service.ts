import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { CreateTeacherPayload, TeacherListItem } from '../models/teacher.model';

const MOCK_SCHOOL_ID = 'SCH-1042';
const MOCK_SCHOOL_NAME = 'Taleem Model School';

let nextTeacherId = 5;

let mockTeachers: TeacherListItem[] = [
  {
    id: 1,
    school_id: MOCK_SCHOOL_ID,
    school_name: MOCK_SCHOOL_NAME,
    teacher_name: 'Ayesha Malik',
    qualification: 'M.Ed Mathematics',
    phone: '0300 1234567',
    email: 'ayesha.malik@school.pk',
    specialty: 'Mathematics',
    rank: 'head_of_department',
    status: 'active',
    created_at: '2025-08-12T09:00:00.000Z',
    updated_at: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 2,
    school_id: MOCK_SCHOOL_ID,
    school_name: MOCK_SCHOOL_NAME,
    teacher_name: 'Imran Qureshi',
    qualification: 'M.A English',
    phone: '0321 5550198',
    email: 'imran.qureshi@school.pk',
    specialty: 'English',
    rank: 'senior_teacher',
    status: 'active',
    created_at: '2025-09-03T09:00:00.000Z',
    updated_at: '2026-08-20T09:00:00.000Z',
  },
  {
    id: 3,
    school_id: MOCK_SCHOOL_ID,
    school_name: MOCK_SCHOOL_NAME,
    teacher_name: 'Nadia Hussain',
    qualification: 'B.Ed Science',
    phone: '0333 4412098',
    email: 'nadia.hussain@school.pk',
    specialty: 'Biology',
    rank: 'junior_teacher',
    status: 'on_leave',
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-09-10T09:00:00.000Z',
  },
  {
    id: 4,
    school_id: MOCK_SCHOOL_ID,
    school_name: MOCK_SCHOOL_NAME,
    teacher_name: 'Farhan Ali',
    qualification: 'M.Sc Computer Science',
    phone: '0345 7788123',
    email: 'farhan.ali@school.pk',
    specialty: 'Computer Science',
    rank: 'senior_teacher',
    status: 'active',
    created_at: '2026-03-02T09:00:00.000Z',
    updated_at: '2026-09-18T09:00:00.000Z',
  },
];

function cloneTeachers(): TeacherListItem[] {
  return mockTeachers.map((teacher) => ({ ...teacher }));
}

function wrap<T>(data: T, message: string, path: string): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      path,
    },
  };
}

@Injectable({ providedIn: 'root' })
export class AdminTeachersService {
  // TODO(backend): swap mock for real call — GET /admin/teachers, response: TeacherListItem[]
  getAllTeachers(): Observable<ApiResponse<TeacherListItem[]>> {
    return of(wrap(cloneTeachers(), 'Teachers loaded', API.ADMIN.TEACHERS)).pipe(delay(300));
  }

  // TODO(backend): swap mock for real call — POST /admin/teachers, response: TeacherListItem
  createTeacher(payload: CreateTeacherPayload): Observable<ApiResponse<TeacherListItem>> {
    const now = new Date().toISOString();
    const created: TeacherListItem = {
      id: nextTeacherId++,
      school_id: MOCK_SCHOOL_ID,
      school_name: MOCK_SCHOOL_NAME,
      teacher_name: payload.teacher_name,
      qualification: payload.qualification,
      phone: payload.phone,
      email: payload.email,
      specialty: payload.specialty,
      rank: payload.rank,
      status: 'active',
      created_at: now,
      updated_at: now,
    };
    mockTeachers = [created, ...mockTeachers];
    return of(wrap({ ...created }, 'Teacher created', API.ADMIN.TEACHERS)).pipe(delay(300));
  }

  // TODO(backend): swap mock for real call — PATCH /admin/teachers/:id, response: TeacherListItem
  updateTeacher(id: number, payload: CreateTeacherPayload): Observable<ApiResponse<TeacherListItem>> {
    const now = new Date().toISOString();
    mockTeachers = mockTeachers.map((teacher) =>
      teacher.id === id ? { ...teacher, ...payload, updated_at: now } : teacher,
    );
    const updated = mockTeachers.find((teacher) => teacher.id === id);
    const result = updated ?? {
      id,
      school_id: MOCK_SCHOOL_ID,
      school_name: MOCK_SCHOOL_NAME,
      ...payload,
      status: 'active' as const,
      created_at: now,
      updated_at: now,
    };
    return of(wrap({ ...result }, 'Teacher updated', API.ADMIN.TEACHER(String(id)))).pipe(delay(300));
  }
}
