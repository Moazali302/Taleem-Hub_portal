import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
CreateTeacherPayload,
TeacherListItem,
TeacherListQuery,
TeacherPage,
UpdateTeacherPayload,
} from '../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class AdminTeachersService {
constructor(private readonly api: ApiService) {}

getAllTeachers(query: TeacherListQuery): Observable<ApiResponse<TeacherPage>> {
  let params = new HttpParams()
    .set('page', query.page)
    .set('limit', query.limit);
  if (query.search) params = params.set('search', query.search);

  return this.api
    .get<TeacherPage | TeacherListItem[]>(API.TEACHERS.LIST, params)
    .pipe(map((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? {
            items: response.data,
            total: response.data.length,
            page: query.page,
            limit: query.limit,
            totalPages: response.data.length ? 1 : 0,
          }
        : response.data,
    })));
}

createTeacher(payload: CreateTeacherPayload): Observable<ApiResponse<TeacherListItem>> {
  return this.api.post<TeacherListItem>(API.TEACHERS.CREATE, payload);
}

updateTeacher(id: number, payload: UpdateTeacherPayload): Observable<ApiResponse<TeacherListItem>> {
  return this.api.patch<TeacherListItem>(API.TEACHERS.UPDATE(id), payload);
}
}