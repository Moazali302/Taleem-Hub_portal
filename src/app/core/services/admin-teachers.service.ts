import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
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

export class InvalidTeacherListResponseError extends Error {}

@Injectable({ providedIn: 'root' })
export class AdminTeachersService {
constructor(private readonly api: ApiService) {}

getAllTeachers(query: TeacherListQuery): Observable<ApiResponse<TeacherPage>> {
  let params = new HttpParams()
    .set('page', query.page)
    .set('limit', query.limit);
  if (query.search) params = params.set('search', query.search);
  if (query.subject) params = params.set('subject', query.subject);
  if (query.status) params = params.set('status', query.status);

  return this.api.get<unknown>(API.TEACHERS.LIST, params).pipe(
    map((response): ApiResponse<TeacherPage> => {
      if (!isTeacherPage(response.data)) {
        throw new InvalidTeacherListResponseError(
          'The teacher list response is missing summary, items, or pagination data.',
        );
      }

      return { ...response, data: response.data };
    }),
  );
}

getAllMatchingTeachers(
  filters: Omit<TeacherListQuery, 'page' | 'limit'> = {},
): Observable<TeacherListItem[]> {
  const firstQuery: TeacherListQuery = { ...filters, page: 1, limit: 100 };

  return this.getAllTeachers(firstQuery).pipe(
    expand((response) => {
      const { page, totalPages } = response.data;
      return page < totalPages
        ? this.getAllTeachers({ ...firstQuery, page: page + 1 })
        : EMPTY;
    }),
    map((response) => response.data.items),
    reduce((allTeachers, pageTeachers) => allTeachers.concat(pageTeachers), [] as TeacherListItem[]),
  );
}

createTeacher(payload: CreateTeacherPayload): Observable<ApiResponse<TeacherListItem>> {
  return this.api.post<TeacherListItem>(API.TEACHERS.CREATE, payload);
}

updateTeacher(id: number, payload: UpdateTeacherPayload): Observable<ApiResponse<TeacherListItem>> {
  return this.api.patch<TeacherListItem>(API.TEACHERS.UPDATE(id), payload);
}
}

function isTeacherPage(value: unknown): value is TeacherPage {
  if (!value || typeof value !== 'object') return false;

  const page = value as Partial<TeacherPage>;
  const summary = page.summary;

  return Array.isArray(page.items)
    && typeof page.total === 'number'
    && typeof page.page === 'number'
    && typeof page.limit === 'number'
    && typeof page.totalPages === 'number'
    && !!summary
    && typeof summary.totalTeachers === 'number'
    && typeof summary.activeTeachers === 'number'
    && typeof summary.inactiveTeachers === 'number'
    && page.items.every((teacher) =>
      !!teacher
      && typeof teacher.teacher_name === 'string'
      && typeof teacher.subject === 'string'
      && (teacher.account_status === 'active' || teacher.account_status === 'inactive'),
    );
}