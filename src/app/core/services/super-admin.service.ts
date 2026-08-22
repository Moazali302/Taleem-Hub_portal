import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';

export interface CreateSchoolPayload {
  school_name: string;
  school_address: string;
  owner_name: string;
  owner_number: string;
  email: string;
  password: string;
}

export interface CreateSchoolData {
  school: {
    id: number;
    school_name: string;
    school_address: string;
    school_id: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  admin: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export interface SchoolListItem {
  id: number;
  school_name: string;
  school_address: string;
  school_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  constructor(private readonly api: ApiService) {}

  createSchool(payload: CreateSchoolPayload): Observable<ApiResponse<CreateSchoolData>> {
    return this.api.post<CreateSchoolData>(API.SUPER_ADMIN.CREATE_SCHOOL, payload);
  }

  getAllSchools(): Observable<ApiResponse<SchoolListItem[]>> {
    return this.api.get<SchoolListItem[]>(API.SUPER_ADMIN.LIST_SCHOOLS);
  }
}