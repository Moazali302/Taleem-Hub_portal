// src/app/core/services/super-admin.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API } from '../constants/api.constants';

export interface CreateSchoolPayload {
  school_name: string;
  school_address: string;
  owner_name: string;
  owner_number: string;
  email: string;
  password: string;
}

export interface CreateSchoolResponse {
  success: boolean;
  message: string;
  data: {
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
  };
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  constructor(private readonly api: ApiService) {}

  createSchool(payload: CreateSchoolPayload): Observable<CreateSchoolResponse> {
    return this.api.post(API.SUPER_ADMIN.CREATE_SCHOOL, payload);
  }
}