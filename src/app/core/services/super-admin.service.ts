import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { DemoRequest,DemoRequestStatus } from '../models/demo-request.model';

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
  package?: 'basic' | 'advanced' | 'premium' | null;
  subscription_status?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  constructor(private readonly api: ApiService) {}

  createSchool(payload: CreateSchoolPayload): Observable<ApiResponse<CreateSchoolData>> {
    return this.api.post<CreateSchoolData>(API.SUPER_ADMIN.CREATE_SCHOOL, payload);
  }

  getAllSchools(): Observable<ApiResponse<SchoolListItem[]>> {
    return this.api.get<SchoolListItem[]>(API.SUPER_ADMIN.SCHOOLS);
  }

  blockSchool(id: number): Observable<ApiResponse<unknown>> {
    return this.api.patch<unknown>(API.SUPER_ADMIN.BLOCK(String(id)));
  }

  unblockSchool(id: number): Observable<ApiResponse<unknown>> {
    return this.api.patch<unknown>(API.SUPER_ADMIN.UNBLOCK(String(id)));
  }

  getDemoRequests(): Observable<ApiResponse<DemoRequest[]>> {
    return this.api.get<DemoRequest[]>(API.SUPER_ADMIN.DEMO_REQUESTS);
  }

  updateDemoRequestStatus(
    id: number,
    status: DemoRequestStatus,
  ): Observable<ApiResponse<DemoRequest>> {
    return this.api.patch<DemoRequest>(API.SUPER_ADMIN.DEMO_REQUEST_STATUS(id.toString()), { status });
  }
}