import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  CreateStudentPayload,
  StudentClassOption,
  StudentListQuery,
  StudentPage,
  StudentListItem,
} from '../models/student.model';
import { ApiService } from './api.service';

export class InvalidStudentListResponseError extends Error {}
export class InvalidClassOptionsResponseError extends Error {}

@Injectable({ providedIn: 'root' })
export class AdminStudentsService {
  constructor(private readonly api: ApiService) {}

  getStudents(query: StudentListQuery): Observable<ApiResponse<StudentPage>> {
    const params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit)
      .set('search', query.search)
      .set('status', query.status)
      .set('class_id', query.class_id)
      .set('sortBy', query.sortBy)
      .set('sortOrder', query.sortOrder);

    return this.api.get<unknown>(API.STUDENTS.LIST, params).pipe(
      map((response): ApiResponse<StudentPage> => {
        if (!isStudentPage(response.data)) {
          throw new InvalidStudentListResponseError(
            'The student list response is missing items or pagination data.',
          );
        }

        return { ...response, data: response.data };
      }),
    );
  }

  getClassOptions(): Observable<StudentClassOption[]> {
    return this.api.get<unknown>(API.CLASSES.LIST).pipe(
      map((response) => {
        const rows = classRowsFrom(response.data);
        if (!rows) {
          throw new InvalidClassOptionsResponseError(
            'The class list response does not contain a valid class collection.',
          );
        }

        return rows.map((row) => {
          const id = nonEmptyString(row['id']) ?? nonEmptyString(row['class_id']);
          const name =
            nonEmptyString(row['class_name']) ??
            nonEmptyString(row['name']) ??
            nonEmptyString(row['grade_name']);
          const section =
            nonEmptyString(row['section_name']) ?? nonEmptyString(row['section']);

          if (!id || !name) {
            throw new InvalidClassOptionsResponseError(
              'A class option is missing its ID or display name.',
            );
          }

          return { id, name, ...(section ? { section } : {}) };
        });
      }),
    );
  }

  createStudent(payload: CreateStudentPayload): Observable<ApiResponse<StudentListItem>> {
    return this.api.post<StudentListItem>(API.STUDENTS.CREATE, payload);
  }
}

function isStudentPage(value: unknown): value is StudentPage {
  if (!isRecord(value)) return false;

  return Array.isArray(value['items'])
    && typeof value['total'] === 'number'
    && typeof value['page'] === 'number'
    && typeof value['limit'] === 'number'
    && typeof value['totalPages'] === 'number';
}

function classRowsFrom(value: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(value) && value.every(isRecord)) return value;
  if (!isRecord(value)) return null;

  const rows = value['items'] ?? value['classes'];
  return Array.isArray(rows) && rows.every(isRecord) ? rows : null;
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
