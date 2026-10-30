import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { SchoolPlan, SchoolStatus } from '../models/school.model';
import { DemoRequest,DemoRequestStatus } from '../models/demo-request.model';
import { schoolRouteSlug } from '../utils/school-route.util';

export type CreateSchoolStatus = SchoolStatus;
export type CreateSchoolPlan = SchoolPlan;

export interface CreateSchoolPayload {
  school_name: string;
  city: string;
  school_address: string;
  phone: string;
  plan: CreateSchoolPlan;
  billing_cycle: string;
  start_date: string;
  status: CreateSchoolStatus;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_password: string;
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
  city?: string | null;
  phone?: string | null;
  plan?: SchoolPlan | null;
  billing_cycle?: string | null;
  start_date?: string | null;
  student_limit?: number | null;
  status: SchoolStatus;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  package?: 'basic' | 'advanced' | 'premium' | null;
  subscription_status?: string | null;
}
 export interface SchoolDetail {
  id: number;
  school_id: string;
  school_name: string;
  city: string | null;
  school_address: string;
  phone: string | null;
  status: string;
  plan: string | null;
  billing_cycle: string | null;
  start_date: string | null;
  end_date: string | null;
  student_limit: number | null;
  students_count: number;
  teachers_count: number;
  amount: number | null;
  currency: string | null;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
}

export interface SchoolForEdit {
  id: number;
  school_id: string;
  school_name: string;
  city: string | null;
  school_address: string;
  phone: string | null;
  status: SchoolStatus;
  plan: SchoolPlan | null;
  billing_cycle: string | null;
  start_date: string | null;
  student_limit: number | string | null;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
}

export interface UpdateSchoolPayload {
  school_name: string;
  city: string;
  school_address: string;
  phone: string;
  status: SchoolStatus;
  plan: SchoolPlan;
  billing_cycle: string;
  start_date: string;
  student_limit: number | null;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
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

  getSchoolIdBySlug(slug: string): Observable<number> {
    return this.getAllSchools().pipe(
      map((response) => {
        const school = response.data.find(
          (item) => schoolRouteSlug(item, response.data) === slug,
        );
        if (!school) {
          throw new Error('The school in this address could not be found.');
        }

        return school.id;
      }),
    );
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
  getSchoolDetail(id: number): Observable<ApiResponse<SchoolDetail>> {
  return this.api.get<SchoolDetail>(API.SUPER_ADMIN.SCHOOL_DETAIL(String(id)));
}

  getSchoolForEdit(id: number): Observable<ApiResponse<SchoolForEdit>> {
    return this.api.get<SchoolForEdit>(API.SUPER_ADMIN.SCHOOL_FOR_EDIT(String(id)));
  }

  updateSchool(id: number, payload: UpdateSchoolPayload): Observable<ApiResponse<SchoolForEdit>> {
    return this.api.patch<SchoolForEdit>(API.SUPER_ADMIN.SCHOOL(String(id)), payload);
  }
}