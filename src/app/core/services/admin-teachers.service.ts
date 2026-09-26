import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from '../auth/auth.service';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { CreateTeacherPayload, TeacherListItem } from '../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class AdminTeachersService {
  constructor(
    private readonly api: ApiService,
    private readonly authService: AuthService,
  ) {}

  // getAllTeachers(): Observable<ApiResponse<TeacherListItem[]>> {
  //   const schoolId = this.authService.getSchoolId();
  //   if (!schoolId) {
  //     return of({
  //       success: true,
  //       message: 'No school context',
  //       data: [],
  //       meta: { timestamp: new Date().toISOString(), path: '' },
  //     });
  //   }
  //   return this.api.get<TeacherListItem[]>(API.TEACHERS.LIST(schoolId));
  // }
   getAllTeachers(): Observable<ApiResponse<TeacherListItem[]>> {
  return this.api.get<TeacherListItem[]>(API.TEACHERS.LIST);
}

  createTeacher(payload: CreateTeacherPayload): Observable<ApiResponse<TeacherListItem>> {
    return this.api.post<TeacherListItem>(API.TEACHERS.CREATE, payload);
  }

  // TODO(backend): still mocked — UPDATE endpoint not yet confirmed via swagger
  updateTeacher(id: number, payload: CreateTeacherPayload): Observable<ApiResponse<TeacherListItem>> {
    const now = new Date().toISOString();
    const updated: TeacherListItem = {
      id,
      school_id: '',
      school_name: '',
      status: 'active',
      created_at: now,
      updated_at: now,
      ...payload,
    };
    return of({
      success: true,
      message: 'Teacher updated (mock — endpoint not confirmed)',
      data: updated,
      meta: { timestamp: now, path: '' },
    }).pipe(delay(300));
  }
}