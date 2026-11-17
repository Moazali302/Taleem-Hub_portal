import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  AdminTeachersService,
  InvalidTeacherListResponseError,
} from './admin-teachers.service';
import { TeacherListItem } from '../models/teacher.model';

const TEACHER: TeacherListItem = {
  id: 45,
  school_id: 'school-from-response',
  school_name: 'School Name',
  teacher_name: 'Teacher Name',
  qualification: 'M.Ed',
  phone: '+923001234567',
  email: 'teacher@example.test',
  subject: 'Math',
  specialty: 'Math',
  rank: 'senior_teacher',
  status: 'on_leave',
  account_status: 'active',
  gender: 'female',
  cnic: '12345-1234567-1',
  address: 'Lahore',
  joining_date: '2024-08-01',
  experience_years: 5,
  monthly_salary: 60000,
  created_at: '2026-10-25T10:00:00.000Z',
  updated_at: '2026-10-25T10:00:00.000Z',
};

const SUMMARY = { totalTeachers: 51, activeTeachers: 48, inactiveTeachers: 3 };

describe('AdminTeachersService', () => {
  let service: AdminTeachersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminTeachersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests teachers with pagination, search, subject and account status filters', () => {
    let result: unknown;
    service.getAllTeachers({
      page: 2,
      limit: 50,
      search: 'Teacher',
      subject: 'Mathematics',
      status: 'active',
    })
      .subscribe((response) => (result = response.data));

    const request = http.expectOne((req) => req.url.endsWith('/teachers/GetAllTeachers'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('50');
    expect(request.request.params.get('search')).toBe('Teacher');
    expect(request.request.params.get('subject')).toBe('Mathematics');
    expect(request.request.params.get('status')).toBe('active');

    const page = {
      summary: SUMMARY,
      items: [TEACHER],
      total: 51,
      page: 2,
      limit: 50,
      totalPages: 2,
    };
    request.flush({ success: true, message: 'Teachers fetched', data: page });
    expect(result).toEqual(page);
  });

  it('fetches every matching page for complete exports without adding school identifiers', () => {
    let rows: TeacherListItem[] | undefined;
    service.getAllMatchingTeachers({ search: 'Teacher', subject: 'Math', status: 'inactive' })
      .subscribe((result) => (rows = result));

    const firstPageRequest = http.expectOne((req) => req.url.endsWith('/teachers/GetAllTeachers'));
    expect(firstPageRequest.request.params.get('page')).toBe('1');
    expect(firstPageRequest.request.params.get('limit')).toBe('100');
    expect(firstPageRequest.request.params.get('search')).toBe('Teacher');
    expect(firstPageRequest.request.params.get('subject')).toBe('Math');
    expect(firstPageRequest.request.params.get('status')).toBe('inactive');
    expect(firstPageRequest.request.params.has('schoolId')).toBe(false);
    expect(firstPageRequest.request.params.has('school_id')).toBe(false);
    firstPageRequest.flush({
      success: true,
      message: 'Teachers fetched',
      data: { summary: SUMMARY, items: [TEACHER], total: 101, page: 1, limit: 100, totalPages: 2 },
    });

    const secondPageRequest = http.expectOne((req) => req.url.endsWith('/teachers/GetAllTeachers'));
    expect(secondPageRequest.request.params.get('page')).toBe('2');
    secondPageRequest.flush({
      success: true,
      message: 'Teachers fetched',
      data: { summary: SUMMARY, items: [{ ...TEACHER, id: 46 }], total: 101, page: 2, limit: 100, totalPages: 2 },
    });

    expect(rows?.map((row) => row.id)).toEqual([45, 46]);
  });

  it('surfaces a malformed list response instead of rendering fabricated pagination data', () => {
    let responseError: unknown;
    service.getAllTeachers({ page: 1, limit: 5 }).subscribe({
      error: (error) => (responseError = error),
    });

    const request = http.expectOne((req) => req.url.endsWith('/teachers/GetAllTeachers'));
    request.flush({ success: true, message: 'Teachers fetched', data: [TEACHER] });

    expect(responseError).toBeInstanceOf(InvalidTeacherListResponseError);
  });

  it('creates a teacher with status and without school identifiers', () => {
    const payload = {
      teacher_name: 'Teacher Name',
      qualification: 'M.Ed',
      phone: '+923001234567',
      email: 'teacher@example.test',
      specialty: 'Math',
      rank: 'senior_teacher' as const,
      password: 'a-secure-password',
      status: 'on_leave' as const,
      joining_date: '2026-10-25',
      gender: 'female' as const,
      cnic: '12345-1234567-1',
      address: 'Lahore',
      experience_years: 5,
      monthly_salary: 60000,
    };
    service.createTeacher(payload).subscribe();

    const request = http.expectOne((req) => req.url.endsWith('/teachers/CreateTeacher'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('schoolId');
    expect(request.request.body).not.toHaveProperty('school_id');
    request.flush({ success: true, message: 'Teacher added', data: TEACHER });
  });

  it('patches all teacher profile fields and employment status to the compatible route', () => {
    const payload = {
      status: 'on_leave' as const,
      gender: 'female' as const,
      cnic: '12345-1234567-1',
      address: 'Lahore',
      joining_date: '2024-08-01',
      experience_years: 5,
      monthly_salary: 60000,
    };
    service.updateTeacher(TEACHER.id, payload).subscribe();
    const patchRequest = http.expectOne((req) => req.url.endsWith('/teachers/UpdateTeacher45'));
    expect(patchRequest.request.method).toBe('PATCH');
    expect(patchRequest.request.body).toEqual(payload);
    expect(patchRequest.request.body.status).toBe('on_leave');
    expect(patchRequest.request.body).not.toHaveProperty('school_id');
    patchRequest.flush({ success: true, message: 'Teacher updated', data: TEACHER });
  });
});
