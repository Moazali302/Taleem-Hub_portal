import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AdminTeachersService } from './admin-teachers.service';
import { TeacherListItem } from '../models/teacher.model';

const TEACHER: TeacherListItem = {
  id: 45,
  school_id: 'school-from-response',
  school_name: 'School Name',
  teacher_name: 'Teacher Name',
  qualification: 'M.Ed',
  phone: '+923001234567',
  email: 'teacher@example.test',
  specialty: 'Math',
  rank: 'senior_teacher',
  status: 'on_leave',
  created_at: '2026-10-25T10:00:00.000Z',
  updated_at: '2026-10-25T10:00:00.000Z',
};

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

  it('requests teachers with pagination and maps data.items plus metadata', () => {
    let result: unknown;
    service.getAllTeachers({ page: 2, limit: 50, search: 'Teacher' })
      .subscribe((response) => (result = response.data));

    const request = http.expectOne((req) => req.url.endsWith('/teachers/GetAllTeachers'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('50');
    expect(request.request.params.get('search')).toBe('Teacher');

    const page = { items: [TEACHER], total: 51, page: 2, limit: 50, totalPages: 2 };
    request.flush({ success: true, message: 'Teachers fetched', data: page });
    expect(result).toEqual(page);
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
    };
    service.createTeacher(payload).subscribe();

    const request = http.expectOne((req) => req.url.endsWith('/teachers/CreateTeacher'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('schoolId');
    expect(request.request.body).not.toHaveProperty('school_id');
    request.flush({ success: true, message: 'Teacher added', data: TEACHER });
  });

  it('patches editable teacher fields and status to the legacy-compatible route', () => {
    const payload = { status: 'active' as const };
    service.updateTeacher(TEACHER.id, payload).subscribe();
    const patchRequest = http.expectOne((req) => req.url.endsWith('/teachers/UpdateTeacher45'));
    expect(patchRequest.request.method).toBe('PATCH');
    expect(patchRequest.request.body).toEqual(payload);
    expect(patchRequest.request.body).not.toHaveProperty('school_id');
    patchRequest.flush({ success: true, message: 'Teacher updated', data: TEACHER });
  });
});
